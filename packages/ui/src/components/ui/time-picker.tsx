import * as React from "react";
import { format, setHours, setMinutes, setSeconds } from "date-fns";
import { Clock, XClose } from "@untitledui/icons";

import { cn } from "../../lib/utils";
import { parseTypedTime } from "../../lib/utils/date";
import { Button } from "./button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./input-group";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { Separator } from "./separator";

export type TimePickerProps = {
  /** Controlled value. Pass `null` for an empty controlled value. */
  value?: Date | null;
  defaultValue?: Date;
  onChange?: (time: Date | undefined, timeString: string) => void;
  onBlur?: () => void;
  name?: string;
  /** Time format for the input display. Default `HH:mm:ss` (24-hour). */
  format?: string;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  showNow?: boolean;
  hourStep?: number;
  minuteStep?: number;
  /** When false, hides the seconds column. Default true. */
  showSeconds?: boolean;
  secondStep?: number;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

type TimeColumnProps = {
  options: number[];
  value: number | null;
  onChange: (value: number) => void;
  label: string;
  className?: string;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function buildSteps(max: number, step: number): number[] {
  const values: number[] = [];
  for (let i = 0; i < max; i += step) values.push(i);
  return values;
}

const COLUMN_ITEM_HEIGHT = 28;

function TimeColumn({
  options,
  value,
  onChange,
  label,
  className,
}: TimeColumnProps) {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const list = listRef.current;
    if (!list || value == null) return;
    const index = options.indexOf(value);
    if (index < 0) return;
    const target =
      index * COLUMN_ITEM_HEIGHT -
      list.clientHeight / 2 +
      COLUMN_ITEM_HEIGHT / 2;
    list.scrollTop = Math.max(0, target);
  }, [options, value]);

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className="text-muted-foreground flex h-7 items-center justify-center text-xs font-medium tracking-wide"
        aria-hidden
      >
        {label}
      </div>
      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        className="h-56 w-14 overflow-y-auto overscroll-contain py-1 [-ms-overflow-style:none] [scrollbar-width:thin]"
        onWheel={(event) => {
          // Keep wheel scrolling on this column; don't bubble to the page/popover.
          event.stopPropagation();
        }}
      >
        {options.map((option) => {
          const selected = value != null && option === value;
          return (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={selected}
              className={cn(
                "hover:bg-accent hover:text-accent-foreground h-7 w-full shrink-0 text-sm tabular-nums focus:outline-none",
                selected && "bg-accent text-accent-foreground font-medium",
              )}
              onClick={() => onChange(option)}
            >
              {pad2(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function applyTimeParts(
  base: Date,
  hour: number,
  minute: number,
  second: number,
): Date {
  return setSeconds(setMinutes(setHours(base, hour), minute), second);
}

export type TimePanelProps = {
  selected: Date | undefined;
  onChange: (date: Date) => void;
  showSeconds?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  className?: string;
};

/** Scrollable 24-hour hour / minute / (seconds) columns. */
export function TimePanel({
  selected,
  onChange,
  showSeconds = true,
  hourStep = 1,
  minuteStep = 1,
  secondStep = 1,
  className,
}: TimePanelProps) {
  const hour24 = selected?.getHours() ?? null;
  const minute = selected?.getMinutes() ?? null;
  const second = selected?.getSeconds() ?? null;

  const hours = React.useMemo(() => buildSteps(24, hourStep), [hourStep]);
  const minutes = React.useMemo(() => buildSteps(60, minuteStep), [minuteStep]);
  const seconds = React.useMemo(() => buildSteps(60, secondStep), [secondStep]);

  const ensureBase = React.useCallback((): Date => {
    if (selected) return new Date(selected);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, [selected]);

  const emitParts = (hour: number, nextMinute: number, nextSecond: number) => {
    onChange(applyTimeParts(ensureBase(), hour, nextMinute, nextSecond));
  };

  const setHour = (nextHour: number) => {
    emitParts(nextHour, minute ?? 0, showSeconds ? (second ?? 0) : 0);
  };

  const setMinute = (nextMinute: number) => {
    emitParts(hour24 ?? 0, nextMinute, showSeconds ? (second ?? 0) : 0);
  };

  const setSecond = (nextSecond: number) => {
    emitParts(hour24 ?? 0, minute ?? 0, nextSecond);
  };

  return (
    <div className={cn("flex items-stretch p-1", className)}>
      <TimeColumn
        label="HH"
        options={hours}
        value={hour24}
        onChange={setHour}
      />
      <Separator orientation="vertical" />
      <TimeColumn
        label="MM"
        options={minutes}
        value={minute}
        onChange={setMinute}
      />
      {showSeconds ? (
        <>
          <Separator orientation="vertical" />
          <TimeColumn
            label="SS"
            options={seconds}
            value={second}
            onChange={setSecond}
          />
        </>
      ) : null}
    </div>
  );
}

export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  function TimePicker(
    {
      value,
      defaultValue,
      onChange,
      onBlur,
      name,
      format: timeFormatProp,
      placeholder = "Select time",
      disabled = false,
      allowClear = true,
      showNow = true,
      hourStep = 1,
      minuteStep = 1,
      showSeconds = true,
      secondStep = 1,
      className,
      id,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedBy,
    },
    ref,
  ) {
  const timeFormat =
    timeFormatProp ?? (showSeconds ? "HH:mm:ss" : "HH:mm");

  const [open, setOpen] = React.useState(false);
  const [uncontrolled, setUncontrolled] = React.useState<Date | undefined>(
    defaultValue,
  );
  const isControlled = value !== undefined;
  const selected = isControlled ? (value ?? undefined) : uncontrolled;

  const formatDisplayValue = React.useCallback(
    (date: Date) => format(date, timeFormat),
    [timeFormat],
  );

  const display = selected ? formatDisplayValue(selected) : "";
  const [text, setText] = React.useState(display);
  const [focused, setFocused] = React.useState(false);
  const [textInvalid, setTextInvalid] = React.useState(false);

  React.useEffect(() => {
    if (!focused) setText(display);
  }, [display, focused]);

  const emitChange = React.useCallback(
    (next: Date | undefined) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next, next ? formatDisplayValue(next) : "");
    },
    [formatDisplayValue, isControlled, onChange],
  );

  const applyParsedParts = (parts: NonNullable<ReturnType<typeof parseTypedTime>>) => {
    const base = selected ? new Date(selected) : new Date();
    base.setHours(
      parts.hours,
      parts.minutes,
      showSeconds ? parts.seconds : 0,
      0,
    );
    emitChange(base);
    return formatDisplayValue(base);
  };

  const commitText = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      if (allowClear) {
        emitChange(undefined);
        setText("");
        setTextInvalid(false);
      } else {
        setText(display);
        setTextInvalid(false);
      }
      return;
    }
    const parts = parseTypedTime(trimmed);
    if (!parts) {
      setTextInvalid(true);
      setText(display);
      return;
    }
    setText(applyParsedParts(parts));
    setTextInvalid(false);
  };

  const handleNow = () => {
    const now = new Date();
    if (!showSeconds) now.setSeconds(0, 0);
    else now.setMilliseconds(0);
    emitChange(now);
    setText(formatDisplayValue(now));
    setTextInvalid(false);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    emitChange(undefined);
    setText("");
    setTextInvalid(false);
  };

  const canConfirm = selected != null;
  const showInvalid = Boolean(ariaInvalid) || textInvalid;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onBlur?.();
      }}
    >
      <PopoverAnchor asChild>
        <InputGroup
          data-slot="time-picker"
          data-disabled={disabled || undefined}
          className={cn(
            disabled && "pointer-events-none opacity-50",
            className,
          )}
        >
          <InputGroupInput
            ref={ref}
            id={id}
            name={name}
            disabled={disabled}
            placeholder={placeholder}
            value={text}
            aria-invalid={showInvalid || undefined}
            aria-describedby={ariaDescribedBy}
            autoComplete="off"
            onChange={(event) => {
              const nextText = event.target.value;
              setText(nextText);
              setTextInvalid(false);
              // Commit complete typed times immediately so server field errors
              // clear via react-hook-form watch (type: "change") without blur.
              const parts = parseTypedTime(nextText.trim());
              if (parts) {
                applyParsedParts(parts);
              }
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              commitText();
              onBlur?.();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitText();
                (event.target as HTMLInputElement).blur();
              }
              if (event.key === "ArrowDown" && !open && !disabled) {
                event.preventDefault();
                setOpen(true);
              }
            }}
          />
          {allowClear && (selected || text) && !disabled ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label="Clear"
                onClick={handleClear}
                onMouseDown={(event) => event.preventDefault()}
              >
                <XClose className="size-3.5" />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
          <InputGroupAddon align="inline-end">
            <PopoverTrigger asChild>
              <InputGroupButton
                size="icon-xs"
                disabled={disabled}
                aria-label="Open time picker"
                onMouseDown={(event) => event.preventDefault()}
              >
                <Clock className="size-4" />
              </InputGroupButton>
            </PopoverTrigger>
          </InputGroupAddon>
        </InputGroup>
      </PopoverAnchor>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col">
          <TimePanel
            selected={selected}
            onChange={(date) => {
              emitChange(date);
              setText(formatDisplayValue(date));
              setTextInvalid(false);
            }}
            showSeconds={showSeconds}
            hourStep={hourStep}
            minuteStep={minuteStep}
            secondStep={secondStep}
          />
          <Separator />
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            {showNow ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={handleNow}
              >
                Now
              </Button>
            ) : (
              <span />
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canConfirm}
              onClick={() => setOpen(false)}
            >
              OK
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
},
);

TimePicker.displayName = "TimePicker";
