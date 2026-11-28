import { ApiError } from "@auctionit/lib";
import { LiveBidMessages } from "@auctionit/messages";
import {
  manualBidAmountError,
  rankBidAmountError,
  rankBoundsLot,
  type MergedLot,
} from "@/lib/use-live-auction";

/** Per-lot overlay while a bid/proxy is in flight or just confirmed by HTTP. */
export type LotOverlay = {
  /** Null for rank-based auctions — the server withholds the winning amount. */
  amount?: number | null;
  status?: "winning" | "outbid";
  pending: boolean;
  rev?: number;
  /** Rank-based auctions only: this bidder's rank and own bid right after bidding. */
  yourRank?: number | null;
  yourBid?: number | null;
};

/** How long the bid-error modal stays up before dismissing itself. */
export const ERROR_AUTO_DISMISS_MS = 6000;

/** Instant local reject — same floors/ceilings as the live bid API. */
export function localBidRejectReason(
  lot: MergedLot,
  amount: number,
): string | null {
  if (!(lot.bidIncrement > 0)) return LiveBidMessages.NO_INCREMENT;
  if (!(amount > 0)) return LiveBidMessages.BID_GREATER_THAN_ZERO;
  // Start price withheld (sealed-bid phase): only the server can judge it.
  const startBidPrice = lot.startBidPrice;
  if (startBidPrice == null) return null;
  if (lot.isRankBased) {
    // Same own-bid rule the server applies (bid or proxy limit); equal amounts
    // to other bidders are allowed.
    return rankBidAmountError(
      rankBoundsLot({ ...lot, startBidPrice }, lot.yourBid ?? null),
      amount,
    );
  }
  // manualBidAmountError is fully direction-aware via lot.auctionType.
  return manualBidAmountError(
    { ...lot, startBidPrice, currentBid: lot.currentBid ?? startBidPrice },
    amount,
  );
}

export function errMsg(err: unknown, fallback: string): string {
  return err instanceof ApiError
    ? ((err.body as { error?: string } | null)?.error ?? fallback)
    : fallback;
}
