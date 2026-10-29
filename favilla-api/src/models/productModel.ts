// src/models/productModel.ts
import pool from '../config/db';

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  discountPrice?: number;
  type: string;
  color: string;
  material: string;
  image: string;
  hoverImage: string;
  description: string;
  rating: number;
  reviewCount: number;
  burnTime?: string;
  scentProfile?: string;
  stockQuantity: number;
}

// Filtreleme Seçenekleri
export interface ProductFilters {
  search?: string;
  type?: string;
  color?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price-asc' | 'price-desc' | 'newest' | 'rating';
  page?: number;
  limit?: number;
}

// Pagination sonucu
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 1. GELİŞMİŞ LİSTELEME VE FİLTRELEME (Pagination destekli)
export const getAllProducts = async (filters: ProductFilters = {}): Promise<PaginatedResult<Product>> => {
  // Pagination parametreleri
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(100, Math.max(1, filters.limit || 20)); // Varsayılan: 20, maksimum: 100
  const offset = (page - 1) * limit;

  // Base query (WHERE koşulları için)
  let whereConditions = ['is_active IS TRUE'];
  const queryParams: any[] = [];
  let paramIndex = 1;

  // Filtreler
  if (filters.type) {
    whereConditions.push(`type = $${paramIndex++}`);
    queryParams.push(filters.type);
  }
  if (filters.color) {
    whereConditions.push(`color = $${paramIndex++}`);
    queryParams.push(filters.color);
  }
  if (filters.material) {
    whereConditions.push(`material = $${paramIndex++}`);
    queryParams.push(filters.material);
  }
  if (filters.minPrice) {
    whereConditions.push(`price >= $${paramIndex++}`);
    queryParams.push(filters.minPrice);
  }
  if (filters.maxPrice) {
    whereConditions.push(`price <= $${paramIndex++}`);
    queryParams.push(filters.maxPrice);
  }

  // Arama (Full Text Search)
  if (filters.search) {
    whereConditions.push(`(
        setweight(to_tsvector('turkish', coalesce(name, '')), 'A') || 
        setweight(to_tsvector('turkish', coalesce(description, '')), 'B')
      ) @@ websearch_to_tsquery('turkish', $${paramIndex++})`);
    queryParams.push(filters.search);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Sıralama
  let orderClause = 'ORDER BY created_at DESC'; // Varsayılan: En yeni
  switch (filters.sort) {
    case 'price-asc': orderClause = 'ORDER BY price ASC'; break;
    case 'price-desc': orderClause = 'ORDER BY price DESC'; break;
    case 'rating': orderClause = 'ORDER BY rating DESC'; break;
    case 'newest': orderClause = 'ORDER BY created_at DESC'; break;
  }

  // Toplam kayıt sayısını al
  const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
  const countResult = await pool.query(countQuery, queryParams);
  const total = parseInt(countResult.rows[0].total, 10);

  // Verileri al (pagination ile)
  const dataQuery = `
    SELECT 
      id, slug, name, tagline, price::float, discount_price::float as "discountPrice", 
      type, color, material, image_url as "image", hover_image_url as "hoverImage", 
      description, rating::float, review_count as "reviewCount", 
      burn_time as "burnTime", scent_profile as "scentProfile", stock_quantity as "stockQuantity"
    FROM products 
    ${whereClause}
    ${orderClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  
  queryParams.push(limit, offset);
  const dataResult = await pool.query(dataQuery, queryParams);

  // Pagination metadata
  const totalPages = Math.ceil(total / limit);

  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

// 2. TEK ÜRÜN GETİR (Slug ile)
export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const query = `
    SELECT id, slug, name, tagline, price::float, discount_price::float as "discountPrice", 
      type, color, material, image_url as "image", hover_image_url as "hoverImage", 
      description, rating::float, review_count as "reviewCount", 
      burn_time as "burnTime", scent_profile as "scentProfile", stock_quantity as "stockQuantity"
    FROM products WHERE slug = $1 AND is_active IS TRUE`;
  const result = await pool.query(query, [slug]);
  return result.rows[0] || null;
};

// 2b. TEK ÜRÜN GETİR (ID ile - Public ve Admin için)
export const getProductById = async (id: string, includeInactive: boolean = false): Promise<Product | null> => {
  let query = `
    SELECT id, slug, name, tagline, price::float, discount_price::float as "discountPrice", 
      type, color, material, image_url as "image", hover_image_url as "hoverImage", 
      description, rating::float, review_count as "reviewCount", 
      burn_time as "burnTime", scent_profile as "scentProfile", stock_quantity as "stockQuantity"
    FROM products WHERE id = $1`;
  
  // Public endpoint için sadece aktif ürünleri göster
  if (!includeInactive) {
    query += ' AND is_active IS TRUE';
  }
  
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

// 3. CREATE (Ürün Ekle)
export const createProduct = async (data: any): Promise<Product> => {
  const { name, slug, tagline, description, price, discountPrice, type, color, material, image, hoverImage, burnTime, scentProfile, stockQuantity } = data;
  
  const result = await pool.query(
    `INSERT INTO products (
      name, slug, tagline, description, price, discount_price, type, color, material, image_url, hover_image_url, burn_time, scent_profile, stock_quantity
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING 
      id, slug, name, tagline, price::float, discount_price::float as "discountPrice", 
      type, color, material, image_url as "image", hover_image_url as "hoverImage", 
      description, rating::float, review_count as "reviewCount", 
      burn_time as "burnTime", scent_profile as "scentProfile", stock_quantity as "stockQuantity"`,
    [name, slug, tagline, description, price, discountPrice || null, type, color, material, image, hoverImage, burnTime, scentProfile, stockQuantity || 100]
  );
  return result.rows[0];
};

// 4. UPDATE (Ürün Güncelle)
export const updateProduct = async (id: string, data: any): Promise<Product | null> => {
  const { name, price, discountPrice, stockQuantity, description, tagline, type, color, material, image, hoverImage, burnTime, scentProfile } = data;
  
  const result = await pool.query(
    `UPDATE products SET 
      name = COALESCE($1, name),
      price = COALESCE($2, price),
      discount_price = COALESCE($3, discount_price),
      stock_quantity = COALESCE($4, stock_quantity),
      description = COALESCE($5, description),
      tagline = COALESCE($6, tagline),
      type = COALESCE($7, type),
      color = COALESCE($8, color),
      material = COALESCE($9, material),
      image_url = COALESCE($10, image_url),
      hover_image_url = COALESCE($11, hover_image_url),
      burn_time = COALESCE($12, burn_time),
      scent_profile = COALESCE($13, scent_profile),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $14 
    RETURNING 
      id, slug, name, tagline, price::float, discount_price::float as "discountPrice", 
      type, color, material, image_url as "image", hover_image_url as "hoverImage", 
      description, rating::float, review_count as "reviewCount", 
      burn_time as "burnTime", scent_profile as "scentProfile", stock_quantity as "stockQuantity"`,
    [name, price, discountPrice, stockQuantity, description, tagline, type, color, material, image, hoverImage, burnTime, scentProfile, id]
  );
  return result.rows[0] || null;
};

// 5. DELETE (Soft Delete - Arşivleme)
export const deleteProduct = async (id: string): Promise<boolean> => {
  // Ürünü veritabanından tamamen silmek yerine 'is_active = false' yapıyoruz.
  // Bu sayede eski siparişlerdeki veriler bozulmaz.
  const result = await pool.query('UPDATE products SET is_active = false WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
};