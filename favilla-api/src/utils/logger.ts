// src/utils/logger.ts
// Winston logger yapılandırması
import winston from 'winston';
import path from 'path';
import { env } from '../config/env';

// Log seviyeleri
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Log seviyesi renkleri
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Log formatı
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Log formatı (dosyaya yazma için - renksiz)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console transport (development için)
const consoleTransport = new winston.transports.Console({
  format: format,
});

// File transports (production için)
const fileTransports = [
  // Tüm loglar
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  // Sadece hatalar
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Environment'a göre transport seçimi
const transports =
  env.NODE_ENV === 'production'
    ? fileTransports
    : [consoleTransport, ...fileTransports];

// Logger oluştur
const logger = winston.createLogger({
    level: env.LOG_LEVEL,
  levels,
  format: fileFormat,
  transports,
  // Exception ve rejection handler
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join('logs', 'exceptions.log') }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join('logs', 'rejections.log') }),
  ],
});

export default logger;
