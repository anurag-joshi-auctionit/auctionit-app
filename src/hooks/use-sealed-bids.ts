import { useAuth } from "@auctionit/lib";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** An auction whose sealed-bid window is open now (GET /live/sealed-auctions). */
export type SealedWindowAuction = {
  id: number;
  auctionNumber: string | null;
  clientId: number | null;
  clientName: string | null;
  auctionType: string | null;
  windowStartsAt: string;
  windowEndsAt: string;
  secondsLeft: number;
  lotCount: number;
  tncRequired: boolean;
};

/** Bidder's sealed-bid page. Bid limit and other bidders' bids are never sent. */
export type SealedBidView = {
  auctionId: number;
  auctionNumber: string | null;
  clientName: string | null;
  auctionType: string | null;
  status: string;
  windowStartsAt: string | null;
  windowEndsAt: string | null;
  serverTime: string;
  tncRequired: boolean;
  lots: SealedBidLot[];
};

export type SealedBidLot = {
  lotId: number;
  lotNumber: string | null;
  title: string | null;
  quantity: number | null;
  uom: string | null;
  materialLocation: string | null;
  yourBid: number | null;
  yourBidAt: string | null;
  yourBidCount: number;
};

export function useSealedWindowAuctions() {
  const { api } = useAuth();
  return useQuery({
    queryKey: ["sealed-auctions"],
    queryFn: () => api.get<SealedWindowAuction[]>("/live/sealed-auctions"),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useSealedBidView(auctionId: number) {
  const { api } = useAuth();
  return useQuery({
    queryKey: ["sealed-bids", auctionId],
    queryFn: () =>
      api.get<SealedBidView>(`/live/auctions/${auctionId}/sealed-bids/me`),
    enabled: Number.isInteger(auctionId) && auctionId > 0,
  });
}

export function usePlaceSealedBid(auctionId: number) {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lotId, amount }: { lotId: number; amount: number }) =>
      api.post<{ ok: true; yourBid: number; placedAt: string }>(
        `/live/auctions/${auctionId}/lots/${lotId}/sealed-bid`,
        { amount },
      ),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["sealed-bids", auctionId] }),
  });
}
