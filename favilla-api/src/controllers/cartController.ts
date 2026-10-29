// src/controllers/cartController.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getCart, addToCart, removeFromCart, updateCartItemQuantity } from '../models/cartModel';
import { validateCoupon } from '../models/couponModel';
import { createOrder } from '../models/orderModel';
import { CustomError, asyncHandler } from '../middlewares/errorHandler';
import { sendSuccess, sendCreated, sendDeleted, sendUpdated } from '../utils/response';

// Helper: Request'ten userId veya guestId'yi al
const getCartIdentifiers = (req: AuthRequest): { userId?: string; guestId?: string } => {
  if (req.user?.id) {
    return { userId: req.user.id };
  }
  
  // Guest ID header'dan veya body'den alınabilir
  // Öncelik: Header > Body
  const guestId = (req.headers['x-guest-id'] as string)?.trim() || req.body?.guestId?.trim();
  
  if (guestId) {
    // Guest ID boş string değilse kullan
    if (guestId.length > 0) {
      return { guestId };
    }
  }
  
  // Guest ID yoksa ve user da yoksa hata ver
  throw new CustomError('User ID veya Guest ID gerekli. Lütfen x-guest-id header\'ını gönderin veya giriş yapın.', 400);
};

export const getMyCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId, guestId } = getCartIdentifiers(req);
  const cart = await getCart(userId, guestId);
  sendSuccess(res, cart);
});

export const addItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, quantity } = req.body;
  const { userId, guestId } = getCartIdentifiers(req);
  
  // Validasyon: Negatif veya sıfır miktar kontrolü
  if (!quantity || quantity < 1) {
    throw new CustomError('Miktar en az 1 olmalıdır.', 400);
  }

  if (!productId) {
    throw new CustomError('Ürün ID zorunludur.', 400);
  }

  try {
    // addToCart artık güncel sepeti döndürüyor (transaction içinde)
    const cart = await addToCart(productId, quantity, userId, guestId);
    sendSuccess(res, cart, { message: 'Sepete eklendi.' });
  } catch (error: any) {
    // Modelden gelen stok hatasını frontend'e ilet
    throw new CustomError(error.message || 'İşlem başarısız.', 400);
  }
});

export const removeItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const { userId, guestId } = getCartIdentifiers(req);
  
  // removeFromCart artık güncel sepeti döndürüyor (transaction içinde)
  const cart = await removeFromCart(productId, userId, guestId);
  sendSuccess(res, cart, { message: 'Ürün silindi.' });
});

// Ürün Adedini Güncelle
export const updateItemQuantity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const { userId, guestId } = getCartIdentifiers(req);

  // Validasyon: Miktar en az 1 olmalı
  if (!quantity || quantity < 1) {
    throw new CustomError('Miktar en az 1 olmalıdır.', 400);
  }

  try {
    // updateCartItemQuantity artık güncel sepeti döndürüyor (transaction içinde)
    const cart = await updateCartItemQuantity(productId, quantity, userId, guestId);
    sendUpdated(res, cart, { message: 'Sepet güncellendi.' });
  } catch (error: any) {
    // Stok hatası veya diğer hatalar
    throw new CustomError(error.message || 'Güncelleme başarısız.', 400);
  }
});

export const checkCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { code } = req.body;
  try {
    const coupon = await validateCoupon(code, req.user!.id);
    sendSuccess(res, coupon);
  } catch (error: any) {
    throw new CustomError(error.message, 400);
  }
});

export const checkout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { addressId, couponCode, cardInfo } = req.body;
  
  if (!addressId) {
    throw new CustomError('Adres seçilmedi.', 400);
  }

  // Basit kart doğrulama simülasyonu
  if (!cardInfo || !cardInfo.number) {
    throw new CustomError('Kart bilgileri eksik.', 400);
  }

  const order = await createOrder(req.user!.id, addressId, couponCode, cardInfo);
  sendCreated(res, order, { message: 'Sipariş başarıyla oluşturuldu!' });
});