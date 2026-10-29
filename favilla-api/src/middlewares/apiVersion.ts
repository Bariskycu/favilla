// src/middlewares/apiVersion.ts
// API versioning middleware
import { Request, Response, NextFunction } from 'express';

// Request interface'ini genişlet
export interface RequestWithVersion extends Request {
  apiVersion?: string;
}

/**
 * API version middleware
 * Request'ten API version'ı alır (header veya path'ten)
 * 
 * Version belirleme önceliği:
 * 1. X-API-Version header
 * 2. Accept header (application/vnd.api+json;version=1)
 * 3. Path'ten (/api/v1/...)
 */
export const apiVersionMiddleware = (
  req: RequestWithVersion,
  res: Response,
  next: NextFunction
): void => {
  // 1. X-API-Version header'dan al
  const headerVersion = req.headers['x-api-version'] as string;
  
  // 2. Accept header'dan al (application/vnd.api+json;version=1)
  const acceptHeader = req.headers.accept || '';
  const acceptVersionMatch = acceptHeader.match(/version=(\d+)/);
  const acceptVersion = acceptVersionMatch ? acceptVersionMatch[1] : null;
  
  // 3. Path'ten al (/api/v1/...)
  const pathMatch = req.path && typeof req.path === 'string' ? req.path.match(/^\/v(\d+)\//) : null;
  const pathVersion = pathMatch ? pathMatch[1] : null;
  
  // Version'ı belirle (öncelik sırasına göre)
  const version = headerVersion || acceptVersion || pathVersion || '1';
  
  // Request'e ekle
  req.apiVersion = version;
  
  // Response header'ına ekle
  res.setHeader('X-API-Version', version);
  
  next();
};

/**
 * Belirli bir version için route koruması
 * @param allowedVersions İzin verilen version'lar
 */
export const requireVersion = (allowedVersions: string[]) => {
  return (req: RequestWithVersion, res: Response, next: NextFunction): void => {
    const version = req.apiVersion || '1';
    
    if (!allowedVersions.includes(version)) {
      res.status(400).json({
        error: `API version ${version} desteklenmiyor. Desteklenen version'lar: ${allowedVersions.join(', ')}`,
        supportedVersions: allowedVersions,
      });
      return;
    }
    
    next();
  };
};
