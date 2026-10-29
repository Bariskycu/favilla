-- Iyzico Checkout Form akışı için "Ödeme Bekliyor" durumu
-- initializePayment aşamasında sipariş bu statüde oluşturulur,
-- paymentCallback başarılı olunca 'processing' ve is_paid=true yapılır.

-- Mevcut CHECK constraint'i kaldır (isim PostgreSQL'de genelde tablo_kolon_check)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- pending_payment dahil yeni constraint
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending_payment', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'));
