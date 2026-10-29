// tests/controllers/validate.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../src/middlewares/validate';
import { ValidationError } from '../../src/middlewares/errorHandler';

describe('Validate Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('geçerli veri ile next() çağırmalı', async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
        email: z.string().email(),
      }),
    });

    mockRequest.body = {
      name: 'Test User',
      email: 'test@example.com',
    };

    const middleware = validate(schema);
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('geçersiz veri ile ValidationError fırlatmalı', async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
        email: z.string().email(),
      }),
    });

    mockRequest.body = {
      name: 'Test User',
      email: 'invalid-email', // Geçersiz email
    };

    const middleware = validate(schema);
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    const error = (mockNext as jest.Mock).mock.calls[0][0];
    expect(error).toBeInstanceOf(ValidationError);
  });

  it('query parametrelerini validate etmeli', async () => {
    const schema = z.object({
      query: z.object({
        page: z.string().transform((val) => parseInt(val, 10)),
      }),
    });

    mockRequest.query = {
      page: '1',
    };

    const middleware = validate(schema);
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
  });

  it('params parametrelerini validate etmeli', async () => {
    const schema = z.object({
      params: z.object({
        id: z.string().uuid(),
      }),
    });

    mockRequest.params = {
      id: '123e4567-e89b-12d3-a456-426614174000',
    };

    const middleware = validate(schema);
    await middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
  });
});
