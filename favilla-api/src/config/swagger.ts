// src/config/swagger.ts
// Swagger/OpenAPI dokümantasyon yapılandırması
import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Favilla API',
      version: '1.0.0',
      description: 'Modern, güvenli ve ölçeklenebilir e-ticaret API dokümantasyonu',
      contact: {
        name: 'API Support',
        email: 'support@favilla.com',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Development server (v1)',
      },
      {
        url: 'https://api.favilla.com/api/v1',
        description: 'Production server (v1)',
      },
      {
        url: `http://localhost:${env.PORT}/api`,
        description: 'Development server (deprecated - use /api/v1)',
      },
      {
        url: 'https://api.favilla.com/api',
        description: 'Production server (deprecated - use /api/v1)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token ile kimlik doğrulama. Format: Bearer {token}',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Hata mesajı',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
              description: 'Validation hataları için detaylı bilgi',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              description: 'Sayfa numarası',
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: 'Sayfa başına kayıt sayısı',
            },
            total: {
              type: 'integer',
              description: 'Toplam kayıt sayısı',
            },
            totalPages: {
              type: 'integer',
              description: 'Toplam sayfa sayısı',
            },
            hasNext: {
              type: 'boolean',
              description: 'Sonraki sayfa var mı?',
            },
            hasPrev: {
              type: 'boolean',
              description: 'Önceki sayfa var mı?',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Kullanıcı ID',
            },
            name: {
              type: 'string',
              description: 'Kullanıcı adı',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'E-posta adresi',
            },
            phone: {
              type: 'string',
              description: 'Telefon numarası',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Oluşturulma tarihi',
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            slug: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            tagline: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            price: {
              type: 'number',
              format: 'float',
            },
            discountPrice: {
              type: 'number',
              format: 'float',
            },
            type: {
              type: 'string',
              enum: ['jar', 'sculptural', 'set'],
            },
            color: {
              type: 'string',
              enum: ['natural', 'charcoal', 'terracotta'],
            },
            material: {
              type: 'string',
              enum: ['soy-wax', 'beeswax', 'coconut-blend'],
            },
            image: {
              type: 'string',
              format: 'uri',
            },
            hoverImage: {
              type: 'string',
              format: 'uri',
            },
            rating: {
              type: 'number',
              format: 'float',
              minimum: 0,
              maximum: 5,
            },
            reviewCount: {
              type: 'integer',
            },
            stockQuantity: {
              type: 'integer',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Kimlik doğrulama işlemleri',
      },
      {
        name: 'Products',
        description: 'Ürün yönetimi',
      },
      {
        name: 'Cart',
        description: 'Sepet işlemleri',
      },
      {
        name: 'Orders',
        description: 'Sipariş yönetimi',
      },
      {
        name: 'Reviews',
        description: 'Ürün yorumları',
      },
      {
        name: 'Questions',
        description: 'Ürün soruları',
      },
      {
        name: 'Wishlist',
        description: 'Favoriler',
      },
      {
        name: 'User',
        description: 'Kullanıcı profili ve adres yönetimi',
      },
      {
        name: 'Support',
        description: 'Destek talepleri',
      },
      {
        name: 'Health',
        description: 'Sistem sağlık kontrolü',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/app.ts',
  ], // Swagger dokümantasyonu için dosya yolları
};

export const swaggerSpec = swaggerJsdoc(options);
