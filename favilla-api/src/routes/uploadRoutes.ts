// src/routes/uploadRoutes.ts
// File upload routes
import { Router, Request, Response, NextFunction } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { uploadSingle, uploadMultiple, handleMulterError } from '../middlewares/upload';
import { uploadImage, uploadImages, deleteUploadedFile } from '../controllers/uploadController';

const router = Router();

// Tüm upload route'ları korumalı (login gerekli)
router.use(protect);

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Tek dosya yükle (ürün resmi)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Yüklenecek resim dosyası (max 5MB)
 *     responses:
 *       201:
 *         description: Dosya başarıyla yüklendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     originalName:
 *                       type: string
 *                     url:
 *                       type: string
 *                     size:
 *                       type: number
 *                     mimetype:
 *                       type: string
 *       400:
 *         description: Geçersiz dosya veya validation hatası
 *       401:
 *         description: Unauthorized
 */
// Multer error handling middleware
const multerErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    const error = handleMulterError(err);
    // Express error handler'a gönder
    return next(error);
  }
  next();
};

router.post('/image', uploadSingle('image'), multerErrorHandler, uploadImage);

/**
 * @swagger
 * /api/upload/images:
 *   post:
 *     summary: Çoklu dosya yükle (ürün resimleri)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Yüklenecek resim dosyaları (max 5 dosya, her biri max 5MB)
 *     responses:
 *       201:
 *         description: Dosyalar başarıyla yüklendi
 *       400:
 *         description: Geçersiz dosya veya validation hatası
 *       401:
 *         description: Unauthorized
 */
router.post('/images', uploadMultiple('images', 5), multerErrorHandler, uploadImages);

/**
 * @swagger
 * /api/upload/:filename:
 *   delete:
 *     summary: Yüklenen dosyayı sil
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Silinecek dosya adı
 *     responses:
 *       200:
 *         description: Dosya başarıyla silindi
 *       404:
 *         description: Dosya bulunamadı
 *       401:
 *         description: Unauthorized
 */
router.delete('/:filename', deleteUploadedFile);

export default router;
