// src/routes/reviewRoutes.ts
import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { reviewListLimiter, reviewCreateLimiter } from '../middlewares/rateLimiter';
import { createReview, getProductReviews, checkEligibility } from '../controllers/reviewController';
import {
  createReviewSchema,
  getProductReviewsSchema,
  checkReviewEligibilitySchema,
} from '../validations/reviewSchemas';

const router = Router();

// Public: Herkes yorumları okuyabilir
router.get('/:productId', reviewListLimiter, validate(getProductReviewsSchema), getProductReviews);

// Protected: Sadece üyeler işlem yapabilir
router.post('/:productId', reviewCreateLimiter, protect, validate(createReviewSchema), createReview);           // Yorum Yap
router.get('/:productId/check', reviewListLimiter, protect, validate(checkReviewEligibilitySchema), checkEligibility);  // Yorum Yapabilir miyim?

export default router;