// src/validations/authSchemas.ts
import { z } from 'zod';

// Email validasyonu için custom refinement
const emailSchema = z.string().email('Geçersiz e-posta formatı').max(254, 'E-posta çok uzun');

// Şifre validasyonu için custom refinement
export const passwordSchema = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalıdır')
  .max(128, 'Şifre en fazla 128 karakter olabilir')
  .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir (A-Z)')
  .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir (a-z)')
  .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir (0-9)')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Şifre en az bir özel karakter içermelidir (!@#$%^&* vb.)')
  .refine(
    (password) => {
      const lowerPassword = password.toLowerCase();
      const commonWeakPasswords = [
        'password',
        'password123',
        '12345678',
        'qwerty123',
        'admin123',
        'letmein',
        'welcome123',
        'monkey123',
        '123456789',
        'password1',
      ];
      return !commonWeakPasswords.some((weak) => lowerPassword.includes(weak));
    },
    { message: 'Lütfen daha güçlü bir şifre seçin. Bu şifre çok yaygın kullanılıyor.' }
  )
  .refine(
    (password) => {
      // Ardışık karakter kontrolü
      const sequentialPattern = /(012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i;
      return !sequentialPattern.test(password);
    },
    { message: 'Şifre ardışık karakterler içermemelidir (ör: 1234, abcd)' }
  )
  .refine(
    (password) => {
      // Aynı karakterin 3+ kez tekrarı kontrolü
      return !/(.)\1{2,}/.test(password);
    },
    { message: 'Şifre aynı karakterin 3+ kez tekrarını içermemelidir (ör: aaa, 111)' }
  );

// Telefon validasyonu
const phoneSchema = z
  .string()
  .regex(/^[\d\s\+\-\(\)]+$/, 'Geçersiz telefon numarası formatı')
  .refine(
    (phone) => {
      const cleanPhone = phone.replace(/[\s\+\-\(\)]/g, '');
      return cleanPhone.length >= 10 && cleanPhone.length <= 15;
    },
    { message: 'Telefon numarası 10-15 karakter arasında olmalıdır' }
  );

// Register şeması
export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'İsim zorunludur')
      .max(100, 'İsim en fazla 100 karakter olabilir')
      .trim()
      .refine((name) => name.length > 0, { message: 'İsim boş olamaz' }),
    email: emailSchema,
    password: passwordSchema,
    phone: phoneSchema,
  }),
});

// Login şeması
export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Şifre zorunludur'),
  }),
});

// Type inference için
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
