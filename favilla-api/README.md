# 🕯️ Favilla API

Modern, güvenli ve ölçeklenebilir e-ticaret API'si. TypeScript, Express.js ve PostgreSQL ile geliştirilmiştir.

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Kurulum](#kurulum)
- [Yapılandırma](#yapılandırma)
- [Kullanım](#kullanım)
- [API Endpoints](#api-endpoints)
- [Güvenlik](#güvenlik)
- [Geliştirme](#geliştirme)
- [Lisans](#lisans)

## ✨ Özellikler

### 🔐 Kimlik Doğrulama ve Yetkilendirme
- JWT tabanlı authentication
- Role-based access control (Admin/Customer)
- Güvenli şifre hashleme (bcrypt)
- Rate limiting (brute force koruması)

### 🛍️ E-Ticaret Özellikleri
- Ürün yönetimi (CRUD)
- Sepet yönetimi
- Sipariş yönetimi
- Kupon sistemi
- Favoriler (Wishlist)
- Ürün yorumları ve sorular
- Destek talepleri

### 👤 Kullanıcı Yönetimi
- Kullanıcı kaydı ve girişi
- Profil yönetimi
- Adres yönetimi
- Sipariş geçmişi

### 🛡️ Güvenlik
- CORS yapılandırması
- Helmet.js (HTTP header güvenliği)
- Input validation (Zod)
- SQL injection koruması
- XSS koruması
- Rate limiting

### 📊 Loglama ve Monitoring
- Winston logger
- Request logging
- Error tracking
- Performance monitoring

## 🛠️ Teknolojiler

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - İlişkisel veritabanı

### Güvenlik ve Validasyon
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing
- **Zod** - Schema validation
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **CORS** - Cross-origin resource sharing

### Loglama ve Utilities
- **Winston** - Logging
- **dotenv** - Environment variables

## 🚀 Kurulum

### Gereksinimler

- Node.js (v18 veya üzeri)
- PostgreSQL (v12 veya üzeri)
- npm veya yarn

### Adımlar

1. **Repository'yi klonlayın:**
```bash
git clone <repository-url>
cd favilla-api
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment değişkenlerini yapılandırın:**
```bash
cp .env.example .env
```

4. **`.env` dosyasını düzenleyin:**
```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=favilla_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
PORT=5000
NODE_ENV=development
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

5. **Veritabanını oluşturun:**
```bash
# PostgreSQL'de veritabanı oluşturun
createdb favilla_db

# Migration'ı çalıştırın
npm run migrate
```

6. **Sunucuyu başlatın:**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## ⚙️ Yapılandırma

### Environment Değişkenleri

| Değişken | Açıklama | Zorunlu | Varsayılan |
|----------|----------|---------|------------|
| `JWT_SECRET` | JWT secret key (min 32 karakter) | ✅ | - |
| `DB_HOST` | PostgreSQL host | ✅ | localhost |
| `DB_PORT` | PostgreSQL port | ✅ | 5432 |
| `DB_DATABASE` | Veritabanı adı | ✅ | favilla_db |
| `DB_USER` | Veritabanı kullanıcı adı | ✅ | - |
| `DB_PASSWORD` | Veritabanı şifresi | ✅ | - |
| `PORT` | API portu | ❌ | 5000 |
| `NODE_ENV` | Ortam (development/production) | ❌ | development |
| `CORS_ALLOWED_ORIGINS` | İzin verilen origin'ler | ❌ | localhost |
| `LOG_LEVEL` | Log seviyesi | ❌ | debug |
| `BODY_SIZE_LIMIT` | Request body size limiti | ❌ | 1mb |
| `REDIS_URL` | Redis connection URL | ❌ | - |
| `REDIS_HOST` | Redis host (REDIS_URL yoksa) | ❌ | localhost |
| `REDIS_PORT` | Redis port (REDIS_URL yoksa) | ❌ | 6379 |
| `REDIS_PASSWORD` | Redis password | ❌ | - |
| `REDIS_ENABLED` | Redis'i etkinleştir/devre dışı bırak | ❌ | true (REDIS_URL varsa) |

Detaylı bilgi için `.env.example` dosyasına bakın.

### Redis Caching (Opsiyonel)

Redis caching performans artışı sağlar. Redis yoksa uygulama in-memory cache ile çalışmaya devam eder.

```env
# Redis URL (tam URL)
REDIS_URL=redis://localhost:6379

# VEYA ayrı ayrı
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# Redis'i devre dışı bırakmak için
REDIS_ENABLED=false
```

### Güvenli JWT Secret Oluşturma

```bash
openssl rand -base64 32
```

## 📖 Kullanım

### Development

```bash
npm run dev
```

Sunucu `http://localhost:5000` adresinde çalışacaktır.

### Production

```bash
npm run build
npm start
```

### Veritabanı Migration

```bash
# Tüm pending migration'ları çalıştır
npm run migrate

# Migration durumunu göster
npm run migrate:status
```

Migration sistemi otomatik olarak:
- Migration dosyalarını versiyon numarasına göre sıralar
- Sadece çalıştırılmamış migration'ları çalıştırır
- Her migration'ı transaction içinde çalıştırır (hata durumunda rollback)
- Migration execution time ve durumunu takip eder

### Kullanıcıları Kontrol Etme

```bash
npm run check-users
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Kullanıcı bilgileri (Protected)

### Products
- `GET /api/products` - Ürün listesi (filtreleme ve pagination destekli)
  - Query params: `?page=1&limit=20&type=jar&color=natural&sort=price-asc`
- `GET /api/products/:slug` - Ürün detayı
- `POST /api/products` - Yeni ürün (Admin)
- `PUT /api/products/:id` - Ürün güncelle (Admin)
- `DELETE /api/products/:id` - Ürün sil (Admin)

### Cart
- `GET /api/cart` - Sepeti getir (Protected)
- `POST /api/cart` - Sepete ürün ekle (Protected)
- `DELETE /api/cart/:productId` - Sepetten ürün sil (Protected)
- `PUT /api/cart/:productId` - Sepet miktarını güncelle (Protected)
- `POST /api/cart/checkout` - Sipariş oluştur (Protected)
- `POST /api/cart/coupon` - Kupon kontrolü (Protected)

### Orders
- `GET /api/orders` - Sipariş geçmişi (Protected, pagination destekli)
  - Query params: `?page=1&limit=20`
- `GET /api/orders/:id` - Sipariş detayı (Protected)

### Reviews
- `GET /api/reviews/:productId` - Ürün yorumları (pagination destekli)
  - Query params: `?page=1&limit=10`
- `POST /api/reviews/:productId` - Yorum ekle (Protected)
- `GET /api/reviews/:productId/eligibility` - Yorum yapabilir mi? (Protected)

### Questions
- `GET /api/questions/:productId` - Ürün soruları (pagination destekli)
  - Query params: `?page=1&limit=10`
- `POST /api/questions/:productId` - Soru sor (Protected)
- `GET /api/questions/my` - Benim sorularım (Protected, pagination destekli)
  - Query params: `?page=1&limit=20`

### Wishlist
- `GET /api/wishlist` - Favorileri getir (Protected)
- `POST /api/wishlist` - Favorilere ekle (Protected)
- `DELETE /api/wishlist/:productId` - Favorilerden çıkar (Protected)
- `GET /api/wishlist/:productId/status` - Favori durumu (Protected)

### User
- `GET /api/users/profile` - Profil bilgileri (Protected)
- `PUT /api/users/profile` - Profil güncelle (Protected)
- `GET /api/users/addresses` - Adresleri getir (Protected)
- `POST /api/users/addresses` - Adres ekle (Protected)
- `PUT /api/users/addresses/:id` - Adres güncelle (Protected)
- `DELETE /api/users/addresses/:id` - Adres sil (Protected)

### Support
- `GET /api/support` - Destek talepleri (Protected, pagination destekli)
  - Query params: `?page=1&limit=20`
- `POST /api/support` - Yeni destek talebi (Protected)

## 📄 Pagination

Tüm listeleme endpoint'leri pagination destekler:

### Query Parametreleri
- `page` - Sayfa numarası (varsayılan: 1, minimum: 1)
- `limit` - Sayfa başına kayıt sayısı (varsayılan: 20, maksimum: 100)

### Response Formatı

```json
{
  "data": [
    // ... kayıtlar
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

### Örnek Kullanım

```bash
# İlk sayfa, 20 kayıt
GET /api/products?page=1&limit=20

# İkinci sayfa, 10 kayıt
GET /api/products?page=2&limit=10

# Filtreleme ile birlikte
GET /api/products?type=jar&color=natural&page=1&limit=20&sort=price-asc
```

### Pagination Limitleri

- **Products**: 1-100 arası (varsayılan: 20)
- **Orders**: 1-100 arası (varsayılan: 20)
- **Reviews**: 1-50 arası (varsayılan: 10)
- **Questions**: 1-50 arası (varsayılan: 10)
- **Support Tickets**: 1-100 arası (varsayılan: 20)

## 🔒 Güvenlik

### Uygulanan Güvenlik Önlemleri

1. **Authentication & Authorization**
   - JWT token-based authentication
   - Role-based access control
   - Password hashing (bcrypt, salt rounds: 10)

2. **Input Validation**
   - Zod schema validation
   - Email format kontrolü
   - Şifre güçlülük kontrolü
   - SQL injection koruması (parameterized queries)

3. **Rate Limiting**
   - Genel API: 100 istek/15 dakika
   - Auth endpoints: 5 istek/15 dakika (brute force koruması)

4. **CORS**
   - Sadece izin verilen origin'lerden istek kabul edilir
   - Credentials desteği

5. **Request Size Limiting**
   - JSON body: Maksimum 1MB (configurable)
   - URL-encoded body: Maksimum 1MB (configurable)
   - DoS saldırılarına karşı koruma
   - 413 Payload Too Large hatası

6. **Security Headers**
   - Helmet.js ile HTTP header güvenliği

7. **Error Handling**
   - Güvenli hata mesajları
   - Detaylı loglama (production'da gizli)

8. **Database Transaction Management**
   - Kritik işlemlerde transaction kullanımı
   - Otomatik rollback yönetimi
   - ACID uyumluluğu
   - Race condition koruması (FOR UPDATE)

7. **Database Transaction Management**
   - Kritik işlemlerde transaction kullanımı
   - Otomatik rollback yönetimi
   - ACID uyumluluğu
   - Race condition koruması (FOR UPDATE)

### Şifre Gereksinimleri

- Minimum 8 karakter
- En az bir büyük harf (A-Z)
- En az bir küçük harf (a-z)
- En az bir rakam (0-9)
- En az bir özel karakter
- Ortak şifreler reddedilir
- Ardışık karakterler reddedilir

## 🔄 Database Transaction Yönetimi

Proje, kritik işlemlerde database transaction yönetimi kullanır:

### Transaction Kullanılan İşlemler

1. **Checkout (Sipariş Oluşturma)**
   - Sepet kontrolü ve kilitleme
   - Stok kontrolü ve güncelleme
   - Sipariş kaydı
   - Kupon kullanımı
   - Sepet temizleme
   - Tüm işlemler atomik olarak gerçekleşir

2. **Sepete Ekleme**
   - Sepet oluşturma/güncelleme
   - Stok kontrolü (FOR UPDATE ile kilitleme)
   - Race condition koruması

3. **Sepet Güncelleme**
   - Stok kontrolü (FOR UPDATE ile kilitleme)
   - Miktar güncelleme
   - Atomik işlem garantisi

### Transaction Utility

```typescript
import { withTransaction, withTransactionVoid } from '../utils/transaction';

// Değer döndüren işlemler için
const result = await withTransaction(async (client) => {
  await client.query('INSERT INTO ...');
  await client.query('UPDATE ...');
  return { success: true };
});

// Void işlemler için
await withTransactionVoid(async (client) => {
  await client.query('INSERT INTO ...');
  await client.query('UPDATE ...');
});
```

### Özellikler

- **Otomatik Rollback**: Hata durumunda tüm değişiklikler geri alınır
- **Connection Management**: Bağlantı otomatik olarak yönetilir
- **Error Handling**: Hatalar loglanır ve yukarı fırlatılır
- **ACID Compliance**: Tüm transaction'lar ACID prensiplerine uyar
- **Row Locking**: `FOR UPDATE` ile race condition'lar önlenir

## 📁 Proje Yapısı

```
favilla-api/
├── database/
│   └── 001_initial_schema.sql    # Veritabanı şeması
├── logs/                           # Log dosyaları
├── src/
│   ├── config/                     # Yapılandırma
│   │   ├── cors.ts                # CORS ayarları
│   │   ├── db.ts                  # Veritabanı bağlantısı
│   │   └── env.ts                 # Environment validasyonu
│   ├── controllers/                # Route handler'ları
│   ├── middlewares/                # Middleware'ler
│   │   ├── adminMiddleware.ts     # Admin yetki kontrolü
│   │   ├── authMiddleware.ts       # JWT authentication
│   │   ├── errorHandler.ts        # Global error handler
│   │   ├── rateLimiter.ts         # Rate limiting
│   │   ├── requestLogger.ts       # Request logging
│   │   └── validate.ts             # Validation middleware
│   ├── models/                     # Veritabanı modelleri
│   ├── routes/                     # Route tanımları
│   ├── types/                      # TypeScript tipleri
│   ├── utils/                      # Yardımcı fonksiyonlar
│   │   ├── logger.ts              # Winston logger
│   │   └── validators.ts           # Validasyon fonksiyonları
│   ├── validations/                # Zod şemaları
│   ├── app.ts                      # Express app
│   └── server.ts                   # Sunucu başlatma
├── .env.example                    # Environment örneği
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Geliştirme

### Scripts

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Production start
npm start

# Database migration
npm run migrate

# Check users
npm run check-users

# Tests
npm test              # Tüm testleri çalıştır
npm run test:watch    # Watch mode (değişiklikleri izle)
npm run test:coverage # Coverage raporu ile test
npm run test:verbose  # Detaylı test çıktısı
```

### Test Yapısı

Proje Jest ile test edilmektedir. Test dosyaları `tests/` klasöründe bulunur:

```
tests/
├── setup.ts                    # Test setup (environment variables)
├── utils/
│   └── validators.test.ts      # Validator fonksiyon testleri
├── middlewares/
│   └── authMiddleware.test.ts  # Auth middleware testleri
└── validations/
    └── authSchemas.test.ts     # Zod schema testleri
```

### Test Örnekleri

- **Validators**: Email, şifre, telefon validasyon testleri
- **Middlewares**: Authentication middleware testleri
- **Validations**: Zod schema validasyon testleri

### Coverage

Test coverage raporu oluşturmak için:

```bash
npm run test:coverage
```

Coverage raporu `coverage/` klasöründe HTML formatında oluşturulur.

### Kod Standartları

- TypeScript strict mode aktif
- ESLint kullanımı önerilir
- Async/await kullanımı
- Error handling için asyncHandler wrapper
- Zod ile input validation

### Loglama

Loglar `logs/` klasöründe saklanır:
- `combined.log` - Tüm loglar
- `error.log` - Sadece hatalar
- `exceptions.log` - Exception'lar
- `rejections.log` - Promise rejection'lar

## 🐛 Hata Ayıklama

### Yaygın Sorunlar

1. **Veritabanı bağlantı hatası**
   - `.env` dosyasındaki DB bilgilerini kontrol edin
   - PostgreSQL servisinin çalıştığından emin olun

2. **JWT_SECRET hatası**
   - JWT_SECRET en az 32 karakter olmalıdır
   - Güvenli bir değer kullanın

3. **CORS hatası**
   - `CORS_ALLOWED_ORIGINS` değişkenini kontrol edin
   - Frontend URL'inin listede olduğundan emin olun

4. **Port zaten kullanılıyor**
   - Farklı bir port kullanın veya mevcut process'i durdurun

## 📝 Lisans

ISC License

## 👥 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📧 İletişim

Sorularınız için issue açabilirsiniz.

---

**Not:** Bu proje eğitim ve geliştirme amaçlıdır. Production kullanımı için ek güvenlik önlemleri alınmalıdır.
