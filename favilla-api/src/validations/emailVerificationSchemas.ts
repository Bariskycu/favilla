// src/validations/emailVerificationSchemas.ts
import { z } from 'zod';

// Resend verification email şeması
export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email('Geçersiz e-posta formatı').max(254, 'E-posta çok uzun'),
  }),
});

// Verify email şeması
export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token zorunludur'),
  }),
});

// Type exports
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>['body'];
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>['body'];
