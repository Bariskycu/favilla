// src/middlewares/requestLogger.ts
// HTTP request logging middleware
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { RequestWithId } from './requestId';

/**
 * Request logging middleware
 * Tüm HTTP isteklerini loglar
 */
export const requestLogger = (req: RequestWithId, res: Response, next: NextFunction): void => {
  // Response tamamlandığında logla
  res.on('finish', () => {
    const { method, originalUrl } = req;
    const { statusCode } = res;
    const responseTime = res.locals.responseTime || 'N/A';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const requestId = req.requestId || res.locals.requestId || 'N/A';

    // Log seviyesi belirleme
    if (statusCode >= 500) {
      logger.error(`${method} ${originalUrl} ${statusCode} - IP: ${ip} - ${responseTime}ms - Request-ID: ${requestId}`);
    } else if (statusCode >= 400) {
      logger.warn(`${method} ${originalUrl} ${statusCode} - IP: ${ip} - ${responseTime}ms - Request-ID: ${requestId}`);
    } else {
      logger.http(`${method} ${originalUrl} ${statusCode} - IP: ${ip} - ${responseTime}ms - Request-ID: ${requestId}`);
    }
  });

  next();
};

/**
 * Response time middleware
 * Response süresini ölçer ve loglar
 */
export const responseTimeLogger = (req: RequestWithId, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    res.locals.responseTime = responseTime;

    // Yavaş istekleri uyar
    if (responseTime > 1000) {
      const requestId = req.requestId || res.locals.requestId || 'N/A';
      logger.warn(`Yavaş istek tespit edildi: ${req.method} ${req.originalUrl} - ${responseTime}ms - Request-ID: ${requestId}`);
    }
  });

  next();
};
