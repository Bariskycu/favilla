// src/utils/response.ts
// Standardized response helper utilities
import { Response } from 'express';
import { RequestWithId } from '../middlewares/requestId';
import { PaginationResult } from './pagination';

/**
 * Standard API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    requestId?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

/**
 * Paginated API response interface
 */
export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination: PaginationResult;
}

/**
 * Success response helper
 */
export const sendSuccess = <T = any>(
  res: Response,
  data: T | null = null,
  options: {
    statusCode?: number;
    message?: string;
    meta?: Record<string, any>;
  } = {}
): void => {
  const { statusCode = 200, message, meta = {} } = options;
  
  // Request ID'yi meta'ya ekle
  const requestId = (res.req as RequestWithId).requestId || res.locals.requestId;
  if (requestId) {
    meta.requestId = requestId;
  }
  
  // Timestamp ekle
  meta.timestamp = new Date().toISOString();

  const response: ApiResponse<T> = {
    success: true,
    ...(data !== null && { data }),
    ...(message && { message }),
    ...(Object.keys(meta).length > 0 && { meta }),
  };

  res.status(statusCode).json(response);
};

/**
 * Created response helper (201)
 */
export const sendCreated = <T = any>(
  res: Response,
  data: T,
  options: {
    message?: string;
    meta?: Record<string, any>;
  } = {}
): void => {
  sendSuccess(res, data, {
    statusCode: 201,
    message: options.message || 'Kayıt başarıyla oluşturuldu',
    meta: options.meta,
  });
};

/**
 * Paginated response helper
 */
export const sendPaginated = <T = any>(
  res: Response,
  data: T[],
  pagination: PaginationResult,
  options: {
    message?: string;
    meta?: Record<string, any>;
  } = {}
): void => {
  const { message, meta = {} } = options;
  
  // Request ID'yi meta'ya ekle
  const requestId = (res.req as RequestWithId).requestId || res.locals.requestId;
  if (requestId) {
    meta.requestId = requestId;
  }
  
  // Timestamp ekle
  meta.timestamp = new Date().toISOString();

  const response: PaginatedApiResponse<T> = {
    success: true,
    data,
    pagination,
    ...(message && { message }),
    ...(Object.keys(meta).length > 0 && { meta }),
  };

  res.status(200).json(response);
};

/**
 * No content response helper (204)
 */
export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};

/**
 * Deleted response helper
 */
export const sendDeleted = (
  res: Response,
  options: {
    message?: string;
    meta?: Record<string, any>;
  } = {}
): void => {
  const { message = 'Kayıt başarıyla silindi', meta = {} } = options;
  
  // Request ID'yi meta'ya ekle
  const requestId = (res.req as RequestWithId).requestId || res.locals.requestId;
  if (requestId) {
    meta.requestId = requestId;
  }
  
  // Timestamp ekle
  meta.timestamp = new Date().toISOString();

  const response: ApiResponse = {
    success: true,
    message,
    ...(Object.keys(meta).length > 0 && { meta }),
  };

  res.status(200).json(response);
};

/**
 * Updated response helper
 */
export const sendUpdated = <T = any>(
  res: Response,
  data: T,
  options: {
    message?: string;
    meta?: Record<string, any>;
  } = {}
): void => {
  sendSuccess(res, data, {
    statusCode: 200,
    message: options.message || 'Kayıt başarıyla güncellendi',
    meta: options.meta,
  });
};
