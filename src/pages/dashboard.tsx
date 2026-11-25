import { useCallback, useEffect, useMemo, useState } from "react";
import { can, useAuth } from "@auctionit/lib";
import { BidderAccountMessages } from "@auctionit/messages/emd";
import { PageHeader, Skeleton, isSelectSearchClear } from "@auctionit/ui";
import { BidderAccountUnlinkedEmpty } from "@/components/bidder-account-unlinked-empty";
import {
  EmdSection,
  EmdSuspense,
} from "@/components/bidder-dashboard/emd-section";
import {
  defaultBidderDashboardFilters,
  readStoredBidderDashboardFilters,
  writeStoredBidderDashboardFilters,
  type StoredBidderDashboardFilters,
} from "@/components/bidder-dashboard/filters-storage";
import { LiftingChartsPanel } from "@/components/bidder-dashboard/lifting-charts-section";
import { LiftingDetailsPanel } from "@/components/bidder-dashboard/lifting-details-section";
import {
  LiftingFiltersBar,
  LiftingFiltersSuspense,
} from "@/components/bidder-dashboard/lifting-filters";
import {
  ClientsFiltersError,
  EmdSectionError,
  LiftingSectionError,
  SubscriptionSectionError,
} from "@/components/bidder-dashboard/section-errors";
import {
  SubscriptionSection,
  SubscriptionSuspense,
} from "@/components/bidder-dashboard/subscription-section";
import { RaStageWindowsBidder } from "@/components/auctions/ra-stage-windows-bidder";
import { SealedBidWindowsBidder } from "@/components/auctions/sealed-bid-windows-bidder";
import { useRaStageWindows } from "@/hooks/use-ra-stage-windows";
import { TodaysAuctionsSection } from "@/components/bidder-dashboard/todays-auctions-section";
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

function DashboardRaStages() {
  const { data = [] } = useRaStageWindows();
  if (data.length === 0) return null;
  return (
    <div className="space-y-2">
      <DashboardSectionHeader id="ra-stages" title="RA Stages" />
      <RaStageWindowsBidder data={data} />
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const userId = user?.userId;
  const linked = user?.bidderCompId != null;
  const showEmd = can(user?.permissions, "module.portal-bidder-emd");

  const [filters, setFilters] = useState<StoredBidderDashboardFilters | null>(
    null,
  );

  useEffect(() => {
    if (userId == null) return;
    setFilters(readStoredBidderDashboardFilters(userId));
  }, [userId]);

  useEffect(() => {
    if (userId == null || filters == null) return;
    if (!filters.from || !filters.to) {
      const defaults = defaultBidderDashboardFilters();
      setFilters((prev) =>
        prev
          ? {
              ...prev,
              from: prev.from ?? defaults.from,
              to: prev.to ?? defaults.to,
            }
          : prev,
      );
      return;
    }
    writeStoredBidderDashboardFilters(userId, filters);
  }, [userId, filters]);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [filters]);

  const patchFilters = useCallback(
    (patch: Partial<StoredBidderDashboardFilters>) => {
      setFilters((prev) => (prev ? { ...prev, ...patch } : prev));
    },
    [],
  );

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

  const from = filters?.from ?? null;
  const to = filters?.to ?? null;
  const clientId = filters?.clientId ?? null;
  const plantLocationId = filters?.plantLocationId ?? null;
  const itemId = filters?.itemId ?? null;
  const liftingReady = from != null && to != null;

  const dateRange = useMemo((): DateRange | undefined => {
    const fromDate = parseIsoDate(from);
    const toDate = parseIsoDate(to);
    if (fromDate && toDate) return { from: fromDate, to: toDate };
    return undefined;
  }, [from, to]);

  return (
    <div>
      <div className="sticky top-0 z-10 border-b bg-background px-4 py-4">
        <PageHeader
          title="Dashboard"
          description="Today's auctions, lifting, EMD, and subscription for your account."
        />
      </div>

      <div className="space-y-12 p-4">
        <div className="space-y-6">
          <SealedBidWindowsBidder />
          <DashboardRaStages />
        </div>

        <section aria-labelledby="todays-auctions">
          <TodaysAuctionsSection />
        </section>

        <section className="space-y-6" aria-labelledby="lifting">
          <DashboardSectionHeader
            id="lifting"
            title="Lifting Details"
            actions={
              filters != null && liftingReady ? (
                <DashboardSectionBoundary
                  fallback={<LiftingFiltersSuspense />}
                  FallbackComponent={ClientsFiltersError}
                >
                  <LiftingFiltersBar
                    filters={filters}
                    dateRange={dateRange}
                    onPatch={patchFilters}
                    onPlantChange={onPlantChange}
                    onItemChange={onItemChange}
                  />
                </DashboardSectionBoundary>
              ) : (
                <LiftingFiltersSuspense />
              )
            }
          />

          {liftingReady ? (
            <>
              <DashboardSectionBoundary
                fallback={
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                  </div>
                }
                FallbackComponent={LiftingSectionError}
              >
                <LiftingDetailsPanel
                  from={from}
                  to={to}
                  clientId={clientId}
                  plantLocationId={plantLocationId}
                  itemId={itemId}
                />
              </DashboardSectionBoundary>

              <DashboardSectionBoundary
                fallback={
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Skeleton className="aspect-video w-full rounded-md" />
                    <Skeleton className="aspect-video w-full rounded-md" />
                  </div>
                }
                FallbackComponent={LiftingSectionError}
              >
                <LiftingChartsPanel
                  from={from}
                  to={to}
                  clientId={clientId}
                  plantLocationId={plantLocationId}
                  itemId={itemId}
                />
              </DashboardSectionBoundary>
            </>
          ) : null}
        </section>

        {showEmd ? (
          <section aria-labelledby="emd">
            {!linked ? (
              <div className="space-y-3">
                <DashboardSectionHeader id="emd" title="EMD Details" />
                <BidderAccountUnlinkedEmpty
                  description={
                    BidderAccountMessages.UNLINKED_EMD_OVERVIEW_DESCRIPTION
                  }
                  className="border-0"
                />
              </div>
            ) : (
              <DashboardSectionBoundary
                fallback={<EmdSuspense />}
                FallbackComponent={EmdSectionError}
              >
                <EmdSection />
              </DashboardSectionBoundary>
            )}
          </section>
        ) : null}

        <section aria-labelledby="subscription">
          {!linked ? (
            <div className="space-y-3">
              <DashboardSectionHeader
                id="subscription"
                title="Subscription Details"
              />
              <BidderAccountUnlinkedEmpty
                description={
                  BidderAccountMessages.UNLINKED_SUBSCRIPTION_DESCRIPTION
                }
                className="border-0"
              />
            </div>
          ) : (
            <DashboardSectionBoundary
              fallback={<SubscriptionSuspense />}
              FallbackComponent={SubscriptionSectionError}
            >
              <SubscriptionSection />
            </DashboardSectionBoundary>
          )}
        </section>
      </div>
    </div>
  );
}
