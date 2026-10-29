// src/routes/productRoutes.ts
import { Router } from 'express';
import { 
  getProducts, 
  getProductDetail, 
  createNewProduct, 
  updateProductDetail, 
  removeProduct 
} from '../controllers/productController';
import { protect } from '../middlewares/authMiddleware';
import { admin } from '../middlewares/adminMiddleware';
import { validate } from '../middlewares/validate';
import { productListLimiter, productDetailLimiter, productCrudLimiter } from '../middlewares/rateLimiter';
import {
  getProductsSchema,
  getProductBySlugSchema,
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
} from '../validations/productSchemas';

const router = Router();

// HERKESİN ERİŞEBİLECEĞİ ROTALAR (Public)
// ------------------------------------------------
// GET /api/products?type=jar&color=natural -> Filtreli listeleme
router.get('/', productListLimiter, validate(getProductsSchema), getProducts);

// GET /api/products/favilla-ember -> Detay
router.get('/:slug', productDetailLimiter, validate(getProductBySlugSchema), getProductDetail);


// SADECE ADMIN ERİŞİMİ OLAN ROTALAR (Protected + Admin)
// ------------------------------------------------
// POST /api/products -> Yeni ürün ekle
router.post('/', productCrudLimiter, protect, admin, validate(createProductSchema), createNewProduct);

// PUT /api/products/:id -> Ürün güncelle (Fiyat, stok vb.)
router.put('/:id', productCrudLimiter, protect, admin, validate(updateProductSchema), updateProductDetail);

// DELETE /api/products/:id -> Ürün sil (Soft delete)
router.delete('/:id', productCrudLimiter, protect, admin, validate(deleteProductSchema), removeProduct);

export default router;