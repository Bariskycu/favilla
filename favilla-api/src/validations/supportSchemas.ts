// src/validations/supportSchemas.ts
import { z } from 'zod';

// Pagination helper
const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => !val || (val >= 1 && val <= 10000), {
      message: 'Page 1-10000 arasında olmalıdır',
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => !val || (val >= 1 && val <= 100), {
      message: 'Limit 1-100 arasında olmalıdır',
    }),
});

// POST /api/support - Create support ticket
export const createSupportTicketSchema = z.object({
  body: z.object({
    subject: z
      .string()
      .min(1, 'Konu zorunludur')
      .max(255, 'Konu en fazla 255 karakter olabilir')
      .trim(),
    message: z
      .string()
      .min(10, 'Mesaj en az 10 karakter olmalıdır')
      .max(5000, 'Mesaj en fazla 5000 karakter olabilir')
      .trim(),
    orderNo: z
      .preprocess(
        (val) => (val === '' || val === null ? undefined : val),
        z
          .string()
          .max(50, 'Sipariş numarası en fazla 50 karakter olabilir')
          .regex(/^#?FAV-?\d+$/, 'Geçersiz sipariş numarası formatı (örn: #FAV-1001)')
          .optional()
      ),
  }),
});

// GET /api/support - Get user tickets
export const getSupportTicketsSchema = z.object({
  query: paginationQuerySchema,
});

// Type exports
export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>['body'];
export type GetSupportTicketsInput = z.infer<typeof getSupportTicketsSchema>['query'];
