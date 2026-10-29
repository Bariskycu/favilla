// Environment değişkenlerini doğrula (uygulama başlamadan önce)
// Bu import, env.ts içindeki validateEnv() fonksiyonunu çalıştırır
// Eğer gerekli değişkenler eksikse uygulama başlamaz
import './config/env';

import app from './app';
import pool from './config/db';
import { env } from './config/env';
import logger from './utils/logger';
import { initializeRedis, closeRedis } from './config/redis';

// Redis'i başlat (opsiyonel)
initializeRedis().catch((err) => {
  logger.warn('Redis başlatılamadı, uygulama Redis olmadan devam edecek:', err);
});

let server;
try {
  server = app.listen(env.PORT, () => {
    logger.info(`Sunucu ${env.PORT} portunda çalışıyor`);
  });
} catch (error: any) {
  logger.error('Sunucu başlatma hatası:', error);
  logger.error('Stack trace:', error.stack);
  process.exit(1);
}

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} sinyali alındı, sunucu kapatılıyor...`);
  
  server.close(() => {
    logger.info('HTTP sunucusu kapatıldı');
    
    // Database connection pool'unu kapat
    pool.end(async () => {
      logger.info('Veritabanı bağlantı pool\'u kapatıldı');
      
      // Redis'i kapat
      await closeRedis();
      
      process.exit(0);
    });
  });

  // Eğer 10 saniye içinde kapanmazsa zorla kapat
  setTimeout(() => {
    logger.error('Zorla kapatılıyor...');
    process.exit(1);
  }, 10000);
};

// SIGTERM ve SIGINT sinyallerini dinle (graceful shutdown için)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled promise rejection'ları yakala
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});

// Uncaught exception'ları yakala
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});
