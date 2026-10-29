// tests/setup.ts
// Jest test setup dosyası

// Environment değişkenlerini test için ayarla
process.env.NODE_ENV = 'test';
// JWT_SECRET: "secret" kelimesi içermemeli, en az 32 karakter olmalı
process.env.JWT_SECRET = 'test-jwt-key-minimum-thirty-two-characters-long-for-testing-purposes-only';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_DATABASE = 'favilla_test';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.PORT = '5000';
process.env.LOG_LEVEL = 'error'; // Test sırasında logları azalt

// Global test timeout
jest.setTimeout(10000);
