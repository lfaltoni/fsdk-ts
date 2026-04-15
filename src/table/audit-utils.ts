/**
 * Pure utilities for extracting structured changes from audit entries.
 * No React imports — usable in any context (SSR, tests, etc.).
 *
 * Parses the foundation-sdk audit convention:
 *   extra_data.changes = { field_name: { before: old, after: new } }
 */

/** A single field-level change from an audit entry. */
export interface AuditFieldChange {
  field: string;
  before: unknown;
  after: unknown;
}

/**
 * Extract structured before/after changes from an audit entry's extra_data.
 *
 * Returns an array of field changes if extra_data.changes exists,
 * or null if extra_data is null or has no changes key.
 */
export function extractAuditChanges(
  extraData: Record<string, unknown> | null,
): AuditFieldChange[] | null {
  if (!extraData) return null;

  const changes = extraData.changes as
    | Record<string, { before: unknown; after: unknown }>
    | undefined;

  if (!changes || typeof changes !== 'object') return null;

  return Object.entries(changes).map(([field, { before, after }]) => ({
    field,
    before,
    after,
  }));
}
