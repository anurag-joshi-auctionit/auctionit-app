

import {
  DATE_RANGE_PRESET,
  DateRangePicker,
  type DateRangePreset,
} from "./date-range";
import { InputGroup } from "./input-group";
import {
  SelectSearch,
  SelectSearchCommand,
  SelectSearchContent,
  SelectSearchEmpty,
  SelectSearchGroup,
  SelectSearchInput,
  SelectSearchItem,
  SelectSearchList,
  SelectSearchTrigger,
  SelectSearchValue,
} from "./select-search";
import type {
  ColumnDateRangeFilterValue,
  DateFilterColumnOption,
} from "../../lib/filters/date-range-filter";
import { cn } from "../../lib/utils";

export type { ColumnDateRangeFilterValue };
export type { BidderDateFilterField as DateFilterField } from "../../lib/filters/date-range-filter";

export interface ColumnDateRangeFilterProps<TField extends string = string> {
  columns: DateFilterColumnOption<TField>[];
  value: ColumnDateRangeFilterValue<TField>;
  onChange: (value: ColumnDateRangeFilterValue<TField>) => void;
  preset?: DateRangePreset;
  applyDefaultOnMount?: boolean;
  selectClassName?: string;
  className?: string;
  dateRangePickerId?: string;
  selectId?: string;
}

export function ColumnDateRangeFilter<TField extends string = string>({
  columns,
  value,
  onChange,
  preset = DATE_RANGE_PRESET.THIS_MONTH,
  applyDefaultOnMount = true,
  selectClassName,
  className,
  dateRangePickerId = "column-date-range-picker",
  selectId = "column-date-range-field",
}: ColumnDateRangeFilterProps<TField>) {
  const selectedLabel =
    columns.find((col) => col.value === value.field)?.label ?? "Select column";

  return (
    <InputGroup
      className={cn(
        "w-fit h-auto grid grid-cols-1 sm:grid-cols-2 divide-input divide-y divide-x-0 sm:divide-x sm:divide-y-0",
        className,
      )}
    >
      <SelectSearch
        value={value.field}
        onValueChange={(field) =>
          onChange({ field: field as TField, range: value.range })
        }
        placeholder="Search date column…"
      >
        <SelectSearchTrigger
          id={selectId}
          variant="ghost"
          data-slot="input-group-control"
          className={cn(
            "w-full min-w-40 hover:rounded-r-none",
            selectClassName,
          )}
        >
          <SelectSearchValue>{selectedLabel}</SelectSearchValue>
        </SelectSearchTrigger>
        <SelectSearchContent popoverWidth="w-[min(100vw-2rem,220px)]">
          <SelectSearchCommand>
            <SelectSearchInput placeholder="Search date column…" />
            <SelectSearchList maxHeight="h-48">
              <SelectSearchEmpty emptyText="No column found." />
              <SelectSearchGroup>
                {columns.map((col) => (
                  <SelectSearchItem
                    key={col.value}
                    value={col.value}
                    searchText={col.label}
                    label={col.label}
                  >
                    {col.label}
                  </SelectSearchItem>
                ))}
              </SelectSearchGroup>
            </SelectSearchList>
          </SelectSearchCommand>
        </SelectSearchContent>
      </SelectSearch>

      <DateRangePicker
        id={dateRangePickerId}
        placeholder="Select a Date Range"
        preset={preset}
        applyDefaultOnMount={applyDefaultOnMount}
        value={value.range}
        onChange={(range) => onChange({ field: value.field, range })}
        className={cn("min-w-0 flex-1 hover:rounded-l-none")}
      />
    </InputGroup>
  );
}
