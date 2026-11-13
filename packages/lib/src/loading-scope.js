export const LOADING_SCOPE_VALUES = ["buyer", "seller"];
export const DEFAULT_LOADING_SCOPE = "buyer";
export const LOADING_SCOPE_LABELS = {
    buyer: "Buyer",
    seller: "Seller",
};
/** Excel / UI display labels (Buyer | Seller). */
export const LOADING_SCOPE_DISPLAY = ["Buyer", "Seller"];
export const DEFAULT_LOADING_SCOPE_DISPLAY =
    LOADING_SCOPE_LABELS[DEFAULT_LOADING_SCOPE];
export function isLoadingScope(value) {
    return (typeof value === "string" &&
        LOADING_SCOPE_VALUES.includes(value));
}
/**
 * Normalize Excel labels, enum keys, or legacy MSSQL ints to LoadingScope.
 * Legacy ints: 1 = Buyer, 2 = Seller (common DropDownValueList pattern).
 */
export function parseLoadingScope(value) {
    if (value == null)
        return null;
    if (typeof value === "number" && Number.isFinite(value)) {
        if (value === 1)
            return "buyer";
        if (value === 2)
            return "seller";
        return null;
    }
    const s = String(value).trim().toLowerCase();
    if (s === "" || s === "null")
        return null;
    if (s === "1" || s === "buyer" || s.includes("buyer"))
        return "buyer";
    if (s === "2" || s === "seller" || s.includes("seller"))
        return "seller";
    return null;
}
export const LOADING_SCOPE_OPTIONS = LOADING_SCOPE_VALUES.map((value) => ({
    value,
    label: LOADING_SCOPE_LABELS[value],
}));
