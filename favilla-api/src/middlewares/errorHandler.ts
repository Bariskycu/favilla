// src/middlewares/errorHandler.ts
// Global error handler middleware
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { RequestWithId } from './requestId';
import { env } from '../config/env';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Custom error class
 */
export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;
  details?: any; // Ek hata detayları (validation errors vb.)

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error class
 * Zod validation hataları için özel error class
 */
export class ValidationError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 400, true, details);
    this.name = 'ValidationError';
  }
}

/**
 * Global error handler middleware
 * Tüm hataları yakalar ve standart formatta döndürür
 */
export const errorHandler = (
  err: AppError | Error,
  req: RequestWithId,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.requestId || res.locals.requestId || 'N/A';
  // Custom error ise status code'u kullan
  if ('statusCode' in err && err.statusCode) {
    const statusCode = err.statusCode;
    const isOperational = err.isOperational !== false;
    const customError = err as CustomError;

    // Operational hatalar (beklenen hatalar) - güvenli mesaj göster
    if (isOperational) {
      // Operational hataları warn seviyesinde logla (4xx hataları)
      if (statusCode >= 400 && statusCode < 500) {
        const errorDetails = customError.details ? ` - Details: ${JSON.stringify(customError.details)}` : '';
        logger.warn(`${statusCode} - ${err.message}${errorDetails} - ${req.method} ${req.originalUrl} - IP: ${req.ip} - Request-ID: ${requestId}`);
      }
      
      // Validation error ise details'i de gönder
      if (customError.details) {
        res.status(statusCode).json({
          error: err.message,
          details: customError.details,
          requestId,
        });
        return;
      }
      
      res.status(statusCode).json({
        error: err.message,
        requestId,
      });
      return;
    }
  }

  // PostgreSQL hataları
  if ('code' in err) {
    const pgError = err as any;
    
    // Unique constraint violation
    if (pgError.code === '23505') {
      logger.warn(`PostgreSQL Unique Constraint - ${pgError.message} - ${req.method} ${req.originalUrl} - Request-ID: ${requestId}`);
      res.status(409).json({
        error: 'Bu kayıt zaten mevcut',
        requestId,
      });
      return;
    }

    // Foreign key violation
    if (pgError.code === '23503') {
      logger.warn(`PostgreSQL Foreign Key - ${pgError.message} - ${req.method} ${req.originalUrl} - Request-ID: ${requestId}`);
      res.status(400).json({
        error: 'İlişkili kayıt bulunamadı',
        requestId,
      });
      return;
    }

    // Not null violation
    if (pgError.code === '23502') {
      logger.warn(`PostgreSQL Not Null - ${pgError.message} - ${req.method} ${req.originalUrl} - Request-ID: ${requestId}`);
      res.status(400).json({
        error: 'Zorunlu alanlar eksik',
        requestId,
      });
      return;
    }
  }

  // JWT hataları (authMiddleware orijinal hatayı ilettiğinde bu bloklara düşer)
  if (err.name === 'JsonWebTokenError') {
    logger.warn(`JWT Error - ${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip} - Request-ID: ${requestId}`);
    res.status(401).json({
      error: 'Geçersiz token',
      code: 'TOKEN_INVALID',
      requestId,
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    logger.warn(`JWT Expired - ${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip} - Request-ID: ${requestId}`);
    res.status(401).json({
      error: 'Token süresi dolmuş',
      code: 'TOKEN_EXPIRED',
      requestId,
    });
    return;
  }

  // Body size limit hataları
  // Body size limit hataları
  if (err.name === 'PayloadTooLargeError' || (err as any).type === 'entity.too.large') {
    logger.warn(`Payload Too Large - ${req.method} ${req.originalUrl} - IP: ${req.ip} - Request-ID: ${requestId}`);
    res.status(413).json({
      error: 'İstek boyutu çok büyük. Maksimum 1MB veri gönderebilirsiniz.',
      requestId,
    });
    return;
  }

  // Varsayılan: 500 Internal Server Error
  // Production'da detaylı hata mesajı gösterme
  const isDevelopment = env.NODE_ENV === 'development';

  // Kritik hataları error seviyesinde logla
  logger.error(`${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip} - Request-ID: ${requestId}`, {
    error: err,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
    requestId,
  });

  res.status(500).json({
    error: isDevelopment ? err.message : 'Sunucu hatası',
    requestId,
    ...(isDevelopment && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: RequestWithId, res: Response): void => {
  const requestId = req.requestId || res.locals.requestId || 'N/A';
  logger.warn(`404 - Route bulunamadı: ${req.method} ${req.originalUrl} - IP: ${req.ip} - Request-ID: ${requestId}`);
  res.status(404).json({
    error: `Route ${req.originalUrl} bulunamadı`,
    requestId,
  });
};

/**
 * Async handler wrapper
 * Controller fonksiyonlarını wrap ederek otomatik error handling sağlar
 * Kullanım: export const myController = asyncHandler(async (req, res) => { ... });
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
