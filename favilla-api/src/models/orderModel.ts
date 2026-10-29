// src/models/orderModel.ts
import pool from '../config/db';
import { withTransaction } from '../utils/transaction';

// Yardımcı Fonksiyon: Kuruş Hassasiyeti (2 hane yuvarlama)
const roundPrice = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

// Mock Ödeme Sistemi
const processFakePayment = async (cardInfo: any, amount: number): Promise<boolean> => {
  // Gerçek entegrasyonda burası Iyzico/Stripe API çağrısı olur.
  return new Promise((resolve) => setTimeout(() => resolve(true), 800));
};

// 1. Kullanıcının Tüm Siparişlerini Getir (Özet Liste - Pagination destekli)
export const getUserOrders = async (userId: string, page: number = 1, limit: number = 20) => {
  const normalizedPage = Math.max(1, page);
  const normalizedLimit = Math.min(100, Math.max(1, limit));
  const offset = (normalizedPage - 1) * normalizedLimit;

  // Toplam kayıt sayısı
  const countQuery = `
    SELECT COUNT(*) as total
    FROM orders 
    WHERE user_id = $1
  `;
  const countResult = await pool.query(countQuery, [userId]);
  const total = parseInt(countResult.rows[0].total, 10);

  // Verileri al
  const query = `
    SELECT 
      id, 
      order_number as "orderNumber", 
      created_at as date, 
      total_amount::float as total, 
      status, 
      (SELECT COUNT(*) FROM order_items WHERE order_id = orders.id)::int as "itemCount"
    FROM orders 
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [userId, normalizedLimit, offset]);
  
  return {
    data: result.rows,
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      totalPages: Math.ceil(total / normalizedLimit),
      hasNext: normalizedPage < Math.ceil(total / normalizedLimit),
      hasPrev: normalizedPage > 1,
    },
  };
};

// 2. Tek Bir Siparişin Detayını Getir (Ürünler ve Adres ile)
export const getOrderById = async (orderId: string, userId: string) => {
  // JSON_AGG kullanarak sipariş kalemlerini tek seferde dizi olarak çekiyoruz
  const query = `
    SELECT 
      o.id, 
      o.order_number as "orderNumber", 
      o.created_at as date, 
      o.subtotal::float, 
      o.discount_amount::float as "discountAmount", 
      o.total_amount::float as total, 
      o.status, 
      o.shipping_address_snapshot as "shippingAddress",
      o.payment_provider as "paymentMethod",
      COALESCE(
        json_agg(
          json_build_object(
            'id', oi.id,
            'productId', oi.product_id,
            'name', oi.product_name_snapshot,
            'image', oi.product_image_snapshot,
            'quantity', oi.quantity,
            'price', oi.price_at_purchase::float
          )
        ) FILTER (WHERE oi.id IS NOT NULL), '[]'
      ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = $1 AND o.user_id = $2
    GROUP BY o.id
  `;

  const result = await pool.query(query, [orderId, userId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const createOrder = async (userId: string, addressId: string, couponCode?: string, cardInfo?: any) => {
  return await withTransaction(async (client) => { 

    // 1. Sepeti Getir ve Kilitle (FOR UPDATE)
    const cartRes = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cartRes.rows.length === 0) throw new Error('Sepet bulunamadı.');
    const cartId = cartRes.rows[0].id;

    const cartItemsRes = await client.query(`
      SELECT p.id, p.price, p.discount_price, p.stock_quantity, ci.quantity, p.name, p.image_url
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1 FOR UPDATE
    `, [cartId]);

    const items = cartItemsRes.rows;
    if (items.length === 0) throw new Error('Sepetiniz boş.');

    // 2. Stok Kontrolü ve Fiyat Hesaplama
    let subtotal = 0;
    
    for (const item of items) {
      if (item.quantity > item.stock_quantity) {
        throw new Error(`Stok yetersiz: ${item.name} (Stok: ${item.stock_quantity})`);
      }
      const price = item.discount_price ? parseFloat(item.discount_price) : parseFloat(item.price);
      subtotal += price * item.quantity;
    }

    // ✅ DÜZELTME: Ara toplamı yuvarla
    subtotal = roundPrice(subtotal);

    // 3. Kupon Uygulama
    let discountAmount = 0;
    let couponId = null;

    if (couponCode) {
      const couponRes = await client.query(
        'SELECT id, discount_percent FROM coupons WHERE code = $1', [couponCode]
      );
      if (couponRes.rows.length > 0) {
        const coupon = couponRes.rows[0];
        couponId = coupon.id;
        
        // ✅ DÜZELTME: İndirim tutarını yuvarla
        discountAmount = roundPrice((subtotal * coupon.discount_percent) / 100);
      }
    }

    // ✅ DÜZELTME: Genel toplamı yuvarla
    const totalAmount = roundPrice(subtotal - discountAmount);

    // 4. Adres Bilgisi
    const addressRes = await client.query(
      'SELECT title, line1, city, zip, country FROM addresses WHERE id = $1', [addressId]
    );
    if (addressRes.rows.length === 0) throw new Error('Teslimat adresi geçersiz.');
    const addressSnapshot = addressRes.rows[0];

    // 5. Ödeme İşlemi
    const paymentSuccess = await processFakePayment(cardInfo, totalAmount);
    if (!paymentSuccess) throw new Error('Ödeme alınamadı. Lütfen kart bilgilerinizi kontrol edin.');

    // 6. Siparişi Kaydet
    const orderRes = await client.query(
      `INSERT INTO orders (
        user_id, subtotal, discount_amount, total_amount, coupon_id, 
        payment_provider, is_paid, status, shipping_address_snapshot
      ) VALUES ($1, $2, $3, $4, $5, 'Credit Card', true, 'processing', $6) 
      RETURNING id, order_number`,
      [userId, subtotal, discountAmount, totalAmount, couponId, JSON.stringify(addressSnapshot)]
    );
    const order = orderRes.rows[0];

    // 7. Kalemleri Kaydet ve Stoğu Düş
    for (const item of items) {
      const price = item.discount_price ? parseFloat(item.discount_price) : parseFloat(item.price);
      
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, product_name_snapshot, product_image_snapshot)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.id, item.quantity, price, item.name, item.image_url]
      );

      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.id]
      );
    }

    // 8. Kupon Kullanımını İşle
    if (couponId) {
      await client.query(
        'INSERT INTO coupon_usages (coupon_id, user_id, order_id) VALUES ($1, $2, $3)',
        [couponId, userId, order.id]
      );
    }

    // 9. Sepeti Temizle
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    // 🚀 İŞLEM BAŞARILI - Transaction otomatik commit edilecek
    return order;
  });
};

/** Iyzico Checkout Form için "Ödeme Bekliyor" statüsünde sipariş oluşturur.
 * Stoğu düşmez, kupon kullanımı yazılmaz; bunlar paymentCallback başarılı olunca yapılır.
 * conversationId olarak order.id kullanılmalıdır.
 */
export const createPendingOrderForIyzico = async (
  userId: string,
  addressId: string,
  couponCode?: string
): Promise<{ id: string; order_number: string; total_amount: number }> => {
  return await withTransaction(async (client) => {
    const cartRes = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cartRes.rows.length === 0) throw new Error('Sepet bulunamadı.');
    const cartId = cartRes.rows[0].id;

    const cartItemsRes = await client.query(`
      SELECT p.id, p.price, p.discount_price, p.stock_quantity, ci.quantity, p.name, p.image_url
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1 FOR UPDATE
    `, [cartId]);

    const items = cartItemsRes.rows;
    if (items.length === 0) throw new Error('Sepetiniz boş.');

    let subtotal = 0;
    for (const item of items) {
      if (item.quantity > item.stock_quantity) {
        throw new Error(`Stok yetersiz: ${item.name} (Stok: ${item.stock_quantity})`);
      }
      const price = item.discount_price ? parseFloat(item.discount_price) : parseFloat(item.price);
      subtotal += price * item.quantity;
    }
    subtotal = roundPrice(subtotal);

    let discountAmount = 0;
    let couponId: string | null = null;
    if (couponCode) {
      const couponRes = await client.query(
        'SELECT id, discount_percent FROM coupons WHERE code = $1', [couponCode]
      );
      if (couponRes.rows.length > 0) {
        const coupon = couponRes.rows[0];
        couponId = coupon.id;
        discountAmount = roundPrice((subtotal * coupon.discount_percent) / 100);
      }
    }

    const totalAmount = roundPrice(subtotal - discountAmount);

    const addressRes = await client.query(
      'SELECT title, line1, city, zip, country FROM addresses WHERE id = $1', [addressId]
    );
    if (addressRes.rows.length === 0) throw new Error('Teslimat adresi geçersiz.');
    const addressSnapshot = addressRes.rows[0];

    const orderRes = await client.query(
      `INSERT INTO orders (
        user_id, subtotal, discount_amount, total_amount, coupon_id,
        payment_provider, is_paid, status, shipping_address_snapshot
      ) VALUES ($1, $2, $3, $4, $5, 'iyzico', false, 'pending_payment', $6)
      RETURNING id, order_number`,
      [userId, subtotal, discountAmount, totalAmount, couponId, JSON.stringify(addressSnapshot)]
    );
    const order = orderRes.rows[0];

    for (const item of items) {
      const price = item.discount_price ? parseFloat(item.discount_price) : parseFloat(item.price);
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, product_name_snapshot, product_image_snapshot)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.id, item.quantity, price, item.name, item.image_url]
      );
    }

    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

    return {
      id: order.id,
      order_number: order.order_number,
      total_amount: parseFloat(order.total_amount),
    };
  });
};

/** Ödeme başarılı olduğunda siparişi günceller: is_paid, status, stok düşümü, kupon kullanımı. */
export const updateOrderPaymentSuccess = async (
  orderId: string,
  paymentTransactionId?: string
): Promise<boolean> => {
  return await withTransaction(async (client) => {
    const orderRes = await client.query(
      `SELECT id, user_id, coupon_id, status FROM orders WHERE id = $1 FOR UPDATE`,
      [orderId]
    );
    if (orderRes.rows.length === 0) return false;
    const order = orderRes.rows[0];
    if (order.status !== 'pending_payment') return true; // Zaten işlendi veya farklı durumda

    await client.query(
      `UPDATE orders SET is_paid = true, status = 'processing',
       payment_transaction_id = COALESCE($2, payment_transaction_id), updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [orderId, paymentTransactionId ?? null]
    );

    const itemsRes = await client.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [orderId]
    );
    for (const row of itemsRes.rows) {
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [row.quantity, row.product_id]
      );
    }

    if (order.coupon_id) {
      await client.query(
        `INSERT INTO coupon_usages (coupon_id, user_id, order_id) VALUES ($1, $2, $3)
         ON CONFLICT (user_id, coupon_id) DO NOTHING`,
        [order.coupon_id, order.user_id, orderId]
      );
    }

    return true;
  });
};