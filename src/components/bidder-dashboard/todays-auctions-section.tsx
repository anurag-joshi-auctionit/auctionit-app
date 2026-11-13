import { Button } from "@auctionit/ui";
import { BidderPortalAuctionMessages } from "@auctionit/messages/auctions";
import { AuctionGroupsBidder } from "@/components/auctions/auction-groups-bidder";
import { DashboardSectionHeader } from "@/components/dashboard/section-header";

export function TodaysAuctionsSection() {
  return (
    <div className="space-y-3">
      <DashboardSectionHeader
        id="todays-auctions"
        title="Today's Auctions"
        actions={
          <Button variant="outline" href="/auctions/today">
            View Details
          </Button>
        }
      />
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
        embedded
        defaultCollapsed
        maxRows={8}
        viewAllHref="/auctions/today"
      />
    </div>
  );
}
