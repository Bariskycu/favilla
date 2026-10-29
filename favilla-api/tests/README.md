# 🧪 Test Dokümantasyonu

Bu klasör Favilla API projesinin test dosyalarını içerir.

## 📁 Test Yapısı

```
tests/
├── controllers/          # Controller testleri
│   └── authController.test.ts
├── middlewares/          # Middleware testleri
│   ├── authMiddleware.test.ts
│   ├── adminMiddleware.test.ts
│   ├── errorHandler.test.ts
│   └── validate.test.ts
├── models/               # Model testleri (henüz eklenmedi)
├── utils/                # Utility testleri
│   ├── validators.test.ts
│   └── pagination.test.ts
├── validations/          # Validation schema testleri
│   └── authSchemas.test.ts
├── integration/          # Integration testleri (henüz eklenmedi)
├── e2e/                  # E2E testleri (henüz eklenmedi)
├── setup.ts              # Jest setup dosyası
└── README.md             # Bu dosya
```

## 🚀 Test Çalıştırma

### Tüm testleri çalıştır
```bash
npm test
```

### Watch mode (değişiklikleri izle)
```bash
npm run test:watch
```

### Coverage raporu ile
```bash
npm run test:coverage
```

### Verbose mode (detaylı çıktı)
```bash
npm run test:verbose
```

## 📊 Test Coverage

Mevcut test coverage durumu:

- ✅ **Controllers**: Auth controller testleri mevcut
- ✅ **Middlewares**: Tüm middleware'ler için testler mevcut
- ✅ **Validations**: Auth schema testleri mevcut
- ✅ **Utils**: Validator ve pagination testleri mevcut
- ⚠️ **Models**: Henüz test eklenmedi (veritabanı mock'laması gerekiyor)
- ⚠️ **Integration**: Henüz test eklenmedi
- ⚠️ **E2E**: Henüz test eklenmedi

## 🎯 Test Stratejisi

### Unit Tests
- **Controllers**: İş mantığı testleri, mock'lanmış dependencies ile
- **Middlewares**: Request/Response akışı testleri
- **Validations**: Schema validation testleri
- **Utils**: Yardımcı fonksiyon testleri

### Integration Tests (Planlanan)
- API endpoint'lerinin birlikte çalışması
- Database işlemleri
- Authentication flow'ları

### E2E Tests (Planlanan)
- Tam kullanıcı senaryoları
- Sipariş akışı
- Sepet işlemleri

## 📝 Test Yazma Rehberi

### Örnek Test Yapısı

```typescript
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('Feature Name', () => {
  beforeEach(() => {
    // Her test öncesi setup
    jest.clearAllMocks();
  });

  it('should do something', () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### Mock Kullanımı

```typescript
// Module mock
jest.mock('../../src/models/userModel');

// Function mock
(userModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
```

## 🔧 Test Setup

Test setup dosyası (`setup.ts`) şunları yapar:
- Test environment değişkenlerini ayarlar
- Jest timeout'unu yapılandırır
- Logger'ı mock'lar

## 📈 Coverage Hedefleri

- **Minimum**: %60
- **Hedef**: %80
- **İdeal**: %90+

## 🐛 Bilinen Sorunlar

- Model testleri için test database setup'ı gerekiyor
- Integration testleri için supertest entegrasyonu gerekiyor
- E2E testleri için test senaryoları tanımlanmalı

## 📚 Kaynaklar

- [Jest Dokümantasyonu](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
