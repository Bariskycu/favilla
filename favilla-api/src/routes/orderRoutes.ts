// src/routes/orderRoutes.ts
import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { orderListLimiter } from '../middlewares/rateLimiter';
import { getMyOrders, getOrderDetails } from '../controllers/orderController';
import {
  getUserOrdersSchema,
  getOrderDetailsSchema,
} from '../validations/orderSchemas';

const router = Router();

// Bu rotaların hepsi giriş yapmış kullanıcı gerektirir
router.use(protect);

router.get('/', orderListLimiter, validate(getUserOrdersSchema), getMyOrders);       // GET /api/orders -> Sipariş listesi
router.get('/:id', orderListLimiter, validate(getOrderDetailsSchema), getOrderDetails);// GET /api/orders/123 -> Tek sipariş detayı

export default router;