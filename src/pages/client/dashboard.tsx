import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@auctionit/lib";
import { ClientDashboardMessages } from "@auctionit/messages/client-dashboard";
import {
  IllustratedEmpty,
  PageHeader,
  isSelectSearchClear,
} from "@auctionit/ui";
import { AccountSummaryError } from "@/components/dashboard/account-summary-error";
import { AccountSummarySection } from "@/components/dashboard/account-summary-section";
import { AccountSummarySuspense } from "@/components/dashboard/account-summary-suspense";
import { BidderDetailsSection } from "@/components/dashboard/bidder-details-section";
import { DashboardClientsActions } from "@/components/dashboard/dashboard-clients-actions";
import { DashboardClientsError } from "@/components/dashboard/dashboard-clients-error";
import { DashboardClientsSuspense } from "@/components/dashboard/dashboard-clients-suspense";
import {
  readStoredDashboardFilters,
  writeStoredDashboardFilters,
  type StoredDashboardFilters,
} from "@/components/dashboard/filters-storage";
import { LiftingDetailsError } from "@/components/dashboard/lifting-details-error";
import { LiftingDetailsSection } from "@/components/dashboard/lifting-details-section";
import { LiftingDetailsSuspense } from "@/components/dashboard/lifting-details-suspense";
import { MaterialDetailsSection } from "@/components/dashboard/material-details-section";
import { DashboardSectionBoundary } from "@/components/dashboard/section-boundary";
import { DashboardSectionHeader } from "@/components/dashboard/section-header";

type DateRange = { from?: Date; to?: Date };

function parseIsoDate(value: string | null): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function positiveIntOrNull(raw: string): number | null {
  if (!raw || isSelectSearchClear(raw)) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function DashboardPageClient() {
  const { user } = useAuth();
  const userId = user?.userId;

  const [filters, setFilters] = useState<StoredDashboardFilters | null>(null);

  useEffect(() => {
    if (userId == null) return;
    setFilters(readStoredDashboardFilters(userId));
  }, [userId]);

  useEffect(() => {
    if (userId == null || filters == null) return;
    writeStoredDashboardFilters(userId, filters);
  }, [userId, filters]);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [filters]);

  const patchFilters = useCallback((patch: Partial<StoredDashboardFilters>) => {
    setFilters((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const onPlantChange = useCallback(
    (value: string) => {
      patchFilters({ plantLocationId: positiveIntOrNull(value) });
    },
    [patchFilters],
  );

  const onItemChange = useCallback(
    (value: string) => {
      patchFilters({ itemId: positiveIntOrNull(value) });
    },
    [patchFilters],
  );

  const onAuctionChange = useCallback(
    (value: string) => {
      patchFilters({ auctionId: positiveIntOrNull(value) });
    },
    [patchFilters],
  );

  const clientId = filters?.clientId ?? null;
  const plantLocationId = filters?.plantLocationId ?? null;
  const itemId = filters?.itemId ?? null;
  const auctionId = filters?.auctionId ?? null;
  const from = filters?.from ?? undefined;
  const to = filters?.to ?? undefined;
  const filtersReady = clientId != null && from != null && to != null;

  const dateRange = useMemo((): DateRange | undefined => {
    const fromDate = parseIsoDate(filters?.from ?? null);
    const toDate = parseIsoDate(filters?.to ?? null);
    if (fromDate && toDate) return { from: fromDate, to: toDate };
    return undefined;
  }, [filters?.from, filters?.to]);

  return (
    <div>
      <div className="sticky top-0 z-10 border-b bg-background px-4 py-4">
        <PageHeader
          title="Dashboard"
          description="Account summary, bidder, material, and lifting metrics for your company."
          actions={
            filters != null ? (
              <DashboardSectionBoundary
                fallback={<DashboardClientsSuspense />}
                FallbackComponent={DashboardClientsError}
              >
                <DashboardClientsActions
                  filters={filters}
                  dateRange={dateRange}
                  onPatch={patchFilters}
                />
              </DashboardSectionBoundary>
            ) : (
              <DashboardClientsSuspense />
            )
          }
        />
      </div>

      <div className="p-4">
        {!filtersReady ? (
          <IllustratedEmpty
            className="sm:mt-8"
            title={ClientDashboardMessages.SELECT_FILTERS_TITLE}
            description={ClientDashboardMessages.SELECT_FILTERS_DESCRIPTION}
          />
        ) : (
          <>
            <section className="space-y-3" aria-labelledby="account-summary">
              <DashboardSectionHeader id="account-summary" title="Account Summary" />
              <DashboardSectionBoundary
                fallback={<AccountSummarySuspense />}
                FallbackComponent={AccountSummaryError}
              >
                <AccountSummarySection
                  clientId={clientId}
                  from={from}
                  to={to}
                />
              </DashboardSectionBoundary>
            </section>

            <section className="sm:mt-12" aria-labelledby="bidder-details">
              <BidderDetailsSection
                clientId={clientId}
                from={from}
                to={to}
                auctionId={auctionId}
                onAuctionChange={onAuctionChange}
              />
            </section>

            <section className="sm:mt-12" aria-labelledby="material-details">
              <MaterialDetailsSection
                clientId={clientId}
                from={from}
                to={to}
                plantLocationId={plantLocationId}
                itemId={itemId}
                onPlantChange={onPlantChange}
                onItemChange={onItemChange}
              />
            </section>

            <section className="sm:mt-12 space-y-3" aria-labelledby="lifting-details">
              <DashboardSectionHeader id="lifting-details" title="Lifting Details" />
              <DashboardSectionBoundary
                fallback={<LiftingDetailsSuspense />}
                FallbackComponent={LiftingDetailsError}
              >
                <LiftingDetailsSection
                  clientId={clientId}
                  from={from}
                  to={to}
                />
              </DashboardSectionBoundary>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
