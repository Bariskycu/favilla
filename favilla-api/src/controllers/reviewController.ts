// src/controllers/reviewController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { addReview, getReviewsByProduct, checkReviewEligibility } from '../models/reviewModel';
import { CustomError, asyncHandler } from '../middlewares/errorHandler';
import { sendCreated, sendPaginated, sendSuccess } from '../utils/response';
import { parseQueryParams, parseParams } from '../utils/requestValidation';

// Yorum Ekle
export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.params;
  const { rating, comment } = req.body;

  // Validasyon
  if (!rating || rating < 1 || rating > 5) {
    throw new CustomError('Puan 1 ile 5 arasında olmalıdır.', 400);
  }

  // Satın Alma Kontrolü (Verified Purchase)
  const canReview = await checkReviewEligibility(userId, productId);
  if (!canReview) {
    throw new CustomError('Bu ürüne yorum yapabilmek için satın almanız gerekmektedir.', 403);
  }

  // Yorum Ekleme
  // (Veritabanındaki UNIQUE constraint sayesinde aynı kullanıcı 2. kez yorum yaparsa otomatik hata döner)
  try {
    const review = await addReview(userId, productId, rating, comment);
    sendCreated(res, review, { message: 'Yorumunuz başarıyla eklendi.' });
  } catch (error: any) {
    // Unique Constraint Hatası (PostgreSQL kodu: 23505) - Global handler'da handle edilecek
    if (error.code === '23505') {
      throw new CustomError('Bu ürüne zaten yorum yaptınız.', 400);
    }
    throw error;
  }
});

// Yorumları Getir (Pagination destekli)
export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const params = parseParams(req);
  const query = parseQueryParams(req);
  
  const productId = params.getUUID('productId', { required: true })!;
  
  // Pagination parametreleri
  const { page, limit } = query.getPagination({ defaultPage: 1, defaultLimit: 10, maxLimit: 50 });

  const result = await getReviewsByProduct(productId, page, limit);
  
  // Paginated response
  if (result.pagination) {
    sendPaginated(res, result.data, result.pagination);
  } else {
    sendSuccess(res, result);
  }
});

// Yorum Yapabilir miyim? (Frontend butonu göstermek için kullanır)
export const checkEligibility = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.params;
  
  const isEligible = await checkReviewEligibility(userId, productId);
  sendSuccess(res, { isEligible });
});