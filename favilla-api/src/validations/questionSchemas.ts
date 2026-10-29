// src/validations/questionSchemas.ts
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

// Pagination helper for user questions (limit up to 100)
const userQuestionsPaginationSchema = z.object({
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

// POST /api/questions/:productId - Ask question
export const askQuestionSchema = z.object({
  params: z.object({
    productId: uuidSchema,
  }),
  body: z.object({
    question: z
      .string()
      .min(5, 'Soru en az 5 karakter olmalıdır')
      .max(1000, 'Soru en fazla 1000 karakter olabilir')
      .trim(),
  }),
});

// GET /api/questions/:productId - Get product questions
export const getProductQuestionsSchema = z.object({
  params: z.object({
    productId: uuidSchema,
  }),
  query: paginationQuerySchema,
});

// GET /api/questions/my - Get user questions
export const getUserQuestionsSchema = z.object({
  query: userQuestionsPaginationSchema,
});

// Type exports
export type AskQuestionInput = z.infer<typeof askQuestionSchema>['body'];
export type GetProductQuestionsInput = z.infer<typeof getProductQuestionsSchema>['query'];
export type GetUserQuestionsInput = z.infer<typeof getUserQuestionsSchema>['query'];
