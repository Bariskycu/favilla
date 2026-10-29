# Kullanıcıyı Admin Yapma Kılavuzu

Customer rolündeki bir kullanıcıyı admin yapmak için iki yöntem mevcuttur:

## Yöntem 1: Doğrudan SQL Sorgusu (Hızlı)

### PostgreSQL ile:

```sql
-- Email adresine göre kullanıcıyı admin yap
UPDATE users 
SET role = 'admin', updated_at = CURRENT_TIMESTAMP
WHERE email = 'kullanici@example.com';

-- Kontrol için:
SELECT id, name, email, role FROM users WHERE email = 'kullanici@example.com';
```

### ID'ye göre (Daha güvenli):

```sql
-- Önce kullanıcının ID'sini bulun:
SELECT id, name, email, role FROM users WHERE email = 'kullanici@example.com';

-- Sonra ID ile güncelleyin:
UPDATE users 
SET role = 'admin', updated_at = CURRENT_TIMESTAMP
WHERE id = 'kullanici-uuid-buraya';
```

---

## Yöntem 2: API Endpoint ile (Önerilen)

Yeni bir admin endpoint'i eklendi. Bu endpoint sadece mevcut admin'ler tarafından kullanılabilir.

### Endpoint Detayları:

- **URL**: `PUT /api/v1/users/:userId/role`
- **Method**: `PUT`
- **Authentication**: Gerekli (Bearer Token)
- **Authorization**: Sadece Admin
- **Content-Type**: `application/json`

### Request:

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `userId` (UUID): Rolü değiştirilecek kullanıcının ID'si

**Request Body:**
```json
{
  "role": "admin"
}
```

**Geçerli Role Değerleri:**
- `"customer"` - Normal kullanıcı
- `"admin"` - Admin kullanıcı

### Response:

**Başarılı (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Kullanıcı Adı",
    "email": "kullanici@example.com",
    "phone": "+90 555 123 4567",
    "role": "admin",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "message": "Kullanıcı rolü admin olarak güncellendi"
}
```

**Hata Durumları:**
- `400`: Geçersiz role değeri veya validation hatası
- `401`: Authentication hatası (token eksik/geçersiz)
- `403`: Admin yetkisi yok
- `404`: Kullanıcı bulunamadı
- `500`: Sunucu hatası

### Örnek Kullanım:

#### cURL:
```bash
curl -X PUT http://localhost:3000/api/v1/users/USER_ID_BURAYA/role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

#### JavaScript (Fetch):
```javascript
const response = await fetch('http://localhost:3000/api/v1/users/USER_ID_BURAYA/role', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    role: 'admin'
  })
});

const data = await response.json();
console.log(data);
```

#### Postman/Insomnia:
1. Method: `PUT`
2. URL: `http://localhost:3000/api/v1/users/{userId}/role`
3. Headers:
   - `Authorization: Bearer YOUR_ADMIN_TOKEN`
   - `Content-Type: application/json`
4. Body (JSON):
   ```json
   {
     "role": "admin"
   }
   ```

---

## İlk Admin Oluşturma

Eğer hiç admin yoksa, ilk admin'i oluşturmak için:

1. **SQL ile (Önerilen):**
   ```sql
   -- Bir kullanıcı oluşturun veya mevcut bir kullanıcıyı bulun
   SELECT id, email FROM users LIMIT 1;
   
   -- Onu admin yapın
   UPDATE users 
   SET role = 'admin', updated_at = CURRENT_TIMESTAMP
   WHERE id = 'BULUNAN_USER_ID';
   ```

2. **API ile:**
   - Önce bir kullanıcı kaydı oluşturun (`POST /api/v1/auth/register`)
   - Sonra SQL ile o kullanıcıyı admin yapın
   - Artık o admin token'ı ile diğer kullanıcıları admin yapabilirsiniz

---

## Güvenlik Notları

1. **Admin Endpoint'i**: Sadece mevcut admin'ler bu endpoint'i kullanabilir
2. **Role Validation**: Sadece `customer` ve `admin` değerleri kabul edilir
3. **Audit Log**: Bu işlem audit log'a kaydedilir (gelecekte eklenebilir)
4. **Token Güvenliği**: Admin token'larınızı güvende tutun

---

## Sorun Giderme

### "Bu işlem için admin yetkisi gerekiyor" hatası:
- Token'ınızın geçerli olduğundan emin olun
- Kullanıcınızın `role = 'admin'` olduğunu kontrol edin

### "Kullanıcı bulunamadı" hatası:
- `userId` parametresinin doğru UUID formatında olduğundan emin olun
- Kullanıcının veritabanında mevcut olduğunu kontrol edin

### "Geçersiz role değeri" hatası:
- `role` değerinin `"customer"` veya `"admin"` olduğundan emin olun
- JSON formatının doğru olduğundan emin olun
