// src/models/cartModel.ts
import pool from '../config/db';
import { withTransaction, withTransactionVoid } from '../utils/transaction';

export interface CartItemDetail {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  image: string;
  quantity: number;
  stockQuantity: number;
}

// Helper: Cart ID'yi bul veya oluştur (user veya guest için)
const getOrCreateCartId = async (userId?: string, guestId?: string): Promise<string> => {
  if (userId) {
    let cartRes = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cartRes.rows.length === 0) {
      cartRes = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
    }
    return cartRes.rows[0].id;
  } else if (guestId) {
    let cartRes = await pool.query('SELECT id FROM carts WHERE guest_id = $1', [guestId]);
    if (cartRes.rows.length === 0) {
      cartRes = await pool.query('INSERT INTO carts (guest_id) VALUES ($1) RETURNING id', [guestId]);
    }
    return cartRes.rows[0].id;
  }
  throw new Error('User ID veya Guest ID gerekli');
};

// 1. Sepeti Getir (user veya guest için)
export const getCart = async (userId?: string, guestId?: string): Promise<CartItemDetail[]> => {
  const cartId = await getOrCreateCartId(userId, guestId);

  const query = `
    SELECT 
      ci.id, p.id as "productId", p.name, p.slug, 
      p.price::float, p.discount_price::float as "discountPrice", 
      p.image_url as "image", ci.quantity, p.stock_quantity as "stockQuantity"
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = $1 AND p.is_active = TRUE
    ORDER BY ci.added_at DESC
  `;

  const result = await pool.query(query, [cartId]);
  return result.rows;
};

// 2. Sepete Ekle (✅ Transaction destekli, Stok Kontrolü Eklendi - user veya guest için)
// Döndürülen değer: Güncel sepet listesi
export const addToCart = async (productId: string, quantity: number, userId?: string, guestId?: string): Promise<CartItemDetail[]> => {
  return await withTransaction(async (client) => {
    // A. Sepet ID'sini bul veya oluştur
    let cartId: string | null = null;
    
    if (userId) {
      let cartRes = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
      if (cartRes.rows.length > 0) {
        cartId = cartRes.rows[0].id;
      } else {
        const newCart = await client.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
        cartId = newCart.rows[0].id;
      }
    } else if (guestId) {
      let cartRes = await client.query('SELECT id FROM carts WHERE guest_id = $1', [guestId]);
      if (cartRes.rows.length > 0) {
        cartId = cartRes.rows[0].id;
      } else {
        const newCart = await client.query('INSERT INTO carts (guest_id) VALUES ($1) RETURNING id', [guestId]);
        cartId = newCart.rows[0].id;
      }
    } else {
      throw new Error('User ID veya Guest ID gerekli');
    }

    // B. Ürünün güncel stok durumunu kontrol et (FOR UPDATE ile kilitle)
    const productRes = await client.query(
      'SELECT stock_quantity FROM products WHERE id = $1 FOR UPDATE',
      [productId]
    );
    if (productRes.rows.length === 0) throw new Error('Ürün bulunamadı.');
    const stockLimit = productRes.rows[0].stock_quantity;

    // C. Sepette zaten var mı? Varsa miktarını al
    const existingItem = await client.query(
      'SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    );

    let currentQuantityInCart = 0;
    if (existingItem.rows.length > 0) {
      currentQuantityInCart = existingItem.rows[0].quantity;
    }

    // D. Kritik Stok Kontrolü: (Sepetteki + Eklenecek) > Stok limiti mi?
    if (currentQuantityInCart + quantity > stockLimit) {
      throw new Error(`Stok yetersiz! Mevcut stok: ${stockLimit}, Sepetinizdeki: ${currentQuantityInCart}`);
    }

    // E. Ekleme veya Güncelleme İşlemi
    if (existingItem.rows.length > 0) {
      const newQuantity = currentQuantityInCart + quantity;
      await client.query(
        'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3',
        [newQuantity, cartId, productId]
      );
    } else {
      await client.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cartId, productId, quantity]
      );
    }

    // F. Transaction içinde güncel sepeti döndür (tutarlılık için)
    const cartQuery = `
      SELECT 
        ci.id, p.id as "productId", p.name, p.slug, 
        p.price::float, p.discount_price::float as "discountPrice", 
        p.image_url as "image", ci.quantity, p.stock_quantity as "stockQuantity"
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1 AND p.is_active = TRUE
      ORDER BY ci.added_at DESC
    `;
    
    const cartResult = await client.query(cartQuery, [cartId]);
    return cartResult.rows;
  });
};

// 3. Sepetten Sil (user veya guest için)
// Döndürülen değer: Güncel sepet listesi
export const removeFromCart = async (productId: string, userId?: string, guestId?: string): Promise<CartItemDetail[]> => {
  return await withTransaction(async (client) => {
    let cartId: string | null = null;
    
    if (userId) {
      const cartRes = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
      if (cartRes.rows.length === 0) {
        // Sepet yoksa boş array döndür
        return [];
      }
      cartId = cartRes.rows[0].id;
    } else if (guestId) {
      const cartRes = await client.query('SELECT id FROM carts WHERE guest_id = $1', [guestId]);
      if (cartRes.rows.length === 0) {
        // Sepet yoksa boş array döndür
        return [];
      }
      cartId = cartRes.rows[0].id;
    } else {
      return [];
    }
    
    // Ürünü sil
    await client.query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
    
    // Transaction içinde güncel sepeti döndür
    const cartQuery = `
      SELECT 
        ci.id, p.id as "productId", p.name, p.slug, 
        p.price::float, p.discount_price::float as "discountPrice", 
        p.image_url as "image", ci.quantity, p.stock_quantity as "stockQuantity"
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1 AND p.is_active = TRUE
      ORDER BY ci.added_at DESC
    `;
    
    const cartResult = await client.query(cartQuery, [cartId]);
    return cartResult.rows;
  });
};

// 4. Sepeti Temizle
export const clearCart = async (cartId: string): Promise<void> => {
  await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
};

// 6. Guest cart'ı user cart'a merge et (Login sonrası kullanılır)
export const mergeGuestCartToUser = async (userId: string, guestId: string): Promise<void> => {
  await withTransactionVoid(async (client) => {
    // A. Guest cart'ı bul
    const guestCartRes = await client.query('SELECT id FROM carts WHERE guest_id = $1', [guestId]);
    if (guestCartRes.rows.length === 0) return; // Guest cart yoksa işlem yok
    
    const guestCartId = guestCartRes.rows[0].id;
    
    // B. User cart'ı bul veya oluştur
    let userCartRes = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    let userCartId: string;
    
    if (userCartRes.rows.length === 0) {
      const newCart = await client.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
      userCartId = newCart.rows[0].id;
    } else {
      userCartId = userCartRes.rows[0].id;
    }
    
    // C. Guest cart'taki tüm ürünleri al
    const guestItems = await client.query(
      'SELECT product_id, quantity FROM cart_items WHERE cart_id = $1',
      [guestCartId]
    );
    
    // D. Her ürün için merge işlemi yap
    for (const item of guestItems.rows) {
      // User cart'ta aynı ürün var mı?
      const existingItem = await client.query(
        'SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [userCartId, item.product_id]
      );
      
      // Stok kontrolü
      const productRes = await client.query(
        'SELECT stock_quantity FROM products WHERE id = $1 FOR UPDATE',
        [item.product_id]
      );
      
      if (productRes.rows.length === 0) continue; // Ürün bulunamadı, atla
      
      const stockLimit = productRes.rows[0].stock_quantity;
      const guestQuantity = item.quantity;
      const userQuantity = existingItem.rows.length > 0 ? existingItem.rows[0].quantity : 0;
      const totalQuantity = userQuantity + guestQuantity;
      
      if (totalQuantity > stockLimit) {
        // Stok yetersiz, mümkün olduğu kadar ekle
        const addableQuantity = Math.max(0, stockLimit - userQuantity);
        if (addableQuantity > 0) {
          if (existingItem.rows.length > 0) {
            await client.query(
              'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3',
              [stockLimit, userCartId, item.product_id]
            );
          } else {
            await client.query(
              'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
              [userCartId, item.product_id, addableQuantity]
            );
          }
        }
      } else {
        // Stok yeterli, merge et
        if (existingItem.rows.length > 0) {
          await client.query(
            'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3',
            [totalQuantity, userCartId, item.product_id]
          );
        } else {
          await client.query(
            'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
            [userCartId, item.product_id, guestQuantity]
          );
        }
      }
    }
    
    // E. Guest cart'ı sil (merge işlemi tamamlandı)
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [guestCartId]);
    await client.query('DELETE FROM carts WHERE id = $1', [guestCartId]);
  });
};

// 5. Sepetteki Ürün Adedini Güncelle (SET işlemi - Transaction destekli - user veya guest için)
// Döndürülen değer: Güncel sepet listesi
export const updateCartItemQuantity = async (productId: string, quantity: number, userId?: string, guestId?: string): Promise<CartItemDetail[]> => {
  return await withTransaction(async (client) => {
    // A. Sepet ID'sini bul
    let cartId: string | null = null;
    
    if (userId) {
      const cartRes = await client.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
      if (cartRes.rows.length === 0) throw new Error('Sepet bulunamadı.');
      cartId = cartRes.rows[0].id;
    } else if (guestId) {
      const cartRes = await client.query('SELECT id FROM carts WHERE guest_id = $1', [guestId]);
      if (cartRes.rows.length === 0) throw new Error('Sepet bulunamadı.');
      cartId = cartRes.rows[0].id;
    } else {
      throw new Error('User ID veya Guest ID gerekli');
    }

    // B. Ürünün Stok Durumunu Kontrol Et (FOR UPDATE ile kilitle)
    const productRes = await client.query(
      'SELECT stock_quantity FROM products WHERE id = $1 FOR UPDATE',
      [productId]
    );
    if (productRes.rows.length === 0) throw new Error('Ürün bulunamadı.');
    
    const stockLimit = productRes.rows[0].stock_quantity;

    // C. İstenen miktar stoktan fazla mı?
    if (quantity > stockLimit) {
      throw new Error(`Stok yetersiz! Maksimum alabileceğiniz adet: ${stockLimit}`);
    }

    // D. Güncelleme İşlemi
    const updateRes = await client.query(
      'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3',
      [quantity, cartId, productId]
    );

    if (updateRes.rowCount === 0) {
      throw new Error('Ürün sepette bulunamadı.');
    }

    // E. Transaction içinde güncel sepeti döndür
    const cartQuery = `
      SELECT 
        ci.id, p.id as "productId", p.name, p.slug, 
        p.price::float, p.discount_price::float as "discountPrice", 
        p.image_url as "image", ci.quantity, p.stock_quantity as "stockQuantity"
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1 AND p.is_active = TRUE
      ORDER BY ci.added_at DESC
    `;
    
    const cartResult = await client.query(cartQuery, [cartId]);
    return cartResult.rows;
  });
};