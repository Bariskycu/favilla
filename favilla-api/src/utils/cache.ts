// src/utils/cache.ts
// Cache utility functions (Redis veya in-memory fallback)
import { getRedisClient, isRedisAvailable } from '../config/redis';
import logger from './logger';
import crypto from 'crypto';

// In-memory cache fallback (Redis yoksa)
const memoryCache = new Map<string, { data: any; expiresAt: number }>();

// Race condition koruması için - aynı key için bekleyen promise'ler
const pendingPromises = new Map<string, Promise<any>>();

/**
 * Cache key oluştur
 */
export const generateCacheKey = (prefix: string, ...parts: (string | number | undefined)[]): string => {
  const keyParts = parts
    .filter(part => part !== undefined && part !== null)
    .map(part => String(part));
  
  const keyString = `${prefix}:${keyParts.join(':')}`;
  
  // Key'i hash'le (çok uzun key'ler için)
  if (keyString.length > 200) {
    const hash = crypto.createHash('md5').update(keyString).digest('hex');
    return `${prefix}:${hash}`;
  }
  
  return keyString;
};

/**
 * Cache'den veri al
 */
export const getCache = async <T = any>(key: string): Promise<T | null> => {
  try {
    // Redis kullanılabilirse Redis'ten al
    if (isRedisAvailable()) {
      const client = getRedisClient();
      if (client) {
        const cached = await client.get(key);
        if (cached) {
          try {
            return JSON.parse(cached) as T;
          } catch (error) {
            logger.warn(`Cache parse hatası (key: ${key}):`, error);
            return null;
          }
        }
      }
    }

    // Redis yoksa in-memory cache'den al
    const cached = memoryCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    } else if (cached) {
      // Expired, sil
      memoryCache.delete(key);
    }

    return null;
  } catch (error) {
    logger.error(`Cache get hatası (key: ${key}):`, error);
    return null;
  }
};

/**
 * Cache'e veri kaydet
 */
export const setCache = async (
  key: string,
  data: any,
  ttlSeconds: number = 300 // Varsayılan: 5 dakika
): Promise<boolean> => {
  try {
    const serialized = JSON.stringify(data);

    // Redis kullanılabilirse Redis'e kaydet
    if (isRedisAvailable()) {
      const client = getRedisClient();
      if (client) {
        await client.setEx(key, ttlSeconds, serialized);
        return true;
      }
    }

    // Redis yoksa in-memory cache'e kaydet
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    memoryCache.set(key, { data, expiresAt });

    // Memory cache temizleme (expired entries)
    if (memoryCache.size > 1000) {
      const now = Date.now();
      for (const [k, v] of memoryCache.entries()) {
        if (v.expiresAt <= now) {
          memoryCache.delete(k);
        }
      }
    }

    return true;
  } catch (error) {
    logger.error(`Cache set hatası (key: ${key}):`, error);
    return false;
  }
};

/**
 * Cache'den veri sil
 */
export const deleteCache = async (key: string): Promise<boolean> => {
  try {
    // Redis kullanılabilirse Redis'ten sil
    if (isRedisAvailable()) {
      const client = getRedisClient();
      if (client) {
        await client.del(key);
        return true;
      }
    }

    // Redis yoksa in-memory cache'den sil
    memoryCache.delete(key);
    return true;
  } catch (error) {
    logger.error(`Cache delete hatası (key: ${key}):`, error);
    return false;
  }
};

/**
 * Pattern'e göre cache'leri sil (örn: "product:*")
 */
export const deleteCachePattern = async (pattern: string): Promise<number> => {
  try {
    let deletedCount = 0;

    // Redis kullanılabilirse Redis'te pattern'e göre sil
    if (isRedisAvailable()) {
      const client = getRedisClient();
      if (client) {
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
          await client.del(keys);
          deletedCount = keys.length;
        }
      }
    } else {
      // Redis yoksa in-memory cache'de pattern'e göre sil
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      for (const key of memoryCache.keys()) {
        if (regex.test(key)) {
          memoryCache.delete(key);
          deletedCount++;
        }
      }
    }

    return deletedCount;
  } catch (error) {
    logger.error(`Cache delete pattern hatası (pattern: ${pattern}):`, error);
    return 0;
  }
};

/**
 * Cache wrapper - Fonksiyonu cache'le
 * Race condition koruması ile - aynı key için birden fazla istek gelirse
 * sadece bir tanesi DB'ye gider, diğerleri bekleyip cache'den alır
 * 
 * @param req Optional request object - cache hit durumunda flag set edilir
 */
export const withCache = async <T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300,
  req?: any // Request object - cache hit flag'i için
): Promise<T> => {
  // Önce cache'den kontrol et
  const cached = await getCache<T>(key);
  if (cached !== null) {
    logger.debug(`Cache hit: ${key}`);
    // Request'e cache hit flag'i ekle (rate limiter için)
    if (req) {
      req.fromCache = true;
    }
    return cached;
  }

  // Aynı key için zaten bir istek devam ediyor mu kontrol et
  const pendingPromise = pendingPromises.get(key);
  if (pendingPromise) {
    logger.debug(`Cache race condition - waiting for pending request: ${key}`);
    try {
      return await pendingPromise as T;
    } catch (error) {
      // Pending promise hata verirse, kendi isteğimizi yapalım
      logger.warn(`Pending promise failed for ${key}, retrying:`, error);
    }
  }

  // Yeni bir promise oluştur ve pending listesine ekle
  logger.debug(`Cache miss: ${key}`);
  const promise = (async () => {
    try {
      // Tekrar cache kontrolü (double-check pattern)
      const cachedAgain = await getCache<T>(key);
      if (cachedAgain !== null) {
        logger.debug(`Cache hit (double-check): ${key}`);
        return cachedAgain;
      }

      // Cache'de yoksa fonksiyonu çalıştır
      const result = await fn();

      // Sonucu cache'e kaydet
      await setCache(key, result, ttlSeconds);

      return result;
    } finally {
      // İşlem bittiğinde pending listesinden çıkar
      pendingPromises.delete(key);
    }
  })();

  // Pending listesine ekle
  pendingPromises.set(key, promise);

  return await promise;
};

/**
 * Cache'i temizle (tüm cache'leri sil)
 */
export const clearCache = async (): Promise<void> => {
  try {
    if (isRedisAvailable()) {
      const client = getRedisClient();
      if (client) {
        await client.flushDb();
        logger.info('Redis cache temizlendi');
      }
    } else {
      memoryCache.clear();
      logger.info('In-memory cache temizlendi');
    }
  } catch (error) {
    logger.error('Cache clear hatası:', error);
  }
};
