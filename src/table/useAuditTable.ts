/**
 * Audit domain wrapper for useServerTable.
 *
 * Provides default columns matching AuditEntry and a fetch adapter for
 * auditApi.query(). Consumer apps render all UI — this hook only provides
 * data, columns, and state.
 *
 * Usage:
 *   // Default — uses auditApi.query (foundationRequest)
 *   const { table, isLoading } = useAuditTable();
 *
 *   // Monolithic apps (e.g., blogmachine) — pass own fetch function
 *   const { table } = useAuditTable({
 *     fetchFn: (params) => myApiRequest(`/admin/audit/?page=${params.page}&per_page=${params.per_page}`),
 *   });
 *
 *   // Custom columns
 *   const { table } = useAuditTable({
 *     columns: [auditColumns.time, auditColumns.action, myCustomColumn],
 *   });
 */

import { useMemo, useCallback } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import type { AuditEntry, AuditPageResponse, AuditQueryParams } from '../types/audit';
import { auditApi } from '../api/audit';
import type { ServerTableFetchFn } from './types';
import { useServerTable } from './useServerTable';
import { getLogger } from '../utils/logging';

const logger = getLogger('useAuditTable');

// ── Default columns ────────────────────────────────────────────

const columnHelper = createColumnHelper<AuditEntry>();

/** Individual audit columns — cherry-pick for custom layouts. */
export const auditColumns = {
  time: columnHelper.accessor('created_at', {
    id: 'created_at',
    header: 'Time',
  }),
  action: columnHelper.accessor('action', {
    id: 'action',
    header: 'Action',
  }),
  category: columnHelper.accessor('category', {
    id: 'category',
    header: 'Category',
  }),
  actor: columnHelper.accessor(
    (row) => row.actor_label || row.actor_id || '\u2014',
    { id: 'actor', header: 'Actor' },
  ),
  entity: columnHelper.accessor(
    (row) => row.entity_label || row.entity_id || '\u2014',
    { id: 'entity', header: 'Entity' },
  ),
  ip: columnHelper.accessor('ip_address', {
    id: 'ip_address',
    header: 'IP',
  }),
};

const defaultColumns: ColumnDef<AuditEntry, any>[] = [
  auditColumns.time,
  auditColumns.action,
  auditColumns.category,
  auditColumns.actor,
  auditColumns.entity,
  auditColumns.ip,
];

// ── Fetch adapter ──────────────────────────────────────────────

type AuditQueryFn = (params: AuditQueryParams) => Promise<AuditPageResponse>;

function createAuditFetchFn(queryFn: AuditQueryFn): ServerTableFetchFn<AuditEntry> {
  return async (params) => {
    const queryParams: AuditQueryParams = {
      page: params.page,
      per_page: params.pageSize,
      ...(params.filters as Partial<AuditQueryParams>),
    };

    const res = await queryFn(queryParams);
    return {
      data: res.data,
      total: res.meta.total,
      pageCount: Math.ceil(res.meta.total / res.meta.per_page),
    };
  };
}

// ── Hook ───────────────────────────────────────────────────────

export interface UseAuditTableOptions {
  /** Full column override. */
  columns?: ColumnDef<AuditEntry, any>[];
  /** Extra columns appended after defaults. */
  extraColumns?: ColumnDef<AuditEntry, any>[];
  /** Rows per page (default 25). */
  initialPageSize?: number;
  /**
   * Override the query function. Default: auditApi.query (uses foundationRequest).
   * Monolithic apps pass their own function that uses their app's HTTP client.
   */
  fetchFn?: AuditQueryFn;
}

export function useAuditTable(options: UseAuditTableOptions = {}) {
  const {
    columns,
    extraColumns,
    initialPageSize = 25,
    fetchFn: queryFn = auditApi.query,
  } = options;

  logger.info('useAuditTable initialized');

  const resolvedColumns = useMemo(() => {
    if (columns) return columns;
    if (extraColumns) return [...defaultColumns, ...extraColumns];
    return defaultColumns;
  }, [columns, extraColumns]);

  const fetchFn = useCallback(
    createAuditFetchFn(queryFn),
    [queryFn],
  );

  return useServerTable<AuditEntry>({
    fetchFn,
    columns: resolvedColumns,
    initialPageSize,
    enableSorting: false,  // audit API does not support sort params
    enableExpanding: true,
    getRowCanExpand: (row) => !!row.original.extra_data,
  });
}
