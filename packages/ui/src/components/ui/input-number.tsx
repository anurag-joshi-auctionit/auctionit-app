
import * as React from "react";

import { Input } from "./input";
import { cn } from "../../lib/utils";

function decimalDigitCap(
  decimalPlaces?: number,
  maxDecimalPlaces?: number,
) {
  return maxDecimalPlaces ?? decimalPlaces;
}

function isValidNumberText(
  value: string,
  allowNegative: boolean,
  integer: boolean,
  maxDigitsAfterDecimal?: number,
) {
  if (value === "") return true;
  if (allowNegative && value === "-") return true;
  if (integer) {
    return allowNegative ? /^-?\d*$/.test(value) : /^\d*$/.test(value);
  }
  const ok = allowNegative
    ? /^-?\d*\.?\d*$/.test(value)
    : /^\d*\.?\d*$/.test(value);
  if (!ok) return false;
  if (maxDigitsAfterDecimal != null) {
    const dot = value.indexOf(".");
    if (dot !== -1 && value.length - dot - 1 > maxDigitsAfterDecimal) {
      return false;
    }
  }
  return true;
}

function displayFromNumber(
  n: number | null,
  showEmptyWhenZero: boolean,
  decimalPlaces: number | undefined,
  integer: boolean,
): string {
  if (n == null || !Number.isFinite(n)) return "";
  if (showEmptyWhenZero && n === 0) return "";
  if (!integer && decimalPlaces != null) return n.toFixed(decimalPlaces);
  return String(n);
}

type InputNumberPropsBase = Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChange" | "type" | "inputMode"
> & {
  /** Render `0` as an empty field when the value is not being edited. Default true. */
  showEmptyWhenZero?: boolean;
  allowNegative?: boolean;
  /** When set, format the displayed value with fixed decimal places (e.g. `1` → `1.000`). */
  decimalPlaces?: number;
  /** Cap digits after the decimal while typing, without padding (e.g. `1.` and `1.2` stay as typed). */
  maxDecimalPlaces?: number;
  /** Restrict input to whole numbers (disallows the decimal point). Default false. */
  integer?: boolean;
  /** When true, keep the typed text locally and call `onChange` on blur. Default false. */
  commitOnBlur?: boolean;
};

type InputNumberProps =
  | (InputNumberPropsBase & {
      /** When empty, call `onChange(0)` so controlled forms stay numeric. Default true. */
      allowEmptyAsZero?: true;
      value: number;
      onChange: (value: number) => void;
    })
  | (InputNumberPropsBase & {
      /** When empty, call `onChange(null)` so the form can treat blank as missing. */
      allowEmptyAsZero: false;
      value: number | null;
      onChange: (value: number | null) => void;
    });

const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      value,
      onChange,
      allowEmptyAsZero = true,
      showEmptyWhenZero = true,
      allowNegative = false,
      decimalPlaces,
      maxDecimalPlaces,
      integer = false,
      commitOnBlur = false,
      className,
      onBlur,
      onFocus,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const [textValue, setTextValue] = React.useState(() =>
      displayFromNumber(value, showEmptyWhenZero, decimalPlaces, integer),
    );
    const focusedRef = React.useRef(false);

    React.useEffect(() => {
      if (focusedRef.current) return;
      setTextValue(
        displayFromNumber(value, showEmptyWhenZero, decimalPlaces, integer),
      );
    }, [value, showEmptyWhenZero, decimalPlaces, integer]);

    const emitEmpty = () => {
      if (allowEmptyAsZero) {
        (onChange as (value: number) => void)(0);
      } else {
        (onChange as (value: number | null) => void)(null);
      }
    };

    const emitNumber = (next: number) => {
      (onChange as (value: number | null) => void)(next);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextText = event.target.value;
      if (
        !isValidNumberText(
          nextText,
          allowNegative,
          integer,
          decimalDigitCap(decimalPlaces, maxDecimalPlaces),
        )
      ) {
        return;
      }
      setTextValue(nextText);

      if (commitOnBlur) return;

      if (nextText === "" || nextText === "-" || nextText === ".") {
        if (nextText === "") {
          emitEmpty();
        }
        return;
      }

      const parsedValue = Number.parseFloat(nextText);
      if (Number.isFinite(parsedValue)) {
        emitNumber(parsedValue);
      }
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      focusedRef.current = true;
      onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      focusedRef.current = false;
      const raw = event.target.value.trim();
      if (raw === "" || raw === "-" || raw === ".") {
        emitEmpty();
        setTextValue(
          displayFromNumber(
            allowEmptyAsZero ? 0 : null,
            showEmptyWhenZero,
            decimalPlaces,
            integer,
          ),
        );
      } else {
        const parsed = Number.parseFloat(raw);
        let next = Number.isFinite(parsed)
          ? allowNegative
            ? parsed
            : Math.max(0, parsed)
          : allowEmptyAsZero
            ? 0
            : null;
        if (next != null && integer) next = Math.trunc(next);
        if (next == null) {
          emitEmpty();
          setTextValue("");
        } else {
          emitNumber(next);
          setTextValue(
            decimalPlaces != null
              ? displayFromNumber(
                  next,
                  showEmptyWhenZero,
                  decimalPlaces,
                  integer,
                )
              : raw,
          );
        }
      }
      onBlur?.(event);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode={integer ? "numeric" : "decimal"}
        autoComplete="off"
        {...props}
        value={textValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        className={cn(className)}
      />
    );
  },
);

InputNumber.displayName = "InputNumber";

export { InputNumber, type InputNumberProps };
