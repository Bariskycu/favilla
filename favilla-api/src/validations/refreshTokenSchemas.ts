// src/validations/refreshTokenSchemas.ts
import { z } from 'zod';

// Refresh token şeması
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token zorunludur'),
  }),
});

// Logout şeması
export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token zorunludur'),
  }),
});

// Type exports
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type LogoutInput = z.infer<typeof logoutSchema>['body'];
