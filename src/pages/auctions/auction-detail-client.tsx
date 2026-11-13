import { useAuth } from "@auctionit/lib";
import { ClientPortalAuctionMessages } from "@auctionit/messages/auctions";
import { DataPanelError, IllustratedEmpty, Skeleton } from "@auctionit/ui";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { AuctionDetailHeader } from "@/components/auctions/auction-detail-header";
import {
  ClosedLotsTableClient,
  type ClosedLot,
} from "@/components/auctions/closed-lots-table-client";
import {
  UpcomingLotsTableClient,
  type UpcomingLot,
} from "@/components/auctions/upcoming-lots-table-client";

type AuctionMeta = {
  auctionId: number;
  auctionNumber: string | null;
  auctionType: string | null;
  clientId: number | null;
  clientName: string | null;
  auctionDate: string | null;
  status: string;
};

type AuctionDetail =
  | { view: "live"; auction: AuctionMeta }
  | { view: "closed"; auction: AuctionMeta; lots: ClosedLot[] }
  | { view: "upcoming"; auction: AuctionMeta; lots: UpcomingLot[] };

export function AuctionDetailPageClient() {
  const { auctionId } = useParams();
  const { api } = useAuth();
  const id = Number(auctionId);
  const valid = Number.isInteger(id) && id > 0;

  const query = useQuery({
    queryKey: ["client-auction", id],
    queryFn: () => api.get<AuctionDetail>(`/client/auctions/${id}`),
    enabled: valid,
  });

  const detail = query.data;
  if (detail?.view === "live") {
    const params = new URLSearchParams();
    if (detail.auction.clientId != null) {
      params.set("clients", String(detail.auction.clientId));
    }
    params.set("auctions", String(detail.auction.auctionId));
    return <Navigate to={`/auctions/live?${params.toString()}`} replace />;
  }

  const lots = detail?.lots ?? [];

  return (
    <div className="space-y-6 p-4">
      {detail ? (
        <AuctionDetailHeader auction={detail.auction} />
      ) : valid && query.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-9 w-80" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
      ) : null}

      {!valid || query.isError ? (
        <DataPanelError
          title={ClientPortalAuctionMessages.DETAIL_LOAD_ERROR_TITLE}
          message={
            query.error instanceof Error
              ? query.error.message
              : ClientPortalAuctionMessages.DETAIL_NOT_FOUND
          }
          onRetry={valid ? () => void query.refetch() : undefined}
        />
      ) : query.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : lots.length === 0 ? (
        <IllustratedEmpty
          title={ClientPortalAuctionMessages.DETAIL_EMPTY_TITLE}
          description={ClientPortalAuctionMessages.DETAIL_EMPTY_DESCRIPTION}
        />
      ) : detail?.view === "closed" ? (
        <ClosedLotsTableClient
          lots={detail.lots}
          auctionType={detail.auction.auctionType}
        />
      ) : (
        <UpcomingLotsTableClient
          lots={detail?.view === "upcoming" ? detail.lots : []}
          auctionType={detail?.auction.auctionType ?? null}
        />
      )}
    </div>
  );
}
