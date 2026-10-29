// src/config/cors.ts
// CORS yapılandırması
import cors, { CorsOptions } from 'cors';
import { env } from './env';

// CORS seçenekleri
const corsOptions: CorsOptions = {
  // Sadece izin verilen origin'lerden gelen isteklere izin ver
  origin: (origin, callback) => {
    // Origin yoksa (örneğin: Postman, curl, mobile app)
    // Bu durumda izin ver (opsiyonel - ihtiyacınıza göre değiştirebilirsiniz)
    if (!origin) {
      // Production'da origin olmayan isteklere izin vermemek daha güvenli
      // Ama development için gerekli olabilir
      if (env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      // Production'da origin olmayan isteklere izin verme
      return callback(new Error('CORS: Origin header eksik'));
    }

    // İzin verilen origin listesinde var mı kontrol et
    if (env.CORS_ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: ${origin} origin'ine izin verilmiyor`));
    }
  },
  
  // Credentials (cookies, authorization headers) gönderilmesine izin ver
  credentials: true,
  
  // İzin verilen HTTP metodları
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // İzin verilen header'lar
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  
  // Exposed headers (client tarafında erişilebilir header'lar)
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  
  // Preflight request'lerin cache süresi (saniye)
  maxAge: 86400, // 24 saat
};

export default cors(corsOptions);
