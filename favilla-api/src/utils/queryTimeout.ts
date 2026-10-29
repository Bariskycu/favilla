// src/utils/queryTimeout.ts
// Query timeout utility
import { Pool, PoolClient, QueryResult } from 'pg';
import logger from './logger';

// Default timeout değerleri (milliseconds)
const DEFAULT_QUERY_TIMEOUT = parseInt(process.env.DB_QUERY_TIMEOUT || '30000', 10); // 30 saniye
const DEFAULT_TRANSACTION_TIMEOUT = parseInt(process.env.DB_TRANSACTION_TIMEOUT || '60000', 10); // 60 saniye

/**
 * Query timeout error class
 */
export class QueryTimeoutError extends Error {
  constructor(message: string, public timeout: number, public query: string) {
    super(message);
    this.name = 'QueryTimeoutError';
  }
}

/**
 * Query'yi timeout ile çalıştır
 * @param queryFn Query fonksiyonu (client.query veya pool.query)
 * @param queryText SQL query
 * @param params Query parametreleri
 * @param timeout Timeout süresi (milliseconds)
 * @returns Query result
 */
export const queryWithTimeout = async <T = any>(
  queryFn: (text: string, params?: any[]) => Promise<QueryResult<T>>,
  queryText: string,
  params?: any[],
  timeout: number = DEFAULT_QUERY_TIMEOUT
): Promise<QueryResult<T>> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        new QueryTimeoutError(
          `Query timeout: ${timeout}ms süre içinde tamamlanamadı`,
          timeout,
          queryText.substring(0, 100) // İlk 100 karakter
        )
      );
    }, timeout);
  });

  try {
    const result = await Promise.race([
      queryFn(queryText, params),
      timeoutPromise,
    ]);

    return result as QueryResult<T>;
  } catch (error) {
    if (error instanceof QueryTimeoutError) {
      logger.error(`Query timeout hatası: ${error.message}`, {
        query: queryText.substring(0, 200),
        timeout,
      });
    }
    throw error;
  }
};

/**
 * Pool query'yi timeout ile çalıştır
 */
export const poolQueryWithTimeout = async <T = any>(
  pool: Pool,
  queryText: string,
  params?: any[],
  timeout?: number
): Promise<QueryResult<T>> => {
  return queryWithTimeout(
    (text, p) => pool.query<T>(text, p),
    queryText,
    params,
    timeout
  );
};

/**
 * Client query'yi timeout ile çalıştır
 */
export const clientQueryWithTimeout = async <T = any>(
  client: PoolClient,
  queryText: string,
  params?: any[],
  timeout?: number
): Promise<QueryResult<T>> => {
  return queryWithTimeout(
    (text, p) => client.query<T>(text, p),
    queryText,
    params,
    timeout
  );
};

/**
 * Transaction timeout wrapper
 * Transaction içindeki tüm query'ler için timeout uygular
 */
export const withTransactionTimeout = async <T>(
  callback: (client: PoolClient) => Promise<T>,
  timeout: number = DEFAULT_TRANSACTION_TIMEOUT
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        new QueryTimeoutError(
          `Transaction timeout: ${timeout}ms süre içinde tamamlanamadı`,
          timeout,
          'Transaction'
        )
      );
    }, timeout);
  });

  try {
    const result = await Promise.race([
      callback({} as PoolClient), // Bu wrapper transaction wrapper ile birlikte kullanılacak
      timeoutPromise,
    ]);

    return result;
  } catch (error) {
    if (error instanceof QueryTimeoutError) {
      logger.error(`Transaction timeout hatası: ${error.message}`, {
        timeout,
      });
    }
    throw error;
  }
};

/**
 * Query timeout ayarlarını al
 */
export const getQueryTimeout = (): number => {
  return DEFAULT_QUERY_TIMEOUT;
};

/**
 * Transaction timeout ayarlarını al
 */
export const getTransactionTimeout = (): number => {
  return DEFAULT_TRANSACTION_TIMEOUT;
};
