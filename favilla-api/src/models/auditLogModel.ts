// src/models/auditLogModel.ts
// Admin audit logging model
import pool from '../config/db';

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  description?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  status: 'success' | 'failed' | 'error';
  error_message?: string;
  created_at: Date;
}

export interface CreateAuditLogData {
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  description?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  status?: 'success' | 'failed' | 'error';
  error_message?: string;
}

// Audit log oluştur
export const createAuditLog = async (data: CreateAuditLogData): Promise<AuditLog> => {
  const {
    admin_id,
    action,
    resource_type,
    resource_id,
    description,
    old_values,
    new_values,
    ip_address,
    user_agent,
    request_id,
    status = 'success',
    error_message,
  } = data;

  const result = await pool.query(
    `INSERT INTO audit_logs (
      admin_id, action, resource_type, resource_id, description,
      old_values, new_values, ip_address, user_agent, request_id,
      status, error_message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      admin_id,
      action,
      resource_type,
      resource_id || null,
      description || null,
      old_values ? JSON.stringify(old_values) : null,
      new_values ? JSON.stringify(new_values) : null,
      ip_address || null,
      user_agent || null,
      request_id || null,
      status,
      error_message || null,
    ]
  );

  const log = result.rows[0];
  
  // JSONB alanları parse et
  if (log.old_values) log.old_values = JSON.parse(log.old_values);
  if (log.new_values) log.new_values = JSON.parse(log.new_values);

  return log as AuditLog;
};

// Audit log'ları getir (filtreleme ve pagination ile)
export interface AuditLogFilters {
  admin_id?: string;
  action?: string;
  resource_type?: string;
  resource_id?: string;
  status?: 'success' | 'failed' | 'error';
  start_date?: Date;
  end_date?: Date;
  page?: number;
  limit?: number;
}

export const getAuditLogs = async (filters: AuditLogFilters = {}): Promise<{
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const {
    admin_id,
    action,
    resource_type,
    resource_id,
    status,
    start_date,
    end_date,
    page = 1,
    limit = 50,
  } = filters;

  // WHERE koşulları
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (admin_id) {
    conditions.push(`admin_id = $${paramIndex++}`);
    params.push(admin_id);
  }

  if (action) {
    conditions.push(`action = $${paramIndex++}`);
    params.push(action);
  }

  if (resource_type) {
    conditions.push(`resource_type = $${paramIndex++}`);
    params.push(resource_type);
  }

  if (resource_id) {
    conditions.push(`resource_id = $${paramIndex++}`);
    params.push(resource_id);
  }

  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    params.push(status);
  }

  if (start_date) {
    conditions.push(`created_at >= $${paramIndex++}`);
    params.push(start_date);
  }

  if (end_date) {
    conditions.push(`created_at <= $${paramIndex++}`);
    params.push(end_date);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Total count
  const countResult = await pool.query(
    `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].total, 10);

  // Pagination
  const offset = (page - 1) * limit;
  params.push(limit, offset);

  // Log'ları getir
  const result = await pool.query(
    `SELECT * FROM audit_logs 
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    params
  );

  // JSONB alanları parse et
  const logs = result.rows.map((log) => {
    if (log.old_values) log.old_values = JSON.parse(log.old_values);
    if (log.new_values) log.new_values = JSON.parse(log.new_values);
    return log;
  });

  return {
    logs: logs as AuditLog[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// Belirli bir audit log'u getir
export const getAuditLogById = async (id: string): Promise<AuditLog | null> => {
  const result = await pool.query('SELECT * FROM audit_logs WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const log = result.rows[0];
  
  // JSONB alanları parse et
  if (log.old_values) log.old_values = JSON.parse(log.old_values);
  if (log.new_values) log.new_values = JSON.parse(log.new_values);

  return log as AuditLog;
};
