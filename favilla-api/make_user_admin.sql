-- Customer'ı Admin Yapma Sorgusu
-- Kullanım: Email adresine göre kullanıcıyı admin yap

-- Örnek 1: Email adresine göre
UPDATE users 
SET role = 'admin', updated_at = CURRENT_TIMESTAMP
WHERE email = 'kullanici@example.com';

-- Örnek 2: ID'ye göre (daha güvenli)
-- Önce kullanıcının ID'sini bulun:
-- SELECT id, name, email, role FROM users WHERE email = 'kullanici@example.com';
-- Sonra ID ile güncelleyin:
-- UPDATE users 
-- SET role = 'admin', updated_at = CURRENT_TIMESTAMP
-- WHERE id = 'kullanici-id-buraya';

-- Kontrol için:
-- SELECT id, name, email, role FROM users WHERE email = 'kullanici@example.com';
