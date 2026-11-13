import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, XClose } from "@untitledui/icons";

import { cn } from "../../lib/utils";
import { formatDateParam, parseDateParam } from "../../lib/utils/date";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Separator } from "./separator";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export type MonthYearPickerProps = {
  /** YYYY-MM-01 (or any YYYY-MM-DD — day is ignored). */
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  /** YYYY-MM-DD — months before this month are disabled */
  min?: string;
  /** YYYY-MM-DD — months after this month are disabled */
  max?: string;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function parseMonth(value?: string): Date | undefined {
  const parsed = parseDateParam(value);
  return parsed ? startOfMonth(parsed) : undefined;
}

function formatMonthValue(date: Date): string {
  return formatDateParam(startOfMonth(date));
}

function formatDisplay(date: Date): string {
  return format(date, "MMM yyyy");
}

function monthIndex(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

export function MonthYearPicker({
  value,
  onChange,
  onBlur,
  placeholder = "Select month",
  disabled = false,
  allowClear = true,
  min,
  max,
  className,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: MonthYearPickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseMonth(value);
  const minMonth = parseMonth(min);
  const maxMonth = parseMonth(max);
  const [viewYear, setViewYear] = React.useState(
    () => (selected ?? new Date()).getFullYear(),
  );
  const display = selected ? formatDisplay(selected) : null;

  const emit = (next: Date | undefined) => {
    onChange?.(next ? formatMonthValue(next) : "");
  };

  const isMonthDisabled = (year: number, month0: number): boolean => {
    const idx = year * 12 + month0;
    if (minMonth && idx < monthIndex(minMonth)) return true;
    if (maxMonth && idx > monthIndex(maxMonth)) return true;
    return false;
  };

  const handleSelect = (month0: number) => {
    if (isMonthDisabled(viewYear, month0)) return;
    emit(new Date(viewYear, month0, 1));
    setOpen(false);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    emit(undefined);
  };

  const handleThisMonth = () => {
    const now = startOfMonth(new Date());
    if (isMonthDisabled(now.getFullYear(), now.getMonth())) return;
    setViewYear(now.getFullYear());
    emit(now);
    setOpen(false);
  };

  const canPrevYear =
    !minMonth || viewYear - 1 >= minMonth.getFullYear();
  const canNextYear =
    !maxMonth || viewYear + 1 <= maxMonth.getFullYear();

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setViewYear((selected ?? new Date()).getFullYear());
        }
        if (!next) onBlur?.();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          id={id}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          data-slot="month-year-picker"
          className={cn(
            "border-input h-9 w-full justify-start gap-2 px-3 font-normal",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            !display && "text-muted-foreground",
            className,
          )}
        >
          <span className="flex-1 truncate text-left">
            {display ?? placeholder}
          </span>
          {allowClear && selected && !disabled ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear"
              className="text-muted-foreground hover:text-foreground rounded-sm p-0.5"
              onClick={handleClear}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  handleClear(event as unknown as React.MouseEvent);
                }
              }}
            >
              <XClose className="size-3.5" />
            </span>
          ) : null}
          <CalendarIcon className="text-muted-foreground size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={!canPrevYear}
              aria-label="Previous year"
              onClick={() => setViewYear((y) => y - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="text-sm font-medium tabular-nums">{viewYear}</div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={!canNextYear}
              aria-label="Next year"
              onClick={() => setViewYear((y) => y + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-1 px-3 pb-3">
            {MONTH_LABELS.map((label, month0) => {
              const isSelected =
                selected != null &&
                selected.getFullYear() === viewYear &&
                selected.getMonth() === month0;
              const isDisabled = isMonthDisabled(viewYear, month0);
              const isCurrent =
                new Date().getFullYear() === viewYear &&
                new Date().getMonth() === month0;
              return (
                <Button
                  key={label}
                  type="button"
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  disabled={isDisabled}
                  className={cn(
                    "h-9 font-normal",
                    !isSelected && isCurrent && "text-sidebar-accent-foreground",
                  )}
                  onClick={() => handleSelect(month0)}
                >
                  {label}
                </Button>
              );
            })}
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <button
              type="button"
              className="text-muted-foreground text-sm hover:text-foreground hover:underline"
              onClick={handleClear}
            >
              Clear
            </button>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={handleThisMonth}
            >
              This month
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
