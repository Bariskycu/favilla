import pool from '../config/db';
import fs from 'fs';
import path from 'path';

export const runMigration = async (migrationFile: string): Promise<void> => {
  try {
    const migrationPath = path.join(__dirname, '../../database', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(sql);
    console.log(`✅ Migration başarıyla çalıştırıldı: ${migrationFile}`);
  } catch (error) {
    console.error(`❌ Migration hatası (${migrationFile}):`, error);
    throw error;
  }
};

// Eğer doğrudan çalıştırılırsa
if (require.main === module) {
  runMigration('001_initial_schema.sql')
    .then(() => {
      console.log('Migration tamamlandı');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration başarısız:', error);
      process.exit(1);
    });
}

