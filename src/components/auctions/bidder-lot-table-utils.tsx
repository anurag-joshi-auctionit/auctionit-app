import { useMemo, useState } from "react";
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

const EMPTY_PLANT = "__none__";

export function buildLotSearchKey(lot: { lotNumber: string | null }): string {
  return (lot.lotNumber ?? "").trim().toLowerCase();
}

export const bidderLotSearchFilter = {
  id: "searchKey",
  placeholder: "Search by lot no.",
  label: "Lot No.",
} as const;

function plantFilterValue(plantLocation: string | null): string {
  const trimmed = plantLocation?.trim();
  return trimmed ? trimmed : EMPTY_PLANT;
}

function plantFilterLabel(value: string): string {
  return value === EMPTY_PLANT ? "—" : value;
}

export function usePlantLocationFilter<T extends { plantLocation: string | null }>(
  lots: T[],
) {
  const [selected, setSelected] = useState<string[]>([]);

  const options = useMemo(() => {
    const values = new Set<string>();
    for (const lot of lots) values.add(plantFilterValue(lot.plantLocation));
    return [...values].sort((a, b) =>
      plantFilterLabel(a).localeCompare(plantFilterLabel(b)),
    );
  }, [lots]);

  const filtered = useMemo(() => {
    if (selected.length === 0) return lots;
    const allow = new Set(selected);
    return lots.filter((lot) => allow.has(plantFilterValue(lot.plantLocation)));
  }, [lots, selected]);

  return { selected, setSelected, options, filtered };
}

export function PlantLocationFilter({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <SelectSearchMulti
      clearable
      options={options.map((option) => ({
        value: option,
        label: plantFilterLabel(option),
      }))}
      value={value}
      onValueChange={onChange}
    >
      <SelectSearchMultiTrigger className="w-[min(100vw-2rem,240px)] shrink-0">
        <SelectSearchMultiValue placeholder="Plant location" />
      </SelectSearchMultiTrigger>
      <SelectSearchMultiContent>
        <SelectSearchMultiCommand>
          <SelectSearchMultiInput placeholder="Search plant locations…" />
          <SelectSearchMultiList>
            <SelectSearchMultiEmpty emptyText="No plant locations found." />
            <SelectSearchMultiGroup>
              {options.map((option) => (
                <SelectSearchMultiItem
                  key={option}
                  value={option}
                  label={plantFilterLabel(option)}
                >
                  {plantFilterLabel(option)}
                </SelectSearchMultiItem>
              ))}
            </SelectSearchMultiGroup>
          </SelectSearchMultiList>
        </SelectSearchMultiCommand>
      </SelectSearchMultiContent>
    </SelectSearchMulti>
  );
}
