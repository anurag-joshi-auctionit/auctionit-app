import { AuctionsValidationMessages } from "@auctionit/messages/auctions";
import { isReverseAuction } from "./bid-direction.js";

export const BID_STEP_LABEL_INCREMENT = "Bid Increment";
export const BID_STEP_LABEL_DECREMENT = "Bid Decrement";

/** User-facing name for the bid step field by auction direction. */
export function bidStepLabel(
  auctionType: string | null | undefined,
): string {
  return isReverseAuction(auctionType)
    ? BID_STEP_LABEL_DECREMENT
    : BID_STEP_LABEL_INCREMENT;
}

export function bidIncrementVsPriceError(
  bidIncrement: number,
  startBidPrice: number,
  opts?: {
    winningAmount?: number | null;
    bidCount?: number;
    auctionType?: string | null;
  },
): string | null {
  const label = bidStepLabel(opts?.auctionType);

  if (!Number.isFinite(bidIncrement) || bidIncrement <= 0) {
    return AuctionsValidationMessages.BID_STEP_MUST_BE_POSITIVE(label);
  }

  return null;
}
