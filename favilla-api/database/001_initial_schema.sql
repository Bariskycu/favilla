-- =============================================
-- FAVILLA CANDLE E-COMMERCE DATABASE SCHEMA
-- Version: 6.1 (GOLD MASTER - Turkish Search Optimized)
-- =============================================

-- 1. EKLENTİLER VE TEMİZLİK
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Arama performansı için

-- Temiz kurulum için tabloları bağımlılık sırasına göre sil
DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
DROP TRIGGER IF EXISTS trigger_increment_coupon_usage ON coupon_usages;
DROP TRIGGER IF EXISTS trigger_update_rating ON product_reviews;
DROP SEQUENCE IF EXISTS order_number_seq;

DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS coupon_usages;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS product_reviews;
DROP TABLE IF EXISTS product_questions;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS wishlist_items;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- =============================================
-- 2. KULLANICI VE ÜRÜN YÖNETİMİ
-- =============================================

-- KULLANICILAR
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ADRESLER
CREATE TABLE addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(50) NOT NULL, -- Örn: Ev, İş
    line1 VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    zip VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÜRÜNLER
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    
    -- Kategorizasyon (Frontend types.ts ile uyumlu)
    type VARCHAR(50) CHECK (type IN ('jar', 'sculptural', 'set')),
    color VARCHAR(50) CHECK (color IN ('natural', 'charcoal', 'terracotta')),
    material VARCHAR(50) CHECK (material IN ('soy-wax', 'beeswax', 'coconut-blend')),
    
    -- Medya
    image_url TEXT NOT NULL,
    hover_image_url TEXT,
    
    -- Detaylar
    burn_time VARCHAR(50),
    scent_profile VARCHAR(100),
    
    -- İstatistikler
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    
    -- Stok
    stock_quantity INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- KUPONLAR
CREATE TABLE coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    usage_limit INTEGER, -- NULL ise sınırsız
    used_count INTEGER DEFAULT 0, -- Trigger ile otomatik artacak
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 3. SEPET VE SİPARİŞ YÖNETİMİ
-- =============================================

-- SEPETLER
CREATE TABLE carts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    guest_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_cart_user UNIQUE (user_id)
);

-- SEPET KALEMLERİ
CREATE TABLE cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_cart_item UNIQUE (cart_id, product_id)
);

-- SİPARİŞLER
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Finansallar
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    coupon_id UUID REFERENCES coupons(id),
    
    -- Ödeme
    payment_provider VARCHAR(50), 
    payment_transaction_id VARCHAR(255),
    is_paid BOOLEAN DEFAULT FALSE,
    
    -- Durum
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'shipped', 'delivered', 'cancelled', 'returned')),
    
    -- Otomatik oluşturulacak (Örn: #FAV-1001)
    order_number VARCHAR(20) UNIQUE, 
    
    -- Snapshot (Adres o anki haliyle saklanır)
    shipping_address_snapshot JSONB NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- KUPON KULLANIM GEÇMİŞİ
CREATE TABLE coupon_usages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_coupon_usage UNIQUE (user_id, coupon_id)
);

-- SİPARİŞ DURUM TARİHÇESİ (Audit Log)
CREATE TABLE order_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SİPARİŞ KALEMLERİ
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    
    -- Ürün silinse bile sipariş detayında adı ve resmi kalsın
    product_name_snapshot VARCHAR(255),
    product_image_snapshot TEXT
);

-- FAVORİLER
CREATE TABLE wishlist_items (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id)
);

-- =============================================
-- 4. ETKİLEŞİM
-- =============================================

-- ÜRÜN YORUMLARI
CREATE TABLE product_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_product_review UNIQUE (user_id, product_id)
);

-- DESTEK TALEPLERİ
CREATE TABLE support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Formda manuel giriş yapıldığı için zorunlu foreign key kaldırıldı
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    -- Kullanıcının formda beyan ettiği sipariş no (Örn: #FAV-2024...)
    declared_order_no VARCHAR(50),
    
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÜRÜN SORULARI
CREATE TABLE product_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'answered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- 5. OTOMASYON (TRIGGER & FUNCTIONS)
-- =============================================

-- [1] ZAMAN DAMGASI GÜNCELLEME
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_products_timestamp BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_carts_timestamp BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_tickets_timestamp BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_orders_timestamp BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- [2] ÜRÜN PUANI HESAPLAMA
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET 
        rating = (SELECT COALESCE(AVG(rating), 0) FROM product_reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_approved = TRUE),
        review_count = (SELECT COUNT(*) FROM product_reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_approved = TRUE)
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating
AFTER INSERT OR UPDATE OR DELETE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- [3] KUPON KULLANIM SAYACI ARTIRMA
CREATE OR REPLACE FUNCTION update_coupon_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE coupons SET used_count = used_count + 1 WHERE id = NEW.coupon_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_coupon_usage
AFTER INSERT ON coupon_usages
FOR EACH ROW
EXECUTE FUNCTION update_coupon_usage_count();

-- [4] SİPARİŞ NUMARASI OTOMATİK OLUŞTURMA
CREATE SEQUENCE order_number_seq START 10001;

CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := '#FAV-' || nextval('order_number_seq');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_number();

-- =============================================
-- 6. PERFORMANS İNDEKSLERİ
-- =============================================

-- Katalog & Arama
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_active ON products(is_active);

-- [GÜNCELLENDİ] Full Text Search (TÜRKÇE)
CREATE INDEX idx_products_search ON products 
USING gin((
    setweight(to_tsvector('turkish', coalesce(name, '')), 'A') || 
    setweight(to_tsvector('turkish', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('turkish', coalesce(tagline, '')), 'C')
));

-- Sipariş & Geçmiş
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_order_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Kuponlar
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupon_usages_user ON coupon_usages(user_id);

-- Sepet & Yorumlar
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_reviews_approved ON product_reviews(is_approved);