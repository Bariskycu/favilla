// src/utils/dbQuery.ts
// Database query wrapper with timeout
// Bu dosya, pool.query yerine kullanılabilir ve otomatik timeout ekler
import pool from '../config/db';
import { poolQueryWithTimeout, getQueryTimeout } from './queryTimeout';
import { QueryResult } from 'pg';

/**
 * Pool query wrapper with timeout
 * Tüm query'lerde bu fonksiyonu kullanarak otomatik timeout eklenir
 * 
 * @example
 * import { query } from '../utils/dbQuery';
 * const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
 */
export const query = async <T = any>(
  queryText: string,
  params?: any[],
  timeout?: number
): Promise<QueryResult<T>> => {
  return poolQueryWithTimeout(pool, queryText, params, timeout);
};

/**
 * Default query timeout değerini döndür
 */
export const getDefaultTimeout = (): number => {
  return getQueryTimeout();
};

// Pool'u da export et (gerekirse direkt erişim için)
export { pool };
