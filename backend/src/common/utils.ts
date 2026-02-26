import { nanoid } from 'nanoid';

export function generateId(size: number = 21): string {
  return nanoid(size);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = nanoid(6).toUpperCase();
  return `AE${year}${month}${day}${random}`;
}

export function generateInquiryNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = nanoid(6).toUpperCase();
  return `INQ${year}${month}${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculatePlatformFee(
  total: number,
  isWholesale: boolean,
  retailFeeRate: number,
  wholesaleFeeRate: number
): number {
  const feeRate = isWholesale ? wholesaleFeeRate : retailFeeRate;
  return Math.round(total * feeRate * 100) / 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function parseBoolean(value: string | boolean | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return false;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(page?: number, limit?: number): PaginationParams {
  const parsedPage = Math.max(1, page || 1);
  const parsedLimit = Math.min(100, Math.max(1, limit || 20));
  const skip = (parsedPage - 1) * parsedLimit;
  return { page: parsedPage, limit: parsedLimit, skip };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationParams
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / pagination.limit);
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasMore: pagination.page < totalPages,
    },
  };
}
