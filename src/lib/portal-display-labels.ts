import { PortalEntityDisplayMessages } from "@auctionit/messages/auctions";

export function auctionDisplayLabel(
  auctionNumber: string | null | undefined,
): string {
  const trimmed = auctionNumber?.trim();
  return trimmed
    ? trimmed
    : PortalEntityDisplayMessages.AUCTION_WITHOUT_NUMBER;
}

export function companyDisplayLabel(name: string | null | undefined): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed : PortalEntityDisplayMessages.COMPANY_WITHOUT_NAME;
}

export function clientDisplayLabel(name: string | null | undefined): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed : PortalEntityDisplayMessages.CLIENT_WITHOUT_NAME;
}

export function lotDisplayLabel(lotNumber: string | null | undefined): string {
  const trimmed = lotNumber?.trim();
  return trimmed ? trimmed : PortalEntityDisplayMessages.LOT_WITHOUT_NUMBER;
}
