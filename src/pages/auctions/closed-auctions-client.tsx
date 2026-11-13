import { AuctionGroupsClient } from "@/components/auctions/auction-groups-client";
import { ClientPortalAuctionMessages } from "@auctionit/messages/auctions";

export function ClosedAuctionsPageClient() {
  return (
    <AuctionGroupsClient
      variant="closed"
      title="Closed Auctions"
      description="Closed auctions for your companies, grouped by company."
      queryKey="client-closed-auctions"
      path="/client/auctions/closed"
      emptyTitle={ClientPortalAuctionMessages.CLOSED_EMPTY_TITLE}
      emptyDescription={ClientPortalAuctionMessages.CLOSED_EMPTY_DESCRIPTION}
      loadErrorTitle={ClientPortalAuctionMessages.CLOSED_LOAD_ERROR_TITLE}
      loadErrorDescription={
        ClientPortalAuctionMessages.CLOSED_LOAD_ERROR_DESCRIPTION
      }
      defaultCollapsed
    />
  );
}
