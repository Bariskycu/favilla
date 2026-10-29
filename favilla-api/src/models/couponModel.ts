// src/models/couponModel.ts
import pool from '../config/db';

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
}

export const validateCoupon = async (code: string, userId: string): Promise<Coupon> => {
  // 1. Kupon var mı, süresi dolmuş mu, aktif mi?
  const res = await pool.query(
    `SELECT id, code, discount_percent, usage_limit, used_count 
     FROM coupons 
     WHERE code = $1 AND is_active IS TRUE 
     AND (valid_until IS NULL OR valid_until > NOW())`,
    [code]
  );

  if (res.rows.length === 0) {
    throw new Error('Geçersiz veya süresi dolmuş kupon kodu.');
  }

  const coupon = res.rows[0];

  // 2. Kullanım limiti dolmuş mu?
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    throw new Error('Bu kuponun kullanım limiti dolmuş.');
  }

  // 3. Kullanıcı bu kuponu daha önce kullanmış mı?
  const usageCheck = await pool.query(
    'SELECT id FROM coupon_usages WHERE user_id = $1 AND coupon_id = $2',
    [userId, coupon.id]
  );

  if (usageCheck.rows.length > 0) {
    throw new Error('Bu kuponu zaten kullandınız.');
  }

  return {
    id: coupon.id,
    code: coupon.code,
    discountPercent: coupon.discount_percent
  };
};