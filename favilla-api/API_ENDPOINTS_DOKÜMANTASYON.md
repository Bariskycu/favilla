# Favilla API - Endpoint Dokümantasyonu

Bu dokümantasyon, Favilla API'nin tüm endpoint'lerini ve CRUD işlemlerini açıklamaktadır. Frontend geliştirmesi için referans olarak kullanılabilir.

## Genel Bilgiler

- **Base URL**: `/api/v1` (veya eski versiyon için `/api`)
- **Authentication**: JWT Bearer Token (çoğu endpoint için gerekli)
- **Content-Type**: `application/json` (dosya yükleme hariç)
- **Rate Limiting**: Tüm endpoint'lerde aktif

---

## 1. AUTHENTICATION (Kimlik Doğrulama)

### 1.1. Kullanıcı Kaydı
- **Endpoint**: `POST /api/v1/auth/register`
- **Authentication**: Gerekli değil (Public)
- **Request Body**:
  ```json
  {
    "name": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "password": "SecurePass123!",
    "phone": "+90 555 123 4567"
  }
  ```
- **Response** (201):
  ```json
  {
    "user": { ... },
    "token": "jwt_access_token"
  }
  ```
- **Hata Kodları**: 400 (Validation), 409 (Email zaten kullanılıyor)

### 1.2. Kullanıcı Girişi
- **Endpoint**: `POST /api/v1/auth/login`
- **Authentication**: Gerekli değil (Public)
- **Request Body**:
  ```json
  {
    "email": "ahmet@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Response** (200):
  ```json
  {
    "user": { ... },
    "token": "jwt_access_token"
  }
  ```
- **Hata Kodları**: 401 (Email/şifre hatalı)

### 1.3. Kullanıcı Bilgilerini Getir
- **Endpoint**: `GET /api/v1/auth/me`
- **Authentication**: Gerekli (Bearer Token)
- **Response** (200):
  ```json
  {
    "message": "Bu veriyi görüyorsanız giriş yapmışsınız demektir!",
    "user": { ... }
  }
  ```

### 1.4. Şifre Sıfırlama İsteği
- **Endpoint**: `POST /api/v1/auth/forgot-password`
- **Authentication**: Gerekli değil (Public)
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response** (200): Her durumda aynı mesaj (güvenlik için)

### 1.5. Şifre Sıfırlama
- **Endpoint**: `POST /api/v1/auth/reset-password`
- **Authentication**: Gerekli değil (Public)
- **Request Body**:
  ```json
  {
    "token": "reset_token_from_email",
    "password": "NewSecurePass123!",
    "confirmPassword": "NewSecurePass123!"
  }
  ```
- **Response** (200): Başarı mesajı

### 1.6. E-posta Doğrulama
- **Endpoint**: `POST /api/v1/auth/verify-email`
- **Authentication**: Gerekli değil (Public)
- **Request Body**:
  ```json
  {
    "token": "verification_token_from_email"
  }
  ```
- **Response** (200): Doğrulama başarılı mesajı

### 1.7. Doğrulama E-postasını Yeniden Gönder
- **Endpoint**: `POST /api/v1/auth/resend-verification`
- **Authentication**: Gerekli değil (Public)
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response** (200): E-posta gönderildi mesajı

### 1.8. Access Token Yenileme
- **Endpoint**: `POST /api/v1/auth/refresh`
- **Authentication**: Gerekli değil (Public - Refresh Token ile)
- **Request Body**:
  ```json
  {
    "refreshToken": "refresh_token_string"
  }
  ```
- **Response** (200):
  ```json
  {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
  ```

### 1.9. Çıkış Yap (Tek Cihaz)
- **Endpoint**: `POST /api/v1/auth/logout`
- **Authentication**: Gerekli değil (Refresh Token ile)
- **Request Body**:
  ```json
  {
    "refreshToken": "refresh_token_to_invalidate"
  }
  ```
- **Response** (200): Çıkış başarılı

### 1.10. Tüm Cihazlardan Çıkış Yap
- **Endpoint**: `POST /api/v1/auth/logout-all`
- **Authentication**: Gerekli değil (Refresh Token ile)
- **Request Body**:
  ```json
  {
    "refreshToken": "refresh_token_string"
  }
  ```
- **Response** (200): Tüm cihazlardan çıkış başarılı

---

## 2. USER (Kullanıcı İşlemleri)

Tüm endpoint'ler authentication gerektirir.

### 2.1. Profil Bilgilerini Getir
- **Endpoint**: `GET /api/v1/users/profile`
- **Authentication**: Gerekli (Bearer Token)
- **Response** (200):
  ```json
  {
    "data": {
      "id": "uuid",
      "name": "Ahmet Yılmaz",
      "email": "ahmet@example.com",
      "phone": "+90 555 123 4567",
      "addresses": [ ... ]
    }
  }
  ```

### 2.2. Profil Güncelle
- **Endpoint**: `PUT /api/v1/users/profile`
- **Authentication**: Gerekli (Bearer Token)
- **Request Body** (Tüm alanlar opsiyonel):
  ```json
  {
    "name": "Yeni İsim",
    "phone": "+90 555 999 8888",
    "currentPassword": "MevcutŞifre123!",
    "newPassword": "YeniŞifre123!",
    "confirmPassword": "YeniŞifre123!"
  }
  ```
- **Response** (200): Güncellenmiş kullanıcı bilgileri
- **Not**: Şifre güncelleme için mevcut şifre, yeni şifre ve tekrar zorunludur.

### 2.3. Adresleri Listele
- **Endpoint**: `GET /api/v1/users/addresses`
- **Authentication**: Gerekli (Bearer Token)
- **Response** (200):
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "title": "Ev",
        "line1": "Atatürk Cad. No:123",
        "city": "İstanbul",
        "zip": "34000",
        "country": "Türkiye"
      }
    ]
  }
  ```

### 2.4. Yeni Adres Ekle
- **Endpoint**: `POST /api/v1/users/addresses`
- **Authentication**: Gerekli (Bearer Token)
- **Request Body**:
  ```json
  {
    "title": "Ev",
    "line1": "Atatürk Cad. No:123",
    "city": "İstanbul",
    "zip": "34000",
    "country": "Türkiye"
  }
  ```
- **Response** (201): Oluşturulan adres bilgisi

### 2.5. Adres Güncelle
- **Endpoint**: `PUT /api/v1/users/addresses/:id`
- **Authentication**: Gerekli (Bearer Token)
- **Path Parameters**: `id` (UUID - adres ID'si)
- **Request Body**:
  ```json
  {
    "title": "İş",
    "line1": "Yeni Adres Satırı",
    "city": "Ankara",
    "zip": "06000",
    "country": "Türkiye"
  }
  ```
- **Response** (200): Güncellenmiş adres bilgisi
- **Hata Kodları**: 404 (Adres bulunamadı veya size ait değil)

### 2.6. Adres Sil
- **Endpoint**: `DELETE /api/v1/users/addresses/:id`
- **Authentication**: Gerekli (Bearer Token)
- **Path Parameters**: `id` (UUID - adres ID'si)
- **Response** (200): Silme başarılı mesajı
- **Hata Kodları**: 404 (Adres bulunamadı veya size ait değil)

---

## 3. PRODUCT (Ürün İşlemleri)

### 3.1. Ürünleri Listele (Public)
- **Endpoint**: `GET /api/v1/products`
- **Authentication**: Gerekli değil (Public)
- **Query Parameters**:
  - `page` (number, default: 1): Sayfa numarası
  - `limit` (number, default: 20, max: 100): Sayfa başına kayıt sayısı
  - `search` (string): Arama terimi
  - `type` (enum: "jar" | "sculptural" | "set"): Ürün tipi
  - `color` (enum: "natural" | "charcoal" | "terracotta"): Renk filtresi
  - `material` (enum: "soy-wax" | "beeswax" | "coconut-blend"): Malzeme filtresi
  - `minPrice` (number): Minimum fiyat
  - `maxPrice` (number): Maksimum fiyat
  - `sort` (enum: "price-asc" | "price-desc" | "newest" | "rating"): Sıralama
- **Örnek**: `GET /api/v1/products?type=jar&color=natural&page=1&limit=20`
- **Response** (200):
  ```json
  {
    "data": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
  ```

### 3.2. Ürün Detayı (Public)
- **Endpoint**: `GET /api/v1/products/:slug`
- **Authentication**: Gerekli değil (Public)
- **Path Parameters**: `slug` (string - ürün slug'ı, örn: "favilla-ember")
- **Response** (200):
  ```json
  {
    "data": {
      "id": "uuid",
      "name": "Ürün Adı",
      "slug": "urun-adi",
      "price": 299.99,
      "stock": 50,
      "description": "...",
      "images": [ ... ],
      ...
    }
  }
  ```
- **Hata Kodları**: 404 (Ürün bulunamadı)

### 3.3. Yeni Ürün Ekle (Admin)
- **Endpoint**: `POST /api/v1/products`
- **Authentication**: Gerekli (Bearer Token + Admin yetkisi)
- **Request Body**:
  ```json
  {
    "name": "Yeni Ürün",
    "slug": "yeni-urun", // Opsiyonel, otomatik oluşturulur
    "description": "Ürün açıklaması",
    "price": 299.99,
    "stock": 50,
    "type": "jar",
    "color": "natural",
    "material": "soy-wax",
    "images": [ "url1", "url2" ],
    ...
  }
  ```
- **Response** (201): Oluşturulan ürün bilgisi

### 3.4. Ürün Güncelle (Admin)
- **Endpoint**: `PUT /api/v1/products/:id`
- **Authentication**: Gerekli (Bearer Token + Admin yetkisi)
- **Path Parameters**: `id` (UUID - ürün ID'si)
- **Request Body**: Güncellenecek alanlar (tüm alanlar opsiyonel)
- **Response** (200): Güncellenmiş ürün bilgisi
- **Hata Kodları**: 404 (Ürün bulunamadı)

### 3.5. Ürün Sil (Admin - Soft Delete)
- **Endpoint**: `DELETE /api/v1/products/:id`
- **Authentication**: Gerekli (Bearer Token + Admin yetkisi)
- **Path Parameters**: `id` (UUID - ürün ID'si)
- **Response** (200): Silme başarılı mesajı (ürün arşivlenir)
- **Hata Kodları**: 404 (Ürün bulunamadı)

---

## 4. CART (Sepet İşlemleri)

Tüm endpoint'ler authentication gerektirir.

### 4.1. Sepeti Getir
- **Endpoint**: `GET /api/v1/cart`
- **Authentication**: Gerekli (Bearer Token)
- **Response** (200):
  ```json
  {
    "data": {
      "items": [
        {
          "productId": "uuid",
          "product": { ... },
          "quantity": 2,
          "subtotal": 599.98
        }
      ],
      "total": 599.98,
      "itemCount": 2
    }
  }
  ```

### 4.2. Sepete Ürün Ekle
- **Endpoint**: `POST /api/v1/cart/add`
- **Authentication**: Gerekli (Bearer Token)
- **Request Body**:
  ```json
  {
    "productId": "uuid",
    "quantity": 2
  }
  ```
- **Response** (200): Başarı mesajı
- **Hata Kodları**: 400 (Stok yetersiz veya geçersiz miktar)

### 4.3. Sepetten Ürün Çıkar
- **Endpoint**: `DELETE /api/v1/cart/:productId`
- **Authentication**: Gerekli (Bearer Token)
- **Path Parameters**: `productId` (UUID)
- **Response** (200): Silme başarılı mesajı

### 4.4. Sepet Ürün Miktarını Güncelle
- **Endpoint**: `PUT /api/v1/cart/:productId`
- **Authentication**: Gerekli (Bearer Token)
- **Path Parameters**: `productId` (UUID)
- **Request Body**:
  ```json
  {
    "quantity": 3
  }
  ```
- **Response** (200): Güncelleme başarılı mesajı
- **Hata Kodları**: 400 (Stok yetersiz veya geçersiz miktar)

### 4.5. Kupon Kodu Kontrol Et
- **Endpoint**: `POST /api/v1/cart/coupon`
- **Authentication**: Gerekli (Bearer Token)
- **Request Body**:
  ```json
  {
    "code": "INDIRIM10"
  }
  ```
- **Response** (200):
  ```json
  {
    "data": {
      "code": "INDIRIM10",
      "discount": 10,
      "discountType": "percentage",
      "valid": true
    }
  }
  ```
- **Hata Kodları**: 400 (Geçersiz veya süresi dolmuş kupon)

### 4.6. Sipariş Oluştur (Checkout)
- **Endpoint**: `POST /api/v1/cart/checkout`
- **Authentication**: Gerekli (Bearer Token)
- **Request Body** (Yeni Format - Önerilen):
  ```json
  {
    "addressId": "uuid",
    "couponCode": "INDIRIM10", // Opsiyonel
    "cardInfo": {
      "number": "4111111111111111",
      "expiryMonth": 12,
      "expiryYear": 2025,
      "cvv": "123",
      "cardholderName": "Ahmet Yılmaz"
    }
  }
  ```
- **Request Body** (Eski Format - Destekleniyor):
  ```json
  {
    "addressId": "uuid",
    "couponCode": "INDIRIM10", // Opsiyonel
    "cardInfo": {
      "number": "4111111111111111",
      "expiry": "12/25",
      "cvv": "123",
      "name": "Ahmet Yılmaz"
    }
  }
  ```
- **Kart Bilgileri Formatı**:
  - `number`: Kart numarası (13-19 rakam, sadece rakam) - **Zorunlu**
  - `expiryMonth`: Son kullanma ayı (1-12 arası sayı) - **Zorunlu** (veya `expiry` kullanın)
  - `expiryYear`: Son kullanma yılı (geçerli yıl ve gelecek 20 yıl arası) - **Zorunlu** (veya `expiry` kullanın)
  - `expiry`: Son kullanma tarihi string formatı (MM/YY veya MM/YYYY, örn: "12/25" veya "12/2025") - **Opsiyonel** (expiryMonth/expiryYear yerine)
  - `cvv`: CVV kodu (3-4 rakam) - **Zorunlu**
  - `cardholderName`: Kart sahibi adı (sadece harf ve boşluk) - **Zorunlu** (veya `name` kullanın)
  - `name`: Kart sahibi adı (sadece harf ve boşluk) - **Opsiyonel** (`cardholderName` yerine)
- **Test Kart Bilgileri** (Geliştirme/Test Amaçlı):
  ```json
  {
    "number": "4111111111111111",  // Visa test kartı
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cvv": "123",
    "cardholderName": "Test Kullanıcı"
  }
  ```
  veya
  ```json
  {
    "number": "5555555555554444",  // Mastercard test kartı
    "expiry": "11/26",
    "cvv": "456",
    "name": "Ahmet Yılmaz"
  }
  ```
- **Response** (201):
  ```json
  {
    "data": {
      "id": "uuid",
      "orderNo": "ORD-2024-001",
      "status": "pending",
      "total": 539.98,
      "items": [ ... ],
      ...
    }
  }
  ```
- **Hata Kodları**: 400 (Adres seçilmedi, kart bilgileri eksik, stok yetersiz)

---

## 5. ORDER (Sipariş İşlemleri)

Tüm endpoint'ler authentication gerektirir.

### 5.1. Siparişleri Listele
- **Endpoint**: `GET /api/v1/orders`
- **Authentication**: Gerekli (Bearer Token)
- **Query Parameters**:
  - `page` (number, default: 1): Sayfa numarası
  - `limit` (number, default: 20, max: 100): Sayfa başına kayıt sayısı
- **Response** (200):
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "orderNo": "ORD-2024-001",
        "status": "pending",
        "total": 599.98,
        "createdAt": "2024-01-01T00:00:00Z",
        ...
      }
    ],
    "pagination": { ... }
  }
  ```

### 5.2. Sipariş Detayı
- **Endpoint**: `GET /api/v1/orders/:id`
- **Authentication**: Gerekli (Bearer Token)
- **Path Parameters**: `id` (UUID - sipariş ID'si)
- **Response** (200):
  ```json
  {
    "data": {
      "id": "uuid",
      "orderNo": "ORD-2024-001",
      "status": "pending",
      "items": [ ... ],
      "address": { ... },
      "total": 599.98,
      "subtotal": 599.98,
      "discount": 0,
      "createdAt": "2024-01-01T00:00:00Z",
      ...
    }
  }
  ```
- **Hata Kodları**: 404 (Sipariş bulunamadı veya size ait değil)

### 5.3. Ödeme Başlat (Iyzico Checkout Form)
- **Endpoint**: `POST /api/v1/payment/initialize`
- **Authentication**: Gerekli (Bearer Token)
- **Açıklama**: Sepetten "Ödeme Bekliyor" statüsünde sipariş oluşturulur; Iyzico Checkout Form yanıtı döner. `conversationId` = Order ID olarak kullanılır. Ödeme tamamlandığında callback ile sipariş "Ödendi / Hazırlanıyor" olarak güncellenir.
- **Request Body**:
  - `addressId` (UUID, zorunlu): Teslimat adresi
  - `couponCode` (string, opsiyonel): Kupon kodu
  - `basketItems` (array, zorunlu): Iyzico basketItems formatında kalemler
  - `buyer` (object, zorunlu): Iyzico buyer alanları (id, name, surname, email, identityNumber, city, country, …)
  - `shippingAddress` (object, zorunlu): Iyzico adres formatı
  - `billingAddress` (object, zorunlu): Iyzico adres formatı
- **Response** (200): Iyzico `checkoutFormInitialize` yanıtı (örn. `checkoutFormContent`, `token`, `paymentPageUrl`).
- **Hata Kodları**: 400 (Eksik alanlar), 401 (Giriş gerekli), 500 (Iyzico/backend hatası)

> **Not**: Callback `POST/GET /api/v1/payment/callback?orderId=...` Iyzico tarafından çağrılır; frontend doğrudan bu endpoint'e istek atmaz. Ödeme sonrası kullanıcı `FRONTEND_URL/payment/result?status=success` veya `?status=failure` adresine yönlendirilir.

---

## 6. WISHLIST (Favoriler)

Tüm endpoint'ler authentication gerektirir.

### 6.1. Favorileri Listele
- **Endpoint**: `GET /api/v1/wishlist`
- **Authentication**: Gerekli (Bearer Token)
- **Response** (200):
  ```json
  {
    "data": [
      {
        "productId": "uuid",
        "product": { ... },
        "addedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

### 6.2. Favorilere Ekle
- **Endpoint**: `POST /api/v1/wishlist`
- **Authentication**: Gerekli (Bearer Token)
- **Request Body**:
  ```json
  {
    "productId": "uuid"
  }
  ```
- **Response** (201):
  ```json
  {
    "data": {
      "isInWishlist": true
    },
    "message": "Ürün favorilere eklendi."
  }
  ```

### 6.3. Favorilerden Çıkar
- **Endpoint**: `DELETE /api/v1/wishlist/:productId`
- **Authentication**: Gerekli (Bearer Token)
- **Path Parameters**: `productId` (UUID)
- **Response** (200): Silme başarılı mesajı

### 6.4. Favori Durumunu Kontrol Et
- **Endpoint**: `GET /api/v1/wishlist/:productId/check`
- **Authentication**: Gerekli (Bearer Token)
- **Path Parameters**: `productId` (UUID)
- **Response** (200):
  ```json
  {
    "data": {
      "isInWishlist": true
    }
  }
  ```

---

## 7. REVIEW (Yorum/Değerlendirme)

### 7.1. Ürün Yorumlarını Getir (Public)
- **Endpoint**: `GET /api/v1/reviews/:productId`
- **Authentication**: Gerekli değil (Public)
- **Path Parameters**: `productId` (UUID)
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10, max: 50)
- **Response** (200):
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "userId": "uuid",
        "userName": "Ahmet Yılmaz",
        "rating": 5,
        "comment": "Harika ürün!",
        "createdAt": "2024-01-01T00:00:00Z",
        "verifiedPurchase": true
      }
    ],
    "pagination": { ... }
  }
  ```

### 7.2. Yorum Yap
- **Endpoint**: `POST /api/v1/reviews/:productId`
- **Authentication**: Gerekli (Bearer Token)
- **Path Parameters**: `productId` (UUID)
- **Request Body**:
  ```json
  {
    "rating": 5,
    "comment": "Harika ürün, çok memnun kaldım!"
  }
  ```
- **Response** (201): Oluşturulan yorum bilgisi
- **Hata Kodları**: 
  - 400 (Puan 1-5 arası olmalı, zaten yorum yapılmış)
  - 403 (Ürün satın alınmamış - verified purchase gerekli)

### 7.3. Yorum Yapabilir miyim? (Eligibility Check)
- **Endpoint**: `GET /api/v1/reviews/:productId/check`
- **Authentication**: Gerekli (Bearer Token)
- **Path Parameters**: `productId` (UUID)
- **Response** (200):
  ```json
  {
    "data": {
      "isEligible": true
    }
  }
  ```
- **Not**: Frontend'de "Yorum Yap" butonunu göstermek/gizlemek için kullanılır.

---

## 8. QUESTION (Soru-Cevap)

### 8.1. Ürün Sorularını Getir (Public)
- **Endpoint**: `GET /api/v1/questions/:productId`
- **Authentication**: Gerekli değil (Public)
- **Path Parameters**: `productId` (UUID)
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10, max: 50)
- **Response** (200):
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "question": "Bu ürün ne kadar süre yanar?",
        "answer": "Yaklaşık 40-50 saat yanar.",
        "answeredAt": "2024-01-01T00:00:00Z",
        ...
      }
    ],
    "pagination": { ... }
  }
  ```
- **Not**: Sadece yanıtlanmış sorular gösterilir.

### 8.2. Soru Sor
- **Endpoint**: `POST /api/v1/questions/:productId`
- **Authentication**: Gerekli (Bearer Token)
- **Path Parameters**: `productId` (UUID)
- **Request Body**:
  ```json
  {
    "question": "Bu ürün ne kadar süre yanar?"
  }
  ```
- **Response** (201): Oluşturulan soru bilgisi
- **Hata Kodları**: 400 (Soru en az 5 karakter olmalı)

### 8.3. Kullanıcının Sorularını Getir
- **Endpoint**: `GET /api/v1/questions/my/all`
- **Authentication**: Gerekli (Bearer Token)
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 20, max: 100)
- **Response** (200):
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "productId": "uuid",
        "product": { ... },
        "question": "...",
        "answer": "...",
        "status": "answered",
        ...
      }
    ],
    "pagination": { ... }
  }
  ```
- **Not**: Kullanıcının tüm sorularını (yanıtlanmış ve yanıtlanmamış) gösterir.

---

## 9. SUPPORT (Destek)

Tüm endpoint'ler authentication gerektirir.

### 9.1. Destek Talebi Oluştur
- **Endpoint**: `POST /api/v1/support`
- **Authentication**: Gerekli (Bearer Token)
- **Request Body**:
  ```json
  {
    "subject": "Siparişim gelmedi",
    "message": "Siparişim 3 gün önce verildi ama henüz gelmedi.",
    "orderNo": "ORD-2024-001" // Opsiyonel
  }
  ```
- **Response** (201): Oluşturulan ticket bilgisi

### 9.2. Destek Taleplerini Listele
- **Endpoint**: `GET /api/v1/support`
- **Authentication**: Gerekli (Bearer Token)
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 20, max: 100)
- **Response** (200):
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "subject": "Siparişim gelmedi",
        "message": "...",
        "status": "open",
        "createdAt": "2024-01-01T00:00:00Z",
        ...
      }
    ],
    "pagination": { ... }
  }
  ```

---

## 10. UPLOAD (Dosya Yükleme)

Tüm endpoint'ler authentication gerektirir.

### 10.1. Tek Resim Yükle
- **Endpoint**: `POST /api/v1/upload/image`
- **Authentication**: Gerekli (Bearer Token)
- **Content-Type**: `multipart/form-data`
- **Request Body**: Form data ile `image` field'ı (dosya)
  - **Max Size**: 5MB
  - **Allowed Types**: image/jpeg, image/png, image/webp
- **Response** (201):
  ```json
  {
    "data": {
      "filename": "generated-filename.jpg",
      "originalName": "original-name.jpg",
      "url": "/uploads/images/generated-filename.jpg",
      "size": 123456,
      "mimetype": "image/jpeg"
    }
  }
  ```

### 10.2. Çoklu Resim Yükle
- **Endpoint**: `POST /api/v1/upload/images`
- **Authentication**: Gerekli (Bearer Token)
- **Content-Type**: `multipart/form-data`
- **Request Body**: Form data ile `images` field'ı (array of files)
  - **Max Files**: 5
  - **Max Size per File**: 5MB
  - **Allowed Types**: image/jpeg, image/png, image/webp
- **Response** (201):
  ```json
  {
    "data": {
      "files": [
        {
          "filename": "...",
          "originalName": "...",
          "url": "...",
          "size": 123456,
          "mimetype": "image/jpeg"
        }
      ]
    }
  }
  ```

### 10.3. Yüklenen Dosyayı Sil
- **Endpoint**: `DELETE /api/v1/upload/:filename`
- **Authentication**: Gerekli (Bearer Token)
- **Path Parameters**: `filename` (string - dosya adı)
- **Response** (200): Silme başarılı mesajı
- **Hata Kodları**: 404 (Dosya bulunamadı)

---

## 11. AUDIT LOGS (Denetim Kayıtları)

Tüm endpoint'ler authentication ve admin yetkisi gerektirir.

### 11.1. Audit Log'ları Listele
- **Endpoint**: `GET /api/v1/audit-logs`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Query Parameters**:
  - `admin_id` (UUID): Admin ID filtresi
  - `action` (string): İşlem tipi (create, update, delete, vb.)
  - `resource_type` (string): Kaynak tipi (product, user, vb.)
  - `resource_id` (UUID): Kaynak ID filtresi
  - `status` (enum: "success" | "failed" | "error"): Durum filtresi
  - `start_date` (ISO date string): Başlangıç tarihi
  - `end_date` (ISO date string): Bitiş tarihi
  - `page` (number): Sayfa numarası
  - `limit` (number): Sayfa başına kayıt sayısı
- **Response** (200):
  ```json
  {
    "data": [ ... ],
    "pagination": { ... }
  }
  ```

### 11.2. Audit Log Detayı
- **Endpoint**: `GET /api/v1/audit-logs/:id`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Path Parameters**: `id` (UUID - log ID'si)
- **Response** (200): Log detay bilgisi
- **Hata Kodları**: 404 (Log bulunamadı)

---

## 12. HEALTH CHECK (Sistem Durumu)

### 12.1. API Durum Kontrolü
- **Endpoint**: `GET /`
- **Authentication**: Gerekli değil (Public)
- **Response** (200):
  ```json
  {
    "message": "API Çalışıyor"
  }
  ```

### 12.2. Sistem Sağlık Kontrolü
- **Endpoint**: `GET /api/health`
- **Authentication**: Gerekli değil (Public)
- **Response** (200 veya 503):
  ```json
  {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00Z",
    "uptime": 3600,
    "environment": "production",
    "version": "1.0.0",
    "checks": {
      "database": "ok",
      "pool": "ok"
    },
    "poolMetrics": { ... }
  }
  ```

---

## Genel Response Formatları

### Başarılı Response (200/201)
```json
{
  "success": true,
  "data": { ... },
  "message": "İşlem başarılı" // Opsiyonel
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Hata Response (400/401/403/404/500)
```json
{
  "success": false,
  "error": "Hata mesajı",
  "statusCode": 400
}
```

---

## Authentication Header Formatı

Tüm korumalı endpoint'lerde aşağıdaki header'ı ekleyin:

```
Authorization: Bearer <jwt_access_token>
```

Örnek:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Önemli Notlar

1. **Rate Limiting**: Tüm endpoint'lerde rate limiting aktif. Aşırı istek durumunda 429 (Too Many Requests) hatası döner.

2. **Validation**: Tüm request body'ler ve query parametreleri validasyon'dan geçer. Hatalı veri gönderilirse 400 (Bad Request) hatası döner.

3. **Pagination**: Listeleme endpoint'lerinde `page` ve `limit` parametreleri kullanılır. Varsayılan değerler ve maksimum limitler endpoint bazında farklılık gösterebilir.

4. **Soft Delete**: Ürün silme işlemi soft delete'dir. Ürün veritabanından silinmez, sadece arşivlenir.

5. **Cache**: Ürün listeleme ve detay endpoint'lerinde cache mekanizması aktif. Yeni ürün ekleme/güncelleme/silme işlemlerinde cache otomatik temizlenir.

6. **File Upload**: Dosya yükleme işlemleri için `multipart/form-data` formatı kullanılır. Max dosya boyutu ve tip kısıtlamaları vardır.

7. **Error Handling**: Tüm hatalar standart format'ta döner. Frontend'de global error handler ile yakalanabilir.

---

## Swagger Dokümantasyonu

Detaylı API dokümantasyonu için Swagger UI kullanılabilir:
- **URL**: `/api-docs`
- **JSON**: `/api-docs.json`
