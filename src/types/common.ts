export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginationInput {
  page?: number | string | null;
  limit?: number | string | null;
}

export interface SearchablePaginationInput extends PaginationInput {
  search?: string | null;
}
