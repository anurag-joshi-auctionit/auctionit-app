/** Shared live-auction deep-link / status helpers (client + bidder). */

/** Comma-separated query param → id list (admin/live deep-link compat). */
export function parseIdListParam(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** First id from a comma-separated query param. */
export function parseFirstIdParam(value: string | null): string | null {
  if (!value) return null;
  const first = value
    .split(",")
    .map((s) => s.trim())
    .find(Boolean);
  return first ?? null;
}

export function stringArraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** Compact "time since" for last-refreshed (`at` epoch-ms; 0 = never). */
export function formatAgo(at: number, now: number): string {
  if (!at) return "—";
  const sec = Math.max(0, Math.floor((now - at) / 1000));
  if (sec < 1) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  return `${min}m ago`;
}
