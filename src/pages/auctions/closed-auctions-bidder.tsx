import { AuctionGroupsBidder } from "@/components/auctions/auction-groups-bidder";
import { BidderPortalAuctionMessages } from "@auctionit/messages/auctions";

export function ClosedAuctionsPageBidder() {
  return (
    <AuctionGroupsBidder
      bucket="closed"
      title="Closed Auctions"
      description="Closed auctions you bid on, grouped by client."
      emptyTitle={BidderPortalAuctionMessages.CLOSED_EMPTY_TITLE}
      emptyDescription={BidderPortalAuctionMessages.CLOSED_EMPTY_DESCRIPTION}
      loadErrorTitle={BidderPortalAuctionMessages.CLOSED_LOAD_ERROR_TITLE}
      loadErrorDescription={
        BidderPortalAuctionMessages.CLOSED_LOAD_ERROR_DESCRIPTION
      }
      defaultCollapsed
    />
  );
}
