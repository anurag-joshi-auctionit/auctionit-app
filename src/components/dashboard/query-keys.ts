export const dashboardKeys = {
  all: ["client-dashboard"] as const,
  clients: () => [...dashboardKeys.all, "clients"] as const,
  summary: (clientId: number, from: string, to: string) =>
    [...dashboardKeys.all, "summary", clientId, from, to] as const,
  materialFilters: (clientId: number, from: string, to: string) =>
    [...dashboardKeys.all, "material-filters", clientId, from, to] as const,
  material: (
    clientId: number,
    from: string,
    to: string,
    plantLocationId: number | null,
    itemId: number | null,
  ) =>
    [
      ...dashboardKeys.all,
      "material",
      clientId,
      from,
      to,
      plantLocationId,
      itemId,
    ] as const,
  lifting: (clientId: number, from: string, to: string) =>
    [...dashboardKeys.all, "lifting", clientId, from, to] as const,
  auctions: (clientId: number, from: string, to: string) =>
    [...dashboardKeys.all, "auctions", clientId, from, to] as const,
  bidder: (
    clientId: number,
    from: string,
    to: string,
    auctionId: number | null,
  ) =>
    [...dashboardKeys.all, "bidder", clientId, from, to, auctionId] as const,
};
