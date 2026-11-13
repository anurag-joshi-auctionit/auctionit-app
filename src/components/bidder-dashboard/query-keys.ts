export const bidderDashboardKeys = {
  all: ["bidder-dashboard"] as const,
  clients: (from: string, to: string) =>
    [...bidderDashboardKeys.all, "clients", from, to] as const,
  liftingFilters: (
    from: string,
    to: string,
    clientId: number | null,
  ) =>
    [
      ...bidderDashboardKeys.all,
      "lifting-filters",
      from,
      to,
      clientId,
    ] as const,
  lifting: (
    from: string,
    to: string,
    clientId: number | null,
    plantLocationId: number | null,
    itemId: number | null,
  ) =>
    [
      ...bidderDashboardKeys.all,
      "lifting",
      from,
      to,
      clientId,
      plantLocationId,
      itemId,
    ] as const,
};
