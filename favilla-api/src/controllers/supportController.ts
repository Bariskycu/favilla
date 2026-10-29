// src/controllers/supportController.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createTicket, getUserTickets } from '../models/supportModel';
import { CustomError, asyncHandler } from '../middlewares/errorHandler';
import { sendCreated, sendPaginated, sendSuccess } from '../utils/response';
import { parseQueryParams } from '../utils/requestValidation';

// Yeni Ticket Oluştur
export const createSupportTicket = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { subject, message, orderNo } = req.body;

  if (!subject || !message) {
    throw new CustomError('Konu ve mesaj alanları zorunludur.', 400);
  }

  const ticket = await createTicket(userId, { subject, message, orderNo });
  sendCreated(res, ticket);
});

// Ticketları Listele (Pagination destekli)
export const getMyTickets = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const query = parseQueryParams(req);
  
  // Pagination parametreleri
  const { page, limit } = query.getPagination({ defaultPage: 1, defaultLimit: 20, maxLimit: 100 });

  const result = await getUserTickets(userId, page, limit);
  
  // Paginated response
  if (result.pagination) {
    sendPaginated(res, result.data, result.pagination);
  } else {
    sendSuccess(res, result);
  }
});