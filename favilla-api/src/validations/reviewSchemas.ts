// src/validations/reviewSchemas.ts
import { z } from 'zod';

// UUID validation helper
const uuidSchema = z.string().uuid('Geçersiz ID formatı');

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
    .refine((val) => !val || (val >= 1 && val <= 50), {
      message: 'Limit 1-50 arasında olmalıdır',
    }),
});

// POST /api/reviews/:productId - Create review
export const createReviewSchema = z.object({
  params: z.object({
    productId: uuidSchema,
  }),
  body: z.object({
    rating: z
      .number({ required_error: 'Puan zorunludur', invalid_type_error: 'Puan sayı olmalıdır' })
      .int('Puan tam sayı olmalıdır')
      .min(1, 'Puan en az 1 olmalıdır')
      .max(5, 'Puan en fazla 5 olabilir'),
    comment: z
      .string()
      .max(2000, 'Yorum en fazla 2000 karakter olabilir')
      .optional(),
  }),
});

// GET /api/reviews/:productId - Get product reviews
export const getProductReviewsSchema = z.object({
  params: z.object({
    productId: uuidSchema,
  }),
  query: paginationQuerySchema,
});

// GET /api/reviews/:productId/check - Check eligibility
export const checkReviewEligibilitySchema = z.object({
  params: z.object({
    productId: uuidSchema,
  }),
});

// Type exports
export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
export type GetProductReviewsInput = z.infer<typeof getProductReviewsSchema>['query'];
