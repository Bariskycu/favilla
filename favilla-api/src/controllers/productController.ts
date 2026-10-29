// src/controllers/productController.ts
import { Response, Request } from 'express';
import { getAllProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, ProductFilters } from '../models/productModel';
import { CustomError, asyncHandler } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/authMiddleware';
import { RequestWithId } from '../middlewares/requestId';
import { logProductAction } from '../utils/auditLogger';
import { getProductById } from '../models/productModel';
import { parseQueryParams, parseParams } from '../utils/requestValidation';
import { sendSuccess, sendPaginated, sendCreated, sendUpdated, sendDeleted } from '../utils/response';
import { withCache, generateCacheKey, deleteCachePattern } from '../utils/cache';

// Listeleme ve Filtreleme (Pagination destekli)
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  // Request validation helper kullanarak query parametrelerini parse et
  const query = parseQueryParams(req);

  // Query string'den filtreleri al
  const pagination = query.getPagination({ defaultPage: 1, defaultLimit: 20, maxLimit: 100 });
  
  // Lang parametresini al (cache key için önemli)
  const lang = query.getString('lang', { maxLength: 10 }) || 'en';
  
  const filters: ProductFilters = {
    search: query.getString('search', { maxLength: 255 }),
    type: query.getEnum('type', ['jar', 'sculptural', 'set']),
    color: query.getEnum('color', ['natural', 'charcoal', 'terracotta']),
    material: query.getEnum('material', ['soy-wax', 'beeswax', 'coconut-blend']),
    minPrice: query.getNumber('minPrice', { min: 0, max: 1000000 }),
    maxPrice: query.getNumber('maxPrice', { min: 0, max: 1000000 }),
    sort: query.getEnum('sort', ['price-asc', 'price-desc', 'newest', 'rating']),
    // Pagination parametreleri
    page: pagination.page,
    limit: pagination.limit,
  };

  // minPrice ve maxPrice kontrolü
  if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
    if (filters.minPrice > filters.maxPrice) {
      throw new CustomError('Min fiyat max fiyattan büyük olamaz', 400);
    }
  }

  // Cache key oluştur (filtrelere göre - lang dahil)
  const cacheKey = generateCacheKey(
    'products',
    lang, // Lang parametresini cache key'e ekle
    filters.search,
    filters.type,
    filters.color,
    filters.material,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
    filters.page,
    filters.limit
  );

  // Cache'den al veya database'den çek (5 dakika TTL)
  // Request'i geçir ki cache hit durumunda rate limiter skip edebilsin
  const result = await withCache(
    cacheKey,
    () => getAllProducts(filters),
    300, // 5 dakika
    req // Request object - cache hit flag'i için
  );
  
  // Paginated response
  if (result.pagination) {
    sendPaginated(res, result.data, result.pagination);
  } else {
    sendSuccess(res, result);
  }
});

// UUID format kontrolü için regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Tek Ürün Detayı (Slug veya ID ile)
export const getProductDetail = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  
  // UUID formatında mı kontrol et
  const isUUID = UUID_REGEX.test(slug);
  
  // Cache key oluştur
  const cacheKey = generateCacheKey('product', slug);
  
  // Cache'den al veya database'den çek (10 dakika TTL - detay sayfası daha az değişir)
  let product: any = null;
  
  if (isUUID) {
    // UUID formatında ise ID ile ara (sadece aktif ürünler)
    product = await withCache(
      cacheKey,
      () => getProductById(slug, false), // includeInactive = false (sadece aktif ürünler)
      600 // 10 dakika
    );
  } else {
    // Slug formatında ise slug ile ara (is_active kontrolü zaten getProductBySlug'da var)
    product = await withCache(
      cacheKey,
      () => getProductBySlug(slug),
      600 // 10 dakika
    );
  }
  
  if (!product) {
    throw new CustomError('Ürün bulunamadı', 404);
  }
  sendSuccess(res, product);
});

// --- ADMIN İŞLEMLERİ ---

// Yeni Ürün Ekle
export const createNewProduct = asyncHandler(async (req: AuthRequest & RequestWithId, res: Response) => {
  // Slug üretimi (Basitçe isimden)
  const slug = req.body.slug || req.body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  
  // Field mapping: imageUrl -> image, hoverImageUrl -> hoverImage
  const productData = {
    ...req.body,
    slug,
    image: req.body.imageUrl || req.body.image,
    hoverImage: req.body.hoverImageUrl || req.body.hoverImage,
  };
  
  try {
    const newProduct = await createProduct(productData);
    
    // Audit log
    await logProductAction(req, 'create', newProduct.id, undefined, newProduct);
    
    // Cache'i temizle (yeni ürün eklendi)
    await deleteCachePattern('products:*');
    
    sendCreated(res, newProduct, { message: 'Ürün başarıyla oluşturuldu' });
  } catch (error) {
    // Audit log (hata durumu)
    await logProductAction(req, 'create', 'unknown', undefined, req.body, error as Error);
    throw error;
  }
});

// Ürün Güncelle
export const updateProductDetail = asyncHandler(async (req: AuthRequest & RequestWithId, res: Response) => {
  const { id } = req.params;
  
  try {
    // Eski değerleri al (admin için pasif ürünler de dahil)
    const oldProduct = await getProductById(id, true);
    if (!oldProduct) {
      throw new CustomError('Ürün bulunamadı.', 404);
    }
    
    // Field mapping: imageUrl -> image, hoverImageUrl -> hoverImage
    const updateData = {
      ...req.body,
      image: req.body.imageUrl !== undefined ? req.body.imageUrl : req.body.image,
      hoverImage: req.body.hoverImageUrl !== undefined ? req.body.hoverImageUrl : req.body.hoverImage,
    };
    
    const updated = await updateProduct(id, updateData);
    if (!updated) {
      throw new CustomError('Ürün güncellenemedi.', 500);
    }
    
    // Audit log
    await logProductAction(req, 'update', id, oldProduct, updated);
    
    // Cache'i temizle (ürün güncellendi)
    await deleteCachePattern('products:*');
    if (oldProduct.slug) {
      await deleteCachePattern(`product:${oldProduct.slug}`);
    }
    if (updated.slug) {
      await deleteCachePattern(`product:${updated.slug}`);
    }
    
    sendUpdated(res, updated, { message: 'Ürün başarıyla güncellendi' });
  } catch (error) {
    // Audit log (hata durumu)
    if (error instanceof CustomError && error.statusCode === 404) {
      // 404 için audit log yok (ürün bulunamadı)
    } else {
      await logProductAction(req, 'update', id, undefined, req.body, error as Error);
    }
    throw error;
  }
});

// Ürün Sil (Arşivle)
export const removeProduct = asyncHandler(async (req: AuthRequest & RequestWithId, res: Response) => {
  const { id } = req.params;
  
  try {
    // Eski değerleri al (silmeden önce - admin için pasif ürünler de dahil)
    const oldProduct = await getProductById(id, true);
    if (!oldProduct) {
      throw new CustomError('Ürün bulunamadı.', 404);
    }
    
    const success = await deleteProduct(id);
    if (!success) {
      throw new CustomError('Ürün silinemedi.', 500);
    }
    
    // Audit log
    await logProductAction(req, 'delete', id, oldProduct, undefined);
    
    // Cache'i temizle (ürün silindi)
    await deleteCachePattern('products:*');
    if (oldProduct.slug) {
      await deleteCachePattern(`product:${oldProduct.slug}`);
    }
    
    sendDeleted(res, { message: 'Ürün başarıyla silindi (arşivlendi)' });
  } catch (error) {
    // Audit log (hata durumu)
    if (error instanceof CustomError && error.statusCode === 404) {
      // 404 için audit log yok (ürün bulunamadı)
    } else {
      await logProductAction(req, 'delete', id, undefined, undefined, error as Error);
    }
    throw error;
  }
});