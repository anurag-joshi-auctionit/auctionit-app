import {
  Button,
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
import { ClientReportsMessages } from "@auctionit/messages/reports";
import { Download01, Loading02 } from "@untitledui/icons";
import { ClosedAuctionsDateFilter } from "@/components/auctions/closed-auctions-date-filter";
import type {
  ReportAuctionOption,
  ReportClientOption,
} from "@/components/reports/report-types";
import {
  auctionDisplayLabel,
  clientDisplayLabel,
} from "@/lib/portal-display-labels";

type DateRange = { from?: Date; to?: Date };

export function BidDetailsFilters({
  clients,
  auctions,
  clientId,
  auctionId,
  dateRange,
  clientsLoading,
  auctionsEnabled,
  auctionsLoading,
  canGetData,
  canExport,
  exporting,
  onClientChange,
  onAuctionChange,
  onDateRangeChange,
  onGetData,
  onExport,
}: {
  clients: ReportClientOption[];
  auctions: ReportAuctionOption[];
  clientId: number | null;
  auctionId: number | null;
  dateRange: DateRange | undefined;
  clientsLoading: boolean;
  auctionsEnabled: boolean;
  auctionsLoading: boolean;
  canGetData: boolean;
  canExport: boolean;
  exporting: boolean;
  onClientChange: (clientId: number | null) => void;
  onAuctionChange: (auctionId: number | null) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onGetData: () => void;
  onExport: () => void;
}) {
  const selectedClient = clients.find((c) => c.clientId === clientId);
  const selectedAuction = auctions.find((a) => a.auctionId === auctionId);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ClosedAuctionsDateFilter
        value={dateRange}
        onChange={onDateRangeChange}
        id="bid-details-date-range"
      />

      <SelectSearch
        value={clientId != null ? String(clientId) : ""}
        onValueChange={(value) => {
          if (isSelectSearchClear(value) || !value) {
            onClientChange(null);
            return;
          }
          const n = Number(value);
          onClientChange(Number.isInteger(n) && n > 0 ? n : null);
        }}
        placeholder="Select Client"
        clearable
      >
        <SelectSearchTrigger
          id="bid-details-client"
          className="w-[min(100vw-2rem,280px)]"
          aria-label="Client"
          loading={clientsLoading}
        >
          <SelectSearchValue placeholder="Select Client">
            {selectedClient
              ? clientDisplayLabel(selectedClient.companyName)
              : undefined}
          </SelectSearchValue>
        </SelectSearchTrigger>
        <SelectSearchContent popoverWidth="w-[min(100vw-2rem,320px)]">
          <SelectSearchCommand>
            <SelectSearchInput placeholder="Search client" />
            <SelectSearchList>
              <SelectSearchEmpty
                emptyText={
                  clientsLoading ? "Loading clients…" : "No clients found."
                }
              />
              <SelectSearchGroup>
                {clients.map((c) => (
                  <SelectSearchItem
                    key={c.clientId}
                    value={String(c.clientId)}
                    keywords={[c.companyName, String(c.clientId)]}
                  >
                    {clientDisplayLabel(c.companyName)}
                  </SelectSearchItem>
                ))}
              </SelectSearchGroup>
            </SelectSearchList>
          </SelectSearchCommand>
        </SelectSearchContent>
      </SelectSearch>

      <SelectSearch
        value={auctionId != null ? String(auctionId) : ""}
        onValueChange={(value) => {
          if (isSelectSearchClear(value) || !value) {
            onAuctionChange(null);
            return;
          }
          const n = Number(value);
          onAuctionChange(Number.isInteger(n) && n > 0 ? n : null);
        }}
        placeholder="Select Auction No."
        clearable
      >
        <SelectSearchTrigger
          id="bid-details-auction"
          className="w-[min(100vw-2rem,360px)]"
          aria-label="Auction No."
          disabled={!auctionsEnabled}
          loading={auctionsLoading}
        >
          <SelectSearchValue placeholder="Select Auction No.">
            {selectedAuction
              ? auctionDisplayLabel(selectedAuction.auctionNumber)
              : undefined}
          </SelectSearchValue>
        </SelectSearchTrigger>
        <SelectSearchContent popoverWidth="w-[min(100vw-2rem,420px)]">
          <SelectSearchCommand>
            <SelectSearchInput placeholder="Search auction" />
            <SelectSearchList>
              <SelectSearchEmpty
                emptyText={
                  auctionsLoading
                    ? "Loading auctions…"
                    : "No auctions found."
                }
              />
              <SelectSearchGroup>
                {auctions.map((a) => (
                  <SelectSearchItem
                    key={a.auctionId}
                    value={String(a.auctionId)}
                    keywords={[
                      a.auctionNumber ?? "",
                      a.auctionDate ?? "",
                      String(a.auctionId),
                    ]}
                  >
                    {auctionDisplayLabel(a.auctionNumber)}
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
