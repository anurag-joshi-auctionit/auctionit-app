export const LOADING_SCOPE_VALUES = ["buyer", "seller"] as const;

export type LoadingScope = (typeof LOADING_SCOPE_VALUES)[number];

export const DEFAULT_LOADING_SCOPE: LoadingScope = "buyer";

export const LOADING_SCOPE_LABELS: Record<LoadingScope, string> = {
  buyer: "Buyer",
  seller: "Seller",
};

/** Excel / UI display labels (Buyer | Seller). */
export const LOADING_SCOPE_DISPLAY = ["Buyer", "Seller"] as const;

export const DEFAULT_LOADING_SCOPE_DISPLAY =
  LOADING_SCOPE_LABELS[DEFAULT_LOADING_SCOPE];

export function isLoadingScope(value: unknown): value is LoadingScope {
  return (
    typeof value === "string" &&
    (LOADING_SCOPE_VALUES as readonly string[]).includes(value)
  );
}

/**
 * Normalize Excel labels, enum keys, or legacy MSSQL ints to LoadingScope.
 * Legacy ints: 1 = Buyer, 2 = Seller (common DropDownValueList pattern).
 */
export function parseLoadingScope(value: unknown): LoadingScope | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value === 1) return "buyer";
    if (value === 2) return "seller";
    return null;
  }
  const s = String(value).trim().toLowerCase();
  if (s === "" || s === "null") return null;
  if (s === "1" || s === "buyer" || s.includes("buyer")) return "buyer";
  if (s === "2" || s === "seller" || s.includes("seller")) return "seller";
  return null;
}

export const LOADING_SCOPE_OPTIONS: ReadonlyArray<{
  value: LoadingScope;
  label: string;
}> = LOADING_SCOPE_VALUES.map((value) => ({
  value,
  label: LOADING_SCOPE_LABELS[value],
}));
