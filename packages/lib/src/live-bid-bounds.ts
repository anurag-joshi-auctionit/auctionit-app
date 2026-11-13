/** Cap a single bid at current ± this many increments (legacy hard cap). */
export const MAX_INCREMENT_STEPS = 50;

export type { BidDirection } from "./bid-direction.js";
export { bidDirectionFor, isReverseAuction } from "./bid-direction.js";

import { LiveBidMessages } from "@auctionit/messages/auctions";
import type { BidDirection } from "./bid-direction.js";
import { bidDirectionFor } from "./bid-direction.js";
import { formatCurrency } from "./currency.js";

export type BidBoundsLot = {
  bidCount: number;
  currentBid: number;
  bidIncrement: number;
  startBidPrice: number;
  sbpPlusIncrement?: boolean;
  /** Ceiling for forward; floor for reverse (DB column `bid_limit`). */
  bidLimit?: number | null;
  /** When set, overrides explicit direction on bound helpers. */
  auctionType?: string | null;
};

function paise(n: number): number {
  return Math.round(n * 100);
}

function fromPaise(p: number): number {
  return p / 100;
}

function directionOf(
  lot: Pick<BidBoundsLot, "auctionType">,
  direction?: BidDirection,
): BidDirection {
  if (direction != null) return direction;
  return bidDirectionFor(lot.auctionType);
}

/** True when the lot has at least one accepted bid (matches server winning_amount). */
export function hasStandingBid(lot: Pick<BidBoundsLot, "bidCount">): boolean {
  return lot.bidCount > 0;
}

/**
 * Next legal bid toward winning.
 * Forward: winning + increment (or SBP / SBP+inc when opening).
 * Reverse: winning − increment (or SBP / SBP−inc when opening).
 */
export function minBidFor(
  lot: Pick<
    BidBoundsLot,
    | "bidCount"
    | "currentBid"
    | "bidIncrement"
    | "startBidPrice"
    | "sbpPlusIncrement"
    | "auctionType"
  >,
  direction?: BidDirection,
): number {
  const d = directionOf(lot, direction);
  if (hasStandingBid(lot)) return lot.currentBid + d * lot.bidIncrement;
  return lot.sbpPlusIncrement
    ? lot.startBidPrice + d * lot.bidIncrement
    : lot.startBidPrice;
}

/**
 * Minimum acceptable proxy ceiling/floor (same as {@link minBidFor}).
 * Forward: proxy max must clear next bid; reverse: proxy min must undercut next bid.
 */
export function minProxyMaxFor(
  lot: Pick<
    BidBoundsLot,
    | "bidCount"
    | "currentBid"
    | "bidIncrement"
    | "startBidPrice"
    | "sbpPlusIncrement"
    | "auctionType"
  >,
  direction?: BidDirection,
): number {
  return minBidFor(lot, direction);
}

/**
 * Soft extreme from the 50×increment rule.
 * Forward: current + 50×inc (ceiling). Reverse: current − 50×inc (floor).
 */
export function incrementCap(
  lot: Pick<BidBoundsLot, "currentBid" | "bidIncrement" | "auctionType">,
  direction?: BidDirection,
): number {
  const d = directionOf(lot, direction);
  return lot.currentBid + d * MAX_INCREMENT_STEPS * lot.bidIncrement;
}

/**
 * Hard extreme the UI/API will accept:
 * Forward: min(current + 50×inc, bidLimit) — tightest ceiling.
 * Reverse: max(current − 50×inc, bidLimit) — tightest floor.
 */
export function maxBidFor(
  lot: Pick<
    BidBoundsLot,
    "currentBid" | "bidIncrement" | "bidLimit" | "auctionType"
  >,
  direction?: BidDirection,
): number {
  const d = directionOf(lot, direction);
  const cap = incrementCap(lot, d);
  if (lot.bidLimit == null) return cap;
  return d === 1 ? Math.min(cap, lot.bidLimit) : Math.max(cap, lot.bidLimit);
}

export function incrementGridBase(
  lot: Pick<BidBoundsLot, "bidCount" | "currentBid" | "startBidPrice">,
): number {
  return hasStandingBid(lot) ? lot.currentBid : lot.startBidPrice;
}

type IncrementGridLot = Pick<
  BidBoundsLot,
  "bidCount" | "currentBid" | "startBidPrice" | "bidIncrement"
>;

export function isOnIncrementGrid(
  amount: number,
  lot: IncrementGridLot,
): boolean {
  const increment = lot.bidIncrement;
  if (!(increment > 0) || !Number.isFinite(amount)) return false;
  return (paise(amount) - paise(incrementGridBase(lot))) % paise(increment) === 0;
}

/**
 * Last base (winning amount or SBP) + n×increment step at or on the less-aggressive
 * side of `amount` (toward the standing price for reverse; down for forward).
 */
export function snapDownToIncrement(
  amount: number,
  lot: IncrementGridLot,
  direction: BidDirection = 1,
): number {
  const increment = lot.bidIncrement;
  const base = incrementGridBase(lot);
  if (!(increment > 0) || !Number.isFinite(amount)) return base;
  if (direction === 1) {
    const steps = Math.floor((paise(amount) - paise(base)) / paise(increment));
    return fromPaise(paise(base) + Math.max(0, steps) * paise(increment));
  }
  // Reverse: snap toward base from below (less aggressive = higher amount).
  const steps = Math.floor((paise(base) - paise(amount)) / paise(increment));
  return fromPaise(paise(base) - Math.max(0, steps) * paise(increment));
}

export type SnapBidKind = "ok" | "min" | "cap" | "maxLimit" | "increment";

export type SnapBidResult = {
  amount: number;
  kind: SnapBidKind;
};

/**
 * Clamp an entered amount onto the legal next-bid range.
 * Forward: [nextBid, extreme]. Reverse: [extreme, nextBid].
 * `kind !== "ok"` means the field should snap and show that reject reason.
 */
export function snapBidAmount(
  lot: BidBoundsLot,
  amount: number,
  direction?: BidDirection,
): SnapBidResult {
  const d = directionOf(lot, direction);
  const next = minBidFor(lot, d);
  const extreme = maxBidFor(lot, d);

  if (!Number.isFinite(amount)) {
    return { amount: next, kind: "min" };
  }

  if (d === 1) {
    if (amount < next) {
      return { amount: next, kind: "min" };
    }

    const snapToMax = (): number => {
      const onGrid = snapDownToIncrement(extreme, lot, d);
      return Math.max(next, Math.min(extreme, onGrid));
    };

    if (amount > extreme) {
      const bidLimit = lot.bidLimit;
      const kind: SnapBidKind =
        bidLimit != null && amount > bidLimit ? "maxLimit" : "cap";
      return { amount: snapToMax(), kind };
    }

    if (!isOnIncrementGrid(amount, lot)) {
      const down = snapDownToIncrement(amount, lot, d);
      const clamped = Math.max(next, Math.min(extreme, down));
      return { amount: clamped, kind: "increment" };
    }

    return { amount, kind: "ok" };
  }

  // Reverse: next is the ceiling (most aggressive / default); extreme is the floor.
  if (amount > next) {
    return { amount: next, kind: "min" };
  }

  const snapToFloor = (): number => {
    const onGrid = snapDownToIncrement(extreme, lot, d);
    return Math.min(next, Math.max(extreme, onGrid));
  };

  if (amount < extreme) {
    const bidLimit = lot.bidLimit;
    const kind: SnapBidKind =
      bidLimit != null && amount < bidLimit ? "maxLimit" : "cap";
    return { amount: snapToFloor(), kind };
  }

  if (!isOnIncrementGrid(amount, lot)) {
    const snapped = snapDownToIncrement(amount, lot, d);
    const clamped = Math.min(next, Math.max(extreme, snapped));
    return { amount: clamped, kind: "increment" };
  }

  return { amount, kind: "ok" };
}

/**
 * Whether `amount` beats (or ties, when `strict` is false) `reference`
 * in the auction's winning direction.
 * Forward: amount > reference. Reverse: amount < reference.
 */
export function beatsAmount(
  amount: number,
  reference: number,
  direction: BidDirection,
  strict = true,
): boolean {
  if (strict) {
    return direction === 1
      ? paise(amount) > paise(reference)
      : paise(amount) < paise(reference);
  }
  return direction === 1
    ? paise(amount) >= paise(reference)
    : paise(amount) <= paise(reference);
}

/** True when amount fails to beat the standing bid (equal or worse). */
export function failsToBeatStanding(
  amount: number,
  standing: number,
  direction: BidDirection,
): boolean {
  return !beatsAmount(amount, standing, direction, true);
}

function violatesNextBid(
  amount: number,
  nextBid: number,
  direction: BidDirection,
): boolean {
  return direction === 1
    ? paise(amount) < paise(nextBid)
    : paise(amount) > paise(nextBid);
}

function nextBidMessage(lot: BidBoundsLot, direction: BidDirection): string {
  if (direction === 1) {
    if (hasStandingBid(lot)) return LiveBidMessages.BID_AT_LEAST;
    return lot.sbpPlusIncrement
      ? LiveBidMessages.BID_AT_LEAST_START_PLUS_INCREMENT
      : LiveBidMessages.BID_AT_LEAST_START;
  }
  if (hasStandingBid(lot)) return LiveBidMessages.BID_AT_MOST;
  return lot.sbpPlusIncrement
    ? LiveBidMessages.BID_AT_MOST_START_MINUS_INCREMENT
    : LiveBidMessages.BID_AT_MOST_START;
}

/**
 * Rank-based auctions bound each bidder by their own best bid, never the
 * (withheld) winning price: the bidder's best bid stands in for `currentBid`,
 * so every helper above yields own ± step, own ± 50× cap, and the opening SBP
 * rule before a first bid.
 */
export function rankBoundsLot(
  lot: Omit<BidBoundsLot, "currentBid" | "bidCount">,
  yourBid: number | null,
): BidBoundsLot {
  return {
    bidIncrement: lot.bidIncrement,
    startBidPrice: lot.startBidPrice,
    sbpPlusIncrement: lot.sbpPlusIncrement,
    bidLimit: lot.bidLimit,
    auctionType: lot.auctionType,
    bidCount: yourBid != null ? 1 : 0,
    currentBid: yourBid ?? lot.startBidPrice,
  };
}

const RANK_MESSAGE: Record<string, string> = {
  [LiveBidMessages.BID_AT_LEAST]: LiveBidMessages.BID_AT_LEAST_OWN,
  [LiveBidMessages.BID_AT_MOST]: LiveBidMessages.BID_AT_MOST_OWN,
  [LiveBidMessages.BID_CAP]: LiveBidMessages.BID_CAP_OWN,
  [LiveBidMessages.BID_FLOOR_CAP]: LiveBidMessages.BID_FLOOR_CAP_OWN,
  [LiveBidMessages.OUTBID_EQUAL_OR_HIGHER]: LiveBidMessages.BID_AT_LEAST_OWN,
  [LiveBidMessages.OUTBID_EQUAL_OR_LOWER]: LiveBidMessages.BID_AT_MOST_OWN,
};

/**
 * {@link manualBidAmountError} against a {@link rankBoundsLot}, with every
 * winning-worded message swapped for its own-bid equivalent so a rejection
 * never hints at the winning price.
 */
export function rankBidAmountError(
  lot: BidBoundsLot,
  amount: number,
  direction?: BidDirection,
): string | null {
  const err = manualBidAmountError(lot, amount, direction);
  return err == null ? null : (RANK_MESSAGE[err] ?? err);
}

/**
 * Amount rules shared by a manual bid and a settlement winning-price correction.
 * Does not include proxy-only rules (own proxy, raise-only) or live-session checks.
 * Order matches placeBid: next legal bid, bid limit, 50× cap, increment grid.
 */
export function manualBidAmountError(
  lot: BidBoundsLot,
  amount: number,
  direction?: BidDirection,
): string | null {
  const d = directionOf(lot, direction);
  if (!(lot.bidIncrement > 0)) return LiveBidMessages.NO_INCREMENT;
  if (!Number.isFinite(amount) || !(amount > 0)) {
    return LiveBidMessages.BID_GREATER_THAN_ZERO;
  }

  const nextBid = minBidFor(lot, d);
  if (violatesNextBid(amount, nextBid, d)) {
    return nextBidMessage(lot, d);
  }

  const bidLimit = lot.bidLimit;
  if (
    bidLimit != null &&
    (d === 1
      ? paise(amount) > paise(bidLimit)
      : paise(amount) < paise(bidLimit))
  ) {
    return d === 1
      ? LiveBidMessages.BID_LIMIT_CEILING
      : LiveBidMessages.BID_LIMIT_FLOOR;
  }

  const cap = incrementCap(lot, d);
  if (
    d === 1 ? paise(amount) > paise(cap) : paise(amount) < paise(cap)
  ) {
    return d === 1 ? LiveBidMessages.BID_CAP : LiveBidMessages.BID_FLOOR_CAP;
  }

  if (!isOnIncrementGrid(amount, lot)) {
    return d === 1
      ? LiveBidMessages.BID_INCREMENT
      : LiveBidMessages.BID_DECREMENT;
  }

  if (hasStandingBid(lot) && failsToBeatStanding(amount, lot.currentBid, d)) {
    return d === 1
      ? LiveBidMessages.OUTBID_EQUAL_OR_HIGHER
      : LiveBidMessages.OUTBID_EQUAL_OR_LOWER;
  }

  return null;
}

export type SealedBidBounds = {
  /** Lot start bid price; null on the bidder client (withheld). */
  startBidPrice: number | null;
  /** Ceiling for forward; floor for reverse. Null when unset or withheld. */
  bidLimit: number | null;
  /** The bidder's own latest sealed-bid on the lot, if any. */
  ownLatest: number | null;
  auctionType?: string | null;
};

/**
 * Sealed-bid window amount rules — no increment grid, no 50× cap, no view of
 * other bids. Order: positive amount, strictly beats own latest bid, start
 * price, bid limit. The bidder client never receives the start price or bid
 * limit, so it runs only the first two; the server runs all four and a
 * rejection names the amount the bid crossed.
 */
export function sealedBidAmountError(
  bounds: SealedBidBounds,
  amount: number,
  direction?: BidDirection,
): string | null {
  const d = directionOf(bounds, direction);
  if (!Number.isFinite(amount) || !(amount > 0)) {
    return LiveBidMessages.BID_GREATER_THAN_ZERO;
  }
  if (
    bounds.ownLatest != null &&
    (d === 1
      ? paise(amount) <= paise(bounds.ownLatest)
      : paise(amount) >= paise(bounds.ownLatest))
  ) {
    return d === 1
      ? LiveBidMessages.SEALED_BID_MUST_EXCEED_OWN
      : LiveBidMessages.SEALED_BID_MUST_BE_BELOW_OWN;
  }
  const sbp = bounds.startBidPrice;
  if (
    sbp != null &&
    (d === 1 ? paise(amount) < paise(sbp) : paise(amount) > paise(sbp))
  ) {
    return d === 1
      ? LiveBidMessages.SEALED_BID_AT_LEAST(formatCurrency(sbp))
      : LiveBidMessages.SEALED_BID_AT_MOST(formatCurrency(sbp));
  }
  const limit = bounds.bidLimit;
  if (
    limit != null &&
    (d === 1 ? paise(amount) > paise(limit) : paise(amount) < paise(limit))
  ) {
    return d === 1
      ? LiveBidMessages.SEALED_BID_AT_MOST(formatCurrency(limit))
      : LiveBidMessages.SEALED_BID_AT_LEAST(formatCurrency(limit));
  }
  return null;
}
