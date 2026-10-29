-- Admin audit logging tablosu
-- Admin işlemlerini kaydetmek için

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- Örn: 'product.create', 'product.update', 'product.delete'
    resource_type VARCHAR(50) NOT NULL, -- Örn: 'product', 'order', 'user'
    resource_id UUID, -- İşlem yapılan kaynağın ID'si (opsiyonel)
    description TEXT, -- İşlem açıklaması
    old_values JSONB, -- Eski değerler (update işlemleri için)
    new_values JSONB, -- Yeni değerler
    ip_address VARCHAR(45), -- IPv4 veya IPv6
    user_agent TEXT, -- Browser/device bilgisi
    request_id VARCHAR(255), -- Request ID (X-Request-ID)
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'error')),
    error_message TEXT, -- Hata durumunda hata mesajı
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request_id ON audit_logs(request_id);

-- Composite index (admin + tarih aralığı sorguları için)
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_created ON audit_logs(admin_id, created_at DESC);
