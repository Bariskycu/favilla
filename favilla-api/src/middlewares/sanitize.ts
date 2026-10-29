// src/middlewares/sanitize.ts
// Input sanitization middleware for XSS protection
import { Request, Response, NextFunction } from 'express';
import {
  sanitizeRequestBody,
  sanitizeQuery,
  sanitizeParams,
} from '../utils/sanitize';

/**
 * Request sanitization middleware
 * Tüm request input'larını (body, query, params) sanitize eder
 * XSS koruması için kullanılır
 */
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Body'yi sanitize et
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeRequestBody(req.body);
  }

  // Query'yi sanitize et (req.query read-only olduğu için property'leri güncelle)
  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery = sanitizeQuery(req.query);
    // Mevcut query objesinin property'lerini güncelle
    Object.keys(sanitizedQuery).forEach((key) => {
      (req.query as any)[key] = sanitizedQuery[key];
    });
  }

  // Params'ı sanitize et (req.params read-only olduğu için property'leri güncelle)
  if (req.params && typeof req.params === 'object') {
    const sanitizedParams = sanitizeParams(req.params);
    // Mevcut params objesinin property'lerini güncelle
    Object.keys(sanitizedParams).forEach((key) => {
      (req.params as any)[key] = sanitizedParams[key];
    });
  }

  next();
};
