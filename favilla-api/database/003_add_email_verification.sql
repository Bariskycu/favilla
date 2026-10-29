-- Email verification özellikleri için migration
-- users tablosuna email verification alanları ekle

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP WITH TIME ZONE;

-- Index ekle (token ile hızlı arama için)
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(email_verification_token) 
WHERE email_verification_token IS NOT NULL;
