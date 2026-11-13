

import * as React from "react";
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type ColumnPinningPosition,
  type ExpandedState,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { cn } from "../../../lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../empty";
import { InputSearch } from "../input-search";
import { Spinner } from "../spinner";
import {
  DataTableViewOptions,
  isToggleableColumn,
} from "./data-table-view-options";
import { DataTablePagination } from "./data-table-pagination";

function pinnedHeadClass(position: ColumnPinningPosition) {
  if (position === "left") {
    return "sticky z-30 bg-background border-r";
  }
  if (position === "right") {
    return "sticky z-30 bg-background border-l";
  }
  return "";
}

function pinnedCellClass(position: ColumnPinningPosition) {
  if (position === "left") {
    return cn(
      "sticky z-20 bg-background border-r",
      "group-hover:bg-hover group-data-[state=selected]:bg-hover",
    );
  }
  if (position === "right") {
    return cn(
      "sticky z-20 bg-background border-l",
      "group-hover:bg-hover group-data-[state=selected]:bg-hover",
    );
  }
  return "";
}

function pinnedOffsetStyle<TData extends RowData>(
  position: ColumnPinningPosition | false,
  column: Column<TData, unknown>,
): React.CSSProperties {
  if (position === "left") {
    return { left: column.getStart("left") };
  }
  if (position === "right") {
    return { right: column.getAfter("right") };
  }
  return {};
}

function columnSizeStyle<TData extends RowData>(
  column: Column<TData, unknown>,
): React.CSSProperties {
  const size = column.columnDef.size;
  const minSize = column.columnDef.minSize ?? size;
  const maxSize = column.columnDef.maxSize;
  return {
    ...(size != null ? { width: size } : {}),
    ...(minSize != null ? { minWidth: minSize } : {}),
    ...(maxSize != null
      ? { maxWidth: maxSize, overflow: "hidden" }
      : {}),
  };
}

/** Reusable config for a single filterable column (e.g. name, email). */
export interface DataTableFilterColumnConfig {
  id: string;
  placeholder?: string;
  label?: string;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  rowCount?: number;
  initialState?: {
    pagination?: PaginationState;
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    columnVisibility?: VisibilityState;
    columnPinning?: ColumnPinningState;
  };
  state?: {
    pagination?: PaginationState;
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    rowSelection?: RowSelectionState;
  };
  /** Required for stable keys when using row selection. */
  getRowId?: (originalRow: TData) => string;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  manualPagination?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  onPaginationChange?: OnChangeFn<PaginationState>;
  onSortingChange?: OnChangeFn<SortingState>;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  /** Single search box (legacy): column id and placeholder. */
  filterPlaceholder?: string;
  filterColumn?: string;
  /** Class name for the single/multi toolbar search input(s). */
  filterClassName?: string;
  /** Multiple filter columns: one input per config. Use this for reusable multi-column filtering. */
  filterColumns?: DataTableFilterColumnConfig[];
  /** Extra content in the toolbar rendered before filters. */
  toolbarExtraBeforeFilters?: React.ReactNode;
  /** Extra content in the toolbar (e.g. date range picker), rendered after filters. */
  toolbarExtra?: React.ReactNode;
  /** When false, hides the column visibility ("View") menu. Default true. */
  showColumnToggle?: boolean;
  /** Custom empty state copy when the table has no rows. */
  emptyTitle?: string;
  emptyDescription?: string;
  /**
   * When true and the table has no rows, shows a loading empty slot
   * (spinner + copy) instead of the no-data illustration.
   */
  isLoading?: boolean;
  loadingTitle?: string;
  loadingDescription?: string;
  /** Debounce ms for toolbar search input. Set 0 when parent already debounces. Default 500. */
  filterDebounceMs?: number;
  /**
   * Renders {@link DataTablePagination} under the table for client-side pagination
   * (`getPaginationRowModel`). Ignored when `manualPagination` is true.
   */
  showPagination?: boolean;
  /**
   * When false, skips client-side pagination so every row is shown. Default true
   * (TanStack default page size applies). Ignored when `manualPagination` is true.
   */
  clientPagination?: boolean;
  /**
   * Overrides the table element classes. Pass `w-full` when columns should share the
   * container width instead of growing to fit their content.
   */
  tableClassName?: string;
  /**
   * Overrides the table wrapper classes (`rounded-md border` by default).
   * Pass `rounded-none border-0` to nest inside an already-bordered card.
   */
  containerClassName?: string;
  /** When set, rows may expand; pair with {@link renderSubComponent}. */
  getRowCanExpand?: (row: Row<TData>) => boolean;
  /** Content rendered in a full-width row under an expanded data row. */
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode;
  /** Controlled expand state (TanStack ExpandedState). */
  expanded?: ExpandedState;
  onExpandedChange?: OnChangeFn<ExpandedState>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  rowCount,
  initialState,
  state: controlledState,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  getRowId,
  onRowSelectionChange,
  filterPlaceholder,
  filterColumn,
  filterClassName = "w-auto max-w-sm shrink-0",
  filterColumns,
  toolbarExtraBeforeFilters,
  toolbarExtra,
  showColumnToggle = true,
  emptyTitle = "No records found",
  emptyDescription = "No data matches your filters. Try adjusting your search or filters.",
  isLoading = false,
  loadingTitle = "Loading…",
  loadingDescription = "Please wait while data is loaded.",
  filterDebounceMs = 500,
  showPagination = false,
  clientPagination = true,
  tableClassName,
  containerClassName,
  getRowCanExpand,
  renderSubComponent,
  expanded: controlledExpanded,
  onExpandedChange,
}: DataTableProps<TData, TValue>) {
  const rowSelectionControlled =
    onRowSelectionChange != null &&
    controlledState?.rowSelection !== undefined;
  const expandEnabled = renderSubComponent != null;
  const expandedControlled =
    expandEnabled &&
    onExpandedChange != null &&
    controlledExpanded !== undefined;

  const table = useReactTable({
    data,
    columns,
    initialState,
    ...(getRowId != null && { getRowId }),
    ...(rowSelectionControlled && {
      enableRowSelection: true,
      onRowSelectionChange,
    }),
    getCoreRowModel: getCoreRowModel(),
    ...(manualPagination && {
      manualPagination: true,
      pageCount: pageCount ?? -1,
      onPaginationChange,
    }),
    ...(!manualPagination &&
      clientPagination && {
        getPaginationRowModel: getPaginationRowModel(),
      }),
    ...(manualSorting && {
      manualSorting: true,
      onSortingChange,
    }),
    ...(!manualSorting && {
      getSortedRowModel: getSortedRowModel(),
    }),
    ...(manualFiltering && {
      manualFiltering: true,
      onColumnFiltersChange,
    }),
    ...(!manualFiltering && {
      getFilteredRowModel: getFilteredRowModel(),
    }),
    ...(expandEnabled && {
      getExpandedRowModel: getExpandedRowModel(),
      getRowCanExpand: getRowCanExpand ?? (() => true),
      ...(expandedControlled ? { onExpandedChange } : {}),
    }),
    state: {
      ...(manualPagination &&
        (controlledState?.pagination ?? initialState?.pagination) != null && {
          pagination: controlledState?.pagination ?? initialState?.pagination,
        }),
      ...(manualSorting &&
        (controlledState?.sorting ?? initialState?.sorting) != null && {
          sorting: controlledState?.sorting ?? initialState?.sorting,
        }),
      ...(manualFiltering &&
        (controlledState?.columnFilters ?? initialState?.columnFilters) !=
          null && {
          columnFilters:
            controlledState?.columnFilters ?? initialState?.columnFilters,
        }),
      ...(rowSelectionControlled && {
        rowSelection: controlledState!.rowSelection!,
      }),
      ...(expandedControlled && {
        expanded: controlledExpanded,
      }),
    },
  });

  const hasSingleFilter = filterColumn != null && filterPlaceholder != null;
  const hasMultiFilter =
    Array.isArray(filterColumns) && filterColumns.length > 0;
  const hasToggleableColumns =
    showColumnToggle && table.getAllLeafColumns().some(isToggleableColumn);
  const showToolbar =
    hasSingleFilter ||
    hasMultiFilter ||
    toolbarExtraBeforeFilters != null ||
    toolbarExtra != null ||
    hasToggleableColumns;

  return (
    <div className="space-y-4">
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-3 py-4 sm:gap-4">
          {toolbarExtraBeforeFilters}
          {hasSingleFilter && (
            <InputSearch
              placeholder={filterPlaceholder}
              value={
                (table.getColumn(filterColumn!)?.getFilterValue() as string) ??
                ""
              }
              onChange={(value) =>
                table.getColumn(filterColumn!)?.setFilterValue(value)
              }
              debounceMs={filterDebounceMs}
              className={filterClassName}
            />
          )}
          {hasMultiFilter &&
            filterColumns!.map((fc) => (
              <InputSearch
                key={fc.id}
                placeholder={
                  fc.placeholder ?? `Filter by ${fc.label ?? fc.id}...`
                }
                value={
                  (table.getColumn(fc.id)?.getFilterValue() as string) ?? ""
                }
                onChange={(value) =>
                  table.getColumn(fc.id)?.setFilterValue(value)
                }
                debounceMs={filterDebounceMs}
                className={filterClassName}
              />
            ))}
          {toolbarExtra}
          {hasToggleableColumns && (
            <div className="ml-auto shrink-0">
              <DataTableViewOptions table={table} />
            </div>
          )}
        </div>
      )}
      <div
        className={cn(
          "@container bg-background relative w-full overflow-x-auto rounded-md border",
          containerClassName,
        )}
      >
        <Table className={cn("min-w-full w-max", tableClassName)}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      ...columnSizeStyle(header.column),
                      ...pinnedOffsetStyle(
                        header.column.getIsPinned(),
                        header.column,
                      ),
                    }}
                    className={cn(
                      "text-muted-foreground text-xs",
                      pinnedHeadClass(header.column.getIsPinned()),
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          ...columnSizeStyle(cell.column),
                          ...pinnedOffsetStyle(
                            cell.column.getIsPinned(),
                            cell.column,
                          ),
                        }}
                        className={pinnedCellClass(cell.column.getIsPinned())}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandEnabled && row.getIsExpanded() ? (
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableCell
                        colSpan={row.getVisibleCells().length}
                        className="px-3 py-3"
                      >
                        {renderSubComponent!({ row })}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </React.Fragment>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="p-0"
                >
                  <Empty className="sticky left-0 w-[100cqw] min-h-[280px] border-0 py-12">
                    <EmptyMedia>
                      {isLoading ? (
                        <Spinner className="size-10 text-muted-foreground" />
                      ) : (
                        <img
                          src="/illustrations/no-data.webp"
                          alt=""
                          width={160}
                          height={160}
                          className="size-20 object-contain"
                          loading="eager"
                        />
                      )}
                    </EmptyMedia>
                    <EmptyHeader>
                      <EmptyTitle>
                        {isLoading ? loadingTitle : emptyTitle}
                      </EmptyTitle>
                      <EmptyDescription>
                        {isLoading ? loadingDescription : emptyDescription}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && !manualPagination ? (
        <DataTablePagination
          currentPage={table.getState().pagination.pageIndex + 1}
          pageCount={Math.max(1, table.getPageCount())}
          pageSize={table.getState().pagination.pageSize}
          totalRows={table.getFilteredRowModel().rows.length}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => {
            table.setPageSize(size);
            table.setPageIndex(0);
          }}
        />
      ) : null}
    </div>
  );
}
