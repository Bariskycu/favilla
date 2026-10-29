// src/config/env.ts
// Environment değişkenlerini doğrulama ve yapılandırma

import dotenv from 'dotenv';

dotenv.config();

// Logger'ı burada import edemeyiz çünkü henüz env doğrulanmadı
// Bu yüzden console kullanmaya devam ediyoruz (sadece başlangıç hataları için)

// Environment type definitions
export type NodeEnv = 'development' | 'production' | 'test' | 'staging';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

interface EnvConfig {
  JWT_SECRET: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_DATABASE: string;
  DB_USER: string;
  DB_PASSWORD: string;
  PORT: number;
  NODE_ENV: NodeEnv;
  LOG_LEVEL: LogLevel;
  CORS_ALLOWED_ORIGINS: string[];
  BODY_SIZE_LIMIT: string; // Örn: '1mb', '500kb'
  COOKIE_SECURE: boolean; // HTTPS için
  COOKIE_SAME_SITE: 'strict' | 'lax' | 'none'; // CSRF koruması
  COOKIE_DOMAIN?: string; // Cookie domain (opsiyonel)
}

// Zorunlu environment değişkenlerini kontrol et
const validateEnv = (): EnvConfig => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
  ];

  const missing: string[] = [];
  const empty: string[] = [];

  // Eksik veya boş değişkenleri kontrol et
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value) {
      missing.push(envVar);
    } else if (value.trim().length === 0) {
      empty.push(envVar);
    }
  }

  // DB_DATABASE veya DB_NAME kontrolü (ikisinden biri olmalı)
  if (!process.env.DB_DATABASE && !process.env.DB_NAME) {
    missing.push('DB_DATABASE veya DB_NAME');
  }

  if (missing.length > 0) {
    console.error('❌ Eksik environment değişkenleri:');
    missing.forEach((envVar) => {
      console.error(`   - ${envVar}`);
    });
    console.error('\n💡 Lütfen .env dosyanızı kontrol edin ve tüm gerekli değişkenleri ekleyin.');
    console.error('   Örnek: .env.example dosyasını .env olarak kopyalayıp değerleri doldurun.');
    process.exit(1);
  }

  if (empty.length > 0) {
    console.error('❌ Boş environment değişkenleri (değer girilmemiş):');
    empty.forEach((envVar) => {
      console.error(`   - ${envVar}`);
    });
    console.error('\n💡 Lütfen .env dosyanızda bu değişkenlere geçerli değerler girin.');
    process.exit(1);
  }

  // JWT_SECRET güvenlik kontrolü
  const jwtSecret = process.env.JWT_SECRET!.trim();
  if (jwtSecret.length < 32) {
    console.error('❌ JWT_SECRET en az 32 karakter olmalıdır (güvenlik için).');
    console.error(`   Mevcut uzunluk: ${jwtSecret.length} karakter`);
    console.error('   Güvenli secret oluşturma: openssl rand -base64 32');
    process.exit(1);
  }

  if (jwtSecret === 'your-secret-key' || 
      jwtSecret.toLowerCase().includes('secret') || 
      jwtSecret.toLowerCase().includes('default') ||
      jwtSecret.toLowerCase().includes('example') ||
      jwtSecret.toLowerCase().includes('change-this')) {
    console.error('❌ JWT_SECRET güvenli bir değer olmalıdır. Varsayılan veya örnek değerler kullanılamaz.');
    console.error('   Güvenli secret oluşturma: openssl rand -base64 32');
    process.exit(1);
  }

  // DB_PORT sayısal kontrolü
  const dbPort = process.env.DB_PORT!.trim();
  const dbPortNum = parseInt(dbPort, 10);
  if (isNaN(dbPortNum) || dbPortNum < 1 || dbPortNum > 65535) {
    console.error('❌ DB_PORT geçerli bir port numarası olmalıdır (1-65535 arası).');
    console.error(`   Mevcut değer: ${dbPort}`);
    process.exit(1);
  }

  // PORT sayısal kontrolü (opsiyonel ama varsa geçerli olmalı)
  if (process.env.PORT) {
    const port = process.env.PORT.trim();
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      console.error('❌ PORT geçerli bir port numarası olmalıdır (1-65535 arası).');
      console.error(`   Mevcut değer: ${port}`);
      process.exit(1);
    }
  }

  // DB_HOST kontrolü (boş olmamalı)
  const dbHost = process.env.DB_HOST!.trim();
  if (dbHost.length === 0) {
    console.error('❌ DB_HOST boş olamaz.');
    process.exit(1);
  }

  // DB_DATABASE kontrolü (boş olmamalı, DB_NAME fallback'i var)
  const dbDatabase = (process.env.DB_DATABASE || process.env.DB_NAME || 'favilla_db').trim();
  if (dbDatabase.length === 0) {
    console.error('❌ DB_DATABASE veya DB_NAME boş olamaz.');
    process.exit(1);
  }

  // DB_USER kontrolü (boş olmamalı)
  const dbUser = process.env.DB_USER!.trim();
  if (dbUser.length === 0) {
    console.error('❌ DB_USER boş olamaz.');
    process.exit(1);
  }

  // DB_PASSWORD kontrolü (boş olmamalı)
  const dbPassword = process.env.DB_PASSWORD!;
  if (dbPassword.length === 0) {
    console.error('❌ DB_PASSWORD boş olamaz.');
    process.exit(1);
  }

  // CORS Allowed Origins
  const corsOrigins = process.env.CORS_ALLOWED_ORIGINS;
  let allowedOrigins: string[] = [];
  
  if (corsOrigins) {
    // Virgülle ayrılmış origin'leri parse et
    allowedOrigins = corsOrigins.split(',').map(origin => origin.trim()).filter(origin => origin.length > 0);
  }
  
  // Development için localhost'a izin ver (eğer hiç origin belirtilmemişse)
  if (allowedOrigins.length === 0) {
    console.warn('⚠️  CORS_ALLOWED_ORIGINS belirtilmemiş. Sadece localhost\'a izin veriliyor (development için).');
    allowedOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'];
  }

  // NODE_ENV validation (enum)
  const validNodeEnvs: NodeEnv[] = ['development', 'production', 'test', 'staging'];
  const nodeEnv = (process.env.NODE_ENV || 'development').trim().toLowerCase() as NodeEnv;
  if (!validNodeEnvs.includes(nodeEnv)) {
    console.error('❌ NODE_ENV geçersiz bir değer içeriyor.');
    console.error(`   Mevcut değer: ${process.env.NODE_ENV}`);
    console.error(`   İzin verilen değerler: ${validNodeEnvs.join(', ')}`);
    console.error('   Varsayılan: development');
    process.exit(1);
  }

  // LOG_LEVEL validation (enum)
  const validLogLevels: LogLevel[] = ['error', 'warn', 'info', 'debug', 'verbose'];
  let logLevel: LogLevel;
  
  if (process.env.LOG_LEVEL) {
    const envLogLevel = process.env.LOG_LEVEL.trim().toLowerCase() as LogLevel;
    if (!validLogLevels.includes(envLogLevel)) {
      console.error('❌ LOG_LEVEL geçersiz bir değer içeriyor.');
      console.error(`   Mevcut değer: ${process.env.LOG_LEVEL}`);
      console.error(`   İzin verilen değerler: ${validLogLevels.join(', ')}`);
      process.exit(1);
    }
    logLevel = envLogLevel;
  } else {
    // Varsayılan: production'da 'info', diğerlerinde 'debug'
    logLevel = nodeEnv === 'production' ? 'info' : 'debug';
  }

  // Body size limit validation (opsiyonel, varsayılan: 1mb)
  const bodySizeLimit = process.env.BODY_SIZE_LIMIT || '1mb';
  const bodySizeLimitPattern = /^(\d+)(kb|mb|gb)$/i;
  if (!bodySizeLimitPattern.test(bodySizeLimit)) {
    console.error('❌ BODY_SIZE_LIMIT geçersiz format.');
    console.error(`   Mevcut değer: ${bodySizeLimit}`);
    console.error('   Geçerli format: <number><unit> (örn: 1mb, 500kb, 2gb)');
    console.error('   Varsayılan: 1mb');
    process.exit(1);
  }

  // Cookie settings
  // COOKIE_SECURE: Production'da true (HTTPS gerekli), development'ta false
  const cookieSecure = process.env.COOKIE_SECURE !== undefined 
    ? process.env.COOKIE_SECURE.toLowerCase() === 'true'
    : nodeEnv === 'production';
  
  // COOKIE_SAME_SITE: CSRF koruması için (varsayılan: 'lax')
  const cookieSameSite = (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase() as 'strict' | 'lax' | 'none';
  if (!['strict', 'lax', 'none'].includes(cookieSameSite)) {
    console.error('❌ COOKIE_SAME_SITE geçersiz değer.');
    console.error(`   Mevcut değer: ${process.env.COOKIE_SAME_SITE}`);
    console.error('   İzin verilen değerler: strict, lax, none');
    console.error('   Varsayılan: lax');
    process.exit(1);
  }
  
  // COOKIE_DOMAIN: Opsiyonel, varsa kullan
  const cookieDomain = process.env.COOKIE_DOMAIN?.trim() || undefined;

  // CORS origins validation (production'da boş olmamalı)
  if (nodeEnv === 'production' && allowedOrigins.length === 0) {
    console.error('❌ Production ortamında CORS_ALLOWED_ORIGINS belirtilmelidir.');
    console.error('   Güvenlik için production\'da tüm origin\'lere izin verilemez.');
    process.exit(1);
  }

  return {
    JWT_SECRET: jwtSecret,
    DB_HOST: dbHost,
    DB_PORT: dbPortNum,
    DB_DATABASE: dbDatabase,
    DB_USER: dbUser,
    DB_PASSWORD: dbPassword,
    PORT: process.env.PORT ? parseInt(process.env.PORT.trim(), 10) : 5000,
    NODE_ENV: nodeEnv,
    LOG_LEVEL: logLevel,
    CORS_ALLOWED_ORIGINS: allowedOrigins,
    BODY_SIZE_LIMIT: bodySizeLimit,
    COOKIE_SECURE: cookieSecure,
    COOKIE_SAME_SITE: cookieSameSite,
    COOKIE_DOMAIN: cookieDomain,
  };
};

export const env = validateEnv();
