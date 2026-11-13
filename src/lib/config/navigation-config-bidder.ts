import {
  Bank,
  CreditCard02,
  Package,
  Perspective02,
  Wallet04,
} from "@untitledui/icons";
import type { NavigationConfig } from "@auctionit/ui";

export const bidderNavigationConfig: NavigationConfig = {
  main: [
    {
      name: "Dashboard",
      icon: Perspective02,
      href: "/",
      permission: "module.portal-bidder-dashboard",
    },
    {
      name: "Auctions",
      icon: Package,
      permission: "module.portal-bidder-auctions",
      items: [
        {
          name: "Today's Auctions",
          href: "/auctions/today",
          permission: "module.portal-bidder-auctions",
        },
        {
          name: "Live Auctions",
          href: "/auctions/live",
          permission: "module.portal-bidder-live",
        },
        {
          name: "Future Auctions",
          href: "/auctions/future",
          permission: "module.portal-bidder-auctions",
        },
        {
          name: "Closed Auctions",
          href: "/auctions/closed",
          permission: "module.portal-bidder-auctions",
        },
      ],
    },
    {
      name: "EMD",
      icon: Wallet04,
      href: "/emd",
      permission: "module.portal-bidder-emd",
    },
    {
      name: "Subscriptions",
      icon: CreditCard02,
      href: "/subscriptions",
      permission: "module.portal-bidder-subscriptions",
    },
    {
      name: "Bank Account",
      icon: Bank,
      href: "/bank-account",
      permission: "module.portal-bidder-emd",
    },
  ],
  footer: [],
};
