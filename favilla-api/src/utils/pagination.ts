// src/utils/pagination.ts
// Pagination yardımcı fonksiyonları

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationResult;
}

/**
 * Pagination parametrelerini normalize eder
 */
export const normalizePagination = (options: PaginationOptions = {}): { page: number; limit: number; offset: number } => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20)); // Varsayılan: 20, maksimum: 100
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Pagination sonucu oluşturur
 */
export const createPaginationResult = (
  total: number,
  page: number,
  limit: number
): PaginationResult => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * Query string'den pagination parametrelerini parse eder
 */
export const parsePaginationFromQuery = (query: any): PaginationOptions => {
  return {
    page: query.page ? parseInt(query.page as string, 10) : undefined,
    limit: query.limit ? parseInt(query.limit as string, 10) : undefined,
  };
};

/**
 * Pagination parametrelerini validate eder
 */
export const validatePagination = (page?: number, limit?: number): void => {
  if (page !== undefined && (isNaN(page) || page < 1)) {
    throw new Error('Page parametresi geçerli bir sayı olmalıdır (1 veya daha büyük)');
  }
  if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
    throw new Error('Limit parametresi 1-100 arasında olmalıdır');
  }
};
