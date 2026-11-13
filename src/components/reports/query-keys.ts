export const reportKeys = {
  all: ["client-reports"] as const,
  clients: () => [...reportKeys.all, "clients"] as const,
  auctions: (clientIds: number[], from: string, to: string) =>
    [
      ...reportKeys.all,
      "auctions",
      [...clientIds].sort((a, b) => a - b).join(","),
      from,
      to,
    ] as const,
  bidOverview: (args: {
    from: string;
    to: string;
    clientIds: number[];
    auctionIds: number[];
    bidMode: string | null;
  }) => [...reportKeys.all, "bid-overview", args] as const,
  bidDetails: (clientId: number, auctionId: number) =>
    [...reportKeys.all, "bid-details", clientId, auctionId] as const,
};
