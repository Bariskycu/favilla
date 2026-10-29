// src/routes/auditRoutes.ts
// Admin audit log routes
import { Router } from 'express';
import { getAuditLogs, getAuditLogById } from '../models/auditLogModel';
import { protect } from '../middlewares/authMiddleware';
import { admin } from '../middlewares/adminMiddleware';
import { auditLogLimiter } from '../middlewares/rateLimiter';
import { asyncHandler } from '../middlewares/errorHandler';
import { Request, Response } from 'express';

const router = Router();

// Tüm route'lar admin korumalı
router.use(protect);
router.use(admin);

/**
 * GET /api/audit-logs
 * Audit log'ları listele (filtreleme ve pagination ile)
 */
router.get('/', auditLogLimiter, asyncHandler(async (req: Request, res: Response) => {
  const {
    admin_id,
    action,
    resource_type,
    resource_id,
    status,
    start_date,
    end_date,
    page,
    limit,
  } = req.query;

  const filters = {
    admin_id: admin_id as string,
    action: action as string,
    resource_type: resource_type as string,
    resource_id: resource_id as string,
    status: status as 'success' | 'failed' | 'error',
    start_date: start_date ? new Date(start_date as string) : undefined,
    end_date: end_date ? new Date(end_date as string) : undefined,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 20,
  };

  const result = await getAuditLogs(filters);

  res.status(200).json({
    success: true,
    data: result.logs,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNext: result.page < result.totalPages,
      hasPrev: result.page > 1
    }
  });
}));

/**
 * GET /api/audit-logs/:id
 * Belirli bir audit log'u getir
 */
router.get('/:id', auditLogLimiter, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const log = await getAuditLogById(id);

  if (!log) {
    return res.status(404).json({ error: 'Audit log bulunamadı' });
  }

  res.status(200).json(log);
}));

export default router;
