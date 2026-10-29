// src/models/supportModel.ts
import pool from '../config/db';

export interface SupportTicket {
  id: string;
  userId: string;
  orderNo?: string; // Kullanıcının beyan ettiği sipariş no
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved';
  date: string; // Frontend'de 'date' olarak kullanılıyor
}

// Yeni Destek Talebi Oluştur
export const createTicket = async (userId: string, data: { subject: string, message: string, orderNo?: string }): Promise<SupportTicket> => {
  const { subject, message, orderNo } = data;
  
  const result = await pool.query(
    `INSERT INTO support_tickets (user_id, subject, message, declared_order_no)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, declared_order_no, subject, message, status, created_at`,
    [userId, subject, message, orderNo]
  );
  
  const row = result.rows[0];
  
  // Veritabanı verisini Frontend formatına çevir
  return {
    id: row.id,
    userId: row.user_id,
    orderNo: row.declared_order_no,
    subject: row.subject,
    message: row.message,
    status: row.status,
    date: row.created_at // Tarih formatı
  };
};

// Kullanıcının Taleplerini Getir (Pagination destekli)
export const getUserTickets = async (userId: string, page: number = 1, limit: number = 20): Promise<{
  data: SupportTicket[];
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
    FROM support_tickets 
    WHERE user_id = $1
  `;
  const countResult = await pool.query(countQuery, [userId]);
  const total = parseInt(countResult.rows[0].total, 10);

  // Verileri al
  const query = `
    SELECT id, user_id, declared_order_no, subject, message, status, created_at 
    FROM support_tickets 
    WHERE user_id = $1 
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;
  
  const result = await pool.query(query, [userId, normalizedLimit, offset]);
  
  return {
    data: result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      orderNo: row.declared_order_no,
      subject: row.subject,
      message: row.message,
      status: row.status,
      date: row.created_at
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