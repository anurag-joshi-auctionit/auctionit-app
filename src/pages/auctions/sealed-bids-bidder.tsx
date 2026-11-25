import { IllustratedEmpty, PageHeader } from "@auctionit/ui";
import { SealedBidWindowsBidder } from "@/components/auctions/sealed-bid-windows-bidder";
import { useSealedWindowAuctions } from "@/hooks/use-sealed-bids";

function SealedBidsContent() {
  const { data } = useSealedWindowAuctions();
  if (data && data.length === 0) {
    return (
      <IllustratedEmpty
        title="No open sealed-bid windows"
        description="Sealed-bid windows will appear here when they open."
      />
    );
  }
  return <SealedBidWindowsBidder />;
}

export function SealedBidsPageBidder() {
  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title="Sealed-bid Windows"
        description="Submit sealed-bids before the window closes. Only your own bid is shown."
      />
      <SealedBidsContent />
    </div>
  );
}
