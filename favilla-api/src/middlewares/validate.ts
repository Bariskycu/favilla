// src/middlewares/validate.ts
// Zod validation middleware
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from './errorHandler';

/**
 * Request validation middleware
 * Zod şemasına göre request'i validate eder
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Şemayı validate et (body, query, params)
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Validasyon başarılı, bir sonraki middleware'e geç
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod validation hatası
        // Zod'da errors yerine issues kullanılır
        if (!error.issues || !Array.isArray(error.issues)) {
          return next(new ValidationError('Validasyon hatası: Geçersiz hata formatı'));
        }

        const errors = error.issues.map((err) => ({
          field: err.path ? err.path.join('.') : 'unknown',
          message: err.message || 'Validasyon hatası',
        }));

        // İlk hatayı al (daha temiz hata mesajı için)
        const firstError = errors[0];

        // ValidationError ile error handler'a yönlendir
        // Birden fazla hata varsa details'i gönder
        const details = errors.length > 1 ? errors : undefined;
        return next(new ValidationError(firstError.message, details));
      }

      // Beklenmeyen hata - CustomError ile error handler'a yönlendir
      return next(new ValidationError('Validasyon hatası'));
    }
  };
};
