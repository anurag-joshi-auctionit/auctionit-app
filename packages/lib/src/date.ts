import {
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subQuarters,
  subWeeks,
  subYears,
} from "date-fns";
import { parseTimeOfDayString } from "./time-of-day.js";

// ---------------------------------------------------------------------------
// UTC storage + IST (Asia/Kolkata) input/display
// ---------------------------------------------------------------------------

/** App-wide display date format: DD MMM YYYY (e.g. 22 Mar 2025). */
const DISPLAY_DATE_FORMAT = "dd MMM yyyy";

/** Date + time for follow-ups and timestamps (12-hour clock with AM/PM). */
const DISPLAY_DATETIME_FORMAT = "dd MMM yyyy, h:mm a";

/** Date + time with seconds. */
const DISPLAY_DATETIME_SECONDS_FORMAT = "dd MMM yyyy, h:mm:ss a";

/** Business timezone for admin input/display. India has no DST. */
export const IST_TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

const ISO_DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const HAS_TIMEZONE_RE = /(?:[zZ]|[+-]\d{2}:?\d{2})$/;
const NAIVE_DATETIME_RE =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3})\d*)?)?/;
const DATETIME_LOCAL_RE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

/**
 * Instant for an Asia/Kolkata wall-clock date/time (same as PG
 * `timestamp AT TIME ZONE 'Asia/Kolkata'`).
 */
export function fromIstWallClock(
  year: number,
  monthIndex0: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  ms = 0,
): Date {
  return new Date(
    Date.UTC(year, monthIndex0, day, hour, minute, second, ms) - IST_OFFSET_MS,
  );
}

/**
 * Parse API/Postgres datetimes. Zoned values (`Z` / offset) are real instants.
 * Naive values are treated as IST wall-clock (legacy tz-naive rows) by building
 * a local Date from components so display digits are not shifted.
 */
export function parseUtcDateTime(value: string): Date {
  const trimmed = value.trim();
  if (!trimmed) return new Date(NaN);

  if (HAS_TIMEZONE_RE.test(trimmed)) {
    return new Date(trimmed);
  }

  const dateOnly = ISO_DATE_ONLY_RE.exec(trimmed);
  if (dateOnly) {
    return new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
    );
  }

  const naive = NAIVE_DATETIME_RE.exec(trimmed);
  if (naive) {
    const msRaw = naive[7];
    const ms = msRaw != null ? Number(msRaw.padEnd(3, "0").slice(0, 3)) : 0;
    return new Date(
      Number(naive[1]),
      Number(naive[2]) - 1,
      Number(naive[3]),
      Number(naive[4]),
      Number(naive[5]),
      Number(naive[6] ?? 0),
      ms,
    );
  }

  return new Date(NaN);
}

function toLocalCalendarDate(date: Date | string | number): Date {
  if (typeof date === "string") {
    const trimmed = date.trim();
    const match = ISO_DATE_ONLY_RE.exec(trimmed);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
    if (isZonedDateTimeString(trimmed)) {
      const instant = new Date(trimmed);
      if (Number.isNaN(instant.getTime())) return instant;
      // IST calendar day of the instant (not UTC Y-M-D).
      return dateFromIstWallClock(instant);
    }
    const parsed = parseUtcDateTime(trimmed);
    // Legacy UTC-midnight calendar encoding: use UTC Y-M-D.
    if (
      !Number.isNaN(parsed.getTime()) &&
      parsed.getUTCHours() === 0 &&
      parsed.getUTCMinutes() === 0 &&
      parsed.getUTCSeconds() === 0 &&
      parsed.getUTCMilliseconds() === 0 &&
      HAS_TIMEZONE_RE.test(trimmed)
    ) {
      return new Date(
        parsed.getUTCFullYear(),
        parsed.getUTCMonth(),
        parsed.getUTCDate(),
      );
    }
    return parsed;
  }
  if (typeof date === "object" && "getTime" in date) {
    return dateFromIstWallClock(date);
  }
  return dateFromIstWallClock(new Date(date));
}

/**
 * Build a local Date whose wall-clock components match Asia/Kolkata for `instant`.
 * date-fns `format` then prints IST digits regardless of the process timezone.
 */
function dateFromIstWallClock(instant: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? NaN);
  return new Date(
    lookup("year"),
    lookup("month") - 1,
    lookup("day"),
    lookup("hour"),
    lookup("minute"),
    lookup("second"),
  );
}

function isZonedDateTimeString(value: string): boolean {
  return HAS_TIMEZONE_RE.test(value.trim());
}

/**
 * Formats a date for display. Use this everywhere a date is shown in the UI.
 * Output format: DD MMM YYYY (e.g. 22 Mar 2025). Always Asia/Kolkata for instants.
 */
export function formatDate(
  date: Date | string | number | null | undefined,
): string {
  if (date == null || date === "") return "";
  const d = toLocalCalendarDate(date);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, DISPLAY_DATE_FORMAT);
}

/** Date in ledger narrations: DD-MMM-YYYY (e.g. 22-Mar-2025). Asia/Kolkata for instants. */
export function formatNarrationDate(
  date: Date | string | number | null | undefined,
): string {
  if (date == null || date === "") return "";
  const d = toLocalCalendarDate(date);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "dd-MMM-yyyy");
}

/** Fractional seconds from a timestamp string (e.g. `.123456` → `123456`). */
const FRACTIONAL_SECONDS_RE = /[T ]\d{2}:\d{2}:\d{2}\.(\d{1,9})/;

function toDisplayDate(date: Date | string | number): Date {
  if (typeof date === "string") {
    const trimmed = date.trim();
    if (isZonedDateTimeString(trimmed)) {
      const instant = new Date(trimmed);
      if (Number.isNaN(instant.getTime())) return instant;
      return dateFromIstWallClock(instant);
    }
    return parseUtcDateTime(trimmed);
  }
  if (typeof date === "object" && "getTime" in date) {
    return dateFromIstWallClock(date);
  }
  return dateFromIstWallClock(new Date(date));
}

/**
 * Resolve fractional seconds for display.
 * Prefers digits from the original string (Postgres can return µs); falls back
 * to `Date` milliseconds when only a Date/number is available.
 */
function resolveFraction(
  date: Date | string | number,
  d: Date,
  digits: 3 | 6,
): string {
  if (typeof date === "string") {
    const match = FRACTIONAL_SECONDS_RE.exec(date.trim());
    if (match?.[1]) {
      return match[1].padEnd(digits, "0").slice(0, digits);
    }
  }
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return digits === 3 ? ms : `${ms}000`;
}

function formatDateTimeWithFraction(
  date: Date | string | number | null | undefined,
  digits: 3 | 6,
): string {
  if (date == null || date === "") return "";
  const d = toDisplayDate(date);
  if (Number.isNaN(d.getTime())) return "";
  const base = format(d, DISPLAY_DATETIME_SECONDS_FORMAT);
  const fraction = resolveFraction(date, d, digits);
  // Insert `.mmm` / `.mmmmmm` before the AM/PM marker.
  return base.replace(
    /(\d{1,2}:\d{2}:\d{2})(\s+[ap]m)$/i,
    `$1.${fraction}$2`,
  );
}

/** Formats a date/time for display (naive DB timestamps as IST wall-clock). */
export function formatDateTime(
  date: Date | string | number | null | undefined,
): string {
  if (date == null || date === "") return "";
  const d = toDisplayDate(date);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, DISPLAY_DATETIME_FORMAT);
}

/**
 * Formats a date/time with seconds (e.g. `21 Aug 2026, 4:55:26 pm`).
 */
export function formatDateTimeSeconds(
  date: Date | string | number | null | undefined,
): string {
  if (date == null || date === "") return "";
  const d = toDisplayDate(date);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, DISPLAY_DATETIME_SECONDS_FORMAT);
}

/**
 * Formats a date/time with milliseconds (e.g. `21 Aug 2026, 4:55:26.123 pm`).
 * Fractional digits come from the source string when present.
 */
export function formatDateTimeMilliseconds(
  date: Date | string | number | null | undefined,
): string {
  return formatDateTimeWithFraction(date, 3);
}

/**
 * Formats a date/time with microseconds (e.g. `21 Aug 2026, 4:55:26.123456 pm`).
 * Prefer for bid timestamps where tie-breaks need sub-second precision.
 */
export function formatDateTimeMicroseconds(
  date: Date | string | number | null | undefined,
): string {
  return formatDateTimeWithFraction(date, 6);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Normalize to `HH:mm:ss` for Postgres `time` columns. Accepts time-only or datetime. */
export function normalizeTimeOfDay(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const fromClock = parseTimeOfDayString(trimmed);
  if (fromClock) return fromClock;

  const d = parseUtcDateTime(trimmed);
  if (!Number.isNaN(d.getTime())) {
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  }

  const isoLocal = new Date(trimmed);
  if (!Number.isNaN(isoLocal.getTime())) {
    return `${pad2(isoLocal.getHours())}:${pad2(isoLocal.getMinutes())}:${pad2(isoLocal.getSeconds())}`;
  }

  return null;
}

/** `HH:mm:ss` (or datetime) → Date on today's local calendar for TimePicker. */
export function timeOfDayToDate(value: string | null | undefined): Date | null {
  const normalized = normalizeTimeOfDay(value);
  if (!normalized) return null;
  const [h, m, s] = normalized.split(":").map(Number);
  const d = new Date();
  d.setHours(h ?? 0, m ?? 0, s ?? 0, 0);
  return d;
}

/** Display a time-of-day value (`HH:mm` / `HH:mm:ss` / datetime). Defaults to 12-hour clock with AM/PM. */
export function formatTimeOfDay(
  value: string | null | undefined,
  pattern = "h:mm a",
): string {
  if (value == null || value === "") return "";
  const d = timeOfDayToDate(value);
  if (!d) return value;
  return format(d, pattern);
}

/** Local calendar YYYY-MM-DD for filters, API params, and date inputs. */
export function formatDateParam(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Local YYYY-MM-DDTHH:mm for datetime-local form values (no seconds). */
export function formatDatetimeLocalParam(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Parse `YYYY-MM-DD` as a local calendar date. */
export function parseDateParam(value: string | undefined): Date | undefined {
  if (!value?.trim()) return undefined;
  const match = ISO_DATE_ONLY_RE.exec(value.trim());
  if (!match) return undefined;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/**
 * `YYYY-MM-DD` date input → UTC ISO for API/DB.
 * Calendar day is 00:00 Asia/Kolkata on that day (IST midnight → UTC).
 */
export function dateInputToIso(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = ISO_DATE_ONLY_RE.exec(trimmed);
  if (!match) return null;
  return fromIstWallClock(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    0,
    0,
    0,
  ).toISOString();
}

/**
 * `YYYY-MM-DDTHH:mm` / `…:ss` datetime-local → UTC ISO for API/DB.
 * Digits are interpreted as Asia/Kolkata wall-clock.
 */
export function datetimeLocalToIso(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = DATETIME_LOCAL_RE.exec(trimmed);
  if (!match) return null;
  return fromIstWallClock(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6] ?? 0),
  ).toISOString();
}

/**
 * Current Asia/Kolkata wall-clock as `YYYY-MM-DDTHH:mm` for datetime-local
 * form defaults (not for DB writes — use `formatUtcNow`).
 */
export function formatIstWallNow(now: Date = new Date()): string {
  return formatDatetimeLocalParam(dateFromIstWallClock(now));
}

/** Asia/Kolkata calendar day as YYYY-MM-DD. */
export function istDateOnly(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Inclusive IST calendar window of the last 30 days ending today
 * (today − 29 through today).
 */
export function last30IstDateRange(now: Date = new Date()): {
  from: string;
  to: string;
} {
  const to = istDateOnly(now);
  const match = ISO_DATE_ONLY_RE.exec(to);
  if (!match) return { from: to, to };
  const start = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
  start.setUTCDate(start.getUTCDate() - 29);
  return { from: start.toISOString().slice(0, 10), to };
}

/** Current UTC instant as ISO for writing into `timestamptz` columns. */
export function formatUtcNow(now: Date = new Date()): string {
  return now.toISOString();
}

/** ISO/API value → YYYY-MM-DD for `<input type="date">` (IST calendar day). */
export function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const trimmed = iso.trim();
  const dateOnly = ISO_DATE_ONLY_RE.exec(trimmed);
  if (dateOnly) {
    return `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`;
  }
  if (isZonedDateTimeString(trimmed)) {
    const instant = new Date(trimmed);
    if (Number.isNaN(instant.getTime())) return "";
    return formatDateParam(dateFromIstWallClock(instant));
  }
  // Legacy naive IST midnight / wall-clock → component calendar day.
  const naive = NAIVE_DATETIME_RE.exec(trimmed);
  if (naive) {
    return `${naive[1]}-${naive[2]}-${naive[3]}`;
  }
  const d = parseUtcDateTime(trimmed);
  if (Number.isNaN(d.getTime())) return "";
  return formatDateParam(d);
}

/** API/DB value → YYYY-MM-DDTHH:mm for datetime-local (always IST, no seconds). */
export function isoToDatetimeLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const trimmed = iso.trim();
  if (isZonedDateTimeString(trimmed)) {
    const instant = new Date(trimmed);
    if (Number.isNaN(instant.getTime())) return "";
    return formatDatetimeLocalParam(dateFromIstWallClock(instant));
  }
  const d = parseUtcDateTime(trimmed);
  if (Number.isNaN(d.getTime())) return "";
  return formatDatetimeLocalParam(d);
}

function parseDateLike(dateLike: string): Date {
  return parseUtcDateTime(dateLike);
}

/** Parts for a vertical timeline date column (day, month, split time). */
export type TimelineDateParts = {
  day: string;
  month: string;
  year: string;
  timeClock: string;
  timePeriod: string;
};

/** Stable `yyyy-MM` key for grouping or filtering by calendar month. */
export function getMonthKey(dateLike: string): string {
  const date = parseDateLike(dateLike);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM");
}

/** Long month and year for section headings (e.g. April 2026). */
export function formatMonthHeading(dateLike: string): string {
  const date = parseDateLike(dateLike);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "MMMM yyyy");
}

/** Short month and year in local timezone (e.g. Feb 2026). */
export function formatMonthYearShort(dateLike: string): string {
  const date = parseDateLike(dateLike);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "MMM yyyy");
}

/**
 * Chronological compare for invoice period anchors (ISO dates, usually first of month).
 * Negative if a is before b; uses calendar month boundaries, not string order.
 */
export function compareInvoicePeriods(
  periodStartA: string,
  periodStartB: string,
): number {
  const ta = startOfMonth(new Date(periodStartA)).getTime();
  const tb = startOfMonth(new Date(periodStartB)).getTime();
  const safeA = Number.isNaN(ta) ? 0 : ta;
  const safeB = Number.isNaN(tb) ? 0 : tb;
  return safeA - safeB;
}

/** Day, abbreviated month, and clock + AM/PM on separate lines in the UI. */
export function formatTimelineDate(dateLike: string): TimelineDateParts {
  const date = parseDateLike(dateLike);
  if (Number.isNaN(date.getTime())) {
    return {
      day: "--",
      month: "--",
      year: "--",
      timeClock: "--",
      timePeriod: "--",
    };
  }

  return {
    day: format(date, "dd"),
    month: format(date, "MMM"),
    year: format(date, "yyyy"),
    timeClock: format(date, "h:mm"),
    timePeriod: format(date, "a").toUpperCase(),
  };
}

// ---------------------------------------------------------------------------
// Date range presets
// ---------------------------------------------------------------------------

/** Date range preset keys (enum-like, ALL_CAPS_SNAKE_CASE). */
export const DATE_RANGE_PRESET = {
  TODAY: "TODAY",
  YESTERDAY: "YESTERDAY",
  THIS_WEEK: "THIS_WEEK",
  LAST_WEEK: "LAST_WEEK",
  /** Clears the range — no created-at filter (not a calendar span). */
  CLEAR_RANGE: "CLEAR_RANGE",
  THIS_MONTH: "THIS_MONTH",
  LAST_MONTH: "LAST_MONTH",
  LAST_30_DAYS: "LAST_30_DAYS",
  LAST_3_MONTHS: "LAST_3_MONTHS",
  THIS_YEAR: "THIS_YEAR",
  LAST_YEAR: "LAST_YEAR",
  LAST_QUARTER: "LAST_QUARTER",
  FY_25_26: "FY_25_26",
  FY_24_25: "FY_24_25",
  FY_23_24: "FY_23_24",
  FY_22_23: "FY_22_23",
} as const;

export type DateRangePreset =
  (typeof DATE_RANGE_PRESET)[keyof typeof DATE_RANGE_PRESET];

export const DATE_RANGE_PRESET_LABELS: Record<DateRangePreset, string> = {
  [DATE_RANGE_PRESET.TODAY]: "Today",
  [DATE_RANGE_PRESET.YESTERDAY]: "Yesterday",
  [DATE_RANGE_PRESET.THIS_WEEK]: "This Week",
  [DATE_RANGE_PRESET.LAST_WEEK]: "Last Week",
  [DATE_RANGE_PRESET.CLEAR_RANGE]: "Clear Filter",
  [DATE_RANGE_PRESET.THIS_MONTH]: "This Month",
  [DATE_RANGE_PRESET.LAST_MONTH]: "Last Month",
  [DATE_RANGE_PRESET.LAST_30_DAYS]: "Last 30 Days",
  [DATE_RANGE_PRESET.LAST_3_MONTHS]: "Last 3 Months",
  [DATE_RANGE_PRESET.THIS_YEAR]: "This Year",
  [DATE_RANGE_PRESET.LAST_YEAR]: "Last Year",
  [DATE_RANGE_PRESET.LAST_QUARTER]: "Last Quarter",
  [DATE_RANGE_PRESET.FY_25_26]: "FY 25-26",
  [DATE_RANGE_PRESET.FY_24_25]: "FY 24-25",
  [DATE_RANGE_PRESET.FY_23_24]: "FY 23-24",
  [DATE_RANGE_PRESET.FY_22_23]: "FY 22-23",
};

/** Presets in display order for the date range picker UI. */
export const DATE_RANGE_PRESETS: readonly DateRangePreset[] = [
  DATE_RANGE_PRESET.TODAY,
  DATE_RANGE_PRESET.YESTERDAY,
  DATE_RANGE_PRESET.THIS_WEEK,
  DATE_RANGE_PRESET.LAST_WEEK,
  DATE_RANGE_PRESET.THIS_MONTH,
  DATE_RANGE_PRESET.LAST_MONTH,
  DATE_RANGE_PRESET.LAST_30_DAYS,
  DATE_RANGE_PRESET.LAST_3_MONTHS,
  DATE_RANGE_PRESET.THIS_YEAR,
  DATE_RANGE_PRESET.LAST_YEAR,
  DATE_RANGE_PRESET.LAST_QUARTER,
  DATE_RANGE_PRESET.FY_25_26,
  DATE_RANGE_PRESET.FY_24_25,
  DATE_RANGE_PRESET.FY_23_24,
  DATE_RANGE_PRESET.FY_22_23,
];

export function getDateRangePresetLabel(preset: DateRangePreset): string {
  return DATE_RANGE_PRESET_LABELS[preset] ?? preset;
}

/** Presets that clear the range (omit date filter), not a computed span. */
export function isClearDatePreset(preset: DateRangePreset): boolean {
  return preset === DATE_RANGE_PRESET.CLEAR_RANGE;
}

// ---------------------------------------------------------------------------
// Preset range calculation (week starts on Monday)
// ---------------------------------------------------------------------------

const WEEK_START = 1;

/**
 * Returns the { from, to } date range for a given preset and reference date.
 * Reusable for filters, API params, or any component that needs preset ranges.
 */
export function getPresetRange(
  preset: DateRangePreset,
  ref: Date,
): { from: Date; to: Date } {
  const today = startOfDay(ref);

  switch (preset) {
    case DATE_RANGE_PRESET.TODAY:
      return { from: today, to: endOfDay(today) };
    case DATE_RANGE_PRESET.YESTERDAY: {
      const y = subDays(today, 1);
      return { from: y, to: endOfDay(y) };
    }
    case DATE_RANGE_PRESET.THIS_WEEK: {
      const wStart = startOfWeek(today, { weekStartsOn: WEEK_START });
      const wEnd = endOfWeek(today, { weekStartsOn: WEEK_START });
      return { from: wStart, to: wEnd };
    }
    case DATE_RANGE_PRESET.LAST_WEEK: {
      const lastWeekStart = subWeeks(
        startOfWeek(today, { weekStartsOn: WEEK_START }),
        1,
      );
      const lastWeekEnd = endOfWeek(lastWeekStart, {
        weekStartsOn: WEEK_START,
      });
      return { from: lastWeekStart, to: lastWeekEnd };
    }
    case DATE_RANGE_PRESET.THIS_MONTH:
      return {
        from: startOfMonth(today),
        to: endOfMonth(today),
      };
    case DATE_RANGE_PRESET.LAST_MONTH: {
      const lastMonth = subMonths(today, 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    }
    case DATE_RANGE_PRESET.LAST_30_DAYS:
      return {
        from: startOfDay(subDays(today, 29)),
        to: endOfDay(today),
      };
    case DATE_RANGE_PRESET.LAST_3_MONTHS:
      return {
        from: startOfDay(subMonths(today, 3)),
        to: endOfDay(today),
      };
    case DATE_RANGE_PRESET.THIS_YEAR:
      return {
        from: startOfYear(today),
        to: endOfYear(today),
      };
    case DATE_RANGE_PRESET.LAST_YEAR: {
      const lastYear = subYears(today, 1);
      return {
        from: startOfYear(lastYear),
        to: endOfYear(lastYear),
      };
    }
    case DATE_RANGE_PRESET.LAST_QUARTER: {
      const lastQ = subQuarters(today, 1);
      return {
        from: startOfQuarter(lastQ),
        to: endOfQuarter(lastQ),
      };
    }
    case DATE_RANGE_PRESET.FY_25_26:
      return {
        from: new Date(2025, 3, 1),
        to: endOfDay(new Date(2026, 2, 31)),
      };
    case DATE_RANGE_PRESET.FY_24_25:
      return {
        from: new Date(2024, 3, 1),
        to: endOfDay(new Date(2025, 2, 31)),
      };
    case DATE_RANGE_PRESET.FY_23_24:
      return {
        from: new Date(2023, 3, 1),
        to: endOfDay(new Date(2024, 2, 31)),
      };
    case DATE_RANGE_PRESET.FY_22_23:
      return {
        from: new Date(2022, 3, 1),
        to: endOfDay(new Date(2023, 2, 31)),
      };
    default:
      return { from: today, to: endOfDay(today) };
  }
}

export {
  parseTypedDate,
  parseTypedDateTime,
  parseTypedTime,
  type ParsedTimeParts,
} from "./parse-picker-input.js";
