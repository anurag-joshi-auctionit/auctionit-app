import type { BreadcrumbConfigItem } from "@auctionit/ui";
import { fallbackBreadcrumbs } from "@/lib/config/breadcrumb-fallback";

const RA_STAGE_LABELS: Record<string, string> = { rfi: "RFI", rfp: "RFP", rfq: "RFQ" };

const breadcrumbMap: Record<string, BreadcrumbConfigItem[]> = {
  "/": [{ label: "Dashboard", href: "/" }],
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
  "/auctions/live": [
    { label: "Auctions", href: "/auctions/today" },
    { label: "Live Auctions", href: "/auctions/live" },
  ],
  "/auctions/sealed-bids": [
    { label: "Auctions", href: "/auctions/today" },
    { label: "Sealed-bid Windows", href: "/auctions/sealed-bids" },
  ],
  "/auctions/ra-stages": [
    { label: "Auctions", href: "/auctions/today" },
    { label: "RA Stages", href: "/auctions/ra-stages" },
  ],
  "/emd": [{ label: "EMD", href: "/emd" }],
  "/bank-account": [{ label: "Bank Account", href: "/bank-account" }],
  "/subscriptions": [{ label: "Subscriptions", href: "/subscriptions" }],
  "/subscriptions/return": [
    { label: "Subscriptions", href: "/subscriptions" },
    { label: "Payment confirmation", href: "/subscriptions/return" },
  ],
};

export function getBidderBreadcrumbConfig(
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

  const raStageMatch = /^\/auctions\/(\d+)\/ra-stages\/([^/]+)$/.exec(pathname);
  if (raStageMatch) {
    const auctionId = raStageMatch[1];
    const stageKey = raStageMatch[2];
    return [
      { label: "Auctions", href: "/auctions/today" },
      { label: auctionId, href: `/auctions/${auctionId}` },
      { label: "RA Stages", href: `/auctions/ra-stages` },
      { label: RA_STAGE_LABELS[stageKey] ?? stageKey.toUpperCase(), href: pathname },
    ];
  }

  return fallbackBreadcrumbs(pathname);
}
