import type { PaginationState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";

/** Server-side page state wired to ListDataTable's pagination props. */
export function useEmdPagination(initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const pagination: PaginationState = useMemo(
    () => ({ pageIndex: page - 1, pageSize }),
    [page, pageSize],
  );

  const onPaginationChange = useCallback(
    (updater: PaginationState | ((p: PaginationState) => PaginationState)) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      if (next.pageIndex + 1 !== page) setPage(next.pageIndex + 1);
      if (next.pageSize !== pageSize) {
        setPageSize(next.pageSize);
        setPage(1);
      }
    },
    [pagination, page, pageSize],
  );

  const onPageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const tableProps = (total: number) => ({
    manualPagination: true as const,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    rowCount: total,
    state: { pagination },
    onPaginationChange,
    currentPage: page,
    onPageChange: setPage,
    onPageSizeChange,
  });

  return { page, pageSize, setPage, params: { page, pageSize }, tableProps };
}
