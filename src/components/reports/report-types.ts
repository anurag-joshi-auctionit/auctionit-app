export type ReportClientOption = {
  clientId: number;
  companyName: string;
};

export type ReportAuctionOption = {
  auctionId: number;
  auctionNumber: string | null;
  auctionDate: string | null;
};

export type BidOverviewReportRow = {
  auctionNumber: string | null;
  auctionDate: string | null;
  lotNumber: string | null;
  plantLocationName: string | null;
  quantity: number | null;
  unit: string | null;
  startBidPrice: number | null;
  startTime: string | null;
  endTime: string | null;
  winningBidder: string | null;
  winningPrice: number | null;
  bidCount: number;
  bidderCount: number;
};

export type BidDetailsReportRow = {
  auctionNumber: string | null;
  auctionDate: string | null;
  auctionType: string | null;
  lotNumber: string | null;
  startBidPrice: number | null;
  startTime: string | null;
  endTime: string | null;
  bidderName: string | null;
  bidTime: string | null;
  bidBasis: string | null;
  bidPrice: number | null;
  bidType: string;
  quantity: number | null;
};

export type BidOverviewMode = "bid" | "no-bid";

export function isBidOverviewMode(
  value: string | null,
): value is BidOverviewMode {
  return value === "bid" || value === "no-bid";
}
