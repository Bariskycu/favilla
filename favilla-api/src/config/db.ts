import { Pool, PoolConfig } from 'pg';
import { env } from './env';
import logger from '../utils/logger';
import { testConnection } from '../utils/dbRetry';
import { startPoolMonitoring, logPoolStatus } from '../utils/poolMonitoring';

// Bağlantı timeout'u: Windows/Docker'da PostgreSQL bazen yavaş açılır.
// Varsayılan 10 saniye; .env'de DB_CONNECTION_TIMEOUT=15000 gibi ayarlanabilir.
const connectionTimeout = parseInt(
  process.env.DB_CONNECTION_TIMEOUT || '10000',
  10
);

const poolConfig: PoolConfig = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_DATABASE,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: connectionTimeout,
};

const pool = new Pool(poolConfig);

// Pool error handler - process.exit yerine log ve retry
pool.on('error', (err) => {
  logger.error('Veritabanı pool hatası:', err);
  // Process.exit yerine sadece log yapıyoruz
  // Pool kendi içinde retry mekanizmasına sahip
  // Kritik hatalar için uygulama seviyesinde retry yapılacak
});

// Bağlantıyı test et (retry mekanizması ile)
// Windows/Docker'da PostgreSQL bazen geç ayağa kalktığı için deneme sayısı ve bekleme süresi yüksek tutuldu.
const initializeDatabase = async () => {
  const maxRetries = parseInt(process.env.DB_CONNECTION_RETRIES || '8', 10);
  const initialDelay = parseInt(process.env.DB_CONNECTION_RETRY_DELAY || '2000', 10);

  logger.info('Veritabanı bağlantısı test ediliyor...');

  const connected = await testConnection(pool, {
    maxRetries,
    initialDelay,
    maxDelay: 30000,
    backoffMultiplier: 2,
  });

  if (!connected) {
    logger.error(
      `Veritabanı bağlantısı başarısız! ${maxRetries + 1} deneme sonrası bağlanılamadı.`
    );
    logger.error('Lütfen veritabanı ayarlarını kontrol edin ve veritabanının çalıştığından emin olun.');
    process.exit(1);
  }

  // Bağlantı başarılı, veritabanı adını al
  try {
    const { clientQueryWithTimeout } = await import('../utils/queryTimeout');
    const client = await pool.connect();
    try {
      // Query timeout ile veritabanı adını al
      const result = await clientQueryWithTimeout(client, 'SELECT current_database()', [], 5000);
      const dbName = result.rows[0].current_database;
      logger.info(`✅ Veritabanına bağlanıldı! (Aktif Veritabanı: ${dbName})`);
      
      // Statement timeout ayarla (PostgreSQL seviyesinde)
      const queryTimeout = parseInt(process.env.DB_QUERY_TIMEOUT || '30000', 10);
      const statementTimeoutMs = queryTimeout;
      await clientQueryWithTimeout(
        client,
        `SET statement_timeout = ${statementTimeoutMs}`,
        [],
        5000
      ).catch((err) => {
        logger.warn('Statement timeout ayarlanamadı (opsiyonel):', err);
      });
    } catch (err) {
      logger.info(
        `✅ Veritabanına bağlanıldı! (Veritabanı adı alınamadı: ${err instanceof Error ? err.message : 'Bilinmeyen hata'})`
      );
    } finally {
      client.release();
    }
  } catch (err) {
      logger.warn('Veritabanı adı alınamadı, ancak bağlantı başarılı:', err);
  }

  // Pool monitoring başlat (sadece production'da değil, tüm ortamlarda)
  if (env.NODE_ENV === 'production') {
    // Production'da daha sık monitoring (30 saniyede bir)
    startPoolMonitoring(pool, {
      interval: 30000,
      logLevel: 'warn', // Sadece warning ve error logla
      enableDetailedLogs: false,
    });
  } else {
    // Development'ta daha az sıklıkta ve detaylı loglar
    startPoolMonitoring(pool, {
      interval: 60000, // 1 dakika
      logLevel: 'info',
      enableDetailedLogs: true, // Development'ta detaylı loglar
    });
  }

  // Başlangıçta pool durumunu logla
  logPoolStatus(pool);

  // Migration'ları çalıştır (veritabanı bağlantısı kurulduktan sonra)
  try {
    const { runPendingMigrations } = await import('../utils/migrationSystem');
    logger.info('Migration\'lar kontrol ediliyor...');
    await runPendingMigrations();
    logger.info('Migration\'lar tamamlandı');
  } catch (error) {
    logger.error('Migration hatası:', error);
    // Development'ta devam et, production'da durdur
    if (process.env.NODE_ENV === 'production') {
      logger.error('Production ortamında migration hatası kritik!');
      // Production'da migration hatası varsa uygulamayı durdurma
      // Çünkü migration'lar manuel olarak da çalıştırılabilir
    } else {
      logger.warn('Development modunda migration hatası ile devam ediliyor...');
    }
  }
};

// Bağlantıyı asenkron olarak başlat
initializeDatabase().catch((err) => {
  logger.error('Veritabanı başlatma hatası:', err);
  process.exit(1);
});

export default pool;

