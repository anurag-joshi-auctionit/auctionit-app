import { File06, Package, Perspective02 } from "@untitledui/icons";
import type { NavigationConfig } from "@auctionit/ui";

export const clientNavigationConfig: NavigationConfig = {
  main: [
    {
      name: "Dashboard",
      icon: Perspective02,
      href: "/dashboard",
      permission: "module.portal-client-dashboard",
    },
    {
      name: "Auctions",
      icon: Package,
      permission: "module.portal-client-auctions",
      items: [
        {
          name: "Today's Auctions",
          href: "/auctions/today",
          permission: "module.portal-client-auctions",
        },
        {
          name: "Live Auctions",
          href: "/auctions/live",
          permission: "module.portal-client-auctions",
        },
        {
          name: "Future Auctions",
          href: "/auctions/future",
          permission: "module.portal-client-auctions",
        },
        {
          name: "Closed Auctions",
          href: "/auctions/closed",
          permission: "module.portal-client-auctions",
        },
        {
          name: "Auction Approval",
          href: "/auctions/approval",
          permission: "module.portal-client-auctions",
        },
      ],
    },
    {
      name: "Reports",
      icon: File06,
      permission: "module.portal-client-reports",
      groups: [
        {
          label: "Post-Auction",
          items: [
            {
              name: "Bid Overview",
              href: "/reports/bid-overview",
              permission: "module.portal-client-reports",
            },
            {
              name: "Bid Details",
              href: "/reports/bid-details",
              permission: "module.portal-client-reports",
            },
          ],
        },
      ],
    },
  ],
  footer: [],
};
