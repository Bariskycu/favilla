// src/validations/productSchemas.ts
import { z } from 'zod';

// UUID validation helper
const uuidSchema = z.string().uuid('Geçersiz ID formatı');

// Slug validation
const slugSchema = z.string().min(1, 'Slug zorunludur').max(255, 'Slug en fazla 255 karakter olabilir');

// Product type enum
const productTypeSchema = z.enum(['jar', 'sculptural', 'set'], {
  errorMap: () => ({ message: 'Ürün tipi jar, sculptural veya set olmalıdır' }),
});

// Color enum
const colorSchema = z.enum(['natural', 'charcoal', 'terracotta'], {
  errorMap: () => ({ message: 'Renk natural, charcoal veya terracotta olmalıdır' }),
});

// Material enum
const materialSchema = z.enum(['soy-wax', 'beeswax', 'coconut-blend'], {
  errorMap: () => ({ message: 'Malzeme soy-wax, beeswax veya coconut-blend olmalıdır' }),
});

// Sort options
const sortSchema = z.enum(['price-asc', 'price-desc', 'rating', 'newest'], {
  errorMap: () => ({ message: 'Sıralama price-asc, price-desc, rating veya newest olmalıdır' }),
});

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

// GET /api/products - Query parameters
export const getProductsSchema = z.object({
  query: paginationQuerySchema.extend({
    search: z.string().max(255, 'Arama terimi en fazla 255 karakter olabilir').optional(),
    type: productTypeSchema.optional(),
    color: colorSchema.optional(),
    material: materialSchema.optional(),
    minPrice: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined))
      .refine((val) => !val || (val >= 0 && val <= 1000000), {
        message: 'Min fiyat 0-1000000 arasında olmalıdır',
      }),
    maxPrice: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined))
      .refine((val) => !val || (val >= 0 && val <= 1000000), {
        message: 'Max fiyat 0-1000000 arasında olmalıdır',
      }),
    sort: sortSchema.optional(),
  }).refine(
    (data) => {
      // minPrice ve maxPrice birlikte kullanılıyorsa minPrice <= maxPrice olmalı
      if (data.minPrice && data.maxPrice) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: 'Min fiyat max fiyattan büyük olamaz',
      path: ['minPrice'],
    }
  ),
});

// GET /api/products/:slug - Params
// Slug veya UUID kabul eden schema
export const getProductBySlugSchema = z.object({
  params: z.object({
    slug: z
      .string()
      .min(1, 'Slug veya ID zorunludur')
      .max(255, 'Slug veya ID en fazla 255 karakter olabilir')
      .refine(
        (val) => {
          // Slug formatı (küçük harf, rakam, tire) veya UUID formatı kabul et
          const slugPattern = /^[a-z0-9-]+$/;
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return slugPattern.test(val) || uuidPattern.test(val);
        },
        { message: 'Geçersiz slug veya ID formatı' }
      ),
  }),
});

// POST /api/products - Create product
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Ürün adı zorunludur').max(255, 'Ürün adı en fazla 255 karakter olabilir'),
    slug: z.string().max(255, 'Slug en fazla 255 karakter olabilir').optional(),
    tagline: z.string().max(255, 'Tagline en fazla 255 karakter olabilir').optional(),
    description: z.string().max(5000, 'Açıklama en fazla 5000 karakter olabilir').optional(),
    price: z
      .number({ required_error: 'Fiyat zorunludur', invalid_type_error: 'Fiyat sayı olmalıdır' })
      .positive('Fiyat pozitif olmalıdır')
      .max(1000000, 'Fiyat çok yüksek'),
    discountPrice: z
      .number({ invalid_type_error: 'İndirimli fiyat sayı olmalıdır' })
      .positive('İndirimli fiyat pozitif olmalıdır')
      .max(1000000, 'İndirimli fiyat çok yüksek')
      .optional(),
    type: productTypeSchema.optional(),
    color: colorSchema.optional(),
    material: materialSchema.optional(),
    imageUrl: z.string().url('Geçerli bir URL olmalıdır').max(500, 'Resim URL en fazla 500 karakter olabilir'),
    hoverImageUrl: z.string().url('Geçerli bir URL olmalıdır').max(500, 'Hover resim URL en fazla 500 karakter olabilir').optional(),
    burnTime: z.string().max(50, 'Yanma süresi en fazla 50 karakter olabilir').optional(),
    scentProfile: z.string().max(100, 'Koku profili en fazla 100 karakter olabilir').optional(),
    stockQuantity: z
      .number({ invalid_type_error: 'Stok miktarı sayı olmalıdır' })
      .int('Stok miktarı tam sayı olmalıdır')
      .min(0, 'Stok miktarı negatif olamaz')
      .max(100000, 'Stok miktarı çok yüksek')
      .optional()
      .default(100),
  }).refine(
    (data) => {
      // Eğer discountPrice varsa, price'dan küçük olmalı
      if (data.discountPrice && data.price) {
        return data.discountPrice < data.price;
      }
      return true;
    },
    {
      message: 'İndirimli fiyat normal fiyattan küçük olmalıdır',
      path: ['discountPrice'],
    }
  ),
});

// PUT /api/products/:id - Update product
export const updateProductSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    name: z.string().min(1, 'Ürün adı zorunludur').max(255, 'Ürün adı en fazla 255 karakter olabilir').optional(),
    slug: z.string().max(255, 'Slug en fazla 255 karakter olabilir').optional(),
    tagline: z.string().max(255, 'Tagline en fazla 255 karakter olabilir').optional(),
    description: z.string().max(5000, 'Açıklama en fazla 5000 karakter olabilir').optional(),
    price: z
      .number({ invalid_type_error: 'Fiyat sayı olmalıdır' })
      .positive('Fiyat pozitif olmalıdır')
      .max(1000000, 'Fiyat çok yüksek')
      .optional(),
    discountPrice: z
      .number({ invalid_type_error: 'İndirimli fiyat sayı olmalıdır' })
      .positive('İndirimli fiyat pozitif olmalıdır')
      .max(1000000, 'İndirimli fiyat çok yüksek')
      .optional(),
    type: productTypeSchema.optional(),
    color: colorSchema.optional(),
    material: materialSchema.optional(),
    imageUrl: z.string().url('Geçerli bir URL olmalıdır').max(500, 'Resim URL en fazla 500 karakter olabilir').optional(),
    hoverImageUrl: z.string().url('Geçerli bir URL olmalıdır').max(500, 'Hover resim URL en fazla 500 karakter olabilir').optional(),
    burnTime: z.string().max(50, 'Yanma süresi en fazla 50 karakter olabilir').optional(),
    scentProfile: z.string().max(100, 'Koku profili en fazla 100 karakter olabilir').optional(),
    stockQuantity: z
      .number({ invalid_type_error: 'Stok miktarı sayı olmalıdır' })
      .int('Stok miktarı tam sayı olmalıdır')
      .min(0, 'Stok miktarı negatif olamaz')
      .max(100000, 'Stok miktarı çok yüksek')
      .optional(),
    isActive: z.boolean({ invalid_type_error: 'isActive boolean olmalıdır' }).optional(),
  }).refine(
    (data) => {
      // Eğer discountPrice ve price varsa, discountPrice price'dan küçük olmalı
      if (data.discountPrice !== undefined && data.price !== undefined) {
        return data.discountPrice < data.price;
      }
      return true;
    },
    {
      message: 'İndirimli fiyat normal fiyattan küçük olmalıdır',
      path: ['discountPrice'],
    }
  ),
});

// DELETE /api/products/:id - Delete product
export const deleteProductSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

// Type exports
export type GetProductsInput = z.infer<typeof getProductsSchema>['query'];
export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
