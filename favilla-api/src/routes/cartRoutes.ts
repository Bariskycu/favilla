// src/routes/cartRoutes.ts
import { Router } from 'express';
import { optionalAuth, protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { cartLimiter, orderCreateLimiter } from '../middlewares/rateLimiter';
import { getMyCart, addItem, removeItem, checkCoupon, checkout, updateItemQuantity } from '../controllers/cartController';
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
  checkCouponSchema,
  checkoutSchema,
} from '../validations/cartSchemas';

const router = Router();

// Cart işlemleri için optional auth (guest cart desteği için)
router.use(optionalAuth);

// Sepet işlemleri (guest veya user)
router.get('/', cartLimiter, getMyCart);
router.post('/add', cartLimiter, validate(addToCartSchema), addItem);
router.delete('/:productId', cartLimiter, validate(removeCartItemSchema), removeItem);
router.put('/:productId', cartLimiter, validate(updateCartItemSchema), updateItemQuantity);

// Coupon ve checkout işlemleri için authentication zorunlu
router.post('/coupon', cartLimiter, protect, validate(checkCouponSchema), checkCoupon);
router.post('/checkout', orderCreateLimiter, protect, validate(checkoutSchema), checkout);

export default router;