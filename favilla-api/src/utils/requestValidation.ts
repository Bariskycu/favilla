// src/utils/requestValidation.ts
// Request validation helper utilities
// Query parameter parsing ve validation için yardımcı fonksiyonlar
import { Request } from 'express';
import { CustomError } from '../middlewares/errorHandler';
import { normalizePagination, PaginationOptions } from './pagination';

/**
 * Query parametresinden string değer al
 */
export const getQueryString = (
  query: any,
  key: string,
  options: {
    required?: boolean;
    maxLength?: number;
    trim?: boolean;
  } = {}
): string | undefined => {
  const { required = false, maxLength, trim = true } = options;
  const value = query[key];

  if (value === undefined || value === null) {
    if (required) {
      throw new CustomError(`${key} parametresi zorunludur`, 400);
    }
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new CustomError(`${key} parametresi geçerli bir string olmalıdır`, 400);
  }

  let result = trim ? value.trim() : value;

  if (result.length === 0) {
    if (required) {
      throw new CustomError(`${key} parametresi boş olamaz`, 400);
    }
    return undefined;
  }

  if (maxLength && result.length > maxLength) {
    throw new CustomError(`${key} parametresi en fazla ${maxLength} karakter olabilir`, 400);
  }

  return result;
};

/**
 * Query parametresinden number değer al
 */
export const getQueryNumber = (
  query: any,
  key: string,
  options: {
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}
): number | undefined => {
  const { required = false, min, max, integer = false } = options;
  const value = query[key];

  if (value === undefined || value === null) {
    if (required) {
      throw new CustomError(`${key} parametresi zorunludur`, 400);
    }
    return undefined;
  }

  const num = typeof value === 'string' ? parseFloat(value) : Number(value);

  if (isNaN(num)) {
    throw new CustomError(`${key} parametresi geçerli bir sayı olmalıdır`, 400);
  }

  if (integer && !Number.isInteger(num)) {
    throw new CustomError(`${key} parametresi tam sayı olmalıdır`, 400);
  }

  if (min !== undefined && num < min) {
    throw new CustomError(`${key} parametresi en az ${min} olmalıdır`, 400);
  }

  if (max !== undefined && num > max) {
    throw new CustomError(`${key} parametresi en fazla ${max} olmalıdır`, 400);
  }

  return integer ? Math.floor(num) : num;
};

/**
 * Query parametresinden boolean değer al
 */
export const getQueryBoolean = (
  query: any,
  key: string,
  options: {
    required?: boolean;
    defaultValue?: boolean;
  } = {}
): boolean | undefined => {
  const { required = false, defaultValue } = options;
  const value = query[key];

  if (value === undefined || value === null) {
    if (required && defaultValue === undefined) {
      throw new CustomError(`${key} parametresi zorunludur`, 400);
    }
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    if (lower === 'true' || lower === '1' || lower === 'yes') {
      return true;
    }
    if (lower === 'false' || lower === '0' || lower === 'no') {
      return false;
    }
  }

  throw new CustomError(`${key} parametresi geçerli bir boolean değer olmalıdır (true/false)`, 400);
};

/**
 * Query parametresinden enum değer al
 */
export const getQueryEnum = <T extends string>(
  query: any,
  key: string,
  allowedValues: T[],
  options: {
    required?: boolean;
    caseSensitive?: boolean;
  } = {}
): T | undefined => {
  const { required = false, caseSensitive = false } = options;
  const value = query[key];

  if (value === undefined || value === null) {
    if (required) {
      throw new CustomError(`${key} parametresi zorunludur. İzin verilen değerler: ${allowedValues.join(', ')}`, 400);
    }
    return undefined;
  }

  const strValue = typeof value === 'string' ? value : String(value);
  const normalizedValue = caseSensitive ? strValue : strValue.toLowerCase();
  const normalizedAllowed = caseSensitive
    ? allowedValues
    : allowedValues.map((v) => v.toLowerCase());

  const index = normalizedAllowed.indexOf(normalizedValue);

  if (index === -1) {
    throw new CustomError(
      `${key} parametresi geçersiz. İzin verilen değerler: ${allowedValues.join(', ')}`,
      400
    );
  }

  return allowedValues[index];
};

/**
 * Query parametresinden pagination bilgilerini al ve validate et
 */
export const getQueryPagination = (
  query: any,
  options: {
    defaultPage?: number;
    defaultLimit?: number;
    maxLimit?: number;
  } = {}
): { page: number; limit: number; offset: number } => {
  const { defaultPage = 1, defaultLimit = 20, maxLimit = 100 } = options;

  const page = getQueryNumber(query, 'page', {
    required: false,
    min: 1,
    integer: true,
  }) || defaultPage;

  const limit = getQueryNumber(query, 'limit', {
    required: false,
    min: 1,
    max: maxLimit,
    integer: true,
  }) || defaultLimit;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Query parametresinden date değer al
 */
export const getQueryDate = (
  query: any,
  key: string,
  options: {
    required?: boolean;
    minDate?: Date;
    maxDate?: Date;
  } = {}
): Date | undefined => {
  const { required = false, minDate, maxDate } = options;
  const value = query[key];

  if (value === undefined || value === null) {
    if (required) {
      throw new CustomError(`${key} parametresi zorunludur`, 400);
    }
    return undefined;
  }

  const date = typeof value === 'string' ? new Date(value) : new Date(value);

  if (isNaN(date.getTime())) {
    throw new CustomError(`${key} parametresi geçerli bir tarih formatı olmalıdır (ISO 8601)`, 400);
  }

  if (minDate && date < minDate) {
    throw new CustomError(`${key} parametresi ${minDate.toISOString()} tarihinden sonra olmalıdır`, 400);
  }

  if (maxDate && date > maxDate) {
    throw new CustomError(`${key} parametresi ${maxDate.toISOString()} tarihinden önce olmalıdır`, 400);
  }

  return date;
};

/**
 * Query parametresinden UUID değer al
 */
export const getQueryUUID = (
  query: any,
  key: string,
  options: {
    required?: boolean;
  } = {}
): string | undefined => {
  const { required = false } = options;
  const value = getQueryString(query, key, { required, trim: true });

  if (!value) {
    return undefined;
  }

  // UUID format kontrolü (basit regex)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(value)) {
    throw new CustomError(`${key} parametresi geçerli bir UUID formatında olmalıdır`, 400);
  }

  return value;
};

/**
 * Request'ten query parametrelerini parse et (helper wrapper)
 */
export const parseQueryParams = (req: Request) => {
  return {
    getString: (key: string, options?: Parameters<typeof getQueryString>[2]) =>
      getQueryString(req.query, key, options),
    getNumber: (key: string, options?: Parameters<typeof getQueryNumber>[2]) =>
      getQueryNumber(req.query, key, options),
    getBoolean: (key: string, options?: Parameters<typeof getQueryBoolean>[2]) =>
      getQueryBoolean(req.query, key, options),
    getEnum: <T extends string>(key: string, allowedValues: T[], options?: Parameters<typeof getQueryEnum>[3]) =>
      getQueryEnum(req.query, key, allowedValues, options),
    getPagination: (options?: Parameters<typeof getQueryPagination>[1]) =>
      getQueryPagination(req.query, options),
    getDate: (key: string, options?: Parameters<typeof getQueryDate>[2]) =>
      getQueryDate(req.query, key, options),
    getUUID: (key: string, options?: Parameters<typeof getQueryUUID>[2]) =>
      getQueryUUID(req.query, key, options),
  };
};

/**
 * Request'ten params parametrelerini parse et
 */
export const parseParams = (req: Request) => {
  return {
    getString: (key: string, options?: Parameters<typeof getQueryString>[2]) =>
      getQueryString(req.params, key, options),
    getNumber: (key: string, options?: Parameters<typeof getQueryNumber>[2]) =>
      getQueryNumber(req.params, key, options),
    getUUID: (key: string, options?: Parameters<typeof getQueryUUID>[2]) =>
      getQueryUUID(req.params, key, options),
  };
};
