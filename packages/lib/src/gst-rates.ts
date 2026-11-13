import { z } from "zod";

export const GST_RATE_VALUES = [0, 5, 12, 18, 28] as const;

export type GstRate = (typeof GST_RATE_VALUES)[number];

export function isGstRate(value: unknown): value is GstRate {
  return (
    typeof value === "number" &&
    (GST_RATE_VALUES as readonly number[]).includes(value)
  );
}

export function parseGstRate(value: unknown): GstRate | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return isGstRate(value) ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const n = Number(trimmed);
    return isGstRate(n) ? n : null;
  }
  return null;
}

export const GST_RATE_OPTIONS: ReadonlyArray<{ value: GstRate; label: string }> =
  GST_RATE_VALUES.map((value) => ({
    value,
    label: `${value}%`,
  }));

export const gstRateZod = z.custom<GstRate>(
  (v) => typeof v === "number" && isGstRate(v),
  { message: `GST% must be one of: ${GST_RATE_VALUES.join(", ")}` },
);

/** Coerces string/number input then checks against allowed GST rates. */
export const gstRateCoerceZod = z.coerce
  .number()
  .refine((v): v is GstRate => isGstRate(v), {
    message: `GST% must be one of: ${GST_RATE_VALUES.join(", ")}`,
  });
