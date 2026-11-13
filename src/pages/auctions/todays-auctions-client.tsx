import { AuctionGroupsClient } from "@/components/auctions/auction-groups-client";
import { ClientPortalAuctionMessages } from "@auctionit/messages/auctions";

export function TodaysAuctionsPageClient() {
  return (
    <AuctionGroupsClient
      variant="today"
      title="Today's Auctions"
      description="Published auctions scheduled for today, grouped by company."
      queryKey="client-todays-auctions"
      path="/client/auctions/today"
      emptyTitle={ClientPortalAuctionMessages.TODAY_EMPTY_TITLE}
      emptyDescription={ClientPortalAuctionMessages.TODAY_EMPTY_DESCRIPTION}
      loadErrorTitle={ClientPortalAuctionMessages.TODAY_LOAD_ERROR_TITLE}
      loadErrorDescription={
        ClientPortalAuctionMessages.TODAY_LOAD_ERROR_DESCRIPTION
      }
    />
  );
}
