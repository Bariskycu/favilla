// src/models/refreshTokenModel.ts
// Refresh token yönetimi
import pool from '../config/db';
import crypto from 'crypto';

export interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  device_info?: string;
  created_at: Date;
  last_used_at: Date;
}

// Refresh token oluştur ve kaydet
export const createRefreshToken = async (
  userId: string,
  deviceInfo?: string
): Promise<string> => {
  // Random token oluştur
  const refreshToken = crypto.randomBytes(64).toString('hex');
  
  // Token'ı hash'le (veritabanında hash'lenmiş halini sakla)
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  
  // Token 30 gün geçerli
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Refresh token'ı veritabanına kaydet
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, device_info)
     VALUES ($1, $2, $3, $4)`,
    [userId, hashedToken, expiresAt, deviceInfo || null]
  );

  // Hash'lenmemiş token'ı döndür
  return refreshToken;
};

// Refresh token'ı doğrula ve kullanıcı ID'sini döndür
export const verifyRefreshToken = async (token: string): Promise<string | null> => {
  // Token'ı hash'le
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Token'ı ve süresini kontrol et
  const result = await pool.query(
    `SELECT user_id FROM refresh_tokens 
     WHERE token_hash = $1 
     AND expires_at > NOW()`,
    [hashedToken]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const userId = result.rows[0].user_id;

  // last_used_at güncelle
  await pool.query(
    'UPDATE refresh_tokens SET last_used_at = CURRENT_TIMESTAMP WHERE token_hash = $1',
    [hashedToken]
  );

  return userId;
};

// Refresh token'ı sil (logout için)
export const revokeRefreshToken = async (token: string): Promise<boolean> => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const result = await pool.query(
    'DELETE FROM refresh_tokens WHERE token_hash = $1',
    [hashedToken]
  );

  return result.rowCount ? result.rowCount > 0 : false;
};

// Kullanıcının tüm refresh token'larını sil (tüm cihazlardan çıkış)
export const revokeAllUserRefreshTokens = async (userId: string): Promise<void> => {
  await pool.query(
    'DELETE FROM refresh_tokens WHERE user_id = $1',
    [userId]
  );
};

// Kullanıcının aktif refresh token'larını getir
export const getUserRefreshTokens = async (userId: string): Promise<RefreshToken[]> => {
  const result = await pool.query(
    `SELECT id, user_id, token_hash, expires_at, device_info, created_at, last_used_at
     FROM refresh_tokens 
     WHERE user_id = $1 AND expires_at > NOW()
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
};

// Token rotation: Eski token'ı sil ve yeni token oluştur
export const rotateRefreshToken = async (
  oldToken: string,
  userId: string,
  deviceInfo?: string
): Promise<string> => {
  // Eski token'ı sil
  await revokeRefreshToken(oldToken);

  // Yeni token oluştur
  return await createRefreshToken(userId, deviceInfo);
};
