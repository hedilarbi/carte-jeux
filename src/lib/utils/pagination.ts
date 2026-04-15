import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/constants/admin";
import type {
  PaginatedResult,
  PaginationInput,
  PaginationParams,
} from "@/types/common";

interface PaginationConfig {
  defaultLimit?: number;
  maxLimit?: number;
}

export function resolvePagination(
  input: PaginationInput = {},
  config: PaginationConfig = {},
): PaginationParams {
  const rawPage = Number(input.page ?? 1);
  const rawLimit = Number(input.limit ?? config.defaultLimit ?? DEFAULT_PAGE_SIZE);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit = Math.min(
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.floor(rawLimit)
      : config.defaultLimit ?? DEFAULT_PAGE_SIZE,
    config.maxLimit ?? MAX_PAGE_SIZE,
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function createPaginatedResult<T>(
  items: T[],
  totalItems: number,
  params: PaginationParams,
): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(totalItems / params.limit));

  return {
    items,
    page: params.page,
    limit: params.limit,
    totalItems,
    totalPages,
    hasPreviousPage: params.page > 1,
    hasNextPage: params.page < totalPages,
  };
}
