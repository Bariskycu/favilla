// src/middlewares/rateLimiter.ts
import rateLimit, { RateLimitRequestHandler, Options } from 'express-rate-limit';
import { Request, Response } from 'express';

// Request interface extension - cache hit flag için
declare global {
  namespace Express {
    interface Request {
      fromCache?: boolean; // Cache hit flag'i
    }
  }
}

// Rate Limiter Factory - Özel limitler için
export interface RateLimitConfig {
  windowMs: number; // Zaman penceresi (milisaniye)
  max: number; // Maksimum istek sayısı
  message?: string; // Özel hata mesajı
  skipSuccessfulRequests?: boolean; // Başarılı istekleri sayma
  skipFailedRequests?: boolean; // Başarısız istekleri sayma
  skipCacheHits?: boolean; // Cache hit olan istekleri sayma
  keyGenerator?: (req: Request) => string; // Özel key generator
}

/**
 * Özel rate limiter oluştur
 */
export const createRateLimiter = (config: RateLimitConfig): RateLimitRequestHandler => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: {
      error: config.message || 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: config.skipSuccessfulRequests || false,
    skipFailedRequests: config.skipFailedRequests || false,
    keyGenerator: config.keyGenerator,
    // Cache hit olan istekleri skip et
    skip: (req: Request) => {
      if (config.skipCacheHits && req.fromCache) {
        return true; // Cache hit ise rate limit'i skip et
      }
      return false;
    },
  });
};

// Genel API Rate Limiter (Tüm endpoint'ler için)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // Her IP için 15 dakikada maksimum 100 istek
  message: {
    error: 'Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.',
  },
  standardHeaders: true, // Rate limit bilgisini `RateLimit-*` header'larında döndür
  legacyHeaders: false, // `X-RateLimit-*` header'larını devre dışı bırak
});

// Auth Rate Limiter (Login/Register için daha sıkı)
// Brute force saldırılarına karşı koruma
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // Her IP için 15 dakikada maksimum 5 deneme
  message: {
    error: 'Çok fazla giriş denemesi yapıldı. Lütfen 15 dakika sonra tekrar deneyin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Başarısız denemeleri daha iyi takip etmek için
  skipSuccessfulRequests: false, // Başarılı istekleri de say (daha güvenli)
});

// API Rate Limiter (Genel API endpoint'leri için)
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 30, // Her IP için 1 dakikada maksimum 30 istek
  message: {
    error: 'Çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// ENDPOINT BAZLI ÖZEL RATE LIMITERS
// ============================================

// Product Listeleme (Yüksek limit - Public endpoint)
// Cache hit'leri saymıyoruz - sadece gerçek DB isteklerini limitliyoruz
export const productListLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 120, // 1 dakikada 120 istek (yüksek trafik - artırıldı)
  message: 'Ürün listesi için çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.',
  skipCacheHits: true, // Cache hit olan istekleri rate limit'ten muaf tut
});

// Product Detay (Orta limit - Public endpoint)
export const productDetailLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 30, // 1 dakikada 30 istek
  message: 'Ürün detayı için çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.',
});

// Product CRUD (Düşük limit - Admin only)
export const productCrudLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 10, // 1 dakikada 10 istek
  message: 'Ürün işlemleri için çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.',
});

// Order Oluşturma (Düşük limit - Kritik işlem)
export const orderCreateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 5, // 1 dakikada 5 sipariş
  message: 'Sipariş oluşturma için çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.',
});

// Order Listeleme (Orta limit)
export const orderListLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 20, // 1 dakikada 20 istek
  message: 'Sipariş listesi için çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.',
});

// Review Oluşturma (Düşük limit - Spam koruması)
export const reviewCreateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // 15 dakikada 5 yorum
  message: 'Yorum oluşturma için çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.',
});

// Review Listeleme (Yüksek limit - Public endpoint)
export const reviewListLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 60, // 1 dakikada 60 istek
  message: 'Yorum listesi için çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.',
});

// Question Oluşturma (Düşük limit - Spam koruması)
export const questionCreateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // 15 dakikada 5 soru
  message: 'Soru oluşturma için çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.',
});

// Question Listeleme (Yüksek limit - Public endpoint)
export const questionListLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 60, // 1 dakikada 60 istek
  message: 'Soru listesi için çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.',
});

// Support Ticket Oluşturma (Düşük limit - Spam koruması)
export const supportCreateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 3, // 15 dakikada 3 ticket
  message: 'Destek talebi oluşturma için çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.',
});

// Support Ticket Listeleme (Orta limit)
export const supportListLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 20, // 1 dakikada 20 istek
  message: 'Destek talebi listesi için çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.',
});

// Cart İşlemleri (Orta limit)
export const cartLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 30, // 1 dakikada 30 istek
  message: 'Sepet işlemleri için çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.',
});

// Wishlist İşlemleri (Orta limit)
export const wishlistLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 30, // 1 dakikada 30 istek
  message: 'Favori işlemleri için çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.',
});

// User Profile İşlemleri (Orta limit)
export const userProfileLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 20, // 1 dakikada 20 istek
  message: 'Profil işlemleri için çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.',
});

// Address İşlemleri (Düşük limit - Kritik işlem)
export const addressLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 10, // 1 dakikada 10 istek
  message: 'Adres işlemleri için çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.',
});

// Audit Log İşlemleri (Düşük limit - Admin only)
export const auditLogLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 10, // 1 dakikada 10 istek
  message: 'Audit log işlemleri için çok fazla istek gönderildi. Lütfen bir dakika sonra tekrar deneyin.',
});
