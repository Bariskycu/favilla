-- =============================================
-- MIGRATIONS TABLE
-- Bu tablo migration'ların versiyonlarını takip eder
-- =============================================

CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) UNIQUE NOT NULL,
    filename VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_migrations_version ON migrations(version);
CREATE INDEX IF NOT EXISTS idx_migrations_executed_at ON migrations(executed_at);
