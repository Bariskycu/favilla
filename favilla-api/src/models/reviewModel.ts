// src/models/reviewModel.ts
import pool from '../config/db';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  isApproved: boolean;
}

// 1. Yorum Ekle
export const addReview = async (userId: string, productId: string, rating: number, comment: string): Promise<Review> => {
  // Varsayılan olarak yorumları onaylı (true) başlatıyoruz. 
  // Gerçek hayatta burası 'false' olur ve admin panelinden onaylanırdı.
  const result = await pool.query(
    `INSERT INTO product_reviews (user_id, product_id, rating, comment, is_approved)
     VALUES ($1, $2, $3, $4, true)
     RETURNING id, created_at`,
    [userId, productId, rating, comment]
  );
  
  return {
    id: result.rows[0].id,
    userId,
    productId,
    userName: '', // Controller'da doldurulabilir veya join ile çekilebilir
    rating,
    comment,
    date: result.rows[0].created_at,
    isApproved: true
  };
};

// 2. Bir Ürüne Ait Yorumları Getir (Pagination destekli)
export const getReviewsByProduct = async (productId: string, page: number = 1, limit: number = 10): Promise<{
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> => {
  const normalizedPage = Math.max(1, page);
  const normalizedLimit = Math.min(50, Math.max(1, limit)); // Yorumlar için max 50
  const offset = (normalizedPage - 1) * normalizedLimit;

  // Toplam kayıt sayısı
  const countQuery = `
    SELECT COUNT(*) as total
    FROM product_reviews r
    WHERE r.product_id = $1 AND r.is_approved = true
  `;
  const countResult = await pool.query(countQuery, [productId]);
  const total = parseInt(countResult.rows[0].total, 10);

  // Verileri al
  const query = `
    SELECT r.id, r.user_id, u.name as "userName", r.rating, r.comment, r.created_at as date
    FROM product_reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = $1 AND r.is_approved = true
    ORDER BY r.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  
  const result = await pool.query(query, [productId, normalizedLimit, offset]);
  
  return {
    data: result.rows.map(row => ({
      id: row.id,
      productId,
      userId: row.user_id,
      userName: row.userName,
      rating: row.rating,
      comment: row.comment,
      date: row.date,
      isApproved: true
    })),
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

// 3. Kullanıcının Yorum Yapma Hakkı Var mı? (Satın Alma Kontrolü)
export const checkReviewEligibility = async (userId: string, productId: string): Promise<boolean> => {
  // Kullanıcı bu ürünü içeren, iptal edilmemiş bir sipariş vermiş mi?
  const query = `
    SELECT 1 
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = $1 
      AND oi.product_id = $2 
      AND o.status IN ('delivered', 'shipped', 'processing') -- İptal edilenler hariç
    LIMIT 1
  `;
  
  const result = await pool.query(query, [userId, productId]);
  return result.rows.length > 0;
};