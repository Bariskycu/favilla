// src/models/wishlistModel.ts
import pool from '../config/db';
import { Product } from './productModel';

// Favoriye Ekle
export const addToWishlist = async (userId: string, productId: string): Promise<void> => {
  // ON CONFLICT DO NOTHING: Eğer zaten ekliyse hata verme, işlemi görmezden gel.
  await pool.query(
    `INSERT INTO wishlist_items (user_id, product_id) 
     VALUES ($1, $2) 
     ON CONFLICT (user_id, product_id) DO NOTHING`,
    [userId, productId]
  );
};

// Favoriden Çıkar
export const removeFromWishlist = async (userId: string, productId: string): Promise<void> => {
  await pool.query(
    'DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2',
    [userId, productId]
  );
};

// Wishlist item interface
export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
}

// Kullanıcının Favorilerini Getir (Ürün Detaylarıyla Birlikte)
export const getUserWishlist = async (userId: string): Promise<WishlistItem[]> => {
  const query = `
    SELECT 
      w.product_id as "productId",
      w.added_at as "addedAt",
      p.id, 
      p.slug, 
      p.name, 
      p.tagline, 
      p.price::float, 
      p.discount_price::float as "discountPrice", 
      p.type, 
      p.color, 
      p.material, 
      p.image_url as "image", 
      p.hover_image_url as "hoverImage", 
      p.description, 
      p.rating::float, 
      p.review_count as "reviewCount",
      p.burn_time as "burnTime", 
      p.scent_profile as "scentProfile",
      p.stock_quantity as "stockQuantity"
    FROM wishlist_items w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = $1 AND p.is_active = TRUE
    ORDER BY w.added_at DESC
  `;

  const result = await pool.query(query, [userId]);
  
  // Transform the result to match the expected format
  return result.rows.map((row) => ({
    productId: row.productId,
    addedAt: row.addedAt,
    product: {
      id: row.id,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      price: row.price,
      discountPrice: row.discountPrice,
      type: row.type,
      color: row.color,
      material: row.material,
      image: row.image,
      hoverImage: row.hoverImage,
      description: row.description,
      rating: row.rating,
      reviewCount: row.reviewCount,
      burnTime: row.burnTime,
      scentProfile: row.scentProfile,
      stockQuantity: row.stockQuantity,
    },
  }));
};

// Bir ürünün favoride olup olmadığını kontrol et (Buton rengi için)
export const checkIsInWishlist = async (userId: string, productId: string): Promise<boolean> => {
  const result = await pool.query(
    'SELECT 1 FROM wishlist_items WHERE user_id = $1 AND product_id = $2',
    [userId, productId]
  );
  return result.rows.length > 0;
};