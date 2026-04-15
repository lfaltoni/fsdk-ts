/**
 * Generic headless hook for server-side paginated, sortable, filterable tables.
 *
 * Wraps @tanstack/react-table with:
 * - Server-side pagination (manualPagination)
 * - Optional server-side sorting (manualSorting)
 * - Custom filter state (simple key-value, not TanStack ColumnFiltersState)
 * - Auto-fetch on state change
 * - Stale request protection
 * - Loading/error state management
 *
 * Domain wrappers (useAuditTable, etc.) compose this hook with a pre-configured
 * fetchFn and default columns. Consumer apps render all UI.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
} from '@tanstack/react-table';
import type { PaginationState, SortingState, ExpandedState } from '@tanstack/react-table';
import type {
  UseServerTableOptions,
  UseServerTableReturn,
  ServerTableFetchParams,
} from './types';
import { getLogger } from '../utils/logging';

const logger = getLogger('useServerTable');

export function useServerTable<T>(
  options: UseServerTableOptions<T>,
): UseServerTableReturn<T> {
  const {
    fetchFn,
    columns,
    initialPageSize = 25,
    enableSorting = false,
    enableExpanding = false,
    getRowCanExpand,
    initialSorting = [],
  } = options;

  // ── Server data state ──────────────────────────────────────

  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── TanStack controlled state ──────────────────────────────

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // ── Custom filter state ────────────────────────────────────

  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const setFilter = useCallback((key: string, value: unknown) => {
    setFilters(prev => {
      if (value === '' || value === null || value === undefined) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const hasActiveFilters = useMemo(
    () => Object.keys(filters).length > 0,
    [filters],
  );

  const clearError = useCallback(() => setError(null), []);

  // ── Stale request protection ───────────────────────────────

  const fetchIdRef = useRef(0);
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  // ── Data fetching ──────────────────────────────────────────

  const fetchData = useCallback(async () => {
    const fetchId = ++fetchIdRef.current;
    setIsLoading(true);
    setError(null);

    const params: ServerTableFetchParams = {
      page: pagination.pageIndex + 1,  // 0-based → 1-based
      pageSize: pagination.pageSize,
      sorting,
      filters,
    };

    try {
      const result = await fetchFnRef.current(params);

      // Discard if a newer fetch has started
      if (fetchId !== fetchIdRef.current) {
        logger.info('Stale fetch discarded', { fetchId });
        return;
      }

      setData(result.data);
      setTotal(result.total);
      setPageCount(result.pageCount);
      logger.info('Table data loaded', { total: result.total, pageCount: result.pageCount, page: params.page });
    } catch (err) {
      if (fetchId !== fetchIdRef.current) return;
      const msg = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(msg);
      logger.error('Table fetch failed', { error: msg });
    } finally {
      if (fetchId === fetchIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting, filters]);

  // Auto-fetch when state changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── TanStack Table instance ────────────────────────────────

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(enableExpanding && { getExpandedRowModel: getExpandedRowModel() }),

    // Server-side pagination — always manual
    manualPagination: true,
    pageCount,
    onPaginationChange: setPagination,

    // Server-side sorting — only when enabled
    ...(enableSorting && {
      manualSorting: true,
      enableSorting: true,
      onSortingChange: setSorting,
    }),
    ...(!enableSorting && {
      enableSorting: false,
    }),

    // Expansion
    ...(enableExpanding && getRowCanExpand && { getRowCanExpand }),
    onExpandedChange: setExpanded,

    state: {
      pagination,
      sorting,
      expanded,
    },
  });

  // ── Return ─────────────────────────────────────────────────

  return {
    table,
    isLoading,
    error,
    clearError,
    total,
    refetch: fetchData,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
  };
}
