// src/config/redis.ts
// Redis client configuration
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import logger from '../utils/logger';
import { env } from './env';

let redisClient: RedisClientType | null = null;
let isRedisEnabled = false;

/**
 * Redis client'ı başlat
 */
export const initializeRedis = async (): Promise<void> => {
  // Redis URL environment variable'dan al (opsiyonel)
  const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST 
    ? `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
    : null;

  // Redis URL yoksa veya REDIS_ENABLED=false ise Redis'i devre dışı bırak
  if (!redisUrl || process.env.REDIS_ENABLED === 'false') {
    logger.info('Redis devre dışı (REDIS_URL belirtilmemiş veya REDIS_ENABLED=false)');
    return;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      password: process.env.REDIS_PASSWORD,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis bağlantısı kurulamadı, Redis devre dışı bırakılıyor');
            return false; // Bağlantıyı durdur
          }
          return Math.min(retries * 100, 3000); // Exponential backoff
        },
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client hatası:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client bağlanıyor...');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis client hazır');
      isRedisEnabled = true;
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis client yeniden bağlanıyor...');
    });

    await redisClient.connect();
  } catch (error) {
    logger.warn('Redis bağlantısı kurulamadı, uygulama Redis olmadan devam edecek:', error);
    redisClient = null;
    isRedisEnabled = false;
  }
};

/**
 * Redis client'ı kapat
 */
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis client kapatıldı');
    } catch (error) {
      logger.error('Redis kapatma hatası:', error);
    }
    redisClient = null;
    isRedisEnabled = false;
  }
};

/**
 * Redis'in aktif olup olmadığını kontrol et
 */
export const isRedisAvailable = (): boolean => {
  return isRedisEnabled && redisClient !== null;
};

/**
 * Redis client'ı döndür
 */
export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

// Graceful shutdown için
process.on('SIGTERM', async () => {
  await closeRedis();
});

process.on('SIGINT', async () => {
  await closeRedis();
});

export default redisClient;
