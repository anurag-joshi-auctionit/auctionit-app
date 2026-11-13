export type MetricWithDelta = {
  value: number;
  previousValue: number;
  percentChange: number;
  previousPeriodLabel: string;
};

export type DashboardClientOption = {
  clientId: number;
  companyName: string;
};

export type DashboardAuctionOption = {
  auctionId: number;
  auctionNumber: string | null;
  auctionDate: string | null;
};

export type DelayReasonRow = {
  reason: string;
  lotCount: number;
};

export type DashboardSummary = {
  totalAuctions: MetricWithDelta;
  totalBidQtyMt: MetricWithDelta;
  totalBidValueCr: MetricWithDelta;
  attachedBidders: MetricWithDelta;
  participatedBidders: MetricWithDelta;
  newBidders: MetricWithDelta;
  auctionsBidderLt5: MetricWithDelta;
  auctionsBidder5To10: MetricWithDelta;
  auctionsBidderGt10: MetricWithDelta;
  totalApprovedQtyMt: MetricWithDelta;
  totalLiftedQtyMt: MetricWithDelta;
  delayReasons: DelayReasonRow[];
  currentPeriodLabel: string;
  previousPeriodLabel: string;
};

export type MaterialSeriesGrain = "month" | "quarter" | "year";

export type MaterialSeriesPoint = {
  period: string;
  periodLabel: string;
  offeredQty: number;
  bidQty: number;
  approvedQty: number;
  offeredAmountLakh: number;
  bidAmountLakh: number;
  approvedAmountLakh: number;
};

export type MaterialSeriesResponse = {
  grain: MaterialSeriesGrain;
  points: MaterialSeriesPoint[];
};

export type MaterialFilters = {
  plants: Array<{ id: number; name: string }>;
  items: Array<{ id: number; name: string }>;
};

export type LiftingAuctionRow = {
  auctionId: number;
  auctionNumber: string | null;
  auctionDate: string | null;
  materialApprovedMt: number;
  materialLiftedMt: number;
  materialPendingMt: number;
  breakUp0To5: number;
  breakUp6To10: number;
  breakUpBeyond10: number;
};

export type LiftingDetails = {
  summary: {
    materialApprovedMt: number;
    materialLiftedMt: number;
    materialPendingMt: number;
    breakUp0To5: number;
    breakUp6To10: number;
    breakUpBeyond10: number;
  };
  rows: LiftingAuctionRow[];
};

export type BidderDetails = {
  attachedBidders: MetricWithDelta;
  participatedBidders: MetricWithDelta;
  newBidders: MetricWithDelta;
  currentPeriodLabel: string;
  previousPeriodLabel: string;
};
