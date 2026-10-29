// tests/middlewares/authMiddleware.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { protect, AuthRequest } from '../../src/middlewares/authMiddleware';
import { env } from '../../src/config/env';

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: any;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      ip: '127.0.0.1',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('geçerli token ile isteği kabul etmeli', () => {
    const token = jwt.sign(
      { id: 'user-id', email: 'test@example.com' },
      env.JWT_SECRET
    );

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    protect(
      mockRequest as AuthRequest,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user?.id).toBe('user-id');
    expect(mockRequest.user?.email).toBe('test@example.com');
  });

  it('token olmadan isteği reddetmeli', () => {
    mockRequest.headers = {};

    protect(
      mockRequest as AuthRequest,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('geçersiz token ile isteği reddetmeli', () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid-token',
    };

    protect(
      mockRequest as AuthRequest,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('yanlış format token ile isteği reddetmeli', () => {
    mockRequest.headers = {
      authorization: 'InvalidFormat token',
    };

    protect(
      mockRequest as AuthRequest,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Bearer olmadan token ile isteği reddetmeli', () => {
    const token = jwt.sign(
      { id: 'user-id', email: 'test@example.com' },
      env.JWT_SECRET
    );

    mockRequest.headers = {
      authorization: token,
    };

    protect(
      mockRequest as AuthRequest,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
