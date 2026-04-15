/**
 * Server-side table types for useServerTable and domain wrappers.
 *
 * Design decisions:
 * - `page` is 1-based (matches backend APIs). The hook converts internally
 *   from TanStack's 0-based pageIndex.
 * - `filters` is a plain Record, not TanStack's ColumnFiltersState — simpler
 *   for consumers and matches how backend APIs accept filter params.
 */

import type {
  ColumnDef,
  SortingState,
  ExpandedState,
  Table,
  Row,
  Header,
  HeaderGroup,
  Cell,
} from '@tanstack/react-table';

// ── Generic server-table interfaces ────────────────────────────

/** Parameters passed to the fetch function by the hook. */
export interface ServerTableFetchParams {
  /** Current page number (1-based). */
  page: number;
  /** Rows per page. */
  pageSize: number;
  /** Current sort state — array of { id, desc } from TanStack. */
  sorting: SortingState;
  /** Active filters as key-value pairs. */
  filters: Record<string, unknown>;
}

/** What the fetch function must return. */
export interface ServerTableFetchResult<T> {
  /** The page of data rows. */
  data: T[];
  /** Total number of rows across all pages. */
  total: number;
  /** Total number of pages. */
  pageCount: number;
}

/** The fetch function signature — provided by domain wrappers or consumers. */
export type ServerTableFetchFn<T> = (
  params: ServerTableFetchParams,
) => Promise<ServerTableFetchResult<T>>;

/** Configuration for useServerTable. */
export interface UseServerTableOptions<T> {
  /** Function that fetches a page of data from the server. */
  fetchFn: ServerTableFetchFn<T>;
  /** TanStack column definitions. */
  columns: ColumnDef<T, any>[];
  /** Initial rows per page (default 25). */
  initialPageSize?: number;
  /** Enable server-side sorting (default false). */
  enableSorting?: boolean;
  /** Enable row expansion (default false). */
  enableExpanding?: boolean;
  /** Determines which rows can expand. Only used when enableExpanding is true. */
  getRowCanExpand?: (row: Row<T>) => boolean;
  /** Initial sort state. */
  initialSorting?: SortingState;
}

/** What useServerTable returns. */
export interface UseServerTableReturn<T> {
  /** TanStack table instance — use for rendering headers, rows, cells. */
  table: Table<T>;
  /** Whether a fetch is in progress. */
  isLoading: boolean;
  /** Error message from the last failed fetch, or null. */
  error: string | null;
  /** Clear the current error. */
  clearError: () => void;
  /** Total row count from the server. */
  total: number;
  /** Re-fetch with current state. */
  refetch: () => Promise<void>;
  /** Current filter state. */
  filters: Record<string, unknown>;
  /** Set a single filter value. Resets to page 1. */
  setFilter: (key: string, value: unknown) => void;
  /** Clear all filters. Resets to page 1. */
  clearFilters: () => void;
  /** Whether any filters are active. */
  hasActiveFilters: boolean;
}

// ── Re-export TanStack types consumers need ────────────────────

export type {
  ColumnDef,
  SortingState,
  ExpandedState,
  Table as TableInstance,
  Row as TableRow,
  Header as TableHeader,
  HeaderGroup as TableHeaderGroup,
  Cell as TableCell,
};
