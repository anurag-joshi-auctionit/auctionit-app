import { Input } from "@auctionit/ui";
import type { ComponentProps } from "react";
import {
  GSTIN_MAX_LENGTH,
  normalizeGstinInput,
  normalizePanInput,
  normalizePincodeInput,
  PAN_MAX_LENGTH,
  PINCODE_MAX_LENGTH,
} from "@auctionit/lib/validation";

type FormattedInputProps = Omit<
  ComponentProps<typeof Input>,
  "onChange" | "value" | "maxLength"
> & {
  value: string;
  onChange: (value: string) => void;
};

function FormattedInput({
  value,
  onChange,
  normalize,
  maxLength,
  inputMode,
  autoComplete,
  className,
  ...props
}: FormattedInputProps & {
  normalize: (value: string) => string;
  maxLength: number;
  inputMode?: ComponentProps<typeof Input>["inputMode"];
  autoComplete?: string;
}) {
  return (
    <Input
      {...props}
      className={className ?? "uppercase"}
      inputMode={inputMode}
      autoComplete={autoComplete}
      maxLength={maxLength}
      value={value}
      onChange={(event) => onChange(normalize(event.target.value))}
    />
  );
}

export function PincodeInput(props: FormattedInputProps) {
  return (
    <FormattedInput
      {...props}
      normalize={normalizePincodeInput}
      maxLength={PINCODE_MAX_LENGTH}
      inputMode="numeric"
      autoComplete="postal-code"
      className={props.className ?? "tabular-nums"}
    />
  );
}

export function PanInput(props: FormattedInputProps) {
  return (
    <FormattedInput
      {...props}
      normalize={normalizePanInput}
      maxLength={PAN_MAX_LENGTH}
      autoComplete="off"
    />
  );
}

export function GstinInput(props: FormattedInputProps) {
  return (
    <FormattedInput
      {...props}
      normalize={normalizeGstinInput}
      maxLength={GSTIN_MAX_LENGTH}
      autoComplete="off"
    />
  );
}
