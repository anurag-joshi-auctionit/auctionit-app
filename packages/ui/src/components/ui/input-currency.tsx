import * as React from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "./input-group";
import { cn } from "../../lib/utils";
import { getCurrencySymbol } from "../../lib/utils/currency";

function isValidCurrencyText(
  value: string,
  allowNegative: boolean,
) {
  if (value === "") return true;
  if (allowNegative && value === "-") return true;
  return allowNegative ? /^-?\d*\.?\d*$/.test(value) : /^\d*\.?\d*$/.test(value);
}

function displayFromNumber(
  n: number | null,
  showEmptyWhenZero: boolean,
  decimalPlaces: number | undefined,
): string {
  if (n == null || !Number.isFinite(n)) return "";
  if (showEmptyWhenZero && n === 0) return "";
  if (decimalPlaces != null) return n.toFixed(decimalPlaces);
  return String(n);
}

type InputCurrencyPropsBase = Omit<
  React.ComponentProps<typeof InputGroupInput>,
  "value" | "onChange" | "type"
> & {
  /** Render `0` as an empty field when the value is not being edited. Default true. */
  showEmptyWhenZero?: boolean;
  allowNegative?: boolean;
  /** When set, format the displayed value with fixed decimal places (e.g. `1` → `1.00`). */
  decimalPlaces?: number;
  /** ISO code for the addon symbol; defaults to the app display currency (INR). */
  currency?: string;
};

type InputCurrencyProps =
  | (InputCurrencyPropsBase & {
      /** When empty, call `onChange(0)` so controlled forms stay numeric. Default true. */
      allowEmptyAsZero?: true;
      value: number;
      onChange: (value: number) => void;
    })
  | (InputCurrencyPropsBase & {
      /** When empty, call `onChange(null)` so the form can treat blank as missing. */
      allowEmptyAsZero: false;
      value: number | null;
      onChange: (value: number | null) => void;
    });

const InputCurrency = React.forwardRef<HTMLInputElement, InputCurrencyProps>(
  (
    {
      value,
      onChange,
      allowEmptyAsZero = true,
      showEmptyWhenZero = true,
      allowNegative = false,
      decimalPlaces,
      currency,
      className,
      onBlur,
      onFocus,
      min = 0,
      step = "0.01",
      ...props
    },
    ref,
  ) => {
    const [textValue, setTextValue] = React.useState(() =>
      displayFromNumber(value, showEmptyWhenZero, decimalPlaces),
    );
    const focusedRef = React.useRef(false);

    React.useEffect(() => {
      if (focusedRef.current) return;
      setTextValue(displayFromNumber(value, showEmptyWhenZero, decimalPlaces));
    }, [value, showEmptyWhenZero, decimalPlaces]);

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

      if (!isValidCurrencyText(nextText, allowNegative)) {
        return;
      }

      setTextValue(nextText);

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
          ),
        );
      } else {
        const parsed = Number.parseFloat(raw);
        let next: number | null = Number.isFinite(parsed)
          ? allowNegative
            ? parsed
            : Math.max(0, parsed)
          : allowEmptyAsZero
            ? 0
            : null;
        if (next == null) {
          emitEmpty();
          setTextValue("");
        } else {
          emitNumber(next);
          setTextValue(
            displayFromNumber(next, showEmptyWhenZero, decimalPlaces),
          );
        }
      }
      onBlur?.(event);
    };

    return (
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>{getCurrencySymbol(currency)}</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          ref={ref}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          min={min}
          step={step}
          value={textValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={cn(className)}
          {...props}
        />
      </InputGroup>
    );
  },
);

InputCurrency.displayName = "InputCurrency";

export { InputCurrency, type InputCurrencyProps };
