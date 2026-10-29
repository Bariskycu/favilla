import { Request, Response, NextFunction } from 'express';
import {
  createUser,
  findByEmail,
  findById,
  createPasswordResetToken,
  resetPassword,
  createEmailVerificationToken,
  verifyEmail,
} from '../models/userModel';
import {
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  rotateRefreshToken,
} from '../models/refreshTokenModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { env } from '../config/env';
import { CustomError } from '../middlewares/errorHandler';
import logger from '../utils/logger';
import pool from '../config/db';
import { sendSuccess, sendCreated } from '../utils/response';
import { mergeGuestCartToUser } from '../models/cartModel';

// Access token oluşturma helper fonksiyonu (kısa süreli - 15 dakika)
const generateAccessToken = (userId: string, email: string): string => {
  return jwt.sign(
    { id: userId, email, type: 'access' },
    env.JWT_SECRET,
    { expiresIn: '15m' } // Access token 15 dakika geçerli
  );
};

// Cookie set etme helper fonksiyonu (HttpOnly, Secure, SameSite)
const setTokenCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  // Access token cookie (15 dakika - kısa süreli)
  res.cookie('accessToken', accessToken, {
    httpOnly: true, // XSS koruması - JavaScript erişemez
    secure: env.COOKIE_SECURE, // HTTPS için (production'da true)
    sameSite: env.COOKIE_SAME_SITE, // CSRF koruması
    domain: env.COOKIE_DOMAIN, // Domain ayarı (opsiyonel)
    maxAge: 15 * 60 * 1000, // 15 dakika (milisaniye)
    path: '/', // Tüm path'lerde geçerli
  });

  // Refresh token cookie (7 gün - uzun süreli)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // XSS koruması - JavaScript erişemez
    secure: env.COOKIE_SECURE, // HTTPS için (production'da true)
    sameSite: env.COOKIE_SAME_SITE, // CSRF koruması
    domain: env.COOKIE_DOMAIN, // Domain ayarı (opsiyonel)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün (milisaniye)
    path: '/', // Tüm path'lerde geçerli
  });
};

// Cookie temizleme helper fonksiyonu
const clearTokenCookies = (res: Response): void => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    domain: env.COOKIE_DOMAIN,
    path: '/',
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    domain: env.COOKIE_DOMAIN,
    path: '/',
  });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validasyon middleware tarafından yapıldı, burada sadece iş mantığı
    const { name, email, password, phone } = req.body;

    // Kullanıcı oluştur (verification token otomatik oluşturulur)
    const user = await createUser({ name, email, password, phone }) as any;

    // Access token oluştur
    const accessToken = generateAccessToken(user.id, user.email);

    // Refresh token oluştur
    const deviceInfo = req.headers['user-agent'] || 'Unknown';
    const refreshToken = await createRefreshToken(user.id, deviceInfo);

    // Email verification link'i oluştur (şimdilik log'a yazılıyor)
    if (user.verificationToken) {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${user.verificationToken}`;
      logger.info(`Email verification token oluşturuldu: ${email}`);
      logger.info(`Verification URL: ${verificationUrl}`);

      // TODO: Production'da burada email gönderilir:
      // await sendVerificationEmail(email, user.verificationToken);
    }

    // Token'ları HttpOnly cookie olarak set et (XSS koruması)
    setTokenCookies(res, accessToken, refreshToken);

    // Başarılı yanıt (token'lar cookie'de, response body'de user ve token bilgisi)
    sendCreated(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          email_verified: user.email_verified || false,
          created_at: user.created_at,
        },
        token: accessToken,
      },
      {
        message: 'Kayıt başarılı! E-posta adresinize doğrulama bağlantısı gönderilmiştir.',
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Bu e-posta adresi zaten kullanılıyor') {
        return next(new CustomError(error.message, 409));
      }
      return next(new CustomError(error.message, 500));
    }
    return next(new CustomError('Sunucu hatası', 500));
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Validasyon middleware tarafından yapıldı, burada sadece iş mantığı
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await findByEmail(email);
    if (!user) {
      return next(new CustomError('E-posta veya şifre hatalı', 401));
    }

    // Şifreyi doğrula
    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      return next(new CustomError('E-posta veya şifre hatalı', 401));
    }

    // Access token oluştur
    const accessToken = generateAccessToken(user.id, user.email);

    // Refresh token oluştur
    const deviceInfo = req.headers['user-agent'] || 'Unknown';
    const refreshToken = await createRefreshToken(user.id, deviceInfo);

    // Guest cart merge işlemi (eğer frontend'den guestId gönderilmişse)
    const guestId = req.body.guestId || req.headers['x-guest-id'] as string;
    if (guestId) {
      try {
        await mergeGuestCartToUser(user.id, guestId);
        logger.info(`Guest cart merged to user cart: userId=${user.id}, guestId=${guestId}`);
      } catch (error) {
        // Merge hatası kritik değil, sadece log'la
        logger.warn(`Failed to merge guest cart: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Token'ları HttpOnly cookie olarak set et (XSS koruması)
    setTokenCookies(res, accessToken, refreshToken);

    // Başarılı yanıt (token'lar cookie'de, response body'de user ve token bilgisi)
    sendSuccess(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        email_verified: user.email_verified || false,
      },
      token: accessToken,
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(new CustomError(error.message, 500));
    }
    return next(new CustomError('Sunucu hatası', 500));
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const resetToken = await createPasswordResetToken(email);

    // Güvenlik için: Kullanıcı bulunamasa bile "bulunamadı" demeyiz, standart mesaj döneriz.
    if (resetToken) {
      logger.info(`Şifre sıfırlama tokeni oluşturuldu: ${email} -> ${resetToken}`);
      // TODO: E-posta gönderme işlemi burada yapılacak
      // const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      // await sendPasswordResetEmail(email, resetUrl);
    }

    sendSuccess(res, { message: 'E-posta adresinize şifre sıfırlama bağlantısı gönderildi.' });
  } catch (error) {
    next(new CustomError('Şifre sıfırlama işlemi başarısız', 500));
  }
};

export const resetPasswordController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body;
    // Token doğrulama ve şifre güncelleme mantığı
    const isReset = await resetPassword(token, password);

    if (!isReset) {
      return next(new CustomError('Geçersiz veya süresi dolmuş token', 400));
    }

    sendSuccess(res, { message: 'Şifreniz başarıyla sıfırlandı.' });
  } catch (error) {
    if (error instanceof Error) {
      return next(new CustomError(error.message || 'Geçersiz veya süresi dolmuş token', 400));
    }
    next(new CustomError('Şifre sıfırlama hatası', 500));
  }
};

export const verifyEmailController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    const isVerified = await verifyEmail(token);

    if (!isVerified) {
      return next(new CustomError('Geçersiz veya süresi dolmuş doğrulama tokeni', 400));
    }

    sendSuccess(res, { message: 'E-posta adresiniz başarıyla doğrulandı.' });
  } catch (error) {
    next(new CustomError('Doğrulama hatası', 500));
  }
};

export const resendVerificationEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await findByEmail(email);

    if (user && !user.email_verified) {
      // Yeni token oluştur
      const newToken = await createEmailVerificationToken(email);
      if (newToken) {
        logger.info(`Yeni doğrulama tokeni: ${email} -> ${newToken}`);
        // TODO: E-posta gönder
        // const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${newToken}`;
        // await sendVerificationEmail(email, verificationUrl);
      }
    }

    // Güvenlik: Kullanıcı olmasa veya zaten doğrulanmış olsa bile aynı mesajı dön
    sendSuccess(res, { message: 'Doğrulama bağlantısı e-posta adresinize gönderildi.' });
  } catch (error) {
    next(new CustomError('İşlem başarısız', 500));
  }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Refresh token'ı cookie'den veya body'den al (geriye dönük uyumluluk için)
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return next(new CustomError('Refresh token bulunamadı', 401));
    }

    // Token veritabanında var mı ve geçerli mi kontrol et
    const userId = await verifyRefreshToken(refreshToken);

    if (!userId) {
      return next(new CustomError('Geçersiz veya süresi dolmuş refresh token', 401));
    }

    // Kullanıcı bilgilerini al
    const user = await findById(userId);
    if (!user) {
      return next(new CustomError('Kullanıcı bulunamadı', 404));
    }

    // Refresh token rotasyonu (Güvenlik için her kullanımda yenisini ver)
    const deviceInfo = req.headers['user-agent'] || 'Unknown';
    const newRefreshToken = await rotateRefreshToken(refreshToken, userId, deviceInfo);

    // Yeni access token üret
    const accessToken = generateAccessToken(user.id, user.email);

    // Yeni token'ları HttpOnly cookie olarak set et
    setTokenCookies(res, accessToken, newRefreshToken);

    // Başarılı yanıt (token'lar cookie'de)
    sendSuccess(res, {
      message: 'Token başarıyla yenilendi',
    });
  } catch (error) {
    if (error instanceof Error) {
      return next(new CustomError(error.message || 'Token yenileme başarısız', 401));
    }
    next(new CustomError('Token yenileme başarısız', 401));
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Refresh token'ı cookie'den veya body'den al (geriye dönük uyumluluk için)
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (refreshToken) {
      const isRevoked = await revokeRefreshToken(refreshToken);

      if (!isRevoked) {
        // Token bulunamadı veya zaten iptal edilmiş, ama güvenlik için başarılı mesaj döneriz
        logger.warn(`Logout: Refresh token bulunamadı veya zaten iptal edilmiş`);
      }
    }

    // Cookie'leri temizle
    clearTokenCookies(res);

    sendSuccess(res, { message: 'Başarıyla çıkış yapıldı.' });
  } catch (error) {
    next(new CustomError('Çıkış işlemi başarısız', 500));
  }
};

export const logoutAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Refresh token'ı cookie'den veya body'den al (geriye dönük uyumluluk için)
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (refreshToken) {
      // Token üzerinden user_id'yi bulup tüm oturumları kapatacağız
      const userId = await verifyRefreshToken(refreshToken);
      if (userId) {
        await revokeAllUserRefreshTokens(userId);
      }
    }

    // Cookie'leri temizle
    clearTokenCookies(res);

    sendSuccess(res, { message: 'Tüm cihazlardan çıkış yapıldı.' });
  } catch (error) {
    next(new CustomError('İşlem başarısız', 500));
  }
};
