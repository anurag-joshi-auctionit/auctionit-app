

import { type Column, type Table } from "@tanstack/react-table";
import { Columns03 } from "@untitledui/icons";

import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

/**
 * Keeps helper columns (e.g. a hidden `searchKey` used only for filtering) out of
 * the toggle list: they must opt in with `enableHiding` and expose a label or header.
 */
export function isToggleableColumn<TData>(
  column: Column<TData, unknown>,
): boolean {
  if (!column.getCanHide()) return false;
  const meta = column.columnDef.meta as { label?: string } | undefined;
  if (meta?.label) return true;
  const header = column.columnDef.header;
  return typeof header === "string" ? header.length > 0 : header != null;
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="hidden shrink-0 lg:inline-flex"
        >
          <Columns03 className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllLeafColumns()
          .filter(isToggleableColumn)
          .map((column) => {
            const meta = column.columnDef.meta as
              | { label?: string }
              | undefined;
            const label = meta?.label ?? column.id;
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className={meta?.label ? undefined : "capitalize"}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                onSelect={(event) => event.preventDefault()}
              >
                {label}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
