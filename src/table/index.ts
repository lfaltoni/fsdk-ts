// Table infrastructure — headless server-side table hooks powered by TanStack Table

// Generic hook
export { useServerTable } from './useServerTable';

// Audit domain wrapper
export { useAuditTable, auditColumns } from './useAuditTable';

// Utilities
export { extractAuditChanges } from './audit-utils';
export type { AuditFieldChange } from './audit-utils';

// Types
export type {
  ServerTableFetchParams,
  ServerTableFetchResult,
  ServerTableFetchFn,
  UseServerTableOptions,
  UseServerTableReturn,
  // Re-exported TanStack types
  ColumnDef,
  SortingState,
  ExpandedState,
  TableInstance,
  TableRow,
  TableHeader,
  TableHeaderGroup,
  TableCell,
} from './types';

// Re-export TanStack utilities consumers need for rendering
export { flexRender, createColumnHelper } from '@tanstack/react-table';
