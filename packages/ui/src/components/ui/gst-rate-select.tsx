import type * as React from "react";
import { GST_RATE_OPTIONS, type GstRate } from "@auctionit/lib/gst-rates";

import { cn } from "../../lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

type GstRateSelectProps = {
  value: GstRate | null | undefined;
  onValueChange: (value: GstRate) => void;
  disabled?: boolean;
  placeholder?: string;
} & Omit<React.ComponentProps<typeof SelectTrigger>, "onChange" | "value">;

function GstRateSelect({
  value,
  onValueChange,
  disabled,
  placeholder = "Select GST%",
  className,
  ...triggerProps
}: GstRateSelectProps) {
  return (
    <Select
      value={value != null ? String(value) : undefined}
      onValueChange={(v) => onValueChange(Number(v) as GstRate)}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-full", className)} {...triggerProps}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {GST_RATE_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={String(opt.value)}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { GstRateSelect, type GstRateSelectProps };
