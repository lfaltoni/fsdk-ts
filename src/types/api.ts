// API response types — shared contracts for paginated endpoints

/** Standard paginated response shape returned by list endpoints. */
export interface PaginatedResponse<T> {
  total: number;
  page: number;
  perPage: number;
  results: T[];
}
