// src/middlewares/upload.ts
// File upload middleware using multer
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { CustomError } from './errorHandler';
import logger from '../utils/logger';

// Uploads klasörünü oluştur (yoksa)
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Image uploads klasörü
const imagesDir = path.join(uploadsDir, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

/**
 * Dosya tipi kontrolü
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // İzin verilen dosya tipleri
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new CustomError(
      `Geçersiz dosya tipi. İzin verilen tipler: ${allowedMimes.join(', ')}`,
      400
    ));
  }
};

/**
 * Storage configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    // Orijinal dosya adından extension'ı al
    const ext = path.extname(file.originalname);
    // UUID ile benzersiz dosya adı oluştur
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

/**
 * Multer configuration
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maksimum dosya boyutu
  },
});

/**
 * Tek dosya upload middleware
 */
export const uploadSingle = (fieldName: string = 'image') => {
  return upload.single(fieldName);
};

/**
 * Çoklu dosya upload middleware
 */
export const uploadMultiple = (fieldName: string = 'images', maxCount: number = 5) => {
  return upload.array(fieldName, maxCount);
};

/**
 * Belirli alanlar için çoklu dosya upload middleware
 */
export const uploadFields = (fields: multer.Field[]) => {
  return upload.fields(fields);
};

/**
 * Upload edilen dosyanın URL'ini oluştur
 */
export const getFileUrl = (filename: string): string => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}/uploads/images/${filename}`;
};

/**
 * Dosyayı sil
 */
export const deleteFile = async (filename: string): Promise<boolean> => {
  try {
    const filePath = path.join(imagesDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Dosya silindi: ${filename}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`Dosya silme hatası (${filename}):`, error);
    return false;
  }
};

/**
 * Eski dosyayı sil (yeni dosya upload edildiğinde)
 */
export const deleteOldFile = async (oldUrl: string): Promise<boolean> => {
  try {
    // URL'den dosya adını çıkar
    const filename = oldUrl.split('/').pop();
    if (filename) {
      return await deleteFile(filename);
    }
    return false;
  } catch (error) {
    logger.error(`Eski dosya silme hatası (${oldUrl}):`, error);
    return false;
  }
};

/**
 * Upload edilen dosyayı doğrula
 */
export const validateUploadedFile = (file: Express.Multer.File | undefined): void => {
  if (!file) {
    throw new CustomError('Dosya yüklenmedi', 400);
  }

  // Dosya boyutu kontrolü (5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new CustomError('Dosya boyutu çok büyük. Maksimum 5MB olabilir.', 400);
  }

  // Dosya tipi kontrolü
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedMimes.includes(file.mimetype)) {
    throw new CustomError(
      `Geçersiz dosya tipi. İzin verilen tipler: ${allowedMimes.join(', ')}`,
      400
    );
  }
};

/**
 * Multer error handling
 */
export const handleMulterError = (error: any): CustomError => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return new CustomError('Dosya boyutu çok büyük. Maksimum 5MB olabilir.', 400);
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return new CustomError('Çok fazla dosya yüklendi. Maksimum 5 dosya olabilir.', 400);
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return new CustomError('Beklenmeyen dosya alanı.', 400);
    }
    return new CustomError(`Dosya yükleme hatası: ${error.message}`, 400);
  }
  return error instanceof CustomError ? error : new CustomError('Dosya yükleme hatası', 500);
};

// Uploads klasörünü export et (static file serving için)
export const uploadsDirPath = uploadsDir;
export const imagesDirPath = imagesDir;
