// src/controllers/orderController.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getUserOrders, getOrderById } from '../models/orderModel';
import { CustomError, asyncHandler } from '../middlewares/errorHandler';
import { sendPaginated, sendSuccess } from '../utils/response';
import { parseQueryParams } from '../utils/requestValidation';

// Sipariş Geçmişini Listele (Pagination destekli)
export const getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const query = parseQueryParams(req);
  
  // Pagination parametreleri
  const { page, limit } = query.getPagination({ defaultPage: 1, defaultLimit: 20, maxLimit: 100 });

  const result = await getUserOrders(userId, page, limit);
  
  // Paginated response
  if (result.pagination) {
    sendPaginated(res, result.data, result.pagination);
  } else {
    sendSuccess(res, result);
  }
});

// Sipariş Detayını Görüntüle
export const getOrderDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const order = await getOrderById(id, userId);

  if (!order) {
    throw new CustomError('Sipariş bulunamadı veya size ait değil.', 404);
  }

  sendSuccess(res, order);
});