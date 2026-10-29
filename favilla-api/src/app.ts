import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import url from 'url';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';
import supportRoutes from './routes/supportRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import reviewRoutes from './routes/reviewRoutes';
import questionRoutes from './routes/questionRoutes';
import auditRoutes from './routes/auditRoutes';
import uploadRoutes from './routes/uploadRoutes';
import paymentRoutes from './routes/paymentRoutes';
import { generalLimiter } from './middlewares/rateLimiter';
import corsMiddleware from './config/cors';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { requestLogger, responseTimeLogger } from './middlewares/requestLogger';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import pool from './config/db';
import logger from './utils/logger';
import { getPoolMetrics, checkPoolHealth } from './utils/poolMonitoring';
import path from 'path';
const app: Express = express();

// --- MIDDLEWARELER (Route'lardan ÖNCE Olmalı!) ---
try {
  app.use(helmet());
} catch (e: any) {
  logger.error('Helmet middleware error:', e);
  throw e;
}

// CORS: Sadece izin verilen origin'lerden gelen isteklere izin ver
try {
  if (typeof corsMiddleware !== 'function') {
    throw new Error(`corsMiddleware is not a function, got: ${typeof corsMiddleware}`);
  }
  app.use(corsMiddleware);
} catch (e: any) {
  logger.error('CORS middleware error:', e);
  throw e;
}

// Request ID tracking (en başta olmalı - diğer middleware'lerden önce)
import { requestIdMiddleware } from './middlewares/requestId';
try {
  if (typeof requestIdMiddleware !== 'function') {
    throw new Error(`requestIdMiddleware is not a function, got: ${typeof requestIdMiddleware}`);
  }
  app.use(requestIdMiddleware);
} catch (e: any) {
  logger.error('Request ID middleware error:', e);
  throw e;
}

// Request logging (request ID'den sonra olmalı)
try {
  if (typeof responseTimeLogger !== 'function') {
    throw new Error(`responseTimeLogger is not a function, got: ${typeof responseTimeLogger}`);
  }
  app.use(responseTimeLogger);
} catch (e: any) {
  logger.error('Response time logger error:', e);
  throw e;
}

try {
  if (typeof requestLogger !== 'function') {
    throw new Error(`requestLogger is not a function, got: ${typeof requestLogger}`);
  }
  app.use(requestLogger);
} catch (e: any) {
  logger.error('Request logger error:', e);
  throw e;
}

// Cookie parser - HttpOnly cookie'ler için gerekli
try {
  app.use(cookieParser());
} catch (e: any) {
  logger.error('Cookie parser error:', e);
  throw e;
}

// 👇 BU SATIR ÇOK ÖNEMLİ! JSON verisini okumamızı sağlar.
// Body size limitleri (DoS koruması)
// Environment'dan limit al, yoksa varsayılan 1mb kullan
const bodyLimit = env.BODY_SIZE_LIMIT;
try {
  app.use(express.json({ limit: bodyLimit })); // JSON body size limiti
  app.use(express.urlencoded({ extended: true, limit: bodyLimit })); // URL-encoded body size limiti
} catch (e: any) {
  logger.error('Body parser error:', e);
  throw e;
}

// Input sanitization (XSS koruması) - Body parse'dan sonra, route'lardan önce
import { sanitizeInput } from './middlewares/sanitize';
try {
  if (typeof sanitizeInput !== 'function') {
    throw new Error(`sanitizeInput is not a function, got: ${typeof sanitizeInput}`);
  }
  app.use(sanitizeInput);
} catch (e: any) {
  logger.error('Sanitize input error:', e);
  throw e;
}

// Path normalization middleware - Fix duplicate /api/v1 prefixes
// This must be placed after body parsing but before route matching
// Express'in URL parsing mekanizmasını kullanarak internal state'i güncelle
app.use((req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if URL has duplicate /api/v1 prefix (e.g., /api/v1/api/v1/auth/login)
    if (req.originalUrl && typeof req.originalUrl === 'string' && req.originalUrl.includes('/api/v1/api/v1')) {
      // Rewrite the URL by removing the duplicate prefix
      const correctedUrl = req.originalUrl.replace(/\/api\/v1\/api\/v1/g, '/api/v1');

      if (correctedUrl && typeof correctedUrl === 'string') {
        // Parse the corrected URL to extract path and query
        const parsedUrl = url.parse(correctedUrl, true);

        // Update req.url (Express uses this for route matching)
        req.url = correctedUrl;

        // Express'in internal state'ini güncelle
        // _parsedUrl Express'in internal URL parsing cache'idir
        // Bu güncelleme olmadan req.path undefined kalabilir
        if ((req as any)._parsedUrl) {
          (req as any)._parsedUrl.pathname = parsedUrl.pathname || '';
          (req as any)._parsedUrl.path = correctedUrl.split('?')[0]; // Query string olmadan path
          (req as any)._parsedUrl.query = parsedUrl.query || {};
          (req as any)._parsedUrl.search = parsedUrl.search || null;
        } else {
          // Eğer _parsedUrl yoksa oluştur
          (req as any)._parsedUrl = {
            pathname: parsedUrl.pathname || '',
            path: correctedUrl.split('?')[0],
            query: parsedUrl.query || {},
            search: parsedUrl.search || null,
          };
        }

        // req.query'yi güncelle (Express'in query parser'ı çalıştıktan sonra)
        if (parsedUrl.query && Object.keys(parsedUrl.query).length > 0) {
          // Mevcut query'yi temizle
          const currentQueryKeys = Object.keys(req.query);
          currentQueryKeys.forEach(key => {
            delete (req.query as any)[key];
          });
          // Yeni query'yi ekle
          Object.assign(req.query, parsedUrl.query);
        }
      }
    }
    next();
  } catch (error) {
    // If URL rewriting fails, log and continue with original URL
    logger.warn('Path normalization error:', error);
    next();
  }
});

// --- ROUTE TANIMLARI ---
/**
 * @swagger
 * /:
 *   get:
 *     summary: API durum kontrolü
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API çalışıyor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: API Çalışıyor
 */
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API Çalışıyor' });
});

// Swagger UI - API Dokümantasyonu (Rate limiter'dan önce, muaf tutulmalı)
// swaggerUi.serve returns an array in v5, so we need to spread it
try {
  const serveMiddleware = swaggerUi.serve;
  const setupMiddleware = swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Favilla API Documentation',
  });

  // Verify setupMiddleware is a function
  if (typeof setupMiddleware !== 'function') {
    logger.error('swaggerUi.setup did not return a function');
    throw new Error('swaggerUi.setup did not return a function');
  }

  if (Array.isArray(serveMiddleware)) {
    app.use('/api-docs', ...serveMiddleware, setupMiddleware);
  } else if (typeof serveMiddleware === 'function') {
    app.use('/api-docs', serveMiddleware, setupMiddleware);
  } else {
    logger.error('swaggerUi.serve is not a function or array');
    throw new Error('swaggerUi.serve is not a function or array');
  }
} catch (error) {
  logger.error('Swagger setup hatası:', error);
  // Swagger olmadan devam et
}

// Swagger JSON endpoint
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Sistem sağlık kontrolü
 *     description: API ve veritabanı bağlantısının durumunu kontrol eder
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Sistem sağlıklı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ok, degraded, error]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: integer
 *                   description: Saniye cinsinden çalışma süresi
 *                 environment:
 *                   type: string
 *                 version:
 *                   type: string
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       enum: [ok, error, unknown]
 *       503:
 *         description: Sistem sorunlu
 */
// Health check endpoint (monitoring için - Rate limiter'dan önce, muaf tutulmalı)
app.get('/api/health', async (req: Request, res: Response) => {
  const healthCheck = {
    status: 'ok' as 'ok' | 'degraded' | 'error',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()), // Saniye cinsinden
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'unknown' as 'ok' | 'error' | 'unknown',
      pool: 'unknown' as 'ok' | 'warning' | 'critical' | 'unknown',
    },
    poolMetrics: null as any,
  };

  // Database bağlantısını kontrol et (timeout ile, retry mekanizması ile)
  try {
    const startTime = Date.now();
    const { queryWithRetry } = await import('./utils/dbRetry');

    const result = await Promise.race([
      queryWithRetry(pool, 'SELECT 1 as health', [], {
        maxRetries: 2, // Health check için daha az retry
        initialDelay: 500,
        maxDelay: 2000,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      ),
    ]) as any;

    if (result.rows && result.rows.length > 0) {
      healthCheck.checks.database = 'ok';
    } else {
      healthCheck.checks.database = 'error';
      healthCheck.status = 'degraded';
    }
  } catch (error) {
    healthCheck.checks.database = 'error';
    healthCheck.status = 'degraded';
  }

  // Pool health check
  try {
    const poolHealth = checkPoolHealth(pool);
    healthCheck.checks.pool = poolHealth.status === 'healthy' ? 'ok' : poolHealth.status;
    healthCheck.poolMetrics = getPoolMetrics(pool);

    // Pool kritikse genel durumu degraded yap
    if (poolHealth.status === 'critical' && healthCheck.status === 'ok') {
      healthCheck.status = 'degraded';
    }
  } catch (error) {
    healthCheck.checks.pool = 'unknown';
    logger.error('Pool health check hatası:', error);
  }

  // Tüm check'ler başarılıysa 200, değilse 503 döndür
  const statusCode = healthCheck.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// Rate Limiting: Tüm API için genel limit (health check'ten sonra)
try {
  if (typeof generalLimiter !== 'function') {
    throw new Error(`generalLimiter is not a function, got: ${typeof generalLimiter}`);
  }
  app.use('/api', generalLimiter);
} catch (e: any) {
  logger.error('General limiter error:', e);
  throw e;
}

// API Versioning middleware
import { apiVersionMiddleware } from './middlewares/apiVersion';
try {
  if (typeof apiVersionMiddleware !== 'function') {
    throw new Error(`apiVersionMiddleware is not a function, got: ${typeof apiVersionMiddleware}`);
  }
  app.use('/api', apiVersionMiddleware);
} catch (e: any) {
  logger.error('API version middleware error:', e);
  throw e;
}

// API Version 1 routes
const v1Router = express.Router();

// Validate all routes are properly imported
const routes = {
  auth: authRoutes,
  products: productRoutes,
  users: userRoutes,
  support: supportRoutes,
  wishlist: wishlistRoutes,
  cart: cartRoutes,
  orders: orderRoutes,
  reviews: reviewRoutes,
  questions: questionRoutes,
  audit: auditRoutes,
  upload: uploadRoutes,
  payment: paymentRoutes,
};

// Check for undefined routes and verify they are Router instances
for (const [name, route] of Object.entries(routes)) {
  if (!route) {
    logger.error(`Route ${name} is undefined. Check import statement.`);
    throw new Error(`Route ${name} is undefined. Check import statement.`);
  }
  // Check if route is a Router instance (has use method)
  const routeAny = route as any;
  if (typeof routeAny !== 'function' && typeof routeAny.use !== 'function') {
    logger.error(`Route ${name} is not a valid Express Router. Type: ${typeof route}`);
    throw new Error(`Route ${name} is not a valid Express Router.`);
  }
}

// V1 routes
try {
  v1Router.use('/auth', routes.auth);
  v1Router.use('/products', routes.products);
  v1Router.use('/users', routes.users);
  v1Router.use('/support', routes.support);
  v1Router.use('/wishlist', routes.wishlist);
  v1Router.use('/cart', routes.cart);
  v1Router.use('/orders', routes.orders);
  v1Router.use('/reviews', routes.reviews);
  v1Router.use('/questions', routes.questions);
  v1Router.use('/audit-logs', routes.audit);
  v1Router.use('/upload', routes.upload);
  v1Router.use('/payment', routes.payment);
} catch (e: any) {
  logger.error('V1 router setup error:', e);
  throw e;
}

// Mount versioned routes
try {
  app.use('/api/v1', v1Router);
} catch (e: any) {
  logger.error('Mounting v1 router error:', e);
  throw e;
}

// Backward compatibility: Mount old routes with deprecated header
// Eski route'lar hala çalışıyor ama deprecated olarak işaretleniyor
const deprecatedMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-API-Deprecated', 'true');
  res.setHeader('X-API-Version', '1');
  res.setHeader('Warning', '299 - "This API endpoint is deprecated. Please use /api/v1 instead."');
  logger.warn(`Deprecated API endpoint used: ${req.method} ${req.originalUrl} - Use /api/v1 instead`);
  next();
};

try {
  if (typeof deprecatedMiddleware !== 'function') {
    throw new Error(`deprecatedMiddleware is not a function, got: ${typeof deprecatedMiddleware}`);
  }
  app.use('/api/auth', deprecatedMiddleware, routes.auth);
  app.use('/api/products', deprecatedMiddleware, routes.products);
  app.use('/api/users', deprecatedMiddleware, routes.users);
  app.use('/api/support', deprecatedMiddleware, routes.support);
  app.use('/api/wishlist', deprecatedMiddleware, routes.wishlist);
  app.use('/api/cart', deprecatedMiddleware, routes.cart);
  app.use('/api/orders', deprecatedMiddleware, routes.orders);
  app.use('/api/reviews', deprecatedMiddleware, routes.reviews);
  app.use('/api/questions', deprecatedMiddleware, routes.questions);
  app.use('/api/audit-logs', deprecatedMiddleware, routes.audit);
  app.use('/api/upload', deprecatedMiddleware, routes.upload);
  app.use('/api/payment', deprecatedMiddleware, routes.payment);
} catch (e: any) {
  logger.error('Deprecated routes setup error:', e);
  throw e;
}

// --- ERROR HANDLING (Route'lardan SONRA Olmalı!) ---
// 404 Not Found handler
try {
  if (typeof notFoundHandler !== 'function') {
    throw new Error(`notFoundHandler is not a function, got: ${typeof notFoundHandler}`);
  }
  app.use(notFoundHandler);
} catch (e: any) {
  logger.error('Not found handler error:', e);
  throw e;
}

// Global error handler (en sonda olmalı)
try {
  if (typeof errorHandler !== 'function') {
    throw new Error(`errorHandler is not a function, got: ${typeof errorHandler}`);
  }
  app.use(errorHandler);
} catch (e: any) {
  logger.error('Error handler error:', e);
  throw e;
}

export default app;

