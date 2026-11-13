import { AuctionGroupsBidder } from "@/components/auctions/auction-groups-bidder";
import { BidderPortalAuctionMessages } from "@auctionit/messages/auctions";

export function TodaysAuctionsPageBidder() {
  return (
    <AuctionGroupsBidder
      bucket="today"
      title="Today's Auctions"
      description="Auctions assigned to you today, grouped by client."
      emptyTitle={BidderPortalAuctionMessages.TODAY_EMPTY_TITLE}
      emptyDescription={BidderPortalAuctionMessages.TODAY_EMPTY_DESCRIPTION}
      loadErrorTitle={BidderPortalAuctionMessages.TODAY_LOAD_ERROR_TITLE}
      loadErrorDescription={
        BidderPortalAuctionMessages.TODAY_LOAD_ERROR_DESCRIPTION
      }
    />
  );
}
