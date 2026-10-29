// src/validations/cartSchemas.ts
import { z } from 'zod';

// UUID validation helper
const uuidSchema = z.string().uuid('Geçersiz ID formatı');

// POST /api/cart/add - Add item to cart
export const addToCartSchema = z.object({
  body: z.object({
    productId: uuidSchema,
    quantity: z
      .number({ required_error: 'Miktar zorunludur', invalid_type_error: 'Miktar sayı olmalıdır' })
      .int('Miktar tam sayı olmalıdır')
      .min(1, 'Miktar en az 1 olmalıdır')
      .max(100, 'Miktar en fazla 100 olabilir'),
  }),
});

// PUT /api/cart/:productId - Update cart item quantity
export const updateCartItemSchema = z.object({
  params: z.object({
    productId: uuidSchema,
  }),
  body: z.object({
    quantity: z
      .number({ required_error: 'Miktar zorunludur', invalid_type_error: 'Miktar sayı olmalıdır' })
      .int('Miktar tam sayı olmalıdır')
      .min(1, 'Miktar en az 1 olmalıdır')
      .max(100, 'Miktar en fazla 100 olabilir'),
  }),
});

// DELETE /api/cart/:productId - Remove item from cart
export const removeCartItemSchema = z.object({
  params: z.object({
    productId: uuidSchema,
  }),
});

// POST /api/cart/coupon - Check coupon
export const checkCouponSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(1, 'Kupon kodu zorunludur')
      .max(50, 'Kupon kodu en fazla 50 karakter olabilir')
      .regex(/^[A-Z0-9-_]+$/, 'Kupon kodu sadece büyük harf, rakam, tire ve alt çizgi içerebilir'),
  }),
});

// POST /api/cart/checkout - Checkout
export const checkoutSchema = z.object({
  body: z.object({
    addressId: uuidSchema,
    couponCode: z
      .string()
      .max(50, 'Kupon kodu en fazla 50 karakter olabilir')
      .regex(/^[A-Z0-9-_]*$/, 'Kupon kodu sadece büyük harf, rakam, tire ve alt çizgi içerebilir')
      .optional(),
    cardInfo: z
      .object({
        number: z
          .string()
          .min(13, 'Kart numarası en az 13 karakter olmalıdır')
          .max(19, 'Kart numarası en fazla 19 karakter olabilir')
          .regex(/^\d+$/, 'Kart numarası sadece rakam içermelidir'),
        // Eski format desteği: expiry string (örn: "12/25") veya yeni format (expiryMonth, expiryYear)
        expiry: z
          .string()
          .regex(/^\d{2}\/\d{2,4}$/, 'Son kullanma tarihi MM/YY veya MM/YYYY formatında olmalıdır')
          .optional(),
        expiryMonth: z
          .number({ invalid_type_error: 'Ay sayı olmalıdır' })
          .int('Ay tam sayı olmalıdır')
          .min(1, 'Ay 1-12 arasında olmalıdır')
          .max(12, 'Ay 1-12 arasında olmalıdır')
          .optional(),
        expiryYear: z
          .number({ invalid_type_error: 'Yıl sayı olmalıdır' })
          .int('Yıl tam sayı olmalıdır')
          .min(new Date().getFullYear(), 'Yıl geçmiş bir yıl olamaz')
          .max(new Date().getFullYear() + 20, 'Yıl çok ileri bir tarih olamaz')
          .optional(),
        cvv: z
          .string()
          .min(3, 'CVV en az 3 karakter olmalıdır')
          .max(4, 'CVV en fazla 4 karakter olabilir')
          .regex(/^\d+$/, 'CVV sadece rakam içermelidir'),
        // Eski format desteği: name veya cardholderName
        name: z
          .string()
          .min(1, 'Kart sahibi adı zorunludur')
          .max(100, 'Kart sahibi adı en fazla 100 karakter olabilir')
          .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'Kart sahibi adı sadece harf içermelidir')
          .optional(),
        cardholderName: z
          .string()
          .min(1, 'Kart sahibi adı zorunludur')
          .max(100, 'Kart sahibi adı en fazla 100 karakter olabilir')
          .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'Kart sahibi adı sadece harf içermelidir')
          .optional(),
      })
      .transform((data) => {
        // Eski formatı yeni formata dönüştür
        let expiryMonth = data.expiryMonth;
        let expiryYear = data.expiryYear;
        let cardholderName = data.cardholderName || data.name;

        // Eğer expiry string formatında gelmişse (örn: "12/25" veya "12/2025")
        if (data.expiry && !expiryMonth && !expiryYear) {
          const [month, year] = data.expiry.split('/');
          expiryMonth = parseInt(month, 10);
          // Yıl 2 haneli ise 2000 ekle (25 -> 2025)
          expiryYear = parseInt(year, 10);
          if (year.length === 2) {
            expiryYear = 2000 + expiryYear;
          }
        }

        return {
          number: data.number,
          expiryMonth,
          expiryYear,
          cvv: data.cvv,
          cardholderName,
        };
      })
      .refine(
        (data) => data.expiryMonth !== undefined && data.expiryMonth !== null,
        {
          message: 'Son kullanma ayı zorunludur (expiryMonth veya expiry formatında gönderin)',
          path: ['expiryMonth'],
        }
      )
      .refine(
        (data) => data.expiryYear !== undefined && data.expiryYear !== null,
        {
          message: 'Son kullanma yılı zorunludur (expiryYear veya expiry formatında gönderin)',
          path: ['expiryYear'],
        }
      )
      .refine(
        (data) => data.cardholderName !== undefined && data.cardholderName !== null && data.cardholderName.length > 0,
        {
          message: 'Kart sahibi adı zorunludur (cardholderName veya name olarak gönderin)',
          path: ['cardholderName'],
        }
      ),
  }),
});

// Type exports
export type AddToCartInput = z.infer<typeof addToCartSchema>['body'];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>['body'];
export type CheckCouponInput = z.infer<typeof checkCouponSchema>['body'];
export type CheckoutInput = z.infer<typeof checkoutSchema>['body'];
