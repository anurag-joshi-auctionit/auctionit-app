export const SERVICE_FEE_TYPES = [
  "service_percentage",
  "fixed_amount",
  "pmt",
] as const;

export type ServiceFeeType = (typeof SERVICE_FEE_TYPES)[number];

export const SERVICE_FEE_TYPE_LABELS: Record<ServiceFeeType, string> = {
  service_percentage: "Service Percentage",
  fixed_amount: "Fixed Amount",
  pmt: "PMT",
};

/** Fixed-amount invoices do not require an annexure PDF (or email attachment). */
export function serviceInvoiceRequiresAnnexurePdf(
  serviceFeeType: ServiceFeeType,
): boolean {
  return serviceFeeType !== "fixed_amount";
}

export const SERVICE_FEE_MIN = 0;
export const SERVICE_FEE_MAX = 5;
export const SERVICE_FEE_DECIMALS = 3;
export const SERVICE_FEE_STEP = 0.001;

const SERVICE_FEE_INPUT_PATTERN = /^\d+(?:\.\d{1,3})?$/;
const NON_NEGATIVE_FEE_INPUT_PATTERN = /^\d+(?:\.\d+)?$/;

export function hasValidServiceFeeDecimals(value: number): boolean {
  const scaled = value * 10 ** SERVICE_FEE_DECIMALS;
  return Math.abs(Math.round(scaled) - scaled) < 1e-6;
}

/** Percentage fee: 0–5 with up to 3 decimals. */
export function isValidServiceFeeNumber(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= SERVICE_FEE_MIN &&
    value <= SERVICE_FEE_MAX &&
    hasValidServiceFeeDecimals(value)
  );
}

export function isValidServiceFeeInput(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || !SERVICE_FEE_INPUT_PATTERN.test(trimmed)) {
    return false;
  }
  return isValidServiceFeeNumber(Number(trimmed));
}

/** Any fee type: value must be >= 0. */
export function isPositiveServiceFeeValue(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function isPositiveServiceFeeValueInput(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || !NON_NEGATIVE_FEE_INPUT_PATTERN.test(trimmed)) {
    return false;
  }
  return isPositiveServiceFeeValue(Number(trimmed));
}

/** Type-aware value check: percentage 0–5; fixed/pmt must be >= 0. */
export function isValidServiceFeeValueForType(
  type: ServiceFeeType,
  value: number,
): boolean {
  if (!Number.isFinite(value)) return false;
  if (type === "service_percentage") {
    return isValidServiceFeeNumber(value);
  }
  return isPositiveServiceFeeValue(value);
}

export function isValidServiceFeeValueInputForType(
  type: ServiceFeeType,
  value: string,
): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (type === "service_percentage") {
    return isValidServiceFeeInput(trimmed);
  }
  return isPositiveServiceFeeValueInput(trimmed);
}
