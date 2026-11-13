const STORAGE_KEY_PREFIX = "auctionit.client-dashboard.filters";

export type StoredDashboardFilters = {
  clientId: number | null;
  from: string | null;
  to: string | null;
  plantLocationId: number | null;
  itemId: number | null;
  auctionId: number | null;
};

const DEFAULT_FILTERS: StoredDashboardFilters = {
  clientId: null,
  from: null,
  to: null,
  plantLocationId: null,
  itemId: null,
  auctionId: null,
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

export function readStoredDashboardFilters(
  userId: number,
): StoredDashboardFilters {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return DEFAULT_FILTERS;
    const parsed = JSON.parse(raw) as Partial<StoredDashboardFilters>;
    const from = isIsoDate(parsed.from) ? parsed.from : null;
    const to = isIsoDate(parsed.to) ? parsed.to : null;
    return {
      clientId: positiveInt(parsed.clientId),
      from: from && to ? from : null,
      to: from && to ? to : null,
      plantLocationId: positiveInt(parsed.plantLocationId),
      itemId: positiveInt(parsed.itemId),
      auctionId: positiveInt(parsed.auctionId),
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

export function writeStoredDashboardFilters(
  userId: number,
  filters: StoredDashboardFilters,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(filters));
  } catch {
    // Ignore quota / private-mode failures.
  }
}
