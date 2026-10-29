// src/utils/validators.ts
// Validasyon yardımcı fonksiyonları

/**
 * Email formatını kontrol eder
 * RFC 5322 uyumlu email validasyonu
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Email regex pattern (RFC 5322 uyumlu)
  // Basit ama etkili bir pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Daha detaylı kontrol için
  const detailedEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // Email uzunluk kontrolü (RFC 5321: local part max 64, domain max 255, toplam max 254)
  if (email.length > 254) {
    return false;
  }

  // @ işareti kontrolü
  const parts = email.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;

  // Local part kontrolü (kullanıcı adı kısmı)
  if (!localPart || localPart.length === 0 || localPart.length > 64) {
    return false;
  }

  // Domain kontrolü
  if (!domain || domain.length === 0 || domain.length > 255) {
    return false;
  }

  // Domain'de en az bir nokta olmalı
  if (!domain.includes('.')) {
    return false;
  }

  // Domain'in son kısmı (TLD) en az 2 karakter olmalı
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) {
    return false;
  }

  // Regex ile format kontrolü
  return detailedEmailRegex.test(email);
};

/**
 * Şifre güçlülük kontrolü
 * Güçlü şifre gereksinimleri:
 * - En az 8 karakter
 * - En az bir büyük harf (A-Z)
 * - En az bir küçük harf (a-z)
 * - En az bir rakam (0-9)
 * - En az bir özel karakter
 */
export const isValidPassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Şifre gereklidir' };
  }

  // Minimum uzunluk kontrolü
  if (password.length < 8) {
    return { valid: false, message: 'Şifre en az 8 karakter olmalıdır' };
  }

  // Maximum uzunluk kontrolü
  if (password.length > 128) {
    return { valid: false, message: 'Şifre en fazla 128 karakter olabilir' };
  }

  // Büyük harf kontrolü
  const hasUpperCase = /[A-Z]/.test(password);
  if (!hasUpperCase) {
    return { valid: false, message: 'Şifre en az bir büyük harf içermelidir (A-Z)' };
  }

  // Küçük harf kontrolü
  const hasLowerCase = /[a-z]/.test(password);
  if (!hasLowerCase) {
    return { valid: false, message: 'Şifre en az bir küçük harf içermelidir (a-z)' };
  }

  // Rakam kontrolü
  const hasNumber = /[0-9]/.test(password);
  if (!hasNumber) {
    return { valid: false, message: 'Şifre en az bir rakam içermelidir (0-9)' };
  }

  // Özel karakter kontrolü
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasSpecialChar) {
    return { valid: false, message: 'Şifre en az bir özel karakter içermelidir (!@#$%^&* vb.)' };
  }

  // Ortak zayıf şifreler kontrolü
  const commonWeakPasswords = [
    'password',
    'password123',
    '12345678',
    'qwerty123',
    'admin123',
    'letmein',
    'welcome123',
    'monkey123',
    '123456789',
    'password1',
  ];

  const lowerPassword = password.toLowerCase();
  if (commonWeakPasswords.some(weak => lowerPassword.includes(weak))) {
    return { valid: false, message: 'Lütfen daha güçlü bir şifre seçin. Bu şifre çok yaygın kullanılıyor.' };
  }

  // Ardışık karakter kontrolü (ör: 1234, abcd)
  const hasSequentialChars = /(012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password);
  if (hasSequentialChars) {
    return { valid: false, message: 'Şifre ardışık karakterler içermemelidir (ör: 1234, abcd)' };
  }

  // Aynı karakterin 3+ kez tekrarı kontrolü (ör: aaa, 111)
  const hasRepeatedChars = /(.)\1{2,}/.test(password);
  if (hasRepeatedChars) {
    return { valid: false, message: 'Şifre aynı karakterin 3+ kez tekrarını içermemelidir (ör: aaa, 111)' };
  }

  return { valid: true };
};

/**
 * Telefon numarası format kontrolü (basit)
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Sadece rakam, boşluk, +, -, () karakterlerine izin ver
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  
  // En az 10 karakter olmalı
  const cleanPhone = phone.replace(/[\s\+\-\(\)]/g, '');
  
  return phoneRegex.test(phone) && cleanPhone.length >= 10 && cleanPhone.length <= 15;
};
