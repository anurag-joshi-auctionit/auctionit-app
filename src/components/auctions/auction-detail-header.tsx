import { formatDate, PageHeader, Separator } from "@auctionit/ui";
import { auctionDisplayLabel } from "@/lib/portal-display-labels";

export type AuctionDetailHeaderAuction = {
  auctionNumber: string | null;
  auctionType: string | null;
  clientName: string | null;
  auctionDate: string | null;
};

function titleCaseAuctionType(value: string | null): string | null {
  if (!value) return null;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function AuctionDetailHeader({
  auction,
}: {
  auction: AuctionDetailHeaderAuction;
}) {
  const auctionType = titleCaseAuctionType(auction.auctionType);

  return (
    <PageHeader
      title={auctionDisplayLabel(auction.auctionNumber)}
      description={
        <div className="flex flex-wrap items-center gap-2">
          {auction.clientName ? (
            <span className="text-foreground">{auction.clientName}</span>
          ) : null}
          {auctionType ? (
            <>
              <Separator orientation="vertical" className="h-4!" />
              <span>{auctionType} Auction</span>
            </>
          ) : null}
          <Separator orientation="vertical" className="h-4!" />
          <span>Auction Date: {formatDate(auction.auctionDate) || "—"}</span>
        </div>
      }
    />
  );
}
