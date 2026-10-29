// src/validations/orderSchemas.ts
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
    .refine((val) => !val || (val >= 1 && val <= 100), {
      message: 'Limit 1-100 arasında olmalıdır',
    }),
});

// GET /api/orders - Get user orders
export const getUserOrdersSchema = z.object({
  query: paginationQuerySchema,
});

// GET /api/orders/:id - Get order details
export const getOrderDetailsSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

// Type exports
export type GetUserOrdersInput = z.infer<typeof getUserOrdersSchema>['query'];
