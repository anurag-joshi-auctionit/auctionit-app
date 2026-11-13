import { useState } from "react";
import {
  DATE_RANGE_PRESET,
  DateRangePicker,
} from "@auctionit/ui/components/ui/date-range";
import { formatDateParam } from "@auctionit/ui";
import { getPresetRange } from "@auctionit/ui/lib/utils/date";

type DateRange = { from?: Date; to?: Date };

function thisMonthRange(): DateRange {
  const range = getPresetRange(DATE_RANGE_PRESET.THIS_MONTH, new Date());
  return { from: range.from, to: range.to };
}

export function useClosedAuctionDateRange() {
  const initial = thisMonthRange();
  const [range, setRange] = useState<DateRange | undefined>(initial);
  const [applied, setApplied] = useState<DateRange | undefined>(initial);

  function onChange(next: DateRange | undefined) {
    setRange(next);
    if (next == null || (next.from && next.to)) setApplied(next);
  }

  const from =
    applied?.from && applied.to ? formatDateParam(applied.from) : undefined;
  const to =
    applied?.from && applied.to ? formatDateParam(applied.to) : undefined;
  return { range, onChange, from, to, cleared: applied == null };
}

export function ClosedAuctionsDateFilter({
  value,
  onChange,
  id = "closed-auctions-date-range",
}: {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  id?: string;
}) {
  return (
    <DateRangePicker
      id={id}
      value={value?.from ? { from: value.from, to: value.to } : undefined}
      onChange={onChange}
      preset={DATE_RANGE_PRESET.THIS_MONTH}
      applyDefaultOnMount={false}
      placeholder="Select Date Range"
    />
  );
}
