// src/utils/sanitize.ts
// Input sanitization utility for XSS protection
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// DOMPurify için JSDOM window oluştur (Node.js ortamı için)
const window = new JSDOM('').window;
// @ts-ignore - JSDOM window type uyumsuzluğu
const DOMPurify = createDOMPurify(window);

/**
 * HTML içeriğini sanitize et (XSS koruması)
 * @param html HTML içeriği
 * @param options Sanitization seçenekleri
 * @returns Sanitize edilmiş HTML
 */
export const sanitizeHTML = (
  html: string,
  options: {
    allowedTags?: string[];
    allowedAttributes?: { [key: string]: string[] };
    stripTags?: boolean;
  } = {}
): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const {
    allowedTags = [],
    allowedAttributes = {},
    stripTags = false,
  } = options;

  if (stripTags) {
    // Tüm HTML tag'lerini kaldır, sadece text'i bırak
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  }

  // Belirtilen tag'ler ve attribute'lar ile sanitize et
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags.length > 0 ? allowedTags : undefined,
    ALLOWED_ATTR: Object.keys(allowedAttributes).length > 0 ? allowedAttributes : undefined,
  });
};

/**
 * Text içeriğini sanitize et (HTML tag'lerini kaldır)
 * @param text Text içeriği
 * @returns Sanitize edilmiş text
 */
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Tüm HTML tag'lerini kaldır
  return sanitizeHTML(text, { stripTags: true });
};

/**
 * String'i escape et (HTML entities)
 * @param str String
 * @returns Escaped string
 */
export const escapeHTML = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return '';
  }

  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return str.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Object'i recursive olarak sanitize et
 * @param obj Sanitize edilecek object
 * @param options Sanitization seçenekleri
 * @returns Sanitize edilmiş object
 */
export const sanitizeObject = (
  obj: any,
  options: {
    stripHTML?: boolean;
    allowedFields?: string[];
    skipFields?: string[];
  } = {}
): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  const { stripHTML = true, allowedFields, skipFields = ['password', 'token'] } = options;

  // String ise sanitize et
  if (typeof obj === 'string') {
    return stripHTML ? sanitizeText(obj) : sanitizeHTML(obj);
  }

  // Array ise her elemanı sanitize et
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, options));
  }

  // Object ise recursive olarak sanitize et
  if (typeof obj === 'object') {
    const sanitized: any = {};

    for (const key in obj) {
      // Skip edilecek field'ları atla
      if (skipFields.includes(key)) {
        sanitized[key] = obj[key];
        continue;
      }

      // Allowed fields varsa sadece onları işle
      if (allowedFields && !allowedFields.includes(key)) {
        sanitized[key] = obj[key];
        continue;
      }

      // Recursive olarak sanitize et
      sanitized[key] = sanitizeObject(obj[key], options);
    }

    return sanitized;
  }

  // Diğer tipler (number, boolean, vb.) olduğu gibi döndür
  return obj;
};

/**
 * Request body'yi sanitize et
 * @param body Request body
 * @returns Sanitize edilmiş body
 */
export const sanitizeRequestBody = (body: any): any => {
  return sanitizeObject(body, {
    stripHTML: true,
    skipFields: ['password', 'token', 'refreshToken', 'password_hash'],
  });
};

/**
 * Request query'yi sanitize et
 * @param query Request query
 * @returns Sanitize edilmiş query
 */
export const sanitizeQuery = (query: any): any => {
  return sanitizeObject(query, {
    stripHTML: true,
  });
};

/**
 * Request params'ı sanitize et
 * @param params Request params
 * @returns Sanitize edilmiş params
 */
export const sanitizeParams = (params: any): any => {
  return sanitizeObject(params, {
    stripHTML: true,
  });
};
