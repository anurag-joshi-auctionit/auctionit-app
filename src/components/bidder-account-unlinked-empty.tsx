import { BidderAccountMessages } from "@auctionit/messages/emd";
import { IllustratedEmpty } from "@auctionit/ui";

type BidderAccountUnlinkedEmptyProps = {
  description: string;
  className?: string;
};

export function BidderAccountUnlinkedEmpty({
  description,
  className,
}: BidderAccountUnlinkedEmptyProps) {
  return (
    <IllustratedEmpty
      title={BidderAccountMessages.UNLINKED_TITLE}
      description={description}
      className={className}
    />
  );
}
