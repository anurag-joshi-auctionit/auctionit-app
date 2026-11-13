import { Suspense, useEffect } from "react";
import { useAuth } from "@auctionit/lib";
import {
  DATE_RANGE_PRESET,
  DateRangePicker,
} from "@auctionit/ui/components/ui/date-range";
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
  Skeleton,
  formatDateParam,
  isSelectSearchClear,
} from "@auctionit/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { bidderDashboardKeys } from "@/components/bidder-dashboard/query-keys";
import type {
  BidderDashboardClientOption,
  BidderLiftingFilters,
} from "@/components/bidder-dashboard/types";
import {
  defaultBidderDashboardFilters,
  type StoredBidderDashboardFilters,
} from "@/components/bidder-dashboard/filters-storage";
import { clientDisplayLabel } from "@/lib/portal-display-labels";

type DateRange = { from?: Date; to?: Date };

function PlantMaterialSelects({
  from,
  to,
  clientId,
  plantLocationId,
  itemId,
  onPlantChange,
  onItemChange,
}: {
  from: string;
  to: string;
  clientId: number;
  plantLocationId: number | null;
  itemId: number | null;
  onPlantChange: (value: string) => void;
  onItemChange: (value: string) => void;
}) {
  const { api } = useAuth();
  const qs = new URLSearchParams({
    from,
    to,
    clientId: String(clientId),
  });

  const { data: materialFilters } = useSuspenseQuery({
    queryKey: bidderDashboardKeys.liftingFilters(from, to, clientId),
    queryFn: () =>
      api.get<BidderLiftingFilters>(
        `/bidder/dashboard/lifting/filters?${qs.toString()}`,
      ),
  });

  useEffect(() => {
    if (
      plantLocationId != null &&
      !materialFilters.plants.some((p) => p.id === plantLocationId)
    ) {
      onPlantChange("");
    }
    if (
      itemId != null &&
      !materialFilters.items.some((i) => i.id === itemId)
    ) {
      onItemChange("");
    }
  }, [
    materialFilters.plants,
    materialFilters.items,
    plantLocationId,
    itemId,
    onPlantChange,
    onItemChange,
  ]);

  const selectedPlant = materialFilters.plants.find(
    (p) => p.id === plantLocationId,
  );
  const selectedItem = materialFilters.items.find((i) => i.id === itemId);

  return (
    <>
      <SelectSearch
        value={plantLocationId != null ? String(plantLocationId) : ""}
        onValueChange={(v) => {
          onPlantChange(isSelectSearchClear(v) ? "" : v);
        }}
        placeholder="Plant location"
        clearable
      >
        <SelectSearchTrigger
          id="bidder-dashboard-plant"
          className="w-[min(100vw-2rem,200px)]"
          aria-label="Plant location"
        >
          <SelectSearchValue placeholder="Plant location">
            {selectedPlant?.name}
          </SelectSearchValue>
        </SelectSearchTrigger>
        <SelectSearchContent>
          <SelectSearchCommand>
            <SelectSearchInput placeholder="Search plant…" />
            <SelectSearchList>
              <SelectSearchEmpty emptyText="No plants found." />
              <SelectSearchGroup>
                {materialFilters.plants.map((p) => (
                  <SelectSearchItem
                    key={p.id}
                    value={String(p.id)}
                    keywords={[p.name]}
                  >
                    {p.name || `Plant #${p.id}`}
                  </SelectSearchItem>
                ))}
              </SelectSearchGroup>
            </SelectSearchList>
          </SelectSearchCommand>
        </SelectSearchContent>
      </SelectSearch>

      <SelectSearch
        value={itemId != null ? String(itemId) : ""}
        onValueChange={(v) => {
          onItemChange(isSelectSearchClear(v) ? "" : v);
        }}
        placeholder="Material"
        clearable
      >
        <SelectSearchTrigger
          id="bidder-dashboard-material"
          className="w-[min(100vw-2rem,200px)]"
          aria-label="Material"
        >
          <SelectSearchValue placeholder="Material">
            {selectedItem?.name}
          </SelectSearchValue>
        </SelectSearchTrigger>
        <SelectSearchContent>
          <SelectSearchCommand>
            <SelectSearchInput placeholder="Search material…" />
            <SelectSearchList>
              <SelectSearchEmpty emptyText="No materials found." />
              <SelectSearchGroup>
                {materialFilters.items.map((i) => (
                  <SelectSearchItem
                    key={i.id}
                    value={String(i.id)}
                    keywords={[i.name]}
                  >
                    {i.name || `Item #${i.id}`}
                  </SelectSearchItem>
                ))}
              </SelectSearchGroup>
            </SelectSearchList>
          </SelectSearchCommand>
        </SelectSearchContent>
      </SelectSearch>
    </>
  );
}

function DisabledPlantMaterialSelects() {
  return (
    <>
      <SelectSearch value="" onValueChange={() => {}} placeholder="Plant location">
        <SelectSearchTrigger
          id="bidder-dashboard-plant"
          className="w-[min(100vw-2rem,200px)]"
          aria-label="Plant location"
          disabled
        >
          <SelectSearchValue placeholder="Plant location" />
        </SelectSearchTrigger>
        <SelectSearchContent>
          <SelectSearchCommand>
            <SelectSearchList>
              <SelectSearchEmpty emptyText="Select a client first." />
            </SelectSearchList>
          </SelectSearchCommand>
        </SelectSearchContent>
      </SelectSearch>

      <SelectSearch value="" onValueChange={() => {}} placeholder="Material">
        <SelectSearchTrigger
          id="bidder-dashboard-material"
          className="w-[min(100vw-2rem,200px)]"
          aria-label="Material"
          disabled
        >
          <SelectSearchValue placeholder="Material" />
        </SelectSearchTrigger>
        <SelectSearchContent>
          <SelectSearchCommand>
            <SelectSearchList>
              <SelectSearchEmpty emptyText="Select a client first." />
            </SelectSearchList>
          </SelectSearchCommand>
        </SelectSearchContent>
      </SelectSearch>
    </>
  );
}

export function LiftingFiltersBar({
  filters,
  dateRange,
  onPatch,
  onPlantChange,
  onItemChange,
}: {
  filters: StoredBidderDashboardFilters;
  dateRange: DateRange | undefined;
  onPatch: (patch: Partial<StoredBidderDashboardFilters>) => void;
  onPlantChange: (value: string) => void;
  onItemChange: (value: string) => void;
}) {
  const { api } = useAuth();
  const from = filters.from!;
  const to = filters.to!;
  const clientId = filters.clientId;
  const plantLocationId = filters.plantLocationId;
  const itemId = filters.itemId;

  const { data: clients } = useSuspenseQuery({
    queryKey: bidderDashboardKeys.clients(from, to),
    queryFn: () =>
      api.get<BidderDashboardClientOption[]>(
        `/bidder/dashboard/clients?from=${from}&to=${to}`,
      ),
  });

  useEffect(() => {
    if (
      clientId != null &&
      !clients.some((c) => c.clientId === clientId)
    ) {
      onPatch({
        clientId: null,
        plantLocationId: null,
        itemId: null,
      });
    }
  }, [clients, clientId, onPatch]);

  useEffect(() => {
    if (clientId == null && (plantLocationId != null || itemId != null)) {
      onPatch({ plantLocationId: null, itemId: null });
    }
  }, [clientId, plantLocationId, itemId, onPatch]);

  const selectedClient = clients.find((c) => c.clientId === clientId);

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <DateRangePicker
        id="bidder-dashboard-lifting-range"
        value={
          dateRange?.from
            ? { from: dateRange.from, to: dateRange.to }
            : undefined
        }
        onChange={(range) => {
          if (!range?.from || !range.to) {
            const defaults = defaultBidderDashboardFilters();
            onPatch({
              from: defaults.from,
              to: defaults.to,
              plantLocationId: null,
              itemId: null,
            });
            return;
          }
          onPatch({
            from: formatDateParam(range.from),
            to: formatDateParam(range.to),
            plantLocationId: null,
            itemId: null,
          });
        }}
        preset={DATE_RANGE_PRESET.LAST_30_DAYS}
        applyDefaultOnMount={false}
        placeholder="Select Date Range"
      />

      <SelectSearch
        value={clientId != null ? String(clientId) : ""}
        onValueChange={(v) => {
          if (isSelectSearchClear(v) || !v) {
            onPatch({
              clientId: null,
              plantLocationId: null,
              itemId: null,
            });
            return;
          }
          const n = Number(v);
          onPatch({
            clientId: Number.isInteger(n) && n > 0 ? n : null,
            plantLocationId: null,
            itemId: null,
          });
        }}
        placeholder="Client"
        clearable
      >
        <SelectSearchTrigger
          id="bidder-dashboard-client"
          className="w-[min(100vw-2rem,200px)]"
          aria-label="Client"
        >
          <SelectSearchValue placeholder="Client">
            {selectedClient
              ? clientDisplayLabel(selectedClient.companyName)
              : undefined}
          </SelectSearchValue>
        </SelectSearchTrigger>
        <SelectSearchContent popoverWidth="w-[min(100vw-2rem,320px)]">
          <SelectSearchCommand>
            <SelectSearchInput placeholder="Search client" />
            <SelectSearchList>
              <SelectSearchEmpty emptyText="No clients found." />
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

      {clientId != null ? (
        <Suspense
          fallback={
            <>
              <Skeleton className="h-9 w-[200px]" />
              <Skeleton className="h-9 w-[200px]" />
            </>
          }
        >
          <PlantMaterialSelects
            from={from}
            to={to}
            clientId={clientId}
            plantLocationId={plantLocationId}
            itemId={itemId}
            onPlantChange={onPlantChange}
            onItemChange={onItemChange}
          />
        </Suspense>
      ) : (
        <DisabledPlantMaterialSelects />
      )}
    </div>
  );
}

export function LiftingFiltersSuspense() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <Skeleton className="h-9 w-[220px]" />
      <Skeleton className="h-9 w-[200px]" />
      <Skeleton className="h-9 w-[200px]" />
      <Skeleton className="h-9 w-[200px]" />
    </div>
  );
}
