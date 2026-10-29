// src/utils/poolMonitoring.ts
// Database connection pool monitoring and metrics
import { Pool } from 'pg';
import logger from './logger';

export interface PoolMetrics {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
  activeCount: number;
  utilizationPercent: number;
  timestamp: Date;
}

export interface PoolHealth {
  status: 'healthy' | 'warning' | 'critical';
  metrics: PoolMetrics;
  message?: string;
}

/**
 * Pool metriklerini topla
 */
export const getPoolMetrics = (pool: Pool): PoolMetrics => {
  const totalCount = pool.totalCount;
  const idleCount = pool.idleCount;
  const waitingCount = pool.waitingCount;
  const activeCount = totalCount - idleCount;
  const maxConnections = (pool as any).options?.max || 20;
  const utilizationPercent = maxConnections > 0 
    ? Math.round((activeCount / maxConnections) * 100) 
    : 0;

  return {
    totalCount,
    idleCount,
    waitingCount,
    activeCount,
    utilizationPercent,
    timestamp: new Date(),
  };
};

/**
 * Pool sağlık durumunu kontrol et
 */
export const checkPoolHealth = (pool: Pool, config?: {
  warningThreshold?: number; // %80 varsayılan
  criticalThreshold?: number; // %95 varsayılan
}): PoolHealth => {
  const { warningThreshold = 80, criticalThreshold = 95 } = config || {};
  const metrics = getPoolMetrics(pool);
  const maxConnections = (pool as any).options?.max || 20;

  // Critical: Pool %95'in üzerinde kullanılıyor
  if (metrics.utilizationPercent >= criticalThreshold) {
    return {
      status: 'critical',
      metrics,
      message: `Pool kritik seviyede! ${metrics.utilizationPercent}% kullanılıyor (${metrics.activeCount}/${maxConnections}). Yeni bağlantılar bekleyebilir.`,
    };
  }

  // Warning: Pool %80'in üzerinde kullanılıyor
  if (metrics.utilizationPercent >= warningThreshold) {
    return {
      status: 'warning',
      metrics,
      message: `Pool yüksek kullanımda! ${metrics.utilizationPercent}% kullanılıyor (${metrics.activeCount}/${maxConnections}).`,
    };
  }

  // Healthy: Normal kullanım
  return {
    status: 'healthy',
    metrics,
    message: `Pool sağlıklı. ${metrics.utilizationPercent}% kullanılıyor (${metrics.activeCount}/${maxConnections}).`,
  };
};

/**
 * Pool metriklerini logla
 */
export const logPoolMetrics = (pool: Pool, level: 'info' | 'warn' | 'error' = 'info'): void => {
  const metrics = getPoolMetrics(pool);
  const health = checkPoolHealth(pool);
  const maxConnections = (pool as any).options?.max || 20;

  const logMessage = `[Pool Metrics] Total: ${metrics.totalCount}, Active: ${metrics.activeCount}, Idle: ${metrics.idleCount}, Waiting: ${metrics.waitingCount}, Utilization: ${metrics.utilizationPercent}% (${metrics.activeCount}/${maxConnections})`;

  if (health.status === 'critical') {
    logger.error(`${logMessage} - ⚠️ CRITICAL: ${health.message}`);
  } else if (health.status === 'warning') {
    logger.warn(`${logMessage} - ⚠️ WARNING: ${health.message}`);
  } else {
    logger[level](logMessage);
  }
};

/**
 * Pool durumunu detaylı logla
 */
export const logPoolStatus = (pool: Pool): void => {
  const metrics = getPoolMetrics(pool);
  const health = checkPoolHealth(pool);
  const maxConnections = (pool as any).options?.max || 20;
  const poolConfig = (pool as any).options || {};

  logger.info('='.repeat(60));
  logger.info('📊 Database Connection Pool Status');
  logger.info('='.repeat(60));
  logger.info(`Max Connections:     ${maxConnections}`);
  logger.info(`Total Connections:   ${metrics.totalCount}`);
  logger.info(`Active Connections:  ${metrics.activeCount}`);
  logger.info(`Idle Connections:   ${metrics.idleCount}`);
  logger.info(`Waiting Requests:   ${metrics.waitingCount}`);
  logger.info(`Utilization:        ${metrics.utilizationPercent}%`);
  logger.info(`Status:             ${health.status.toUpperCase()}`);
  if (health.message) {
    logger.info(`Message:            ${health.message}`);
  }
  logger.info(`Idle Timeout:       ${poolConfig.idleTimeoutMillis || 'N/A'}ms`);
  logger.info(`Connection Timeout: ${poolConfig.connectionTimeoutMillis || 'N/A'}ms`);
  logger.info('='.repeat(60));
};

/**
 * Periyodik pool monitoring başlat
 */
export const startPoolMonitoring = (
  pool: Pool,
  options?: {
    interval?: number; // ms, varsayılan: 60000 (1 dakika)
    logLevel?: 'info' | 'warn' | 'error';
    enableDetailedLogs?: boolean; // Detaylı loglar için
  }
): NodeJS.Timeout => {
  const {
    interval = 60000, // 1 dakika
    logLevel = 'info',
    enableDetailedLogs = false,
  } = options || {};

  logger.info(`Pool monitoring başlatıldı (interval: ${interval}ms)`);

  const monitoringInterval = setInterval(() => {
    try {
      if (enableDetailedLogs) {
        logPoolStatus(pool);
      } else {
        logPoolMetrics(pool, logLevel);
      }
    } catch (error) {
      logger.error('Pool monitoring hatası:', error);
    }
  }, interval);

  return monitoringInterval;
};

/**
 * Pool monitoring'i durdur
 */
export const stopPoolMonitoring = (interval: NodeJS.Timeout): void => {
  clearInterval(interval);
  logger.info('Pool monitoring durduruldu');
};
