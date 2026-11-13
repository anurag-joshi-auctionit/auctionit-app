import { useEffect } from "react";
import { useAuth } from "@auctionit/lib";
import { ClientDashboardMessages } from "@auctionit/messages/client-dashboard";
import { IllustratedEmpty, formatDateParam } from "@auctionit/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { dashboardKeys } from "@/components/dashboard/query-keys";
import type { DashboardClientOption } from "@/components/dashboard/types";
import type { StoredDashboardFilters } from "@/components/dashboard/filters-storage";

type DateRange = { from?: Date; to?: Date };

export function DashboardClientsActions({
  filters,
  dateRange,
  onPatch,
}: {
  filters: StoredDashboardFilters;
  dateRange: DateRange | undefined;
  onPatch: (patch: Partial<StoredDashboardFilters>) => void;
}) {
  const { api } = useAuth();
  const { data: clients } = useSuspenseQuery({
    queryKey: dashboardKeys.clients(),
    queryFn: () =>
      api.get<DashboardClientOption[]>("/client/dashboard/clients"),
  });

  useEffect(() => {
    if (filters.clientId == null) {
      const first = clients[0];
      if (first) onPatch({ clientId: first.clientId });
      return;
    }
    if (!clients.some((c) => c.clientId === filters.clientId)) {
      onPatch({
        clientId: null,
        plantLocationId: null,
        itemId: null,
        auctionId: null,
      });
    }
  }, [clients, filters.clientId, onPatch]);

  useEffect(() => {
    if (filters.from && filters.to) return;
    const now = new Date();
    const fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    onPatch({
      from: formatDateParam(fromDate),
      to: formatDateParam(toDate),
    });
  }, [filters.from, filters.to, onPatch]);

  if (clients.length === 0) {
    return (
      <IllustratedEmpty
        title={ClientDashboardMessages.CLIENTS_EMPTY_TITLE}
        description={ClientDashboardMessages.CLIENTS_EMPTY_DESCRIPTION}
        className="min-h-0 border-0 py-0"
        showIllustration={false}
      />
    );
  }

  return (
    <DashboardFilters
      clients={clients}
      clientId={filters.clientId}
      dateRange={dateRange}
      clientsLoading={false}
      onClientChange={(value) => {
        const n = Number(value);
        onPatch({
          clientId: Number.isInteger(n) && n > 0 ? n : null,
          plantLocationId: null,
          itemId: null,
          auctionId: null,
        });
      }}
      onDateRangeChange={(range) => {
        if (!range?.from || !range.to) {
          onPatch({
            from: null,
            to: null,
            auctionId: null,
            plantLocationId: null,
            itemId: null,
          });
          return;
        }
        onPatch({
          from: formatDateParam(range.from),
          to: formatDateParam(range.to),
          auctionId: null,
          plantLocationId: null,
          itemId: null,
        });
      }}
    />
  );
}
