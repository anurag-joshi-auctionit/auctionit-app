export const ADDITIONAL_FIELD_SCOPES = ["auction", "lot"] as const;
export type AdditionalFieldScope = (typeof ADDITIONAL_FIELD_SCOPES)[number];

export const ADDITIONAL_FIELD_SCOPE_LABELS: Record<AdditionalFieldScope, string> =
  {
    auction: "Auction",
    lot: "Lot",
  };

export const ADDITIONAL_FIELD_DATA_TYPES = [
  "text",
  "number",
  "date",
  "boolean",
] as const;
export type AdditionalFieldDataType =
  (typeof ADDITIONAL_FIELD_DATA_TYPES)[number];

export const ADDITIONAL_FIELD_DATA_TYPE_LABELS: Record<
  AdditionalFieldDataType,
  string
> = {
  text: "Text",
  number: "Number",
  date: "Date",
  boolean: "Yes/No",
};

/** Stored values for boolean fields. */
export const ADDITIONAL_FIELD_BOOLEAN_VALUES = ["Yes", "No"] as const;

const BOOLEAN_INPUTS: Record<string, (typeof ADDITIONAL_FIELD_BOOLEAN_VALUES)[number]> = {
  yes: "Yes",
  y: "Yes",
  true: "Yes",
  "1": "Yes",
  no: "No",
  n: "No",
  false: "No",
  "0": "No",
};

export const ADDITIONAL_FIELD_LABEL_MAX = 100;
export const ADDITIONAL_FIELD_VALUE_MAX = 2000;

export const ADDITIONAL_FIELD_FORMAT_LABELS: Record<
  AdditionalFieldDataType,
  string
> = {
  text: `Text (max ${ADDITIONAL_FIELD_VALUE_MAX})`,
  number: "Numeric",
  date: "DD-MM-YYYY",
  boolean: "Yes or No",
};

/** e.g. "Date (DD-MM-YYYY)" */
export function additionalFieldTypeWithFormat(
  dataType: AdditionalFieldDataType,
): string {
  if (dataType === "boolean") return ADDITIONAL_FIELD_DATA_TYPE_LABELS[dataType];
  return `${ADDITIONAL_FIELD_DATA_TYPE_LABELS[dataType]} (${ADDITIONAL_FIELD_FORMAT_LABELS[dataType]})`;
}

const NUMBER_PATTERN = /^[-+]?\d+(?:\.\d+)?$/;
const DMY_PATTERN = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
const ISO_PATTERN = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
/** Excel serial day 0 = 1899-12-30 (accounts for the 1900 leap-year bug). */
const EXCEL_EPOCH_UTC_MS = Date.UTC(1899, 11, 30);
const DAY_MS = 86_400_000;

function toIsoDate(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(Date.UTC(year, month - 1, day));
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null;
  }
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Parses Excel serials, DD-MM-YYYY, DD/MM/YYYY, and YYYY-MM-DD into ISO YYYY-MM-DD.
 */
export function parseAdditionalFieldDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  const iso = ISO_PATTERN.exec(s);
  if (iso) return toIsoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  const dmy = DMY_PATTERN.exec(s);
  if (dmy) return toIsoDate(Number(dmy[3]), Number(dmy[2]), Number(dmy[1]));
  if (/^\d+(?:\.\d+)?$/.test(s)) {
    const serial = Math.floor(Number(s));
    if (serial < 1 || serial > 2_958_465) return null;
    const d = new Date(EXCEL_EPOCH_UTC_MS + serial * DAY_MS);
    return toIsoDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  }
  return null;
}

export type NormalizedAdditionalFieldValue =
  | { ok: true; value: string | null }
  | { ok: false };

/** Blank → null; otherwise type-checked and normalized for storage. */
export function normalizeAdditionalFieldValue(
  dataType: AdditionalFieldDataType,
  raw: string | null | undefined,
): NormalizedAdditionalFieldValue {
  const s = (raw ?? "").trim();
  if (!s) return { ok: true, value: null };
  if (dataType === "number") {
    const compact = s.replace(/,/g, "");
    if (!NUMBER_PATTERN.test(compact)) return { ok: false };
    return { ok: true, value: String(Number(compact)) };
  }
  if (dataType === "date") {
    const iso = parseAdditionalFieldDate(s);
    return iso ? { ok: true, value: iso } : { ok: false };
  }
  if (dataType === "boolean") {
    const b = BOOLEAN_INPUTS[s.toLowerCase()];
    return b ? { ok: true, value: b } : { ok: false };
  }
  if (s.length > ADDITIONAL_FIELD_VALUE_MAX) return { ok: false };
  return { ok: true, value: s };
}

/** ISO YYYY-MM-DD → DD-MM-YYYY for display/export; other types unchanged. */
export function formatAdditionalFieldValue(
  dataType: AdditionalFieldDataType,
  value: string | null | undefined,
): string {
  if (value == null || value === "") return "";
  if (dataType === "date") {
    const m = ISO_PATTERN.exec(value);
    if (m) return `${m[3]!.padStart(2, "0")}-${m[2]!.padStart(2, "0")}-${m[1]}`;
  }
  return value;
}
