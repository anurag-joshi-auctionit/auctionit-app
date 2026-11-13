import { formatDateParam } from "@auctionit/ui";

const STORAGE_KEY_PREFIX = "auctionit.bidder-dashboard.filters";

export type StoredBidderDashboardFilters = {
  from: string | null;
  to: string | null;
  clientId: number | null;
  plantLocationId: number | null;
  itemId: number | null;
};

function defaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 89);
  return {
    from: formatDateParam(from),
    to: formatDateParam(to),
  };
}

const DEFAULT_FILTERS: StoredBidderDashboardFilters = {
  from: null,
  to: null,
  clientId: null,
  plantLocationId: null,
  itemId: null,
};

function storageKey(userId: number): string {
  return `${STORAGE_KEY_PREFIX}.${userId}`;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function positiveInt(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function defaultBidderDashboardFilters(): StoredBidderDashboardFilters {
  const range = defaultDateRange();
  return {
    ...DEFAULT_FILTERS,
    from: range.from,
    to: range.to,
  };
}

export function readStoredBidderDashboardFilters(
  userId: number,
): StoredBidderDashboardFilters {
  if (typeof window === "undefined") return defaultBidderDashboardFilters();
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return defaultBidderDashboardFilters();
    const parsed = JSON.parse(raw) as Partial<StoredBidderDashboardFilters>;
    const from = isIsoDate(parsed.from) ? parsed.from : null;
    const to = isIsoDate(parsed.to) ? parsed.to : null;
    if (!from || !to) return defaultBidderDashboardFilters();
    return {
      from,
      to,
      clientId: positiveInt(parsed.clientId),
      plantLocationId: positiveInt(parsed.plantLocationId),
      itemId: positiveInt(parsed.itemId),
    };
  } catch {
    return defaultBidderDashboardFilters();
  }
}

export function writeStoredBidderDashboardFilters(
  userId: number,
  filters: StoredBidderDashboardFilters,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(filters));
  } catch {
    // Ignore quota / private-mode failures.
  }
}
