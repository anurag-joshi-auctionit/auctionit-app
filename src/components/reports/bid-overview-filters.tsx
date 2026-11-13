import {
  Button,
  EntityIdOptionLabel,
  SelectSearch,
  SelectSearchCommand,
  SelectSearchContent,
  SelectSearchGroup,
  SelectSearchItem,
  SelectSearchList,
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
  SelectSearchTrigger,
  SelectSearchValue,
  isSelectSearchClear,
} from "@auctionit/ui";
import { ClientReportsMessages } from "@auctionit/messages/reports";
import { Download01, Loading02 } from "@untitledui/icons";
import { ClosedAuctionsDateFilter } from "@/components/auctions/closed-auctions-date-filter";
import type {
  BidOverviewMode,
  ReportAuctionOption,
  ReportClientOption,
} from "@/components/reports/report-types";
import {
  auctionDisplayLabel,
  clientDisplayLabel,
} from "@/lib/portal-display-labels";

type DateRange = { from?: Date; to?: Date };

const BID_MODE_OPTIONS: { value: BidOverviewMode; label: string }[] = [
  { value: "bid", label: "Bid" },
  { value: "no-bid", label: "No-Bid" },
];

export function BidOverviewFilters({
  clients,
  auctions,
  clientIds,
  auctionIds,
  bidMode,
  dateRange,
  clientsLoading,
  auctionsEnabled,
  auctionsLoading,
  canGetData,
  canExport,
  exporting,
  onClientIdsChange,
  onAuctionIdsChange,
  onBidModeChange,
  onDateRangeChange,
  onGetData,
  onExport,
}: {
  clients: ReportClientOption[];
  auctions: ReportAuctionOption[];
  clientIds: number[];
  auctionIds: number[];
  bidMode: BidOverviewMode | null;
  dateRange: DateRange | undefined;
  clientsLoading: boolean;
  auctionsEnabled: boolean;
  auctionsLoading: boolean;
  canGetData: boolean;
  canExport: boolean;
  exporting: boolean;
  onClientIdsChange: (clientIds: number[]) => void;
  onAuctionIdsChange: (auctionIds: number[]) => void;
  onBidModeChange: (bidMode: BidOverviewMode | null) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onGetData: () => void;
  onExport: () => void;
}) {
  const clientIdValues = clientIds.map(String);
  const auctionIdValues = auctionIds.map(String);
  const bidModeLabel = BID_MODE_OPTIONS.find((o) => o.value === bidMode)?.label;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ClosedAuctionsDateFilter
        value={dateRange}
        onChange={onDateRangeChange}
        id="bid-overview-date-range"
      />

      <SelectSearchMulti
        clearable
        selectAll
        options={clients.map((c) => ({
          value: String(c.clientId),
          label: clientDisplayLabel(c.companyName),
          searchText: `${c.companyName} ${c.clientId}`,
        }))}
        value={clientIdValues}
        onValueChange={(next) => {
          onClientIdsChange(
            next
              .map(Number)
              .filter((n) => Number.isInteger(n) && n > 0),
          );
        }}
      >
        <SelectSearchMultiTrigger
          id="bid-overview-client"
          className="w-[min(100vw-2rem,280px)]"
          aria-label="Clients"
          loading={clientsLoading}
        >
          <SelectSearchMultiValue placeholder="Clients" />
        </SelectSearchMultiTrigger>
        <SelectSearchMultiContent popoverWidth="w-[min(100vw-2rem,320px)]">
          <SelectSearchMultiCommand>
            <SelectSearchMultiInput placeholder="Search client" />
            <SelectSearchMultiList>
              <SelectSearchMultiEmpty
                emptyText={
                  clientsLoading ? "Loading clients…" : "No clients found."
                }
              />
              <SelectSearchMultiGroup>
                {clients.map((c) => {
                  const label = clientDisplayLabel(c.companyName);
                  return (
                    <SelectSearchMultiItem
                      key={c.clientId}
                      value={String(c.clientId)}
                      label={label}
                      searchText={`${c.companyName} ${c.clientId}`}
                    >
                      <EntityIdOptionLabel
                        label={label}
                        id={String(c.clientId)}
                      />
                    </SelectSearchMultiItem>
                  );
                })}
              </SelectSearchMultiGroup>
            </SelectSearchMultiList>
          </SelectSearchMultiCommand>
        </SelectSearchMultiContent>
      </SelectSearchMulti>

      <SelectSearchMulti
        clearable
        selectAll
        options={auctions.map((a) => ({
          value: String(a.auctionId),
          label: auctionDisplayLabel(a.auctionNumber),
          searchText: `${a.auctionNumber ?? ""} ${a.auctionDate ?? ""} ${a.auctionId}`,
        }))}
        value={auctionIdValues}
        onValueChange={(next) => {
          onAuctionIdsChange(
            next
              .map(Number)
              .filter((n) => Number.isInteger(n) && n > 0),
          );
        }}
      >
        <SelectSearchMultiTrigger
          id="bid-overview-auction"
          className="w-[min(100vw-2rem,360px)]"
          aria-label="Auction No."
          disabled={!auctionsEnabled}
          loading={auctionsLoading}
        >
          <SelectSearchMultiValue placeholder="Auctions" />
        </SelectSearchMultiTrigger>
        <SelectSearchMultiContent popoverWidth="w-[min(100vw-2rem,420px)]">
          <SelectSearchMultiCommand>
            <SelectSearchMultiInput placeholder="Search auction" />
            <SelectSearchMultiList>
              <SelectSearchMultiEmpty
                emptyText={
                  auctionsLoading
                    ? "Loading auctions…"
                    : "No auctions found."
                }
              />
              <SelectSearchMultiGroup>
                {auctions.map((a) => {
                  const label = auctionDisplayLabel(a.auctionNumber);
                  return (
                    <SelectSearchMultiItem
                      key={a.auctionId}
                      value={String(a.auctionId)}
                      label={label}
                      searchText={`${a.auctionNumber ?? ""} ${a.auctionDate ?? ""} ${a.auctionId}`}
                    >
                      <EntityIdOptionLabel
                        label={label}
                        id={String(a.auctionId)}
                      />
                    </SelectSearchMultiItem>
                  );
                })}
              </SelectSearchMultiGroup>
            </SelectSearchMultiList>
          </SelectSearchMultiCommand>
        </SelectSearchMultiContent>
      </SelectSearchMulti>

      <SelectSearch
        value={bidMode ?? ""}
        onValueChange={(value) => {
          if (isSelectSearchClear(value) || !value) {
            onBidModeChange(null);
            return;
          }
          if (value === "bid" || value === "no-bid") {
            onBidModeChange(value);
          }
        }}
        placeholder="Bid / No-Bid"
        clearable
      >
        <SelectSearchTrigger
          id="bid-overview-bid-mode"
          className="w-[min(100vw-2rem,160px)]"
          aria-label="Bid / No-Bid"
        >
          <SelectSearchValue placeholder="Bid / No-Bid">
            {bidModeLabel}
          </SelectSearchValue>
        </SelectSearchTrigger>
        <SelectSearchContent popoverWidth="w-[180px]">
          <SelectSearchCommand>
            <SelectSearchList>
              <SelectSearchGroup>
                {BID_MODE_OPTIONS.map((o) => (
                  <SelectSearchItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectSearchItem>
                ))}
              </SelectSearchGroup>
            </SelectSearchList>
          </SelectSearchCommand>
        </SelectSearchContent>
      </SelectSearch>

      <Button
        type="button"
        size="sm"
        disabled={!canGetData}
        onClick={onGetData}
      >
        {ClientReportsMessages.GET_DATA}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!canExport || exporting}
        onClick={onExport}
      >
        {exporting ? (
          <Loading02 className="size-4 animate-spin" />
        ) : (
          <Download01 className="size-4" />
        )}
        Export
      </Button>
    </div>
  );
}
