import { AuctionGroupsClient } from "@/components/auctions/auction-groups-client";
import { ClientPortalAuctionMessages } from "@auctionit/messages/auctions";

export function FutureAuctionsPageClient() {
  return (
    <AuctionGroupsClient
      variant="future"
      title="Future Auctions"
      description="Published auctions scheduled after today, grouped by company."
      queryKey="client-future-auctions"
      path="/client/auctions/future"
      emptyTitle={ClientPortalAuctionMessages.FUTURE_EMPTY_TITLE}
      emptyDescription={ClientPortalAuctionMessages.FUTURE_EMPTY_DESCRIPTION}
      loadErrorTitle={ClientPortalAuctionMessages.FUTURE_LOAD_ERROR_TITLE}
      loadErrorDescription={
        ClientPortalAuctionMessages.FUTURE_LOAD_ERROR_DESCRIPTION
      }
    />
  );
}
