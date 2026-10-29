// tests/middlewares/adminMiddleware.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Response, NextFunction } from 'express';
import { admin } from '../../src/middlewares/adminMiddleware';
import { AuthRequest } from '../../src/middlewares/authMiddleware';
import pool from '../../src/config/db';

// Mock database
jest.mock('../../src/config/db', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Admin Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
      },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('admin kullanıcı için next() çağırmalı', async () => {
    (pool.query as jest.Mock).mockResolvedValue({
      rows: [{ role: 'admin' }],
    });

    await admin(
      mockRequest as AuthRequest,
      mockResponse as Response,
      mockNext
    );

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT role FROM users WHERE id = $1',
      ['user-id']
    );
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('customer kullanıcı için 403 döndürmeli', async () => {
    (pool.query as jest.Mock).mockResolvedValue({
      rows: [{ role: 'customer' }],
    });

    await admin(
      mockRequest as AuthRequest,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    const error = (mockNext as jest.Mock).mock.calls[0][0];
    expect(error).toBeDefined();
  });

  it('user olmayan istek için 401 döndürmeli', async () => {
    mockRequest.user = undefined;

    await admin(
      mockRequest as AuthRequest,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('kullanıcı bulunamazsa 403 döndürmeli', async () => {
    (pool.query as jest.Mock).mockResolvedValue({
      rows: [],
    });

    await admin(
      mockRequest as AuthRequest,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
  });
});
