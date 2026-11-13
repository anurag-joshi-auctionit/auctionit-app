/**
 * Shared time-of-day parsing → canonical `HH:mm:ss` for Postgres `time` columns.
 * Primary: 24-hour `HH:mm` / `HH:mm:ss`. Defensive: `h:mm AM/PM` (optional space).
 */

const TIME_24H_RE = /^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/;
const TIME_12H_RE =
  /^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?\s*(am|pm|a\.m\.|p\.m\.)$/i;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatHms(h: number, m: number, s: number): string | null {
  if (
    !Number.isInteger(h) ||
    !Number.isInteger(m) ||
    !Number.isInteger(s) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59 ||
    s < 0 ||
    s > 59
  ) {
    return null;
  }
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

/**
 * Parse a time-of-day string to `HH:mm:ss`, or null if unrecognized.
 * Does not use Date.parse (avoids timezone shifts on plain clock times).
 */
export function parseTimeOfDayString(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const twelve = TIME_12H_RE.exec(trimmed);
  if (twelve) {
    let h = Number(twelve[1]);
    const m = Number(twelve[2]);
    const s = Number(twelve[3] ?? 0);
    const meridiem = twelve[4]!.replace(/\./g, "").toLowerCase();
    if (h < 1 || h > 12) return null;
    if (meridiem === "am") {
      h = h === 12 ? 0 : h;
    } else {
      h = h === 12 ? 12 : h + 12;
    }
    return formatHms(h, m, s);
  }

  const twentyFour = TIME_24H_RE.exec(trimmed);
  if (twentyFour) {
    return formatHms(
      Number(twentyFour[1]),
      Number(twentyFour[2]),
      Number(twentyFour[3] ?? 0),
    );
  }

  return null;
}
