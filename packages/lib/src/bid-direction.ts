/**
 * Bid comparison direction for forward vs reverse auctions.
 * +1 = ascending (highest wins); -1 = descending (lowest wins).
 */
export type BidDirection = 1 | -1;

/**
 * Forward / yankee / unknown → ascending (+1).
 * Reverse → descending (−1).
 */
export function bidDirectionFor(
  auctionType: string | null | undefined,
): BidDirection {
  return auctionType?.toLowerCase() === "reverse" ? -1 : 1;
}

export function isReverseAuction(
  auctionType: string | null | undefined,
): boolean {
  return auctionType?.toLowerCase() === "reverse";
}
