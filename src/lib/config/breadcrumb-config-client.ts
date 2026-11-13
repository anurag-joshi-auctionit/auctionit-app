import type { BreadcrumbConfigItem } from "@auctionit/ui";
import { fallbackBreadcrumbs } from "@/lib/config/breadcrumb-fallback";

const breadcrumbMap: Record<string, BreadcrumbConfigItem[]> = {
  "/dashboard": [{ label: "Dashboard", href: "/dashboard" }],
  "/auctions/today": [
    { label: "Auctions", href: "/auctions/today" },
    { label: "Today's Auctions", href: "/auctions/today" },
  ],
  "/auctions/future": [
    { label: "Auctions", href: "/auctions/today" },
    { label: "Future Auctions", href: "/auctions/future" },
  ],
  "/auctions/closed": [
    { label: "Auctions", href: "/auctions/today" },
    { label: "Closed Auctions", href: "/auctions/closed" },
  ],
  "/auctions/approval": [
    { label: "Auctions", href: "/auctions/today" },
    { label: "Auction Approval", href: "/auctions/approval" },
  ],
  "/auctions/live": [
    { label: "Auctions", href: "/auctions/today" },
    { label: "Live Auctions", href: "/auctions/live" },
  ],
  "/reports/bid-overview": [
    { label: "Reports", href: "/reports/bid-overview" },
    { label: "Bid Overview Report", href: "/reports/bid-overview" },
  ],
  "/reports/bid-details": [
    { label: "Reports", href: "/reports/bid-overview" },
    { label: "Bid Details Report", href: "/reports/bid-details" },
  ],
};

export function getClientBreadcrumbConfig(
  pathname: string,
  _searchParams?: URLSearchParams,
): BreadcrumbConfigItem[] {
  if (breadcrumbMap[pathname]) return breadcrumbMap[pathname];

  if (/^\/auctions\/\d+$/.test(pathname)) {
    return [
      { label: "Auctions", href: "/auctions/today" },
      { label: "Auction Details", href: pathname },
    ];
  }

  return fallbackBreadcrumbs(pathname);
}
