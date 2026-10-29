import pool from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

const checkUsers = async () => {
  try {
    // Önce hangi veritabanına bağlı olduğumuzu kontrol et
    const dbInfo = await pool.query('SELECT current_database(), current_user');
    console.log('=== Veritabanı Bilgileri ===');
    console.log('Bağlı Veritabanı:', dbInfo.rows[0].current_database);
    console.log('Kullanıcı:', dbInfo.rows[0].current_user);
    console.log('===========================\n');

    // Veritabanı bağlantı bilgilerini göster
    console.log('=== .env Bağlantı Bilgileri ===');
    console.log('Host:', process.env.DB_HOST || 'localhost');
    console.log('Port:', process.env.DB_PORT || '5432');
    console.log('Database:', process.env.DB_NAME || '(tanımsız - varsayılan kullanılıyor)');
    console.log('User:', process.env.DB_USER);
    console.log('================================\n');

    // Tablo var mı kontrol et
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ "users" tablosu bulunamadı!');
      process.exit(1);
    }
    
    console.log('✅ "users" tablosu mevcut\n');

    // Kullanıcıları listele
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        created_at,
        (SELECT COUNT(*) FROM users) as total_count
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    const totalCount = result.rows.length > 0 ? result.rows[0].total_count : 0;
    console.log(`✅ Toplam ${totalCount} kullanıcı bulundu:\n`);
    
    if (result.rows.length === 0) {
      console.log('⚠️  Veritabanında hiç kullanıcı yok!');
    } else {
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Phone: ${user.phone}`);
        console.log(`   Oluşturulma: ${user.created_at}`);
        console.log('');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error);
    if (error instanceof Error) {
      console.error('Hata mesajı:', error.message);
    }
    process.exit(1);
  }
};

if (require.main === module) {
  checkUsers();
}
