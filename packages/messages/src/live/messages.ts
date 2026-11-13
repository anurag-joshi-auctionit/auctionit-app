/** Live auction API access / transport errors (live routes + SSE stream). */
export const LiveAuctionMessages = {
  AUCTION_FORBIDDEN: "Not authorized for this auction",
  AUCTIONS_FORBIDDEN: "Not authorized for these auctions",
  LOT_FORBIDDEN: "Not authorized for this lot",
  ADMINS_ONLY: "Admins only",
  AUCTION_IDS_REQUIRED: "auctionIds is required",
  SSE_DISABLED: "SSE transport is disabled",
  SSE_CAPACITY_REACHED: "SSE capacity reached",
} as const;

/** Bidder portal auction access errors (catalogue / TnC / detail). */
export const BidderAuctionAccessMessages = {
  NOT_ATTACHED_TO_AUCTION: "Not attached to this auction",
  NO_CATALOGUE: "No catalogue available",
  NO_TNC: "No terms & conditions available",
} as const;
