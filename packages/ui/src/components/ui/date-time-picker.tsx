import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, XClose } from "@untitledui/icons";

import { cn } from "../../lib/utils";
import {
  formatDatetimeLocalParam,
  parseDateParam,
} from "../../lib/utils/date";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Separator } from "./separator";
import { TimePanel } from "./time-picker";

const DATETIME_LOCAL_RE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

const DISPLAY_FORMAT = "dd MMM yyyy, HH:mm";
const DROPDOWN_START_MONTH = new Date(2000, 0);
const DROPDOWN_END_MONTH = new Date(2040, 11);

export type DateTimePickerProps = {
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

function parseDatetimeLocalValue(value: string | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const match = DATETIME_LOCAL_RE.exec(value.trim());
  if (!match) return undefined;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6] ?? 0),
  );
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDisplay(date: Date): string {
  return format(date, DISPLAY_FORMAT);
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function DateTimePicker({
  value,
  onChange,
  onBlur,
  placeholder = "Select date and time",
  disabled = false,
  allowClear = true,
  min,
  max,
  className,
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseDatetimeLocalValue(value);
  const minDate = parseDateParam(min);
  const maxDate = parseDateParam(max);
  const [month, setMonth] = React.useState<Date>(
    () => selected ?? new Date(),
  );
  const display = selected ? formatDisplay(selected) : null;

  const emit = (next: Date | undefined) => {
    onChange?.(next ? formatDatetimeLocalParam(next) : "");
  };

  const isDayAllowed = (day: Date): boolean => {
    const local = startOfLocalDay(day);
    if (minDate && local < startOfLocalDay(minDate)) return false;
    if (maxDate && local > startOfLocalDay(maxDate)) return false;
    return true;
  };

  const handleDateSelect = (day: Date | undefined) => {
    if (!day || !isDayAllowed(day)) return;
    const next = new Date(day);
    if (selected) {
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    } else {
      const now = new Date();
      next.setHours(now.getHours(), now.getMinutes(), 0, 0);
    }
    emit(next);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    emit(undefined);
  };

  const handleNow = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    if (!isDayAllowed(now)) return;
    setMonth(now);
    emit(now);
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
          data-slot="date-time-picker"
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
          <div className="flex items-stretch">
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
            <Separator orientation="vertical" />
            <TimePanel
              selected={selected}
              onChange={emit}
              showSeconds={false}
            />
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
              onClick={handleNow}
            >
              Now
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
