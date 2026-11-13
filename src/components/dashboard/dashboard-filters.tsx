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
} from "@auctionit/ui";
import { ClosedAuctionsDateFilter } from "@/components/auctions/closed-auctions-date-filter";
import type { DashboardClientOption } from "@/components/dashboard/types";
import { clientDisplayLabel } from "@/lib/portal-display-labels";

type DateRange = { from?: Date; to?: Date };

export function DashboardFilters({
  clients,
  clientId,
  dateRange,
  clientsLoading,
  onClientChange,
  onDateRangeChange,
}: {
  clients: DashboardClientOption[];
  clientId: number | null;
  dateRange: DateRange | undefined;
  clientsLoading: boolean;
  onClientChange: (clientId: string) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
}) {
  const selectedClient = clients.find((c) => c.clientId === clientId);
  const clientLabel = selectedClient
    ? clientDisplayLabel(selectedClient.companyName)
    : undefined;

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <SelectSearch
        value={clientId != null ? String(clientId) : ""}
        onValueChange={onClientChange}
        placeholder="Select company"
      >
        <SelectSearchTrigger
          id="dashboard-client"
          className="w-[min(100vw-2rem,240px)]"
          aria-label="Company"
          loading={clientsLoading}
        >
          <SelectSearchValue placeholder="Select company">
            {clientLabel}
          </SelectSearchValue>
        </SelectSearchTrigger>
        <SelectSearchContent popoverWidth="w-[min(100vw-2rem,320px)]">
          <SelectSearchCommand>
            <SelectSearchInput placeholder="Search company" />
            <SelectSearchList>
              <SelectSearchEmpty
                emptyText={
                  clientsLoading ? "Loading companies…" : "No companies found."
                }
              />
              <SelectSearchGroup>
                {clients.map((c) => (
                  <SelectSearchItem
                    key={c.clientId}
                    value={String(c.clientId)}
                    keywords={[c.companyName]}
                  >
                    {clientDisplayLabel(c.companyName)}
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
