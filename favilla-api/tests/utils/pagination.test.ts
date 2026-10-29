// tests/utils/pagination.test.ts
import { describe, it, expect } from '@jest/globals';
import {
  normalizePagination,
  createPaginationResult,
  parsePaginationFromQuery,
  validatePagination,
} from '../../src/utils/pagination';

describe('Pagination Utils', () => {
  describe('normalizePagination', () => {
    it('varsayılan değerlerle pagination normalize etmeli', () => {
      const result = normalizePagination();

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });

    it('özel page ve limit ile pagination normalize etmeli', () => {
      const result = normalizePagination({ page: 2, limit: 10 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(10);
    });

    it('geçersiz page değerini 1 yapmalı', () => {
      const result = normalizePagination({ page: 0, limit: 20 });

      expect(result.page).toBe(1);
      expect(result.offset).toBe(0);
    });

    it('limit değerini maksimum 100 ile sınırlamalı', () => {
      const result = normalizePagination({ page: 1, limit: 200 });

      expect(result.limit).toBe(100);
    });
  });

  describe('createPaginationResult', () => {
    it('doğru pagination sonucu oluşturmalı', () => {
      const result = createPaginationResult(100, 1, 20);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.total).toBe(100);
      expect(result.totalPages).toBe(5);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(false);
    });

    it('hasNext ve hasPrev değerlerini doğru hesaplamalı', () => {
      const firstPage = createPaginationResult(100, 1, 20);
      expect(firstPage.hasNext).toBe(true);
      expect(firstPage.hasPrev).toBe(false);

      const middlePage = createPaginationResult(100, 3, 20);
      expect(middlePage.hasNext).toBe(true);
      expect(middlePage.hasPrev).toBe(true);

      const lastPage = createPaginationResult(100, 5, 20);
      expect(lastPage.hasNext).toBe(false);
      expect(lastPage.hasPrev).toBe(true);
    });

    it('toplam kayıt 0 ise doğru değerler döndürmeli', () => {
      const result = createPaginationResult(0, 1, 20);

      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(false);
    });
  });

  describe('parsePaginationFromQuery', () => {
    it('query string\'den pagination parametrelerini parse etmeli', () => {
      const query = { page: '2', limit: '10' };
      const result = parsePaginationFromQuery(query);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });

    it('query string boşsa undefined döndürmeli', () => {
      const result = parsePaginationFromQuery({});

      expect(result.page).toBeUndefined();
      expect(result.limit).toBeUndefined();
    });
  });

  describe('validatePagination', () => {
    it('geçerli pagination parametrelerini kabul etmeli', () => {
      expect(() => validatePagination(1, 20)).not.toThrow();
    });

    it('geçersiz page değerini reddetmeli', () => {
      expect(() => validatePagination(0, 20)).toThrow();
      expect(() => validatePagination(-1, 20)).toThrow();
    });

    it('geçersiz limit değerini reddetmeli', () => {
      expect(() => validatePagination(1, 0)).toThrow();
      expect(() => validatePagination(1, 101)).toThrow();
    });
  });
});
