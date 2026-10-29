// tests/controllers/authController.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { register, login } from '../../src/controllers/authController';
import * as userModel from '../../src/models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../src/models/userModel');
jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('geçerli kullanıcı kaydı yapmalı', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!@#',
        phone: '5551234567',
      };

      mockRequest.body = userData;

      const mockUser = {
        id: 'user-id',
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        created_at: new Date(),
      };

      (userModel.findByEmail as jest.Mock).mockResolvedValue(null);
      (userModel.createUser as jest.Mock).mockResolvedValue(mockUser);

      await register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userModel.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(userModel.createUser).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('mevcut email ile kayıt yapmaya çalışırsa hata döndürmeli', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'Test123!@#',
        phone: '5551234567',
      };

      mockRequest.body = userData;

      (userModel.findByEmail as jest.Mock).mockResolvedValue({
        id: 'existing-id',
        email: userData.email,
      });

      await register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('geçerli kullanıcı ile giriş yapmalı', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      mockRequest.body = loginData;

      const hashedPassword = await bcrypt.hash(loginData.password, 10);
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: loginData.email,
        phone: '5551234567',
        password: hashedPassword,
      };

      (userModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(userModel.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('yanlış şifre ile giriş yapmaya çalışırsa hata döndürmeli', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      mockRequest.body = loginData;

      const hashedPassword = await bcrypt.hash('CorrectPassword123!', 10);
      const mockUser = {
        id: 'user-id',
        email: loginData.email,
        password: hashedPassword,
      };

      (userModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('olmayan kullanıcı ile giriş yapmaya çalışırsa hata döndürmeli', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Test123!@#',
      };

      mockRequest.body = loginData;

      (userModel.findByEmail as jest.Mock).mockResolvedValue(null);

      await login(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
