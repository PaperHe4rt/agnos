export const PAGE_SIZE = 12;

export function getPageCount(total: number, pageSize = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(1, page), pageCount);
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize = PAGE_SIZE,
): T[] {
  const pageCount = getPageCount(items.length, pageSize);
  const currentPage = clampPage(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getPageRange(
  total: number,
  page: number,
  pageSize = PAGE_SIZE,
): { start: number; end: number } {
  if (total === 0) return { start: 0, end: 0 };

  const pageCount = getPageCount(total, pageSize);
  const currentPage = clampPage(page, pageCount);
  const start = (currentPage - 1) * pageSize + 1;
  return {
    start,
    end: Math.min(start + pageSize - 1, total),
  };
}
