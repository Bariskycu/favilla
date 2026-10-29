// src/controllers/wishlistController.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { addToWishlist, removeFromWishlist, getUserWishlist, checkIsInWishlist } from '../models/wishlistModel';
import { CustomError, asyncHandler } from '../middlewares/errorHandler';
import { sendSuccess, sendCreated, sendDeleted } from '../utils/response';

// Favorileri Listele
export const getMyWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const wishlist = await getUserWishlist(userId);
  
  // Response format matches documentation: array of items with productId, product, and addedAt
  sendSuccess(res, wishlist);
});

// Favoriye Ekle
export const addItemToWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.body;

  if (!productId) {
    throw new CustomError('Ürün ID zorunludur.', 400);
  }

  await addToWishlist(userId, productId);
  sendCreated(res, { isInWishlist: true }, { message: 'Ürün favorilere eklendi.' });
});

// Favoriden Çıkar
export const removeItemFromWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.params;

  await removeFromWishlist(userId, productId);
  sendDeleted(res, { message: 'Ürün favorilerden çıkarıldı.' });
});

// Tek bir ürünün durumunu kontrol et
export const checkWishlistStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.params;
  
  const exists = await checkIsInWishlist(userId, productId);
  sendSuccess(res, { isInWishlist: exists });
});