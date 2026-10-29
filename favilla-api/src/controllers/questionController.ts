// src/controllers/questionController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createQuestion, getAnsweredQuestionsByProduct, getUserQuestions } from '../models/questionModel';
import { CustomError, asyncHandler } from '../middlewares/errorHandler';
import { parseQueryParams, parseParams } from '../utils/requestValidation';
import { sendCreated, sendPaginated, sendSuccess } from '../utils/response';

// Soru Sor
export const askQuestion = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.params;
  const { question } = req.body;

  if (!question || question.trim().length < 5) {
    throw new CustomError('Soru en az 5 karakter olmalıdır.', 400);
  }

  const newQuestion = await createQuestion(userId, productId, question);
  sendCreated(res, newQuestion, { message: 'Sorunuz alındı, yanıtlandığında yayınlanacaktır.' });
});

// Ürün Sorularını Getir (Public - Pagination destekli)
export const getProductQuestions = asyncHandler(async (req: Request, res: Response) => {
  const params = parseParams(req);
  const query = parseQueryParams(req);
  
  const productId = params.getUUID('productId', { required: true })!;
  
  // Pagination parametreleri
  const { page, limit } = query.getPagination({ defaultPage: 1, defaultLimit: 10, maxLimit: 50 });

  const result = await getAnsweredQuestionsByProduct(productId, page, limit);
  
  // Paginated response
  if (result.pagination) {
    sendPaginated(res, result.data, result.pagination);
  } else {
    sendSuccess(res, result);
  }
});

// Benim Sorularım (Private - Pagination destekli)
export const getMyQuestions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const query = parseQueryParams(req);
  
  // Pagination parametreleri
  const { page, limit } = query.getPagination({ defaultPage: 1, defaultLimit: 20, maxLimit: 100 });

  const result = await getUserQuestions(userId, page, limit);
  
  // Paginated response
  if (result.pagination) {
    sendPaginated(res, result.data, result.pagination);
  } else {
    sendSuccess(res, result);
  }
});