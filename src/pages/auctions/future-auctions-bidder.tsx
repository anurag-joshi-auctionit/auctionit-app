import { AuctionGroupsBidder } from "@/components/auctions/auction-groups-bidder";
import { BidderPortalAuctionMessages } from "@auctionit/messages/auctions";

export function FutureAuctionsPageBidder() {
  return (
    <AuctionGroupsBidder
      bucket="future"
      title="Future Auctions"
      description="Auctions assigned to you after today, grouped by client."
      emptyTitle={BidderPortalAuctionMessages.FUTURE_EMPTY_TITLE}
      emptyDescription={BidderPortalAuctionMessages.FUTURE_EMPTY_DESCRIPTION}
      loadErrorTitle={BidderPortalAuctionMessages.FUTURE_LOAD_ERROR_TITLE}
      loadErrorDescription={
        BidderPortalAuctionMessages.FUTURE_LOAD_ERROR_DESCRIPTION
      }
    />
  );
}
