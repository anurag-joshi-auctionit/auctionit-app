import { isValid, parse } from "date-fns";

const ISO_DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATETIME_LOCAL_RE =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/;

const TIME_24H_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
const TIME_12H_RE =
  /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)$/i;
const TIME_COMPACT_RE = /^(\d{1,2})(\d{2})(\d{2})?$/;

export type ParsedTimeParts = {
  hours: number;
  minutes: number;
  seconds: number;
};

function parseIsoDateOnly(value: string): Date | undefined {
  const match = ISO_DATE_ONLY_RE.exec(value.trim());
  if (!match) return undefined;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function isValidHms(h: number, m: number, s: number): boolean {
  return (
    Number.isInteger(h) &&
    Number.isInteger(m) &&
    Number.isInteger(s) &&
    h >= 0 &&
    h <= 23 &&
    m >= 0 &&
    m <= 59 &&
    s >= 0 &&
    s <= 59
  );
}

function fromParts(
  h: number,
  m: number,
  s: number,
): ParsedTimeParts | undefined {
  if (!isValidHms(h, m, s)) return undefined;
  return { hours: h, minutes: m, seconds: s };
}

/** Parse typed date text → local calendar Date, or undefined if invalid. */
export function parseTypedDate(text: string): Date | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;

  const iso = parseIsoDateOnly(trimmed);
  if (iso) return iso;

  const formats = ["dd MMM yyyy", "d MMM yyyy", "dd/MM/yyyy", "d/M/yyyy"];
  for (const pattern of formats) {
    const parsed = parse(trimmed, pattern, new Date());
    if (isValid(parsed)) {
      return new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate(),
      );
    }
  }
  return undefined;
}

/** Parse typed time text → clock parts, or undefined if invalid. */
export function parseTypedTime(text: string): ParsedTimeParts | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;

  const twelve = TIME_12H_RE.exec(trimmed);
  if (twelve) {
    let h = Number(twelve[1]);
    const m = Number(twelve[2]);
    const s = Number(twelve[3] ?? 0);
    const meridiem = twelve[4]!.replace(/\./g, "").toLowerCase();
    if (h < 1 || h > 12) return undefined;
    if (meridiem === "am") {
      h = h === 12 ? 0 : h;
    } else {
      h = h === 12 ? 12 : h + 12;
    }
    return fromParts(h, m, s);
  }

  const twentyFour = TIME_24H_RE.exec(trimmed);
  if (twentyFour) {
    return fromParts(
      Number(twentyFour[1]),
      Number(twentyFour[2]),
      Number(twentyFour[3] ?? 0),
    );
  }

  // Compact digits: HHmm or HHmmss (also hmm / hmmss with 1-digit hour).
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 3 || digits.length === 4 || digits.length === 6) {
    const compact = TIME_COMPACT_RE.exec(digits);
    if (compact) {
      return fromParts(
        Number(compact[1]),
        Number(compact[2]),
        Number(compact[3] ?? 0),
      );
    }
  }

  return undefined;
}

/** Parse typed datetime text → local Date, or undefined if invalid. */
export function parseTypedDateTime(text: string): Date | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;

  const local = DATETIME_LOCAL_RE.exec(trimmed);
  if (local) {
    const date = new Date(
      Number(local[1]),
      Number(local[2]) - 1,
      Number(local[3]),
      Number(local[4]),
      Number(local[5]),
      Number(local[6] ?? 0),
    );
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  const displayFormats = [
    "dd MMM yyyy, h:mm a",
    "dd MMM yyyy, h:mm:ss a",
    "d MMM yyyy, h:mm a",
    "dd MMM yyyy h:mm a",
    "dd/MM/yyyy HH:mm",
    "dd/MM/yyyy H:mm",
    "yyyy-MM-dd HH:mm",
    "yyyy-MM-dd HH:mm:ss",
  ];
  for (const pattern of displayFormats) {
    const parsed = parse(trimmed, pattern, new Date());
    if (isValid(parsed)) return parsed;
  }

  // Split "date time" when date and time parsers each succeed.
  const spaceIdx = trimmed.search(/\s+/);
  if (spaceIdx > 0) {
    const datePart = trimmed.slice(0, spaceIdx).trim();
    const timePart = trimmed.slice(spaceIdx).trim();
    const day = parseTypedDate(datePart);
    const clock = parseTypedTime(timePart);
    if (day && clock) {
      return new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        clock.hours,
        clock.minutes,
        clock.seconds,
      );
    }
  }

  return undefined;
}
