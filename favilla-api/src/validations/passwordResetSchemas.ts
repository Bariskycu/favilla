// src/validations/passwordResetSchemas.ts
import { z } from 'zod';
import { passwordSchema } from './authSchemas';

// Forgot password şeması
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Geçersiz e-posta formatı').max(254, 'E-posta çok uzun'),
  }),
});

// Reset password şeması
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token zorunludur'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Şifre tekrar zorunludur'),
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Şifre ve şifre tekrar eşleşmiyor',
      path: ['confirmPassword'],
    }
  ),
});

// Type exports
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
