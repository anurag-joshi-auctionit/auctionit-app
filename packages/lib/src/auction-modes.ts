import { parseLotDateTimeOnAuctionDate } from "./lot-schedule.js";

/**
 * Auction bidding-mode flags.
 *
 * `isRankBased`: bidders see their own bid and live rank, never the winning
 * amount. Each bid must step past the bidder's own best (SBP rule for a first
 * bid). Bidders may quote the same amount; the first to reach it ranks higher.
 * Proxy bidding works as in a normal auction — see
 * LiveBidService.placeRankBasedBid, loadRankings and rankBoundsLot.
 *
 * `isSealedBid`: the auction has a sealed-bid window (sealed_bid_date +
 * start/end time, IST). During it bidders see only their own latest bid — no
 * winning price, rank, start price or bid limit, no proxy. See
 * SealedBidService and sealedBidAmountError. A sealed-bid window is always
 * followed by the auction's normal live phase.
 */
export type AuctionBiddingFlags = {
  isRankBased: boolean;
  isSealedBid: boolean;
};

export type SealedBidWindowInput = {
  isSealedBid: boolean;
  sealedBidDate: string | null;
  sealedBidStartTime: string | null;
  sealedBidEndTime: string | null;
};

export type SealedBidWindowState = "upcoming" | "open" | "closed";

/** Window start/end as instants, or null when the window is not configured. */
export function sealedBidWindow(
  a: SealedBidWindowInput,
): { startAt: Date; endAt: Date } | null {
  if (
    !a.isSealedBid ||
    !a.sealedBidDate ||
    !a.sealedBidStartTime ||
    !a.sealedBidEndTime
  ) {
    return null;
  }
  const startAt = parseLotDateTimeOnAuctionDate(
    a.sealedBidStartTime,
    a.sealedBidDate,
  );
  const endAt = parseLotDateTimeOnAuctionDate(
    a.sealedBidEndTime,
    a.sealedBidDate,
  );
  if (!startAt || !endAt) return null;
  return { startAt, endAt };
}

/** Where `now` sits relative to the sealed-bid window; null when there is none. */
export function sealedBidWindowState(
  a: SealedBidWindowInput,
  now: Date = new Date(),
): SealedBidWindowState | null {
  const w = sealedBidWindow(a);
  if (!w) return null;
  const t = now.getTime();
  if (t < w.startAt.getTime()) return "upcoming";
  if (t < w.endAt.getTime()) return "open";
  return "closed";
}
