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
  isSelectSearchClear,
} from "@auctionit/ui";
import {
  ClosedAuctionsDateFilter,
} from "@/components/auctions/closed-auctions-date-filter";
import {
  clientDisplayLabel,
  companyDisplayLabel,
} from "@/lib/portal-display-labels";

type DateRange = { from?: Date; to?: Date };

export type ClosedAuctionClientOption = {
  clientId: number;
  name: string;
};

export function ClosedAuctionsFilters({
  clients,
  clientId,
  dateRange,
  onClientChange,
  onDateRangeChange,
  entity = "client",
}: {
  clients: ClosedAuctionClientOption[];
  clientId: number | null;
  dateRange: DateRange | undefined;
  onClientChange: (clientId: number | null) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  /** Bidder lists use "client"; client portal lists use "company". */
  entity?: "client" | "company";
}) {
  const selected = clients.find((c) => c.clientId === clientId);
  const labelFn = entity === "company" ? companyDisplayLabel : clientDisplayLabel;
  const selectedLabel = selected ? labelFn(selected.name) : undefined;
  const placeholder = entity === "company" ? "Company" : "Client";
  const searchPlaceholder =
    entity === "company" ? "Search company" : "Search client";
  const emptyText =
    entity === "company" ? "No companies found." : "No clients found.";

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <SelectSearch
        value={clientId != null ? String(clientId) : ""}
        onValueChange={(v) => {
          if (isSelectSearchClear(v) || !v) {
            onClientChange(null);
            return;
          }
          const n = Number(v);
          onClientChange(Number.isInteger(n) && n > 0 ? n : null);
        }}
        placeholder={placeholder}
        clearable
      >
        <SelectSearchTrigger
          id="closed-auctions-client"
          className="w-[min(100vw-2rem,240px)]"
          aria-label={placeholder}
        >
          <SelectSearchValue placeholder={placeholder}>
            {selectedLabel}
          </SelectSearchValue>
        </SelectSearchTrigger>
        <SelectSearchContent popoverWidth="w-[min(100vw-2rem,320px)]">
          <SelectSearchCommand>
            <SelectSearchInput placeholder={searchPlaceholder} />
            <SelectSearchList>
              <SelectSearchEmpty emptyText={emptyText} />
              <SelectSearchGroup>
                {clients.map((c) => (
                  <SelectSearchItem
                    key={c.clientId}
                    value={String(c.clientId)}
                    keywords={[c.name]}
                  >
                    {labelFn(c.name)}
                  </SelectSearchItem>
                ))}
              </SelectSearchGroup>
            </SelectSearchList>
          </SelectSearchCommand>
        </SelectSearchContent>
      </SelectSearch>

      <ClosedAuctionsDateFilter value={dateRange} onChange={onDateRangeChange} />
    </div>
  );
}
