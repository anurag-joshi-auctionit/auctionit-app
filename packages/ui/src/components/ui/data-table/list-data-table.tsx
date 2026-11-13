import type { RowData } from "@tanstack/react-table";

import { Spinner } from "../spinner";
import { DataTable, type DataTableProps } from "./data-table";
import { DataTablePagination } from "./data-table-pagination";

export type ListDataTableProps<TData extends RowData, TValue> =
  DataTableProps<TData, TValue> & {
    isFetching?: boolean;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };

export function ListDataTable<TData extends RowData, TValue>({
  isFetching = false,
  isLoading = false,
  currentPage,
  onPageChange,
  onPageSizeChange,
  manualPagination,
  pageCount,
  rowCount,
  state,
  data,
  ...dataTableProps
}: ListDataTableProps<TData, TValue>) {
  const paginationPageSize = state?.pagination?.pageSize ?? 10;
  const showCornerSpinner = isFetching && !isLoading;

  return (
    <div className="relative space-y-4">
      {showCornerSpinner ? (
        <div className="absolute top-2 right-2 z-10">
          <Spinner className="size-4" />
        </div>
      ) : null}
      <DataTable
        {...dataTableProps}
        data={data}
        isLoading={isLoading}
        manualPagination={manualPagination}
        pageCount={pageCount}
        rowCount={rowCount}
        state={state}
      />
      {manualPagination &&
      currentPage != null &&
      onPageChange != null &&
      pageCount != null ? (
        <DataTablePagination
          currentPage={currentPage}
          pageCount={pageCount}
          pageSize={paginationPageSize}
          totalRows={rowCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      ) : null}
    </div>
  );
}
