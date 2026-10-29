// src/utils/auditLogger.ts
// Admin audit logging helper utility
import { Request } from 'express';
import { createAuditLog, CreateAuditLogData } from '../models/auditLogModel';
import { RequestWithId } from '../middlewares/requestId';
import { AuthRequest } from '../middlewares/authMiddleware';
import logger from './logger';

export interface AuditLogContext {
  action: string;
  resource_type: string;
  resource_id?: string;
  description?: string;
  old_values?: any;
  new_values?: any;
  status?: 'success' | 'failed' | 'error';
  error_message?: string;
}

/**
 * Admin audit log oluştur
 * @param req Request object (AuthRequest ve RequestWithId olmalı)
 * @param context Audit log context
 */
export const logAdminAction = async (
  req: AuthRequest & RequestWithId,
  context: AuditLogContext
): Promise<void> => {
  try {
    // Admin ID kontrolü
    if (!req.user || !req.user.id) {
      logger.warn('Audit log oluşturulamadı: Admin ID bulunamadı');
      return;
    }

    const auditData: CreateAuditLogData = {
      admin_id: req.user.id,
      action: context.action,
      resource_type: context.resource_type,
      resource_id: context.resource_id,
      description: context.description,
      old_values: context.old_values,
      new_values: context.new_values,
      ip_address: req.ip || req.socket.remoteAddress || undefined,
      user_agent: req.headers['user-agent'] || undefined,
      request_id: req.requestId || undefined,
      status: context.status || 'success',
      error_message: context.error_message,
    };

    await createAuditLog(auditData);
  } catch (error) {
    // Audit log oluşturma hatası kritik değil, sadece log'a yaz
    logger.error(`Audit log oluşturulamadı: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Helper: Product işlemleri için audit log
 */
export const logProductAction = async (
  req: AuthRequest & RequestWithId,
  action: 'create' | 'update' | 'delete',
  productId: string,
  oldValues?: any,
  newValues?: any,
  error?: Error
): Promise<void> => {
  const descriptions = {
    create: 'Yeni ürün oluşturuldu',
    update: 'Ürün güncellendi',
    delete: 'Ürün silindi',
  };

  await logAdminAction(req, {
    action: `product.${action}`,
    resource_type: 'product',
    resource_id: productId,
    description: descriptions[action],
    old_values: oldValues,
    new_values: newValues,
    status: error ? 'error' : 'success',
    error_message: error?.message,
  });
};

/**
 * Helper: Order işlemleri için audit log
 */
export const logOrderAction = async (
  req: AuthRequest & RequestWithId,
  action: 'update' | 'cancel' | 'refund',
  orderId: string,
  oldValues?: any,
  newValues?: any,
  error?: Error
): Promise<void> => {
  const descriptions = {
    update: 'Sipariş güncellendi',
    cancel: 'Sipariş iptal edildi',
    refund: 'Sipariş iade edildi',
  };

  await logAdminAction(req, {
    action: `order.${action}`,
    resource_type: 'order',
    resource_id: orderId,
    description: descriptions[action],
    old_values: oldValues,
    new_values: newValues,
    status: error ? 'error' : 'success',
    error_message: error?.message,
  });
};

/**
 * Helper: User işlemleri için audit log
 */
export const logUserAction = async (
  req: AuthRequest & RequestWithId,
  action: 'update' | 'delete' | 'activate' | 'deactivate',
  userId: string,
  oldValues?: any,
  newValues?: any,
  error?: Error
): Promise<void> => {
  const descriptions = {
    update: 'Kullanıcı güncellendi',
    delete: 'Kullanıcı silindi',
    activate: 'Kullanıcı aktif edildi',
    deactivate: 'Kullanıcı deaktif edildi',
  };

  await logAdminAction(req, {
    action: `user.${action}`,
    resource_type: 'user',
    resource_id: userId,
    description: descriptions[action],
    old_values: oldValues,
    new_values: newValues,
    status: error ? 'error' : 'success',
    error_message: error?.message,
  });
};
