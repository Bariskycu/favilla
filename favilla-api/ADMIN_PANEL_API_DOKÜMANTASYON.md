# Favilla Admin Panel API - Endpoint Dokümantasyonu

Bu dokümantasyon, Favilla Admin Panel'inin backend entegrasyonu için gerekli tüm API endpoint'lerini, veritabanı şemalarını ve entegrasyon detaylarını içermektedir.

## Genel Bilgiler

- **Base URL**: `/api/v1`
- **Authentication**: JWT Bearer Token (Tüm admin endpoint'leri için zorunlu)
- **Authorization**: Admin rolü gereklidir (`role = 'admin'`)
- **Content-Type**: `application/json` (dosya yükleme hariç)
- **Rate Limiting**: Tüm endpoint'lerde aktif

---

## 1. AUTHENTICATION (Kimlik Doğrulama)

### 1.1. Admin Girişi
- **Endpoint**: `POST /api/v1/auth/login`
- **Authentication**: Gerekli değil (Public)
- **Request Body**:
  ```json
  {
    "email": "admin@favilla.com",
    "password": "AdminPassword123!"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "uuid",
        "name": "Admin Kullanıcı",
        "email": "admin@favilla.com",
        "phone": "+90 555 123 4567",
        "role": "admin",
        "email_verified": true
      }
    }
  }
  ```
- **Not**: Frontend'de `role === 'admin'` kontrolü yapılmalı. Admin değilse admin paneline erişim engellenmelidir.
- **Hata Kodları**: 401 (Email/şifre hatalı)

### 1.2. Admin Bilgilerini Getir
- **Endpoint**: `GET /api/v1/auth/me`
- **Authentication**: Gerekli (Bearer Token)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "message": "Bu veriyi görüyorsanız giriş yapmışsınız demektir!",
      "user": {
        "id": "uuid",
        "name": "Admin Kullanıcı",
        "email": "admin@favilla.com",
        "phone": "+90 555 123 4567",
        "role": "admin"
      }
    }
  }
  ```
- **Not**: Sayfa yenilendiğinde oturum kontrolü için kullanılır. `role` kontrolü yapılmalı.

### 1.3. Admin Çıkışı
- **Endpoint**: `POST /api/v1/auth/logout`
- **Authentication**: Gerekli değil (Refresh Token ile)
- **Request Body**:
  ```json
  {
    "refreshToken": "refresh_token_string"
  }
  ```
- **Response** (200): Çıkış başarılı mesajı

---

## 2. DASHBOARD (Genel Bakış)

### 2.1. Dashboard İstatistikleri (KPI'lar)
- **Endpoint**: `GET /api/v1/admin/dashboard/stats`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "totalSales": {
        "value": 125000.50,
        "change": 12.5,
        "trend": "up"
      },
      "activeOrders": {
        "value": 45,
        "change": -5.2,
        "trend": "down"
      },
      "totalCustomers": {
        "value": 1234,
        "change": 8.3,
        "trend": "up"
      },
      "stockStatus": {
        "value": 23,
        "change": -2,
        "trend": "down",
        "lowStockCount": 5,
        "outOfStockCount": 2
      },
      "salesTarget": {
        "current": 125000.50,
        "target": 150000.00,
        "percentage": 83.33
      }
    }
  }
  ```
- **Not**: `change` değeri önceki döneme göre yüzde değişimi, `trend` "up" veya "down" olabilir.

### 2.2. Satış Grafiği Verileri
- **Endpoint**: `GET /api/v1/admin/dashboard/sales-chart`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Query Parameters**:
  - `period` (enum: "week" | "month" | "year", default: "month"): Zaman aralığı
  - `startDate` (ISO date string, opsiyonel): Başlangıç tarihi
  - `endDate` (ISO date string, opsiyonel): Bitiş tarihi
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "period": "month",
      "data": [
        {
          "date": "2024-01-01",
          "sales": 4500.00,
          "orders": 12
        },
        {
          "date": "2024-01-02",
          "sales": 5200.00,
          "orders": 15
        }
      ]
    }
  }
  ```

### 2.3. Son Siparişler (Dashboard Özet)
- **Endpoint**: `GET /api/v1/admin/dashboard/recent-orders`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Query Parameters**:
  - `limit` (number, default: 10, max: 50): Gösterilecek sipariş sayısı
- **Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "orderNumber": "#FAV-10045",
        "customerName": "Ahmet Yılmaz",
        "total": 599.98,
        "status": "processing",
        "createdAt": "2024-01-24T10:30:00Z"
      }
    ]
  }
  ```

---

## 3. PRODUCT MANAGEMENT (Ürün Yönetimi)

### 3.1. Tüm Ürünleri Listele (Admin)
- **Endpoint**: `GET /api/v1/admin/products`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Query Parameters**:
  - `page` (number, default: 1): Sayfa numarası
  - `limit` (number, default: 20, max: 100): Sayfa başına kayıt sayısı
  - `search` (string): Arama terimi (ürün adı, açıklama)
  - `type` (enum: "jar" | "sculptural" | "set"): Ürün tipi filtresi
  - `status` (enum: "active" | "draft" | "archived"): Durum filtresi
    - `active`: `is_active = true`
    - `draft`: `is_active = false` ve `created_at` yakın zamanda
    - `archived`: `is_active = false` ve eski kayıtlar
  - `stockStatus` (enum: "in-stock" | "low-stock" | "out-of-stock"): Stok durumu filtresi
    - `in-stock`: `stock_quantity > 10`
    - `low-stock`: `stock_quantity <= 10 AND stock_quantity > 0`
    - `out-of-stock`: `stock_quantity = 0`
- **Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "name": "Favilla Ember",
        "slug": "favilla-ember",
        "price": 299.99,
        "discountPrice": 249.99,
        "stockQuantity": 50,
        "type": "jar",
        "color": "natural",
        "material": "soy-wax",
        "image": "/uploads/products/ember.jpg",
        "isActive": true,
        "status": "active",
        "stockStatus": "in-stock",
        "rating": 4.5,
        "reviewCount": 23,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T00:00:00Z"
      }
    ],
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

### 3.2. Ürün Detayı (Admin)
- **Endpoint**: `GET /api/v1/admin/products/:id`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Path Parameters**: `id` (UUID - ürün ID'si)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Favilla Ember",
      "slug": "favilla-ember",
      "tagline": "Doğal mum deneyimi",
      "description": "Detaylı ürün açıklaması...",
      "price": 299.99,
      "discountPrice": 249.99,
      "stockQuantity": 50,
      "type": "jar",
      "color": "natural",
      "material": "soy-wax",
      "image": "/uploads/products/ember.jpg",
      "hoverImage": "/uploads/products/ember-hover.jpg",
      "burnTime": "40-50 saat",
      "scentProfile": "Vanilya, Tarçın",
      "rating": 4.5,
      "reviewCount": 23,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  }
  ```
- **Hata Kodları**: 404 (Ürün bulunamadı)

### 3.3. Yeni Ürün Ekle
- **Endpoint**: `POST /api/v1/admin/products`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Request Body**:
  ```json
  {
    "name": "Yeni Ürün",
    "slug": "yeni-urun",
    "tagline": "Ürün sloganı",
    "description": "Ürün açıklaması",
    "price": 299.99,
    "discountPrice": 249.99,
    "stockQuantity": 50,
    "type": "jar",
    "color": "natural",
    "material": "soy-wax",
    "image": "/uploads/products/yeni-urun.jpg",
    "hoverImage": "/uploads/products/yeni-urun-hover.jpg",
    "burnTime": "40-50 saat",
    "scentProfile": "Vanilya, Tarçın",
    "isActive": true
  }
  ```
- **Not**: `slug` opsiyoneldir. Gönderilmezse `name`'den otomatik oluşturulur (Türkçe karakterler temizlenir, boşluklar tire ile değiştirilir).
- **Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Yeni Ürün",
      "slug": "yeni-urun",
      ...
    },
    "message": "Ürün başarıyla oluşturuldu"
  }
  ```
- **Hata Kodları**: 400 (Validation hatası), 409 (Slug zaten kullanılıyor)

### 3.4. Ürün Güncelle
- **Endpoint**: `PUT /api/v1/admin/products/:id`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Path Parameters**: `id` (UUID - ürün ID'si)
- **Request Body**: Güncellenecek alanlar (tüm alanlar opsiyonel):
  ```json
  {
    "name": "Güncellenmiş Ürün Adı",
    "price": 349.99,
    "stockQuantity": 75,
    "isActive": false
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Güncellenmiş Ürün Adı",
      ...
    },
    "message": "Ürün başarıyla güncellendi"
  }
  ```
- **Hata Kodları**: 404 (Ürün bulunamadı), 400 (Validation hatası)

### 3.5. Ürün Sil (Soft Delete / Arşivle)
- **Endpoint**: `DELETE /api/v1/admin/products/:id`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Path Parameters**: `id` (UUID - ürün ID'si)
- **Response** (200):
  ```json
  {
    "success": true,
    "message": "Ürün başarıyla arşivlendi"
  }
  ```
- **Not**: Ürün veritabanından silinmez, sadece `is_active = false` yapılır (soft delete).
- **Hata Kodları**: 404 (Ürün bulunamadı)

### 3.6. Ürün Durumunu Değiştir (Aktif/Pasif)
- **Endpoint**: `PATCH /api/v1/admin/products/:id/status`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Path Parameters**: `id` (UUID - ürün ID'si)
- **Request Body**:
  ```json
  {
    "isActive": true
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "isActive": true
    },
    "message": "Ürün durumu güncellendi"
  }
  ```

---

## 4. ORDER MANAGEMENT (Sipariş Yönetimi)

### 4.1. Tüm Siparişleri Listele
- **Endpoint**: `GET /api/v1/admin/orders`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Query Parameters**:
  - `page` (number, default: 1): Sayfa numarası
  - `limit` (number, default: 20, max: 100): Sayfa başına kayıt sayısı
  - `status` (enum: "processing" | "shipped" | "delivered" | "cancelled" | "returned"): Durum filtresi
  - `search` (string): Sipariş numarası veya müşteri adı ile arama
  - `startDate` (ISO date string): Başlangıç tarihi filtresi
  - `endDate` (ISO date string): Bitiş tarihi filtresi
- **Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "orderNumber": "#FAV-10045",
        "customerName": "Ahmet Yılmaz",
        "customerEmail": "ahmet@example.com",
        "total": 599.98,
        "status": "processing",
        "itemCount": 2,
        "createdAt": "2024-01-24T10:30:00Z",
        "updatedAt": "2024-01-24T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
  ```

### 4.2. Sipariş Detayı
- **Endpoint**: `GET /api/v1/admin/orders/:id`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Path Parameters**: `id` (UUID - sipariş ID'si)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "orderNumber": "#FAV-10045",
      "status": "processing",
      "customer": {
        "id": "uuid",
        "name": "Ahmet Yılmaz",
        "email": "ahmet@example.com",
        "phone": "+90 555 123 4567"
      },
      "shippingAddress": {
        "title": "Ev",
        "line1": "Atatürk Cad. No:123",
        "city": "İstanbul",
        "zip": "34000",
        "country": "Türkiye"
      },
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "productName": "Favilla Ember",
          "productImage": "/uploads/products/ember.jpg",
          "quantity": 2,
          "price": 299.99,
          "subtotal": 599.98
        }
      ],
      "subtotal": 599.98,
      "discountAmount": 0.00,
      "total": 599.98,
      "paymentMethod": "Credit Card",
      "isPaid": true,
      "createdAt": "2024-01-24T10:30:00Z",
      "updatedAt": "2024-01-24T10:30:00Z",
      "statusHistory": [
        {
          "oldStatus": null,
          "newStatus": "processing",
          "changedBy": "uuid",
          "changedByName": "Admin Kullanıcı",
          "note": "Sipariş oluşturuldu",
          "createdAt": "2024-01-24T10:30:00Z"
        }
      ]
    }
  }
  ```
- **Hata Kodları**: 404 (Sipariş bulunamadı)

### 4.3. Sipariş Durumunu Güncelle
- **Endpoint**: `PATCH /api/v1/admin/orders/:id/status`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Path Parameters**: `id` (UUID - sipariş ID'si)
- **Request Body**:
  ```json
  {
    "status": "shipped",
    "note": "Kargoya verildi - Kargo takip no: TR123456789"
  }
  ```
- **Geçerli Status Değerleri**:
  - `processing`: Hazırlanıyor
  - `shipped`: Kargolandı
  - `delivered`: Teslim edildi
  - `cancelled`: İptal edildi
  - `returned`: İade edildi
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "status": "shipped",
      "statusHistory": [
        {
          "oldStatus": "processing",
          "newStatus": "shipped",
          "changedBy": "uuid",
          "changedByName": "Admin Kullanıcı",
          "note": "Kargoya verildi - Kargo takip no: TR123456789",
          "createdAt": "2024-01-24T11:00:00Z"
        }
      ]
    },
    "message": "Sipariş durumu güncellendi"
  }
  ```
- **Not**: Durum değişikliği `order_status_history` tablosuna kaydedilir.
- **Hata Kodları**: 404 (Sipariş bulunamadı), 400 (Geçersiz status değeri)

### 4.4. Sipariş Müşteri Bilgilerini Güncelle
- **Endpoint**: `PATCH /api/v1/admin/orders/:id/customer`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Path Parameters**: `id` (UUID - sipariş ID'si)
- **Request Body**:
  ```json
  {
    "shippingAddress": {
      "title": "İş",
      "line1": "Yeni Adres Satırı",
      "city": "Ankara",
      "zip": "06000",
      "country": "Türkiye"
    }
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "shippingAddress": {
        "title": "İş",
        "line1": "Yeni Adres Satırı",
        "city": "Ankara",
        "zip": "06000",
        "country": "Türkiye"
      }
    },
    "message": "Müşteri bilgileri güncellendi"
  }
  ```
- **Not**: Sipariş adresi `shipping_address_snapshot` (JSONB) alanında saklanır ve güncellenir.
- **Hata Kodları**: 404 (Sipariş bulunamadı), 400 (Validation hatası)

### 4.5. Sipariş İptal Et
- **Endpoint**: `POST /api/v1/admin/orders/:id/cancel`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Path Parameters**: `id` (UUID - sipariş ID'si)
- **Request Body**:
  ```json
  {
    "reason": "Müşteri talebi",
    "refund": true
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "status": "cancelled",
      "statusHistory": [
        {
          "oldStatus": "processing",
          "newStatus": "cancelled",
          "note": "Müşteri talebi - İade edildi",
          "createdAt": "2024-01-24T12:00:00Z"
        }
      ]
    },
    "message": "Sipariş iptal edildi"
  }
  ```
- **Not**: İptal edilen siparişlerde stok geri eklenebilir (backend'de otomatik yapılabilir).
- **Hata Kodları**: 404 (Sipariş bulunamadı), 400 (Sipariş iptal edilemez durumda)

---

## 5. CUSTOMER MANAGEMENT (Müşteri Yönetimi)

### 5.1. Tüm Müşterileri Listele
- **Endpoint**: `GET /api/v1/admin/customers`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Query Parameters**:
  - `page` (number, default: 1): Sayfa numarası
  - `limit` (number, default: 20, max: 100): Sayfa başına kayıt sayısı
  - `search` (string): İsim veya e-posta ile arama
  - `vipOnly` (boolean, default: false): Sadece VIP müşterileri göster
- **Response** (200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "name": "Ahmet Yılmaz",
        "email": "ahmet@example.com",
        "phone": "+90 555 123 4567",
        "totalSpent": 12500.00,
        "orderCount": 15,
        "isVip": true,
        "lastOrderDate": "2024-01-20T00:00:00Z",
        "createdAt": "2023-06-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1234,
      "totalPages": 62,
      "hasNext": true,
      "hasPrev": false
    }
  }
  ```
- **Not**: `isVip` hesaplaması frontend'de yapılabilir (örn: `totalSpent > 10000`). Backend'de de hesaplanabilir.

### 5.2. Müşteri Detayı
- **Endpoint**: `GET /api/v1/admin/customers/:id`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Path Parameters**: `id` (UUID - müşteri ID'si)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Ahmet Yılmaz",
      "email": "ahmet@example.com",
      "phone": "+90 555 123 4567",
      "role": "customer",
      "isActive": true,
      "totalSpent": 12500.00,
      "orderCount": 15,
      "isVip": true,
      "addresses": [
        {
          "id": "uuid",
          "title": "Ev",
          "line1": "Atatürk Cad. No:123",
          "city": "İstanbul",
          "zip": "34000",
          "country": "Türkiye",
          "isDefault": true
        }
      ],
      "recentOrders": [
        {
          "id": "uuid",
          "orderNumber": "#FAV-10045",
          "total": 599.98,
          "status": "delivered",
          "createdAt": "2024-01-20T00:00:00Z"
        }
      ],
      "createdAt": "2023-06-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  }
  ```
- **Hata Kodları**: 404 (Müşteri bulunamadı)

### 5.3. Müşteri Notu Ekle/Güncelle
- **Endpoint**: `POST /api/v1/admin/customers/:id/notes`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Path Parameters**: `id` (UUID - müşteri ID'si)
- **Request Body**:
  ```json
  {
    "note": "VIP müşteri - Özel indirim uygulanabilir"
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "customerId": "uuid",
      "note": "VIP müşteri - Özel indirim uygulanabilir",
      "createdBy": "uuid",
      "createdByName": "Admin Kullanıcı",
      "createdAt": "2024-01-24T12:00:00Z"
    },
    "message": "Not eklendi"
  }
  ```
- **Not**: Müşteri notları için ayrı bir `customer_notes` tablosu oluşturulabilir veya `users` tablosuna `notes` (JSONB) alanı eklenebilir.

---

## 6. SETTINGS (Ayarlar)

### 6.1. Genel Ayarları Getir
- **Endpoint**: `GET /api/v1/admin/settings`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "siteName": "Favilla Candle",
      "siteDescription": "Premium mum koleksiyonu",
      "contactEmail": "info@favilla.com",
      "contactPhone": "+90 555 123 4567",
      "currency": "TRY",
      "taxRate": 20,
      "shippingCost": 50.00,
      "freeShippingThreshold": 500.00
    }
  }
  ```
- **Not**: Ayarlar için `settings` tablosu oluşturulabilir veya JSONB alanı kullanılabilir.

### 6.2. Genel Ayarları Güncelle
- **Endpoint**: `PUT /api/v1/admin/settings`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Request Body**:
  ```json
  {
    "siteName": "Favilla Candle",
    "contactEmail": "info@favilla.com",
    "shippingCost": 60.00,
    "freeShippingThreshold": 600.00
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "siteName": "Favilla Candle",
      ...
    },
    "message": "Ayarlar güncellendi"
  }
  ```

### 6.3. Admin Profil Bilgilerini Getir
- **Endpoint**: `GET /api/v1/admin/profile`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Admin Kullanıcı",
      "email": "admin@favilla.com",
      "phone": "+90 555 123 4567",
      "role": "admin",
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  }
  ```

### 6.4. Admin Profil Güncelle
- **Endpoint**: `PUT /api/v1/admin/profile`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Request Body**:
  ```json
  {
    "name": "Yeni Admin Adı",
    "phone": "+90 555 999 8888",
    "currentPassword": "MevcutŞifre123!",
    "newPassword": "YeniŞifre123!",
    "confirmPassword": "YeniŞifre123!"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Yeni Admin Adı",
      "phone": "+90 555 999 8888",
      ...
    },
    "message": "Profil güncellendi"
  }
  ```
- **Not**: Şifre güncelleme için `currentPassword`, `newPassword` ve `confirmPassword` zorunludur.

### 6.5. Bildirim Ayarlarını Getir
- **Endpoint**: `GET /api/v1/admin/settings/notifications`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "emailNotifications": {
        "newOrder": true,
        "lowStock": true,
        "customerSupport": true
      },
      "pushNotifications": {
        "enabled": false
      }
    }
  }
  ```

### 6.6. Bildirim Ayarlarını Güncelle
- **Endpoint**: `PUT /api/v1/admin/settings/notifications`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Request Body**:
  ```json
  {
    "emailNotifications": {
      "newOrder": true,
      "lowStock": false,
      "customerSupport": true
    }
  }
  ```
- **Response** (200): Güncellenmiş ayarlar

### 6.7. Kargo Ayarlarını Getir
- **Endpoint**: `GET /api/v1/admin/settings/shipping`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Response** (200):
  ```json
  {
    "success": true,
    "data": {
      "defaultShippingCost": 50.00,
      "freeShippingThreshold": 500.00,
      "shippingProviders": [
        {
          "id": "yurtici",
          "name": "Yurtiçi Kargo",
          "enabled": true
        },
        {
          "id": "aras",
          "name": "Aras Kargo",
          "enabled": true
        }
      ]
    }
  }
  ```

### 6.8. Kargo Ayarlarını Güncelle
- **Endpoint**: `PUT /api/v1/admin/settings/shipping`
- **Authentication**: Gerekli (Bearer Token + Admin)
- **Request Body**:
  ```json
  {
    "defaultShippingCost": 60.00,
    "freeShippingThreshold": 600.00,
    "shippingProviders": [
      {
        "id": "yurtici",
        "enabled": true
      }
    ]
  }
  ```
- **Response** (200): Güncellenmiş ayarlar

---

## 7. VERİTABANI ŞEMALARI

### 7.1. Users (Kullanıcılar) Tablosu
```sql
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
```

**Önemli Alanlar:**
- `role`: `'customer'` veya `'admin'` değerlerini alır
- `is_active`: Kullanıcının aktif/pasif durumu

### 7.2. Products (Ürünler) Tablosu
```sql
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    
    -- Kategorizasyon
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
```

**Önemli Alanlar:**
- `is_active`: Ürünün yayında olup olmadığını belirler (true = Yayında, false = Taslak/Arşiv)
- `stock_quantity`: Stok miktarı (0 = Tükendi, <= 10 = Az kaldı, > 10 = Stokta var)

### 7.3. Orders (Siparişler) Tablosu
```sql
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
```

**Önemli Alanlar:**
- `status`: Sipariş durumu (`processing`, `shipped`, `delivered`, `cancelled`, `returned`)
- `shipping_address_snapshot`: JSONB formatında teslimat adresi (sipariş anındaki hali)

### 7.4. Order Status History (Sipariş Durum Geçmişi) Tablosu
```sql
CREATE TABLE order_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Önemli Alanlar:**
- `changed_by`: Durumu değiştiren admin kullanıcının ID'si
- `note`: Durum değişikliği notu

### 7.5. Order Items (Sipariş Kalemleri) Tablosu
```sql
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
```

**Önemli Alanlar:**
- `product_name_snapshot` ve `product_image_snapshot`: Ürün silinse bile sipariş detayında görüntülenmesi için snapshot'lar

---

## 8. ÖNEMLİ NOTLAR VE ENTEGRASYON TİPLERİ

### 8.1. Authentication Header Formatı
Tüm admin endpoint'lerde aşağıdaki header'ı ekleyin:
```
Authorization: Bearer <jwt_access_token>
```

### 8.2. Admin Yetkisi Kontrolü
- Tüm admin endpoint'leri `admin` middleware'i ile korunmalıdır
- Frontend'de `role === 'admin'` kontrolü yapılmalı
- Admin olmayan kullanıcılar admin paneline erişememelidir

### 8.3. Pagination
Tüm listeleme endpoint'lerinde pagination kullanılır:
- `page`: Sayfa numarası (varsayılan: 1)
- `limit`: Sayfa başına kayıt sayısı (varsayılan: 20, maksimum: 100)

### 8.4. Response Formatları

**Başarılı Response (200/201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "İşlem başarılı" // Opsiyonel
}
```

**Paginated Response:**
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

**Hata Response (400/401/403/404/500):**
```json
{
  "success": false,
  "error": "Hata mesajı",
  "statusCode": 400
}
```

### 8.5. VIP Müşteri Hesaplaması
VIP müşteri kontrolü frontend'de yapılabilir:
```typescript
const isVip = customer.totalSpent > 10000; // 10.000 TL üzeri harcama
```

Backend'de de hesaplanabilir, ancak şu an için frontend'de yapılması yeterlidir.

### 8.6. Ürün Durumları
- **active** (`is_active = true`): Yayında
- **draft** (`is_active = false` ve yeni oluşturulmuş): Taslak
- **archived** (`is_active = false` ve eski): Arşiv

### 8.7. Stok Durumları
- **in-stock**: `stock_quantity > 10`
- **low-stock**: `stock_quantity <= 10 AND stock_quantity > 0`
- **out-of-stock**: `stock_quantity = 0`

### 8.8. Sipariş Durumları
- **processing**: Hazırlanıyor
- **shipped**: Kargolandı
- **delivered**: Teslim edildi
- **cancelled**: İptal edildi
- **returned**: İade edildi

### 8.9. Slug Oluşturma
Ürün adından otomatik slug oluşturma:
- Türkçe karakterler İngilizce karşılıklarına çevrilir (ı→i, ş→s, ç→c, vb.)
- Büyük harfler küçük harfe çevrilir
- Boşluklar tire (-) ile değiştirilir
- Özel karakterler temizlenir

Örnek: "Favilla Ember" → "favilla-ember"

### 8.10. Soft Delete
Ürün silme işlemi soft delete'dir:
- Ürün veritabanından silinmez
- `is_active = false` yapılır
- Arşivlenmiş ürünler listelenebilir

---

## 9. EKSİK ENDPOINT'LER (Backend'de Oluşturulması Gerekenler)

Aşağıdaki endpoint'ler şu an mevcut değil, backend'de oluşturulmalıdır:

1. **Dashboard İstatistikleri**: `GET /api/v1/admin/dashboard/stats`
2. **Satış Grafiği**: `GET /api/v1/admin/dashboard/sales-chart`
3. **Son Siparişler**: `GET /api/v1/admin/dashboard/recent-orders`
4. **Admin Ürün Listesi**: `GET /api/v1/admin/products` (filtreleme ile)
5. **Admin Sipariş Listesi**: `GET /api/v1/admin/orders` (tüm siparişler)
6. **Sipariş Durum Güncelleme**: `PATCH /api/v1/admin/orders/:id/status`
7. **Sipariş Müşteri Bilgisi Güncelleme**: `PATCH /api/v1/admin/orders/:id/customer`
8. **Sipariş İptal**: `POST /api/v1/admin/orders/:id/cancel`
9. **Müşteri Listesi**: `GET /api/v1/admin/customers`
10. **Müşteri Detayı**: `GET /api/v1/admin/customers/:id`
11. **Müşteri Notu**: `POST /api/v1/admin/customers/:id/notes`
12. **Ayarlar Endpoint'leri**: `GET/PUT /api/v1/admin/settings/*`

---

## 10. ÖRNEK ENTEGRASYON KODLARI

### 10.1. React - Admin Girişi
```typescript
const loginAdmin = async (email: string, password: string) => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success && data.data.user.role === 'admin') {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data.data.user;
  } else {
    throw new Error('Admin yetkisi yok');
  }
};
```

### 10.2. React - Dashboard İstatistikleri
```typescript
const getDashboardStats = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/v1/admin/dashboard/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
};
```

### 10.3. React - Ürün Listesi (Filtreleme ile)
```typescript
const getProducts = async (filters: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  stockStatus?: string;
}) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value.toString());
  });
  
  const response = await fetch(`/api/v1/admin/products?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
};
```

### 10.4. React - Sipariş Durum Güncelleme
```typescript
const updateOrderStatus = async (orderId: string, status: string, note?: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status, note })
  });
  
  return await response.json();
};
```

---

## 11. HATA KODLARI VE MESAJLARI

| HTTP Kodu | Açıklama | Örnek Mesaj |
|-----------|----------|-------------|
| 200 | Başarılı | İşlem başarılı |
| 201 | Oluşturuldu | Ürün başarıyla oluşturuldu |
| 400 | Geçersiz İstek | Validation hatası, eksik parametre |
| 401 | Yetkisiz Erişim | Token bulunamadı veya geçersiz |
| 403 | Yasak | Admin yetkisi gerekiyor |
| 404 | Bulunamadı | Ürün/sipariş/müşteri bulunamadı |
| 409 | Çakışma | Slug zaten kullanılıyor |
| 500 | Sunucu Hatası | Beklenmeyen hata oluştu |

---

## 12. GÜVENLİK NOTLARI

1. **JWT Token**: Tüm admin endpoint'leri JWT token ile korunmalıdır
2. **Role Check**: Backend'de her admin endpoint'inde `role === 'admin'` kontrolü yapılmalıdır
3. **Rate Limiting**: Tüm endpoint'lerde rate limiting aktif olmalıdır
4. **Input Validation**: Tüm request body'ler ve query parametreleri validate edilmelidir
5. **SQL Injection**: Prepared statements kullanılmalıdır (PostgreSQL'de zaten kullanılıyor)
6. **XSS Protection**: Response'larda HTML escape yapılmalıdır
7. **CORS**: Sadece güvenilir domain'lerden istek kabul edilmelidir

---

Bu dokümantasyon, admin paneli frontend geliştirmesi için gerekli tüm bilgileri içermektedir. Backend'de eksik endpoint'ler oluşturuldukça bu dokümantasyon güncellenmelidir.
