// src/routes/authRoutes.ts
import { Router, Response } from 'express';
import { 
  register, 
  login, 
  forgotPassword, 
  resetPasswordController,
  verifyEmailController,
  resendVerificationEmail,
  refreshAccessToken,
  logout,
  logoutAll,
} from '../controllers/authController';
import { protect, AuthRequest } from '../middlewares/authMiddleware';
import { authLimiter } from '../middlewares/rateLimiter';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema } from '../validations/authSchemas';
import { forgotPasswordSchema, resetPasswordSchema } from '../validations/passwordResetSchemas';
import { verifyEmailSchema, resendVerificationSchema } from '../validations/emailVerificationSchemas';
import { refreshTokenSchema, logoutSchema } from '../validations/refreshTokenSchemas';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Kullanıcı kaydı
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Ahmet Yılmaz
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ahmet@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: En az 8 karakter, büyük harf, küçük harf, rakam ve özel karakter içermeli
 *                 example: SecurePass123!
 *               phone:
 *                 type: string
 *                 example: +90 555 123 4567
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       400:
 *         description: Validation hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: E-posta adresi zaten kullanılıyor
 */
router.post('/register', authLimiter, validate(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ahmet@example.com
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Giriş başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       401:
 *         description: E-posta veya şifre hatalı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', authLimiter, validate(loginSchema), login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Kullanıcı bilgilerini getir
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı bilgileri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Yetkisiz erişim
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', protect, (req: AuthRequest, res: Response) => {
  res.json({
    message: 'Bu veriyi görüyorsanız giriş yapmışsınız demektir!',
    user: req.user,
  });
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Şifre sıfırlama isteği
 *     description: E-posta adresine şifre sıfırlama bağlantısı gönderir
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: E-posta gönderildi (güvenlik için her durumda aynı mesaj)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Şifre sıfırlama
 *     description: Token ile yeni şifre belirleme
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Şifre sıfırlama token'ı (email'den gelen)
 *                 example: abc123def456...
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Yeni şifre
 *                 example: NewSecurePass123!
 *               confirmPassword:
 *                 type: string
 *                 description: Yeni şifre tekrar
 *                 example: NewSecurePass123!
 *     responses:
 *       200:
 *         description: Şifre başarıyla sıfırlandı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Geçersiz token veya validation hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPasswordController);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: E-posta doğrulama
 *     description: E-posta doğrulama token'ı ile e-posta adresini doğrular
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: E-posta doğrulama token'ı (email'den gelen)
 *                 example: abc123def456...
 *     responses:
 *       200:
 *         description: E-posta başarıyla doğrulandı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Geçersiz token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), verifyEmailController);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Doğrulama e-postasını yeniden gönder
 *     description: E-posta doğrulama bağlantısını yeniden gönderir
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: E-posta gönderildi (güvenlik için her durumda aynı mesaj)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation hatası
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/resend-verification', authLimiter, validate(resendVerificationSchema), resendVerificationEmail);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Access token yenileme
 *     description: Refresh token ile yeni access token alır
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token
 *                 example: abc123def456...
 *     responses:
 *       200:
 *         description: Yeni access token ve refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Yeni access token (15 dakika geçerli)
 *                 refreshToken:
 *                   type: string
 *                   description: Yeni refresh token (30 gün geçerli)
 *       401:
 *         description: Geçersiz refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh', authLimiter, validate(refreshTokenSchema), refreshAccessToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Çıkış yap
 *     description: Refresh token'ı iptal eder (sadece bu cihazdan çıkış)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: İptal edilecek refresh token
 *     responses:
 *       200:
 *         description: Başarıyla çıkış yapıldı
 *       400:
 *         description: Validation hatası
 */
router.post('/logout', authLimiter, validate(logoutSchema), logout);

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Tüm cihazlardan çıkış yap
 *     description: Kullanıcının tüm refresh token'larını iptal eder
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Kullanıcının refresh token'ı
 *     responses:
 *       200:
 *         description: Tüm cihazlardan başarıyla çıkış yapıldı
 *       401:
 *         description: Geçersiz refresh token
 */
router.post('/logout-all', authLimiter, validate(logoutSchema), logoutAll);

export default router;