export type BidderDashboardClientOption = {
  clientId: number;
  companyName: string;
};

export type BidderLiftingFilters = {
  plants: Array<{ id: number; name: string }>;
  items: Array<{ id: number; name: string }>;
};

export type BidderLiftingSellerRow = {
  clientId: number;
  clientName: string | null;
  materialApprovedMt: number;
  materialLiftedMt: number;
  materialPendingMt: number;
  /** Rupee amount — format with formatCurrencyIndian. */
  approvedValue: number;
  /** Rupee amount — format with formatCurrencyIndian. */
  liftedValue: number;
};

export type BidderLiftingSeriesPoint = {
  period: string;
  periodLabel: string;
  approvedQty: number;
  liftedQty: number;
  /** Rupee amount. */
  approvedAmount: number;
  /** Rupee amount. */
  liftedAmount: number;
};

export type BidderLiftingDetails = {
  summary: {
    materialApprovedMt: number;
    materialLiftedMt: number;
    materialPendingMt: number;
    approvedValue: number;
    liftedValue: number;
  };
  rows: BidderLiftingSellerRow[];
  series: {
    grain: "month" | "quarter" | "year";
    points: BidderLiftingSeriesPoint[];
  };
};
