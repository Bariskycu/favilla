// tests/middlewares/errorHandler.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { errorHandler, CustomError, ValidationError } from '../../src/middlewares/errorHandler';

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('Error Handler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      originalUrl: '/api/test',
      ip: '127.0.0.1',
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('CustomError ile 400 hatası döndürmeli', () => {
    const error = new CustomError('Test error', 400);

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Test error',
    });
  });

  it('ValidationError ile details döndürmeli', () => {
    const details = [
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Password too short' },
    ];
    const error = new ValidationError('Validation failed', details);

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      details,
    });
  });

  it('PostgreSQL unique constraint hatasını handle etmeli', () => {
    const error: any = new Error('Duplicate key');
    error.code = '23505';

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Bu kayıt zaten mevcut',
    });
  });

  it('JWT hatasını handle etmeli', () => {
    const error: any = new Error('Invalid token');
    error.name = 'JsonWebTokenError';

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Geçersiz token',
    });
  });

  it('Bilinmeyen hatayı 500 olarak handle etmeli', () => {
    const error = new Error('Unknown error');
    process.env.NODE_ENV = 'test';

    errorHandler(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalled();
  });
});
