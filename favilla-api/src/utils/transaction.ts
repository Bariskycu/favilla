// src/utils/transaction.ts
// Database transaction yönetimi için yardımcı fonksiyonlar
import { PoolClient } from 'pg';
import pool from '../config/db';
import logger from './logger';
import { getTransactionTimeout, QueryTimeoutError } from './queryTimeout';

/**
 * Transaction içinde çalışacak fonksiyon tipi
 */
export type TransactionCallback<T> = (client: PoolClient) => Promise<T>;

/**
 * Transaction wrapper - Otomatik BEGIN, COMMIT, ROLLBACK yönetimi
 * 
 * @param callback Transaction içinde çalışacak fonksiyon
 * @returns Transaction sonucu
 * 
 * @example
 * const result = await withTransaction(async (client) => {
 *   await client.query('INSERT INTO ...');
 *   await client.query('UPDATE ...');
 *   return { success: true };
 * });
 */
export const withTransaction = async <T>(
  callback: TransactionCallback<T>,
  timeout?: number
): Promise<T> => {
  const client = await pool.connect();
  const transactionTimeout = timeout || getTransactionTimeout();
  
  // Transaction timeout wrapper
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        new QueryTimeoutError(
          `Transaction timeout: ${transactionTimeout}ms süre içinde tamamlanamadı`,
          transactionTimeout,
          'Transaction'
        )
      );
    }, transactionTimeout);
  });

  try {
    // BEGIN query'si için timeout
    const { clientQueryWithTimeout } = await import('./queryTimeout');
    await clientQueryWithTimeout(client, 'BEGIN', [], 5000); // BEGIN için 5 saniye
    
    // Transaction callback'i timeout ile çalıştır
    const result = await Promise.race([
      callback(client),
      timeoutPromise,
    ]);
    
    // COMMIT query'si için timeout
    await clientQueryWithTimeout(client, 'COMMIT', [], 5000); // COMMIT için 5 saniye
    return result;
  } catch (error) {
    // ROLLBACK query'si için timeout (hata durumunda)
    try {
      const { clientQueryWithTimeout } = await import('./queryTimeout');
      await clientQueryWithTimeout(client, 'ROLLBACK', [], 5000); // ROLLBACK için 5 saniye
    } catch (rollbackError) {
      logger.error('ROLLBACK hatası:', rollbackError);
    }
    
    if (error instanceof QueryTimeoutError) {
      logger.error('Transaction timeout:', error);
    } else {
      logger.error('Transaction rolled back:', error);
    }
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Transaction içinde çalışacak fonksiyon tipi (void döndüren)
 */
export type TransactionVoidCallback = (client: PoolClient) => Promise<void>;

/**
 * Transaction wrapper - Void döndüren işlemler için
 * 
 * @param callback Transaction içinde çalışacak fonksiyon
 * 
 * @example
 * await withTransactionVoid(async (client) => {
 *   await client.query('INSERT INTO ...');
 *   await client.query('UPDATE ...');
 * });
 */
export const withTransactionVoid = async (
  callback: TransactionVoidCallback
): Promise<void> => {
  await withTransaction(async (client) => {
    await callback(client);
  });
};
