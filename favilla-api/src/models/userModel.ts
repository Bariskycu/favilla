// src/models/userModel.ts
import pool from '../config/db';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer'; // Added role
  password?: string;
  password_reset_token?: string;
  password_reset_expires?: Date;
  email_verified?: boolean;
  email_verification_token?: string;
  email_verification_expires?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export const createUser = async (userData: CreateUserData): Promise<Omit<User, 'password'>> => {
  const { name, email, password, phone } = userData;

  const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (emailCheck.rows.length > 0) {
    throw new Error('Bu e-posta adresi zaten kullanılıyor');
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Email verification token oluştur
  const crypto = require('crypto');
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  // Token 24 saat geçerli
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, phone, email_verification_token, email_verification_expires) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING id, name, email, phone, role, email_verified, created_at, updated_at`,
    [name, email, hashedPassword, phone, hashedVerificationToken, expiresAt]
  );

  // Hash'lenmemiş token'ı result'a ekle (email göndermek için)
  return { ...result.rows[0], verificationToken };
};

export const findByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role, password_hash as password, 
     email_verified, created_at, updated_at 
     FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as User;
};

// ID ile kullanıcı bulma (Profil detayı için)
export const findById = async (id: string): Promise<User | null> => {
  const result = await pool.query(
    'SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
};

// ID ile kullanıcı bulma (Şifre ile birlikte - Şifre güncelleme için)
export const findByIdWithPassword = async (id: string): Promise<User | null> => {
  const result = await pool.query(
    'SELECT id, name, email, phone, password_hash as password, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
};

// 👇 GÜNCELLENEN KISIM: Profil güncelleme (İsim, Telefon ve Şifre)
export const updateUser = async (id: string, data: Partial<User> & { password?: string }): Promise<User | null> => {
  const { name, phone, password } = data;

  let passwordHash = null;

  // Eğer şifre gönderilmişse ve boş değilse Hash'le
  if (password && password.trim() !== '') {
    const salt = await bcrypt.genSalt(10);
    passwordHash = await bcrypt.hash(password, salt);
  }

  // COALESCE: Eğer değer NULL ise eski değeri korur.
  // Böylece şifre göndermezse eski şifresi değişmez.
  const result = await pool.query(
    `UPDATE users 
     SET name = COALESCE($1, name), 
         phone = COALESCE($2, phone),
         password_hash = COALESCE($3, password_hash),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4 
     RETURNING id, name, email, phone, updated_at`,
    [name, phone, passwordHash, id]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
};

// Kullanıcı rolünü güncelle (Admin işlemi)
export const updateUserRole = async (userId: string, role: 'customer' | 'admin'): Promise<User | null> => {
  const result = await pool.query(
    `UPDATE users 
     SET role = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2 
     RETURNING id, name, email, phone, role, created_at, updated_at`,
    [role, userId]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
};

// Email'e göre kullanıcı bul (role dahil)
export const findByEmailWithRole = async (email: string): Promise<(User & { role?: string }) | null> => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role, email_verified, created_at, updated_at 
     FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as User & { role?: string };
};

// Password reset token oluştur ve kaydet
export const createPasswordResetToken = async (email: string): Promise<string | null> => {
  const user = await findByEmail(email);
  if (!user) {
    // Güvenlik için: Kullanıcı yoksa da başarılı mesaj döndür (email enumeration koruması)
    return null;
  }

  // Random token oluştur (crypto kullanarak)
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Token'ı hash'le (veritabanında hash'lenmiş halini sakla)
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Token'ı veritabanına kaydet (1 saat geçerli)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await pool.query(
    'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE email = $3',
    [hashedToken, expiresAt, email]
  );

  // Hash'lenmemiş token'ı döndür (email ile gönderilecek)
  return resetToken;
};

// Password reset token'ı doğrula
export const verifyPasswordResetToken = async (token: string): Promise<User | null> => {
  // Token'ı hash'le
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Token'ı ve süresini kontrol et
  const result = await pool.query(
    `SELECT id, name, email, phone, password_reset_token, password_reset_expires 
     FROM users 
     WHERE password_reset_token = $1 
     AND password_reset_expires > NOW()`,
    [hashedToken]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as User;
};

// Şifreyi sıfırla ve token'ı temizle
export const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
  const user = await verifyPasswordResetToken(token);
  if (!user) {
    return false;
  }

  // Yeni şifreyi hash'le
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  // Şifreyi güncelle ve token'ı temizle
  await pool.query(
    `UPDATE users 
     SET password_hash = $1, 
         password_reset_token = NULL, 
         password_reset_expires = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [hashedPassword, user.id]
  );

  return true;
};

// Email verification token oluştur ve kaydet (yeniden gönderme için)
export const createEmailVerificationToken = async (email: string): Promise<string | null> => {
  const user = await findByEmail(email);
  if (!user) {
    return null;
  }

  // Eğer zaten doğrulanmışsa token oluşturma
  if (user.email_verified) {
    return null;
  }

  // Random token oluştur
  const crypto = require('crypto');
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  // Token'ı veritabanına kaydet (24 saat geçerli)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await pool.query(
    'UPDATE users SET email_verification_token = $1, email_verification_expires = $2 WHERE email = $3',
    [hashedToken, expiresAt, email]
  );

  // Hash'lenmemiş token'ı döndür
  return verificationToken;
};

// Email verification token'ı doğrula ve email'i verify et
export const verifyEmail = async (token: string): Promise<boolean> => {
  // Token'ı hash'le
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Token'ı ve süresini kontrol et
  const result = await pool.query(
    `SELECT id FROM users 
     WHERE email_verification_token = $1 
     AND email_verification_expires > NOW()
     AND email_verified = FALSE`,
    [hashedToken]
  );

  if (result.rows.length === 0) {
    return false;
  }

  const userId = result.rows[0].id;

  // Email'i verify et ve token'ı temizle
  await pool.query(
    `UPDATE users 
     SET email_verified = TRUE, 
         email_verification_token = NULL, 
         email_verification_expires = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [userId]
  );

  return true;
};