import {
  isBidOverviewMode,
  type BidOverviewMode,
} from "@/components/reports/report-types";

const OVERVIEW_STORAGE_KEY_PREFIX = "auctionit.client-reports.bid-overview";
const DETAILS_STORAGE_KEY_PREFIX = "auctionit.client-reports.bid-details";

export type StoredBidOverviewFilters = {
  from: string | null;
  to: string | null;
  clientIds: number[];
  auctionIds: number[];
  bidMode: BidOverviewMode | null;
};

export type StoredBidDetailsFilters = {
  from: string | null;
  to: string | null;
  clientId: number | null;
  auctionId: number | null;
};

const DEFAULT_OVERVIEW: StoredBidOverviewFilters = {
  from: null,
  to: null,
  clientIds: [],
  auctionIds: [],
  bidMode: null,
};

const DEFAULT_DETAILS: StoredBidDetailsFilters = {
  from: null,
  to: null,
  clientId: null,
  auctionId: null,
};

function storageKey(prefix: string, userId: number): string {
  return `${prefix}.${userId}`;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function positiveInt(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function positiveIntList(value: unknown): number[] {
  if (Array.isArray(value)) {
    return [
      ...new Set(
        value
          .map((v) => positiveInt(v))
          .filter((n): n is number => n != null),
      ),
    ];
  }
  const single = positiveInt(value);
  return single != null ? [single] : [];
}

export function readStoredBidOverviewFilters(
  userId: number,
): StoredBidOverviewFilters {
  if (typeof window === "undefined") return DEFAULT_OVERVIEW;
  try {
    const raw = window.localStorage.getItem(
      storageKey(OVERVIEW_STORAGE_KEY_PREFIX, userId),
    );
    if (!raw) return DEFAULT_OVERVIEW;
    const parsed = JSON.parse(raw) as Partial<StoredBidOverviewFilters> & {
      clientId?: unknown;
      auctionId?: unknown;
    };
    const from = isIsoDate(parsed.from) ? parsed.from : null;
    const to = isIsoDate(parsed.to) ? parsed.to : null;
    const bidModeRaw =
      typeof parsed.bidMode === "string" ? parsed.bidMode : null;
    const clientIds =
      parsed.clientIds != null
        ? positiveIntList(parsed.clientIds)
        : positiveIntList(parsed.clientId);
    const auctionIds =
      parsed.auctionIds != null
        ? positiveIntList(parsed.auctionIds)
        : positiveIntList(parsed.auctionId);
    return {
      from: from && to ? from : null,
      to: from && to ? to : null,
      clientIds,
      auctionIds,
      bidMode: isBidOverviewMode(bidModeRaw) ? bidModeRaw : null,
    };
  } catch {
    return DEFAULT_OVERVIEW;
  }
}

export function writeStoredBidOverviewFilters(
  userId: number,
  filters: StoredBidOverviewFilters,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKey(OVERVIEW_STORAGE_KEY_PREFIX, userId),
      JSON.stringify(filters),
    );
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function readStoredBidDetailsFilters(
  userId: number,
): StoredBidDetailsFilters {
  if (typeof window === "undefined") return DEFAULT_DETAILS;
  try {
    const raw = window.localStorage.getItem(
      storageKey(DETAILS_STORAGE_KEY_PREFIX, userId),
    );
    if (!raw) return DEFAULT_DETAILS;
    const parsed = JSON.parse(raw) as Partial<StoredBidDetailsFilters>;
    const from = isIsoDate(parsed.from) ? parsed.from : null;
    const to = isIsoDate(parsed.to) ? parsed.to : null;
    return {
      from: from && to ? from : null,
      to: from && to ? to : null,
      clientId: positiveInt(parsed.clientId),
      auctionId: positiveInt(parsed.auctionId),
    };
  } catch {
    return DEFAULT_DETAILS;
  }
}

export function writeStoredBidDetailsFilters(
  userId: number,
  filters: StoredBidDetailsFilters,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKey(DETAILS_STORAGE_KEY_PREFIX, userId),
      JSON.stringify(filters),
    );
  } catch {
    // Ignore quota / private-mode failures.
  }
}
