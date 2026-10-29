import express from 'express';
import { initializePayment, paymentCallback } from '../controllers/paymentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Ödeme başlat: Giriş zorunlu, sipariş "Ödeme Bekliyor" olarak oluşturulur, Iyzico formu döner
router.post('/initialize', protect, initializePayment);

// Iyzico'dan yönlendirme (token + orderId ile sipariş güncellenir)
router.post('/callback', paymentCallback);
router.get('/callback', paymentCallback);
export default router;
