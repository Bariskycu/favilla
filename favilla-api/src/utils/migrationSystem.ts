// src/utils/migrationSystem.ts
// Database migration versioning system
import pool from '../config/db';
import fs from 'fs';
import path from 'path';
import logger from './logger';

export interface MigrationRecord {
  id: number;
  version: string;
  filename: string;
  executed_at: Date;
  execution_time_ms: number | null;
  success: boolean;
  error_message: string | null;
}

/**
 * Migration tablosunu oluştur (eğer yoksa)
 */
export const ensureMigrationsTable = async (): Promise<void> => {
  try {
    const migrationsTablePath = path.join(__dirname, '../../database/000_create_migrations_table.sql');
    const sql = fs.readFileSync(migrationsTablePath, 'utf8');
    await pool.query(sql);
    logger.info('Migrations table ensured');
  } catch (error) {
    logger.error('Error creating migrations table:', error);
    throw error;
  }
};

/**
 * Migration dosyalarını sıralı olarak bul
 */
export const getMigrationFiles = (): string[] => {
  const migrationsDir = path.join(__dirname, '../../database');
  const files = fs.readdirSync(migrationsDir);
  
  // Sadece SQL dosyalarını al ve sırala
  const migrationFiles = files
    .filter(file => file.endsWith('.sql') && file !== '000_create_migrations_table.sql')
    .sort((a, b) => {
      // Dosya adlarından versiyon numaralarını çıkar (örn: 001_initial_schema.sql -> 001)
      const versionA = parseInt(a.split('_')[0]) || 0;
      const versionB = parseInt(b.split('_')[0]) || 0;
      return versionA - versionB;
    });
  
  return migrationFiles;
};

/**
 * Çalıştırılmış migration'ları veritabanından al
 */
export const getExecutedMigrations = async (): Promise<MigrationRecord[]> => {
  try {
    const result = await pool.query<MigrationRecord>(
      'SELECT * FROM migrations WHERE success = true ORDER BY version ASC'
    );
    return result.rows;
  } catch (error) {
    // Eğer migrations tablosu yoksa boş dizi döndür
    if ((error as any).code === '42P01') {
      return [];
    }
    throw error;
  }
};

/**
 * Migration'ın çalıştırılıp çalıştırılmadığını kontrol et
 */
export const isMigrationExecuted = async (version: string): Promise<boolean> => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM migrations WHERE version = $1 AND success = true',
      [version]
    );
    return parseInt(result.rows[0].count, 10) > 0;
  } catch (error) {
    // Eğer migrations tablosu yoksa false döndür
    if ((error as any).code === '42P01') {
      return false;
    }
    throw error;
  }
};

/**
 * Migration'ı veritabanına kaydet
 */
export const recordMigration = async (
  version: string,
  filename: string,
  executionTimeMs: number,
  success: boolean,
  errorMessage?: string
): Promise<void> => {
  try {
    await pool.query(
      `INSERT INTO migrations (version, filename, execution_time_ms, success, error_message)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (version) DO UPDATE SET
         execution_time_ms = $3,
         success = $4,
         error_message = $5,
         executed_at = CURRENT_TIMESTAMP`,
      [version, filename, executionTimeMs, success, errorMessage || null]
    );
  } catch (error) {
    logger.error('Error recording migration:', error);
    throw error;
  }
};

/**
 * Migration dosyasını çalıştır
 */
export const executeMigration = async (filename: string): Promise<void> => {
  const startTime = Date.now();
  const version = filename.split('_')[0]; // Örn: 001_initial_schema.sql -> 001
  const client = await pool.connect();
  
  try {
    const migrationPath = path.join(__dirname, '../../database', filename);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Transaction içinde çalıştır
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('COMMIT');
      
      const executionTime = Date.now() - startTime;
      await recordMigration(version, filename, executionTime, true);
      
      logger.info(`✅ Migration executed: ${filename} (${executionTime}ms)`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Migration kaydını transaction dışında yap (hata durumunda bile kaydedilmeli)
    try {
      await recordMigration(version, filename, executionTime, false, errorMessage);
    } catch (recordError) {
      logger.error('Error recording failed migration:', recordError);
    }
    
    logger.error(`❌ Migration failed: ${filename}`, error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Tüm pending migration'ları çalıştır
 */
export const runPendingMigrations = async (): Promise<void> => {
  try {
    // Önce migrations tablosunu oluştur
    await ensureMigrationsTable();
    
    // Migration dosyalarını al
    const migrationFiles = getMigrationFiles();
    logger.info(`Found ${migrationFiles.length} migration files`);
    
    // Çalıştırılmış migration'ları al
    const executedMigrations = await getExecutedMigrations();
    const executedVersions = new Set(executedMigrations.map(m => m.version));
    
    // Pending migration'ları bul
    const pendingMigrations = migrationFiles.filter(file => {
      const version = file.split('_')[0];
      return !executedVersions.has(version);
    });
    
    if (pendingMigrations.length === 0) {
      logger.info('✅ No pending migrations');
      return;
    }
    
    logger.info(`Running ${pendingMigrations.length} pending migration(s)...`);
    
    // Sırayla çalıştır
    for (const migrationFile of pendingMigrations) {
      const isExecuted = await isMigrationExecuted(migrationFile.split('_')[0]);
      if (!isExecuted) {
        await executeMigration(migrationFile);
      }
    }
    
    logger.info('✅ All migrations completed');
  } catch (error) {
    logger.error('❌ Migration process failed:', error);
    throw error;
  }
};

/**
 * Migration durumunu göster
 */
export const showMigrationStatus = async (): Promise<void> => {
  try {
    await ensureMigrationsTable();
    
    const migrationFiles = getMigrationFiles();
    const executedMigrations = await getExecutedMigrations();
    const executedVersions = new Set(executedMigrations.map(m => m.version));
    
    console.log('\n📊 Migration Status:');
    console.log('='.repeat(60));
    
    for (const file of migrationFiles) {
      const version = file.split('_')[0];
      const isExecuted = executedVersions.has(version);
      const status = isExecuted ? '✅ Executed' : '⏳ Pending';
      const migration = executedMigrations.find(m => m.version === version);
      
      if (migration) {
        const time = migration.execution_time_ms ? `${migration.execution_time_ms}ms` : 'N/A';
        console.log(`${status} | ${version.padEnd(10)} | ${file.padEnd(40)} | ${time}`);
      } else {
        console.log(`${status} | ${version.padEnd(10)} | ${file.padEnd(40)} | -`);
      }
    }
    
    console.log('='.repeat(60));
    console.log(`Total: ${migrationFiles.length} migrations`);
    console.log(`Executed: ${executedMigrations.length}`);
    console.log(`Pending: ${migrationFiles.length - executedMigrations.length}`);
  } catch (error) {
    logger.error('Error showing migration status:', error);
    throw error;
  }
};

// CLI için
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'status') {
    showMigrationStatus()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
      });
  } else {
    runPendingMigrations()
      .then(() => {
        console.log('Migration process completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Migration process failed:', error);
        process.exit(1);
      });
  }
}
