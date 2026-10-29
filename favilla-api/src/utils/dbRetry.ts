// src/utils/dbRetry.ts
// Database connection retry utility
import { Pool, PoolClient } from 'pg';
import logger from './logger';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
  backoffMultiplier?: number;
  retryableErrors?: string[]; // PostgreSQL error codes
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 5,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'ECONNREFUSED', // Connection refused
    'ETIMEDOUT', // Connection timeout
    'ENOTFOUND', // DNS lookup failed
    '57P01', // PostgreSQL: admin_shutdown
    '57P02', // PostgreSQL: crash_shutdown
    '57P03', // PostgreSQL: cannot_connect_now
    '08003', // PostgreSQL: connection_does_not_exist
    '08006', // PostgreSQL: connection_failure
    '08001', // PostgreSQL: sqlclient_unable_to_establish_sqlconnection
  ],
};

/**
 * Exponential backoff delay hesapla
 */
const calculateDelay = (
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number => {
  const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
  return Math.min(delay, maxDelay);
};

/** pg kütüphanesinden gelen "connection timeout" mesajları da retry edilebilir sayılır */
const RETRYABLE_MESSAGE_SUBSTRINGS = [
  'connection timeout',
  'Connection terminated due to connection timeout',
  'Connection terminated',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'ENOTFOUND',
];

/**
 * Hatanın retry edilebilir olup olmadığını kontrol et
 */
const isRetryableError = (error: any, retryableErrors: string[]): boolean => {
  if (!error) return false;

  // Error code kontrolü
  if (error.code && retryableErrors.includes(error.code)) {
    return true;
  }

  // Error message kontrolü (pg'den gelen "Connection terminated due to connection timeout" vb.)
  const errorMessage = (error.message || error.toString() || '').toString();
  const lower = errorMessage.toLowerCase();
  for (const msg of RETRYABLE_MESSAGE_SUBSTRINGS) {
    if (lower.includes(msg.toLowerCase())) {
      return true;
    }
  }
  for (const retryableError of retryableErrors) {
    if (errorMessage.includes(retryableError)) {
      return true;
    }
  }

  // Network error kontrolü
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
    return true;
  }

  return false;
};

/**
 * Retry mekanizması ile fonksiyon çalıştır
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Son deneme ise hatayı fırlat
      if (attempt === opts.maxRetries) {
        logger.error(
          `Database retry başarısız: ${opts.maxRetries + 1} deneme sonrası hata:`,
          error
        );
        throw error;
      }

      // Retry edilebilir hata mı kontrol et
      if (!isRetryableError(error, opts.retryableErrors)) {
        logger.warn('Database hatası retry edilebilir değil:', error);
        throw error;
      }

      // Delay hesapla ve bekle
      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier
      );

      logger.warn(
        `Database bağlantı hatası (deneme ${attempt + 1}/${opts.maxRetries + 1}):`,
        error.message || error
      );
      logger.info(`${delay}ms sonra tekrar denenecek...`);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Buraya gelmemeli ama TypeScript için
  throw lastError;
};

/**
 * Database bağlantısını test et (retry ile)
 */
export const testConnection = async (
  pool: Pool,
  options: RetryOptions = {}
): Promise<boolean> => {
  try {
    await withRetry(
      async () => {
        const client = await pool.connect();
        try {
          await client.query('SELECT 1');
          return true;
        } finally {
          client.release();
        }
      },
      options
    );
    return true;
  } catch (error) {
    logger.error('Database bağlantı testi başarısız:', error);
    return false;
  }
};

/**
 * Database query'yi retry ile çalıştır
 */
export const queryWithRetry = async <T = any>(
  pool: Pool,
  queryText: string,
  params?: any[],
  options: RetryOptions = {}
): Promise<T> => {
  return withRetry(
    async () => {
      const result = await pool.query(queryText, params);
      return result as T;
    },
    options
  );
};

/**
 * Database client'ı retry ile al
 */
export const connectWithRetry = async (
  pool: Pool,
  options: RetryOptions = {}
): Promise<PoolClient> => {
  return withRetry(
    async () => {
      return await pool.connect();
    },
    options
  );
};
