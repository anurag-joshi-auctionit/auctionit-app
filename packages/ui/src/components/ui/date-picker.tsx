import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, XClose } from "@untitledui/icons";

import { cn } from "../../lib/utils";
import { formatDateParam, parseDateParam } from "../../lib/utils/date";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Separator } from "./separator";

const DISPLAY_FORMAT = "dd MMM yyyy";
const DROPDOWN_START_MONTH = new Date(2000, 0);
const DROPDOWN_END_MONTH = new Date(2040, 11);

export type DatePickerProps = {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  /** YYYY-MM-DD — days before this are disabled */
  min?: string;
  /** YYYY-MM-DD — days after this are disabled */
  max?: string;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

function formatDisplay(date: Date): string {
  return format(date, DISPLAY_FORMAT);
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  placeholder = "Select date",
  disabled = false,
  allowClear = true,
  min,
  max,
  className,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseDateParam(value);
  const minDate = parseDateParam(min);
  const maxDate = parseDateParam(max);
  const [month, setMonth] = React.useState<Date>(
    () => selected ?? new Date(),
  );
  const display = selected ? formatDisplay(selected) : null;

  const emit = (next: Date | undefined) => {
    onChange?.(next ? formatDateParam(next) : "");
  };

  const clampToBounds = (day: Date): Date | undefined => {
    const local = startOfLocalDay(day);
    if (minDate && local < startOfLocalDay(minDate)) return undefined;
    if (maxDate && local > startOfLocalDay(maxDate)) return undefined;
    return local;
  };

  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return;
    const next = clampToBounds(day);
    if (!next) return;
    emit(next);
    setOpen(false);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    emit(undefined);
  };

  const handleToday = () => {
    const today = startOfLocalDay(new Date());
    const next = clampToBounds(today);
    if (!next) return;
    setMonth(next);
    emit(next);
    setOpen(false);
  };

  const disabledMatchers = React.useMemo(() => {
    const matchers: Array<{ before: Date } | { after: Date }> = [];
    if (minDate) matchers.push({ before: startOfLocalDay(minDate) });
    if (maxDate) matchers.push({ after: startOfLocalDay(maxDate) });
    return matchers.length > 0 ? matchers : undefined;
  }, [minDate, maxDate]);

  const startMonth = minDate
    ? new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    : DROPDOWN_START_MONTH;
  const endMonth = maxDate
    ? new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
    : DROPDOWN_END_MONTH;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && selected) setMonth(selected);
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
          data-slot="date-picker"
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
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleDateSelect}
            month={month}
            onMonthChange={setMonth}
            captionLayout="dropdown"
            startMonth={startMonth}
            endMonth={endMonth}
            disabled={disabledMatchers}
          />
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
              onClick={handleToday}
            >
              Today
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
