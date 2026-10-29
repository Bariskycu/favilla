// src/models/questionModel.ts
import pool from '../config/db';

export interface Question {
  id: string;
  productId: string;
  userId: string;
  userName?: string; // Gizlilik için sadece ismin baş harfi vb. gönderilebilir
  question: string;
  answer?: string;
  status: 'pending' | 'answered';
  createdAt: string;
  answeredAt?: string;
  productName?: string;  // Kullanıcının sorularım listesi için
  productImage?: string; // Kullanıcının sorularım listesi için
}

// 1. Yeni Soru Sor
export const createQuestion = async (userId: string, productId: string, question: string): Promise<Question> => {
  const result = await pool.query(
    `INSERT INTO product_questions (user_id, product_id, question, status)
     VALUES ($1, $2, $3, 'pending')
     RETURNING id, created_at, status`,
    [userId, productId, question]
  );
  
  return {
    id: result.rows[0].id,
    userId,
    productId,
    question,
    status: 'pending',
    createdAt: result.rows[0].created_at
  };
};

// 2. Bir Ürüne Ait Yanıtlanmış Soruları Getir (Public - Pagination destekli)
export const getAnsweredQuestionsByProduct = async (productId: string, page: number = 1, limit: number = 10): Promise<{
  data: Question[];
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
  const normalizedLimit = Math.min(50, Math.max(1, limit));
  const offset = (normalizedPage - 1) * normalizedLimit;

  // Toplam kayıt sayısı
  const countQuery = `
    SELECT COUNT(*) as total
    FROM product_questions pq
    WHERE pq.product_id = $1 AND pq.status = 'answered'
  `;
  const countResult = await pool.query(countQuery, [productId]);
  const total = parseInt(countResult.rows[0].total, 10);

  // Verileri al
  const query = `
    SELECT 
      pq.id, pq.user_id, u.name as "userName", 
      pq.question, pq.answer, pq.created_at, pq.answered_at
    FROM product_questions pq
    LEFT JOIN users u ON pq.user_id = u.id
    WHERE pq.product_id = $1 AND pq.status = 'answered'
    ORDER BY pq.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  
  const result = await pool.query(query, [productId, normalizedLimit, offset]);
  
  return {
    data: result.rows.map(row => ({
      id: row.id,
      productId,
      userId: row.user_id,
      userName: row.userName ? row.userName[0] + '***' : 'Misafir',
      question: row.question,
      answer: row.answer,
      status: 'answered' as const,
      createdAt: row.created_at,
      answeredAt: row.answered_at
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

// 3. Kullanıcının Kendi Sorduğu Soruları Getir (Profil Sayfası İçin - Pagination destekli)
export const getUserQuestions = async (userId: string, page: number = 1, limit: number = 20): Promise<{
  data: Question[];
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
  const normalizedLimit = Math.min(100, Math.max(1, limit));
  const offset = (normalizedPage - 1) * normalizedLimit;

  // Toplam kayıt sayısı
  const countQuery = `
    SELECT COUNT(*) as total
    FROM product_questions pq
    WHERE pq.user_id = $1
  `;
  const countResult = await pool.query(countQuery, [userId]);
  const total = parseInt(countResult.rows[0].total, 10);

  // Verileri al
  const query = `
    SELECT 
      pq.id, pq.question, pq.answer, pq.status, pq.created_at, pq.answered_at,
      p.id as "productId", p.name as "productName", p.image_url as "productImage"
    FROM product_questions pq
    JOIN products p ON pq.product_id = p.id
    WHERE pq.user_id = $1
    ORDER BY pq.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  
  const result = await pool.query(query, [userId, normalizedLimit, offset]);
  
  return {
    data: result.rows.map(row => ({
      id: row.id,
      userId,
      productId: row.productId,
      productName: row.productName,
      productImage: row.productImage,
      question: row.question,
      answer: row.answer,
      status: row.status,
      createdAt: row.created_at,
      answeredAt: row.answered_at
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