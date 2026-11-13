import type { BadgeColorPreset } from "../components/ui/badge";

export const ROLE_NAME_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  BIDDER: "Bidder",
  CLIENT: "Client",
  MANAGER_CLIENT: "Manager (Client)",
  MANAGER_BIDDER: "Manager (Bidder)",
  SALES_EXECUTIVE_CLIENT: "Sales Executive (Client)",
  SALES_EXECUTIVE_BIDDER: "Sales Executive (Bidder)",
};

export function getRoleNameLabel(name: string): string {
  return ROLE_NAME_LABEL[name] ?? name;
}

/** Keys that have a curated badge color; other keys fall back to grey. */
export const CLIENT_LEAD_REFERENCE_BADGE_COLOR: Record<
  string,
  BadgeColorPreset
> = {
  MEGHA_JAIN: "green",
  SANJEEV_GARG: "blue",
  MANOJ_MATAI: "yellow",
};

export function getClientLeadReferenceBadgeColor(
  reference: string,
): BadgeColorPreset {
  const key = reference.trim();
  return CLIENT_LEAD_REFERENCE_BADGE_COLOR[key] ?? "grey";
}

export const BIDDER_SUBSCRIPTION_STATUS_BADGE_COLOR: Record<
  string,
  BadgeColorPreset
> = {
  UNREGISTERED: "red",
  REGISTERED: "yellow",
  SUBSCRIBED: "green",
};

export const BIDDER_DISPOSITION_STATUS_BADGE_COLOR: Record<
  string,
  BadgeColorPreset
> = {
  NOT_CALLED: "yellow",
  NOT_ANSWERED: "yellow",
  NOT_INTERESTED: "red",
  GENERIC_FOLLOWUP: "purple",
  INTERESTED_FOLLOWUP: "blue",
  ONBOARDED: "green",
  WRONG_NUMBER: "rose",
};

export function getBidderSubscriptionStatusBadgeColor(
  status: string,
): BadgeColorPreset {
  return BIDDER_SUBSCRIPTION_STATUS_BADGE_COLOR[status] ?? "grey";
}

export function getBidderDispositionStatusBadgeColor(
  status: string,
): BadgeColorPreset {
  return BIDDER_DISPOSITION_STATUS_BADGE_COLOR[status] ?? "grey";
}
