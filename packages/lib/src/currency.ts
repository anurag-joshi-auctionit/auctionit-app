// ---------------------------------------------------------------------------
// Display currency (INR / en-IN)
// ---------------------------------------------------------------------------

/** App-wide display locale for currency amounts. */
const DISPLAY_LOCALE = "en-IN";

/** App-wide ISO currency code. Symbol comes from Intl, not a hardcoded glyph. */
export const DISPLAY_CURRENCY = "INR";

const LAKH = 100_000;
const CRORE = 10_000_000;

function toFiniteNumber(
  value: number | string | null | undefined,
): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export type FormatCurrencyOptions = {
  /**
   * When set, both min and max fraction digits use this value
   * (e.g. `2` → always show paise: `₹1,234.00`).
   * Default UI behavior is 0–2.
   */
  fractionDigits?: number;
};

/**
 * Formats a currency amount for display. Use everywhere an amount is shown
 * (UI and emails). Symbol/code come from DISPLAY_CURRENCY via Intl.
 */
export function formatCurrency(
  value: number | string | null | undefined,
  options?: FormatCurrencyOptions,
): string {
  const n = toFiniteNumber(value);
  if (n == null) return "";
  const fractionDigits = options?.fractionDigits;
  return new Intl.NumberFormat(DISPLAY_LOCALE, {
    style: "currency",
    currency: DISPLAY_CURRENCY,
    minimumFractionDigits: fractionDigits ?? 0,
    maximumFractionDigits: fractionDigits ?? 2,
  }).format(n);
}

/**
 * Currency in accounting notation — negatives are wrapped in parentheses
 * (e.g. -25,000 → "(₹25,000)"). Use for signed amounts like ledger running
 * balances; positives render identically to formatCurrency.
 */
export function formatCurrencyAccounting(
  value: number | string | null | undefined,
): string {
  const n = toFiniteNumber(value);
  if (n == null) return "";
  // Intl's `currencySign: "accounting"` drops en-IN lakh grouping (₹530,000).
  const formatted = formatCurrency(Math.abs(n));
  return n < 0 ? `(${formatted})` : formatted;
}

function formatScaled(value: number, divisor: number, suffix: string): string {
  const amount = new Intl.NumberFormat(DISPLAY_LOCALE, {
    style: "currency",
    currency: DISPLAY_CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value / divisor);
  return `${amount}${suffix}`;
}

/**
 * Indian headline totals: full amount below 1 lakh, then "₹25L" / "₹1.25Cr.".
 * Trailing zeros are dropped. Amounts that would round to ₹100L promote to Cr.
 */
export function formatCurrencyIndian(
  value: number | string | null | undefined,
): string {
  const n = toFiniteNumber(value);
  if (n == null) return "";
  const abs = Math.abs(n);
  if (abs >= CRORE) return formatScaled(n, CRORE, "Cr.");
  if (abs >= LAKH) {
    return Math.round((abs / LAKH) * 100) / 100 >= 100
      ? formatScaled(n, CRORE, "Cr.")
      : formatScaled(n, LAKH, "L");
  }
  return formatCurrency(n);
}

/** Always in crores with 2 decimals, e.g. "₹0.45Cr." / "₹1,234.50Cr.", so a row of totals lines up. */
export function formatCurrencyCrore(
  value: number | string | null | undefined,
): string {
  const n = toFiniteNumber(value);
  if (n == null) return "";
  const amount = new Intl.NumberFormat(DISPLAY_LOCALE, {
    style: "currency",
    currency: DISPLAY_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n / CRORE);
  return `${amount}Cr.`;
}

/** Currency glyph for InputCurrency addon / labels (not for amount values). */
export function getCurrencySymbol(currency: string = DISPLAY_CURRENCY): string {
  return (
    new Intl.NumberFormat(DISPLAY_LOCALE, {
      style: "currency",
      currency,
    })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? currency
  );
}
