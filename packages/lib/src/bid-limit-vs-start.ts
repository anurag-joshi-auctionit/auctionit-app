import { isReverseAuction } from "./bid-direction.js";
import { AuctionsValidationMessages } from "@auctionit/messages/auctions";

/**
 * Cross-field rule: bid_limit is a ceiling strictly above SBP (forward), or
 * a floor strictly between 0 and SBP (reverse). Equality with SBP is
 * rejected either way. Returns a validation message or null if ok.
 */
export function bidLimitVsStartPriceError(
  auctionType: string | null | undefined,
  bidLimit: number,
  startBidPrice: number,
): string | null {
  if (isReverseAuction(auctionType)) {
    if (!(bidLimit > 0)) {
      return AuctionsValidationMessages.BID_LIMIT_MUST_BE_POSITIVE;
    }
    if (bidLimit >= startBidPrice) {
      return AuctionsValidationMessages.BID_LIMIT_VS_START_BID_PRICE_REVERSE;
    }
    return null;
  }
  if (bidLimit <= startBidPrice) {
    return AuctionsValidationMessages.BID_LIMIT_VS_START_BID_PRICE_FORWARD;
  }
  return null;
}
