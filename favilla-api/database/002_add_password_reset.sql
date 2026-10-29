-- Password reset özellikleri için migration
-- users tablosuna password reset alanları ekle

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP WITH TIME ZONE;

-- Index ekle (token ile hızlı arama için)
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(password_reset_token) 
WHERE password_reset_token IS NOT NULL;
