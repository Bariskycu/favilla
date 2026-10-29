// src/middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { CustomError } from './errorHandler';

// TypeScript için Request nesnesini genişletiyoruz
// Böylece req.user diyerek kullanıcının ID'sine erişebileceğiz
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // 1. Token'ı önce Authorization header'dan, yoksa cookie'den al
  // Geriye dönük uyumluluk için önce header kontrolü yapıyoruz
  let token: string | undefined;
  
  // Authorization header kontrolü
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  // Header'da yoksa cookie'den al
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }
  
  if (!token) {
    return next(new CustomError('Yetkisiz erişim, token bulunamadı', 401));
  }

  // 2. Token'ı doğrula
  try {
    // env.JWT_SECRET zorunlu olduğu için fallback yok
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
    };

    // 3. Çözülen veriyi isteğe ekle
    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    // 4. Her şey yolunda, sıradaki işleme geç
    next();
  } catch (error: any) {
    // Orijinal JWT hatasını ilet ki errorHandler "Token süresi dolmuş" / "Geçersiz token" ayırt edebilsin
    if (error?.name === 'TokenExpiredError' || error?.name === 'JsonWebTokenError') {
      return next(error);
    }
    return next(new CustomError('Yetkisiz erişim, token geçersiz', 401));
  }
};

// Optional auth middleware - Token varsa user'ı set eder, yoksa guest olarak devam eder
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Token'ı önce Authorization header'dan, yoksa cookie'den al
  let token: string | undefined;
  
  // Authorization header kontrolü
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  // Header'da yoksa cookie'den al
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }
  
  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        id: string;
        email: string;
      };
      
      req.user = {
        id: decoded.id,
        email: decoded.email
      };
    } catch (error) {
      // Token geçersiz ama guest olarak devam edebilir
      req.user = undefined;
    }
  }
  
  next();
};