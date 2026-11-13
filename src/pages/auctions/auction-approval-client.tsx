import { useAuth } from "@auctionit/lib";
import { ClientPortalAuctionMessages } from "@auctionit/messages/auctions";
import {
  DataPanelError,
  IllustratedEmpty,
  PageHeader,
  Skeleton,
} from "@auctionit/ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AuctionApprovalTableClient } from "@/components/auctions/auction-approval-table-client";
import {
  ClosedAuctionsDateFilter,
  useClosedAuctionDateRange,
} from "@/components/auctions/closed-auctions-date-filter";
import type { PortalAuction } from "@/components/auctions/auction-groups-client";

export function AuctionApprovalPageClient() {
  const { api } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const auctionIdParam = searchParams.get("auctionId");
  const selectedAuctionId = Number(auctionIdParam);
  const dateRange = useClosedAuctionDateRange();
  const listPath =
    dateRange.from && dateRange.to
      ? `/client/auctions/closed?from=${dateRange.from}&to=${dateRange.to}`
      : "/client/auctions/closed";

  const closedQuery = useQuery({
    queryKey: ["client-closed-auctions", "approval-select", listPath],
    queryFn: () => api.get<PortalAuction[]>(listPath),
  });

  const auctions = closedQuery.data ?? [];

  const selectedAuction = useMemo(
    () =>
      Number.isInteger(selectedAuctionId) && selectedAuctionId > 0
        ? (auctions.find((a) => a.auctionId === selectedAuctionId) ?? null)
        : null,
    [auctions, selectedAuctionId],
  );

  useEffect(() => {
    if (closedQuery.isLoading || auctions.length === 0) return;
    if (selectedAuction) return;
    const firstId = auctions[0]?.auctionId;
    if (firstId == null) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("auctionId", String(firstId));
        return next;
      },
      { replace: true },
    );
  }, [auctions, closedQuery.isLoading, selectedAuction, setSearchParams]);

  const onAuctionChange = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("auctionId", value);
        return next;
      },
      { replace: true },
    );
  };

  let body;
  if (closedQuery.isLoading) {
    body = <Skeleton className="h-64 w-full" />;
  } else if (closedQuery.isError) {
    body = (
      <DataPanelError
        title={ClientPortalAuctionMessages.CLOSED_LOAD_ERROR_TITLE}
        message={ClientPortalAuctionMessages.CLOSED_LOAD_ERROR_DESCRIPTION}
        onRetry={() => void closedQuery.refetch()}
      />
    );
  } else if (auctions.length === 0) {
    body = (
      <IllustratedEmpty
        title={ClientPortalAuctionMessages.CLOSED_EMPTY_TITLE}
        description={ClientPortalAuctionMessages.CLOSED_EMPTY_DESCRIPTION}
      />
    );
  } else if (selectedAuction) {
    body = (
      <AuctionApprovalTableClient
        auctionId={selectedAuction.auctionId}
        clientName={selectedAuction.clientName}
        auctionDate={selectedAuction.auctionDate}
        auctions={auctions}
        onAuctionChange={onAuctionChange}
      />
    );
  } else {
    body = <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title="Auction Approval"
        description="Approve or reject closed auction lots."
        actions={
          <ClosedAuctionsDateFilter
            value={dateRange.range}
            onChange={dateRange.onChange}
          />
        }
      />
      {body}
    </div>
  );
}
