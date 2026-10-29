// src/middlewares/adminMiddleware.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import pool from '../config/db';
import { CustomError } from './errorHandler';

export const admin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // AuthMiddleware'den gelen user id'yi kullan
    if (!req.user || !req.user.id) {
      return next(new CustomError('Yetkisiz erişim.', 401));
    }

    // Kullanıcının rolünü veritabanından kontrol et
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
    
    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      return next(new CustomError('Bu işlem için admin yetkisi gerekiyor.', 403));
    }

    next();
  } catch (error) {
    // Database hatası veya beklenmeyen hata
    return next(new CustomError('Yetki kontrolü sırasında hata oluştu.', 500));
  }
};