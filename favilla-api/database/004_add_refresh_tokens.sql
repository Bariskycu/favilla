-- Refresh token tablosu
-- Her kullanıcı için birden fazla refresh token olabilir (farklı cihazlar için)

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL, -- SHA-256 hash'lenmiş token
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    device_info TEXT, -- Opsiyonel: Cihaz bilgisi (browser, OS vb.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Süresi dolmuş token'ları temizlemek için function (opsiyonel, cron job ile çalıştırılabilir)
CREATE OR REPLACE FUNCTION cleanup_expired_refresh_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM refresh_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
