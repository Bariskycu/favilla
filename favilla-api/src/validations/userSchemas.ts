// src/validations/userSchemas.ts
import { z } from 'zod';

// Şifre şeması (authSchemas'tan import edilebilir ama şimdilik burada)
const passwordSchema = z
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
      const sequentialPattern = /(012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i;
      return !sequentialPattern.test(password);
    },
    { message: 'Şifre ardışık karakterler içermemelidir (ör: 1234, abcd)' }
  )
  .refine(
    (password) => {
      return !/(.)\1{2,}/.test(password);
    },
    { message: 'Şifre aynı karakterin 3+ kez tekrarını içermemelidir (ör: aaa, 111)' }
  );

// Profil güncelleme şeması
export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .max(100, 'İsim en fazla 100 karakter olabilir')
      .trim()
      .refine((name) => !name || name.length > 0, { message: 'İsim boş olamaz' })
      .optional(),
    phone: z
      .string()
      .regex(/^[\d\s\+\-\(\)]+$/, 'Geçersiz telefon numarası formatı')
      .refine(
        (phone) => {
          if (!phone) return true; // Optional
          const cleanPhone = phone.replace(/[\s\+\-\(\)]/g, '');
          return cleanPhone.length >= 10 && cleanPhone.length <= 15;
        },
        { message: 'Telefon numarası 10-15 karakter arasında olmalıdır' }
      )
      .max(20, 'Telefon numarası en fazla 20 karakter olabilir')
      .optional(),
    currentPassword: z.string().optional(),
    newPassword: passwordSchema.optional(),
    confirmPassword: z.string().optional(),
  }).refine(
    (data) => {
      // Şifre güncelleme için tüm alanlar gerekli
      if (data.newPassword || data.currentPassword || data.confirmPassword) {
        return data.currentPassword && data.newPassword && data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Şifre güncelleme için mevcut şifre, yeni şifre ve yeni şifre tekrar alanları zorunludur.',
      path: ['currentPassword'],
    }
  ).refine(
    (data) => {
      // Yeni şifre ve tekrar eşleşmeli
      if (data.newPassword && data.confirmPassword) {
        return data.newPassword === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Yeni şifre ve yeni şifre tekrar eşleşmiyor.',
      path: ['confirmPassword'],
    }
  ),
});

// Adres şeması
export const addressSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Başlık zorunludur').max(50, 'Başlık en fazla 50 karakter olabilir'),
    line1: z.string().min(1, 'Adres satırı zorunludur').max(255, 'Adres satırı en fazla 255 karakter olabilir'),
    city: z.string().min(1, 'Şehir zorunludur').max(100, 'Şehir en fazla 100 karakter olabilir'),
    zip: z.string().min(1, 'Posta kodu zorunludur').max(20, 'Posta kodu en fazla 20 karakter olabilir'),
    country: z.string().min(1, 'Ülke zorunludur').max(100, 'Ülke en fazla 100 karakter olabilir'),
  }),
});

// Adres güncelleme şeması (params ile birlikte)
export const updateAddressSchema = z.object({
  params: z.object({
    id: z.string().uuid('Geçersiz ID formatı'),
  }),
  body: addressSchema.shape.body,
});

// Adres silme şeması
export const deleteAddressSchema = z.object({
  params: z.object({
    id: z.string().uuid('Geçersiz ID formatı'),
  }),
});

// Kullanıcı rolü güncelleme şeması (Admin işlemi)
export const changeUserRoleSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Geçersiz kullanıcı ID formatı'),
  }),
  body: z.object({
    role: z.enum(['customer', 'admin'], {
      errorMap: () => ({ message: 'Rol customer veya admin olmalıdır' }),
    }),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type AddressInput = z.infer<typeof addressSchema>['body'];
export type ChangeUserRoleInput = z.infer<typeof changeUserRoleSchema>['body'];