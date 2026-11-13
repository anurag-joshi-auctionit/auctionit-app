import { useAuth } from "@auctionit/lib";
import { BidderAccountMessages } from "@auctionit/messages/emd";
import { DataPanelError, Skeleton } from "@auctionit/ui";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { AuctionDetailHeader } from "@/components/auctions/auction-detail-header";
import {
  AssignedLotsTable,
  type AssignedLot,
} from "@/components/auctions/assigned-lots-table";
import {
  ParticipatedLotsTable,
  type ParticipatedLot,
} from "@/components/auctions/participated-lots-table";

type LiveState = "live" | "upcoming";

type AuctionHeader = {
  id: number;
  auctionNumber: string | null;
  auctionType: string | null;
  clientId: number | null;
  clientName: string | null;
  auctionDate: string | null;
  status: string;
  liveState: LiveState | null;
};

/** The API picks the view from the auction's status; the client never does. */
type AuctionDetail =
  | { view: "assigned"; auction: AuctionHeader; lots: AssignedLot[] }
  | { view: "participated"; auction: AuctionHeader; lots: ParticipatedLot[] };

export function AuctionDetailPageBidder() {
  const { auctionId } = useParams();
  const { api } = useAuth();
  const id = Number(auctionId);
  const valid = Number.isInteger(id) && id > 0;

  const query = useQuery({
    queryKey: ["auction", id],
    queryFn: () => api.get<AuctionDetail>(`/auctions/me/${id}`),
    enabled: valid,
  });

  const detail = query.data;

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
          title={BidderAccountMessages.AUCTION_LOAD_ERROR_TITLE}
          message={
            query.error instanceof Error
              ? query.error.message
              : BidderAccountMessages.AUCTION_LOAD_ERROR_DESCRIPTION
          }
          onRetry={valid ? () => void query.refetch() : undefined}
        />
      ) : query.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : detail?.view === "participated" ? (
        <ParticipatedLotsTable
          lots={detail.lots}
          isFetching={query.isFetching}
        />
      ) : (
        <AssignedLotsTable
          lots={detail?.lots ?? []}
          auctionType={detail?.auction.auctionType ?? null}
          isFetching={query.isFetching}
        />
      )}
    </div>
  );
}
