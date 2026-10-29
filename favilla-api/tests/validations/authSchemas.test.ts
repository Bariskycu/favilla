// tests/validations/authSchemas.test.ts
import { describe, it, expect } from '@jest/globals';
import { registerSchema, loginSchema } from '../../src/validations/authSchemas';

describe('Auth Schemas', () => {
  describe('registerSchema', () => {
    it('geçerli kayıt verisini kabul etmeli', () => {
      const validData = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'Test1@9Kp', // Güçlü şifre (ardışık karakter yok, tüm gereksinimleri karşılıyor)
          phone: '5551234567',
        },
      };

      const result = registerSchema.safeParse(validData);
      if (!result.success) {
        console.log('Validation errors:', result.error.issues);
      }
      expect(result.success).toBe(true);
    });

    it('eksik alanları reddetmeli', () => {
      const invalidData = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          // password eksik
          phone: '5551234567',
        },
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('geçersiz email formatını reddetmeli', () => {
      const invalidData = {
        body: {
          name: 'Test User',
          email: 'invalid-email',
          password: 'Secure123!',
          phone: '5551234567',
        },
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('zayıf şifreyi reddetmeli', () => {
      const invalidData = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'weak',
          phone: '5551234567',
        },
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('boş ismi reddetmeli', () => {
      const invalidData = {
        body: {
          name: '',
          email: 'test@example.com',
          password: 'Secure123!',
          phone: '5551234567',
        },
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('geçerli giriş verisini kabul etmeli', () => {
      const validData = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('eksik alanları reddetmeli', () => {
      const invalidData = {
        body: {
          email: 'test@example.com',
          // password eksik
        },
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('geçersiz email formatını reddetmeli', () => {
      const invalidData = {
        body: {
          email: 'invalid-email',
          password: 'password123',
        },
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
