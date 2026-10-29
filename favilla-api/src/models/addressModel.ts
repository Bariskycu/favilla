// src/models/addressModel.ts
import pool from '../config/db';

export interface Address {
  id: string;
  user_id: string;
  title: string;
  line1: string;
  city: string;
  zip: string;
  country: string;
}

export const addAddress = async (userId: string, address: Omit<Address, 'id' | 'user_id'>): Promise<Address> => {
  const { title, line1, city, zip, country } = address;
  
  const result = await pool.query(
    `INSERT INTO addresses (user_id, title, line1, city, zip, country) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING id, title, line1, city, zip, country`,
    [userId, title, line1, city, zip, country]
  );
  
  return result.rows[0];
};

export const getUserAddresses = async (userId: string): Promise<Address[]> => {
  const result = await pool.query(
    'SELECT id, title, line1, city, zip, country FROM addresses WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

export const deleteAddress = async (addressId: string, userId: string): Promise<boolean> => {
  const result = await pool.query(
    'DELETE FROM addresses WHERE id = $1 AND user_id = $2',
    [addressId, userId]
  );
  return (result.rowCount ?? 0) > 0;
};

// Adres Güncelleme
export const updateAddress = async (addressId: string, userId: string, address: Partial<Address>): Promise<Address | null> => {
    const { title, line1, city, zip, country } = address;
    
    // COALESCE fonksiyonu: Eğer yeni değer NULL/Undefined ise eski değeri korur.
    const result = await pool.query(
      `UPDATE addresses
       SET title = COALESCE($1, title),
           line1 = COALESCE($2, line1),
           city = COALESCE($3, city),
           zip = COALESCE($4, zip),
           country = COALESCE($5, country)
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title, line1, city, zip, country, addressId, userId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  };