// src/middlewares/requestId.ts
// Request ID tracking middleware
// Her request için unique bir ID oluşturur ve response header'ına ekler
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

// Request interface'ini genişlet
export interface RequestWithId extends Request {
  requestId?: string;
}

/**
 * Request ID middleware
 * Her request için unique bir ID oluşturur ve:
 * - req.requestId olarak request'e ekler
 * - X-Request-ID header'ı olarak response'a ekler
 * - Logger'da kullanılabilir hale getirir
 */
export const requestIdMiddleware = (req: RequestWithId, res: Response, next: NextFunction): void => {
  // Eğer client tarafından X-Request-ID header'ı gönderilmişse onu kullan,
  // yoksa yeni bir UUID oluştur
  const clientRequestId = req.headers['x-request-id'] as string;
  const requestId = clientRequestId || randomUUID();

  // Request'e ekle
  req.requestId = requestId;

  // Response header'ına ekle
  res.setHeader('X-Request-ID', requestId);

  // Response locals'a da ekle (logger'da kullanmak için)
  res.locals.requestId = requestId;

  next();
};
