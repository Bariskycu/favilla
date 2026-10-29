// src/routes/wishlistRoutes.ts
import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { wishlistLimiter } from '../middlewares/rateLimiter';
import { getMyWishlist, addItemToWishlist, removeItemFromWishlist, checkWishlistStatus } from '../controllers/wishlistController';

const router = Router();

// Tüm işlemler giriş yapmış kullanıcı gerektirir
router.use(protect);

router.get('/', wishlistLimiter, getMyWishlist);                  // GET /api/wishlist -> Listeyi getir
router.post('/', wishlistLimiter, addItemToWishlist);             // POST /api/wishlist -> Ekle (Body: { productId: "..." })
router.delete('/:productId', wishlistLimiter, removeItemFromWishlist); // DELETE /api/wishlist/:productId -> Çıkar
router.get('/:productId/check', wishlistLimiter, checkWishlistStatus); // GET /api/wishlist/:productId/check -> Durum kontrolü

export default router;