import { Response } from 'express';
import iyzico from '../config/iyzico';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createPendingOrderForIyzico, updateOrderPaymentSuccess } from '../models/orderModel';

const backendUrl = () => process.env.API_URL || 'http://localhost:5000/api/v1';
const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

/** Ödeme başlat: Sepetten "Ödeme Bekliyor" siparişi oluşturur, Iyzico Checkout Form Initialize çağırır.
 * conversationId = Order ID olarak kullanılır; callback'te bu ID ile sipariş güncellenir.
 * Body: addressId, couponCode?, basketItems, buyer, shippingAddress, billingAddress, price, paidPrice
 */
export const initializePayment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'failure', message: 'Giriş yapmanız gerekir.' });
    }

    const { addressId, couponCode, basketItems, buyer, shippingAddress, billingAddress } = req.body;

    if (!addressId || !basketItems || !buyer || !shippingAddress || !billingAddress) {
      return res.status(400).json({
        status: 'failure',
        message: 'addressId, basketItems, buyer, shippingAddress, billingAddress zorunludur.',
      });
    }

    // 1. "Ödeme Bekliyor" statüsünde sipariş oluştur (conversationId = order.id)
    const order = await createPendingOrderForIyzico(userId, addressId, couponCode);

    const conversationId = order.id;
    const callbackUrlWithOrder = `${backendUrl()}/payment/callback?orderId=${conversationId}`;
    const priceStr = String(order.total_amount);
    const paidPriceStr = String(order.total_amount);

    const request = {
      locale: 'tr',
      conversationId,
      price: priceStr,
      paidPrice: paidPriceStr,
      currency: 'TRY' as const,
      basketId: order.id,
      paymentGroup: 'PRODUCT' as const,
      callbackUrl: callbackUrlWithOrder,
      enabledInstallments: [2, 3, 6, 9],
      buyer,
      shippingAddress,
      billingAddress,
      basketItems,
    };

    (iyzico as any).checkoutFormInitialize.create(request, (err: any, result: any) => {
      if (err) {
        return res.status(500).json({ status: 'failure', errorMessage: err.message });
      }
      res.json(result);
    });
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      status: 'failure',
      message: error?.message || 'Internal Server Error',
    });
  }
};

/** Iyzico'dan dönen callback: token ile sonucu sorgular, başarılıysa siparişi "Ödendi / Hazırlanıyor" yapar. */
export const paymentCallback = async (req: AuthRequest, res: Response) => {
  try {
    const token = req.body?.token ?? req.query?.token;
    const orderId = (req.query?.orderId || req.body?.orderId) as string | undefined;

    if (!token) {
      return res.redirect(`${frontendUrl()}/payment/result?status=failure&message=${encodeURIComponent('Token eksik')}`);
    }

    if (!orderId) {
      return res.redirect(`${frontendUrl()}/payment/result?status=failure&message=${encodeURIComponent('Sipariş bilgisi eksik')}`);
    }

    const request = {
      locale: 'tr',
      conversationId: orderId,
      token,
    };

    (iyzico as any).checkoutForm.retrieve(request, async (err: any, result: any) => {
      if (err) {
        return res.redirect(`${frontendUrl()}/payment/result?status=failure&message=${encodeURIComponent(err.message)}`);
      }

      if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
        await updateOrderPaymentSuccess(orderId, result.paymentId ?? undefined);
        return res.redirect(`${frontendUrl()}/payment/result?status=success&paymentId=${result.paymentId ?? ''}`);
      }

      const msg = result.errorMessage || 'Ödeme alınamadı.';
      return res.redirect(`${frontendUrl()}/payment/result?status=failure&message=${encodeURIComponent(msg)}`);
    });
  } catch (error) {
    console.error('Payment callback error:', error);
    res.redirect(`${frontendUrl()}/payment/result?status=failure&message=InternalServerError`);
  }
};
