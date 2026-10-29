// src/controllers/uploadController.ts
// File upload controller
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { CustomError, asyncHandler } from '../middlewares/errorHandler';
import { getFileUrl, validateUploadedFile, deleteOldFile, handleMulterError } from '../middlewares/upload';
import { sendSuccess, sendCreated } from '../utils/response';
import logger from '../utils/logger';

/**
 * Tek dosya upload (ürün resmi için)
 * POST /api/upload/image
 */
export const uploadImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Multer error kontrolü
  if (req.file === undefined && !req.body.error) {
    throw new CustomError('Dosya yüklenmedi. Lütfen bir dosya seçin.', 400);
  }

  // Dosya kontrolü
  validateUploadedFile(req.file);

  const file = req.file!;
  const fileUrl = getFileUrl(file.filename);

  logger.info(`Dosya yüklendi: ${file.originalname} -> ${file.filename} (${file.size} bytes)`);

  sendCreated(
    res,
    {
      filename: file.filename,
      originalName: file.originalname,
      url: fileUrl,
      size: file.size,
      mimetype: file.mimetype,
    },
    { message: 'Dosya başarıyla yüklendi' }
  );
});

/**
 * Çoklu dosya upload (ürün resimleri için)
 * POST /api/upload/images
 */
export const uploadImages = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new CustomError('En az bir dosya yüklenmelidir', 400);
  }

  // Her dosyayı doğrula
  req.files.forEach((file) => {
    validateUploadedFile(file);
  });

  const uploadedFiles = req.files.map((file) => ({
    filename: file.filename,
    originalName: file.originalname,
    url: getFileUrl(file.filename),
    size: file.size,
    mimetype: file.mimetype,
  }));

  logger.info(`${uploadedFiles.length} dosya yüklendi`);

  sendCreated(
    res,
    { files: uploadedFiles },
    { message: `${uploadedFiles.length} dosya başarıyla yüklendi` }
  );
});

/**
 * Dosya sil
 * DELETE /api/upload/:filename
 */
export const deleteUploadedFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { filename } = req.params;

  if (!filename) {
    throw new CustomError('Dosya adı belirtilmedi', 400);
  }

  const { deleteFile } = await import('../middlewares/upload');
  const deleted = await deleteFile(filename);

  if (!deleted) {
    throw new CustomError('Dosya bulunamadı veya silinemedi', 404);
  }

  sendSuccess(res, null, { message: 'Dosya başarıyla silindi' });
});

/**
 * Eski dosyayı sil (yeni dosya upload edildiğinde)
 * Bu fonksiyon product update/delete işlemlerinde kullanılabilir
 */
export const replaceFile = async (oldUrl: string, newFile: Express.Multer.File): Promise<string> => {
  // Eski dosyayı sil
  await deleteOldFile(oldUrl);

  // Yeni dosya URL'ini döndür
  return getFileUrl(newFile.filename);
};
