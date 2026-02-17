// Pagination utilities — pure logic for computing page numbers to display

export type PaginationItem = number | 'gap';

/**
 * Compute which page numbers (and gaps) to render in a pagination bar.
 *
 * Always shows first page, last page, current page, and `siblings` pages
 * on each side of current. Inserts 'gap' where pages are skipped.
 *
 * @example
 * computePaginationPages(1, 5)    // [1, 2, 3, 4, 5]
 * computePaginationPages(3, 66)   // [1, 2, 3, 4, 'gap', 66]
 * computePaginationPages(33, 66)  // [1, 'gap', 32, 33, 34, 'gap', 66]
 * computePaginationPages(65, 66)  // [1, 'gap', 64, 65, 66]
 */
export function computePaginationPages(
  current: number,
  totalPages: number,
  siblings: number = 1,
): PaginationItem[] {
  if (totalPages <= 1) return [];

  // Collect all page numbers that should be visible
  const visible = new Set<number>();

  // Always show first and last
  visible.add(1);
  visible.add(totalPages);

  // Show current and siblings
  for (let i = current - siblings; i <= current + siblings; i++) {
    if (i >= 1 && i <= totalPages) {
      visible.add(i);
    }
  }

  // Sort and insert gaps
  const sorted = Array.from(visible).sort((a, b) => a - b);
  const result: PaginationItem[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push('gap');
    }
    result.push(sorted[i]);
  }

  return result;
}

/**
 * Compute total pages from total items and items per page.
 */
export function computeTotalPages(total: number, perPage: number): number {
  return Math.max(1, Math.ceil(total / perPage));
}
