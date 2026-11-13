import type { ReactNode } from "react";
import {
  SelectSearchMulti,
  SelectSearchMultiCommand,
  SelectSearchMultiContent,
  SelectSearchMultiEmpty,
  SelectSearchMultiGroup,
  SelectSearchMultiInput,
  SelectSearchMultiItem,
  SelectSearchMultiList,
  SelectSearchMultiTrigger,
  SelectSearchMultiValue,
} from "@auctionit/ui";

export type SortKey = "lot" | "price" | "nobid" | "participated";

export const LIVE_AUCTION_SORTS: { value: SortKey; label: string }[] = [
  { value: "lot", label: "Display Order" },
  { value: "price", label: "Start Bid Price (Low → High)" },
  { value: "nobid", label: "No Bid" },
  { value: "participated", label: "Participated" },
];

export function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

export function MultiSelect({
  options,
  value,
  onChange,
  triggerLabel,
  chipLabel,
  searchPlaceholder,
  emptyText,
  width,
}: {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
  triggerLabel: string;
  /** Label shown on the trigger (falls back to triggerLabel). */
  chipLabel?: string;
  searchPlaceholder: string;
  emptyText: string;
  width: string;
}) {
  return (
    <SelectSearchMulti
      clearable
      options={options.map((o) => ({
        value: o.value,
        label: o.label,
        searchText: o.label,
      }))}
      value={value}
      onValueChange={onChange}
    >
      <SelectSearchMultiTrigger className={width}>
        <SelectSearchMultiValue placeholder={chipLabel ?? triggerLabel} />
      </SelectSearchMultiTrigger>
      <SelectSearchMultiContent>
        <SelectSearchMultiCommand>
          <SelectSearchMultiInput placeholder={searchPlaceholder} />
          <SelectSearchMultiList>
            <SelectSearchMultiEmpty emptyText={emptyText} />
            <SelectSearchMultiGroup>
              {options.map((o) => (
                <SelectSearchMultiItem
                  key={o.value}
                  value={o.value}
                  label={o.label}
                  searchText={o.label}
                >
                  {o.label}
                </SelectSearchMultiItem>
              ))}
            </SelectSearchMultiGroup>
          </SelectSearchMultiList>
        </SelectSearchMultiCommand>
      </SelectSearchMultiContent>
    </SelectSearchMulti>
  );
}
