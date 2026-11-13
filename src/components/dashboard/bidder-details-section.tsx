import { useEffect } from "react";
import { useAuth } from "@auctionit/lib";
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
  isSelectSearchClear,
} from "@auctionit/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BidderDetailsError } from "@/components/dashboard/bidder-details-error";
import { dashboardKeys } from "@/components/dashboard/query-keys";
import { DashboardSectionBoundary } from "@/components/dashboard/section-boundary";
import { DashboardSectionHeader } from "@/components/dashboard/section-header";
import { DashboardStatCard } from "@/components/dashboard/stat-card";
import type {
  BidderDetails,
  DashboardAuctionOption,
} from "@/components/dashboard/types";
import { auctionDisplayLabel } from "@/lib/portal-display-labels";

function BidderAuctionFilterPanel({
  clientId,
  from,
  to,
  auctionId,
  onAuctionChange,
}: {
  clientId: number;
  from: string;
  to: string;
  auctionId: number | null;
  onAuctionChange: (value: string) => void;
}) {
  const { api } = useAuth();
  const { data: auctions } = useSuspenseQuery({
    queryKey: dashboardKeys.auctions(clientId, from, to),
    queryFn: () =>
      api.get<DashboardAuctionOption[]>(
        `/client/dashboard/auctions?clientId=${clientId}&from=${from}&to=${to}`,
      ),
  });

  useEffect(() => {
    if (auctionId == null) return;
    if (auctions.some((a) => a.auctionId === auctionId)) return;
    onAuctionChange("");
  }, [auctions, auctionId, onAuctionChange]);

  const selectedAuction = auctions.find((a) => a.auctionId === auctionId);

  return (
    <SelectSearch
      value={auctionId != null ? String(auctionId) : ""}
      onValueChange={(v) => {
        onAuctionChange(isSelectSearchClear(v) ? "" : v);
      }}
      placeholder="Auction"
      clearable
    >
      <SelectSearchTrigger
        id="dashboard-auction"
        className="w-[min(100vw-2rem,320px)]"
        aria-label="Auction"
      >
        <SelectSearchValue placeholder="Auction">
          {selectedAuction
            ? auctionDisplayLabel(selectedAuction.auctionNumber)
            : undefined}
        </SelectSearchValue>
      </SelectSearchTrigger>
      <SelectSearchContent>
        <SelectSearchCommand>
          <SelectSearchInput placeholder="Search auction…" />
          <SelectSearchList>
            <SelectSearchEmpty emptyText="No auctions found." />
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
  );
}

function BidderCardsPanel({
  clientId,
  from,
  to,
  auctionId,
}: {
  clientId: number;
  from: string;
  to: string;
  auctionId: number | null;
}) {
  const { api } = useAuth();
  const { data } = useSuspenseQuery({
    queryKey: dashboardKeys.bidder(clientId, from, to, auctionId),
    queryFn: () => {
      const qs = new URLSearchParams({
        clientId: String(clientId),
        from,
        to,
      });
      if (auctionId != null) qs.set("auctionId", String(auctionId));
      return api.get<BidderDetails>(
        `/client/dashboard/bidder?${qs.toString()}`,
      );
    },
  });

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <DashboardStatCard
        label="Bidders Attached"
        metric={data.attachedBidders}
        tone="blue"
      />
      <DashboardStatCard
        label="Bidders Participated"
        metric={data.participatedBidders}
        tone="red"
      />
      <DashboardStatCard
        label="New Bidders"
        metric={data.newBidders}
        tone="green"
      />
    </div>
  );
}

function AuctionFilterSuspense() {
  return <Skeleton className="h-9 w-[320px]" />;
}

function BidderCardsSuspense() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function BidderDetailsSection({
  clientId,
  from,
  to,
  auctionId,
  onAuctionChange,
}: {
  clientId: number;
  from: string;
  to: string;
  auctionId: number | null;
  onAuctionChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <DashboardSectionHeader
        id="bidder-details"
        title="Bidder Details"
        actions={
          <DashboardSectionBoundary
            fallback={<AuctionFilterSuspense />}
            FallbackComponent={BidderDetailsError}
          >
            <BidderAuctionFilterPanel
              clientId={clientId}
              from={from}
              to={to}
              auctionId={auctionId}
              onAuctionChange={onAuctionChange}
            />
          </DashboardSectionBoundary>
        }
      />

      <DashboardSectionBoundary
        fallback={<BidderCardsSuspense />}
        FallbackComponent={BidderDetailsError}
      >
        <BidderCardsPanel
          clientId={clientId}
          from={from}
          to={to}
          auctionId={auctionId}
        />
      </DashboardSectionBoundary>
    </div>
  );
}
