import { AuctionsValidationMessages } from "@auctionit/messages/auctions";
import { fromIstWallClock, IST_TIME_ZONE } from "./date.js";
import { parseTimeOfDayString } from "./time-of-day.js";

type Ymd = { year: number; month: number; day: number };

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function istYmd(instant: Date): Ymd {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { year, month, day };
}

/**
 * IST calendar day of `instant` as UTC-midnight `auction_date` encoding
 * (`YYYY-MM-DDT00:00:00.000Z`), matching create/publish and Live Monitor.
 */
export function auctionDateIsoForInstant(instant: Date = new Date()): string {
  const { year, month, day } = istYmd(instant);
  return `${year}-${pad2(month)}-${pad2(day)}T00:00:00.000Z`;
}

/**
 * Resolve auction calendar Y-M-D from stored `auction_date`.
 * New encoding: UTC midnight of the chosen calendar day.
 * Legacy local-midnight values: resolve via IST calendar day.
 */
function auctionCalendarYmd(auctionDate: string): Ymd | null {
  const d = new Date(auctionDate);
  if (Number.isNaN(d.getTime())) return null;
  if (
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0
  ) {
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
    };
  }
  return istYmd(d);
}

/**
 * Combine auction calendar date with a lot time-of-day (`HH:mm` / `HH:mm:ss`
 * or 12h defensive forms) as an Asia/Kolkata wall-clock instant.
 */
export function parseLotDateTimeOnAuctionDate(
  lotTime: string,
  auctionDate: string,
): Date | null {
  const hms = parseTimeOfDayString(lotTime);
  if (!hms) return null;
  const ymd = auctionCalendarYmd(auctionDate);
  if (!ymd) return null;
  const [hour, minute, second] = hms.split(":").map(Number);
  return fromIstWallClock(
    ymd.year,
    ymd.month - 1,
    ymd.day,
    hour ?? 0,
    minute ?? 0,
    second ?? 0,
    0,
  );
}

/**
 * Floor `instant` to the start of its Asia/Kolkata wall-clock minute.
 * Lot TimePickers use minute precision (`HH:mm` → `:00` seconds); comparing
 * against full `now` (with seconds) falsely rejects the current/next minute
 * (e.g. end 16:32:00 at 16:32:10).
 */
function floorToIstMinute(instant: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  const minute = Number(parts.find((p) => p.type === "minute")?.value);
  return fromIstWallClock(year, month - 1, day, hour, minute, 0, 0);
}

function ymdOrdinal(ymd: Ymd): number {
  return ymd.year * 10_000 + ymd.month * 100 + ymd.day;
}

/** True when the auction calendar day (IST) is strictly before today's IST day. */
export function isAuctionDateBeforeToday(
  auctionDate: string,
  now: Date = new Date(),
): boolean {
  const auctionYmd = auctionCalendarYmd(auctionDate);
  if (!auctionYmd) return false;
  return ymdOrdinal(auctionYmd) < ymdOrdinal(istYmd(now));
}

/** True when lot end (on auction calendar day, IST) is strictly after `now`. */
export function isLotEndTimeAfterNow(
  lotEndTime: string,
  auctionDate: string,
  now: Date = new Date(),
): boolean {
  const endAt = parseLotDateTimeOnAuctionDate(lotEndTime, auctionDate);
  if (!endAt) return false;
  // Minute-precision compare — matches admin/import HH:mm clocks.
  return endAt.getTime() > floorToIstMinute(now).getTime();
}

/** True when `publishedAt` (a timestamptz instant) is strictly after `now`. */
export function isPublishedAtAfterNow(
  publishedAt: string,
  now: Date = new Date(),
): boolean {
  const publishedTime = new Date(publishedAt).getTime();
  if (Number.isNaN(publishedTime)) return false;
  return publishedTime > now.getTime();
}

/** True when `publishedAt`'s IST calendar day is on or before the auction's calendar day. */
export function isPublishedAtOnOrBeforeAuctionDate(
  publishedAt: string,
  auctionDate: string,
): boolean {
  const publishedInstant = new Date(publishedAt);
  if (Number.isNaN(publishedInstant.getTime())) return false;
  const auctionYmd = auctionCalendarYmd(auctionDate);
  if (!auctionYmd) return false;
  return ymdOrdinal(istYmd(publishedInstant)) <= ymdOrdinal(auctionYmd);
}

/**
 * True when the lot's start instant (auction calendar day + lot start time,
 * IST) is on or after `publishedAt`. A missing `publishedAt` always passes —
 * callers that require one report that separately.
 */
export function isLotStartOnOrAfterPublishedAt(
  lotStartTime: string,
  auctionDate: string,
  publishedAt: string | null | undefined,
): boolean {
  if (!publishedAt) return true;
  const startAt = parseLotDateTimeOnAuctionDate(lotStartTime, auctionDate);
  if (!startAt) return true;
  const publishedTime = new Date(publishedAt).getTime();
  if (Number.isNaN(publishedTime)) return true;
  return startAt.getTime() >= publishedTime;
}

/**
 * Cross-field rule: lot end must be strictly after lot start.
 * Expects normalized `HH:mm:ss` (lexicographic compare is safe).
 * Returns a validation message or null if ok / incomplete.
 */
export function lotEndTimeVsStartError(
  lotEndTime: string,
  lotStartTime: string,
): string | null {
  if (!lotEndTime || !lotStartTime) return null;
  if (lotEndTime <= lotStartTime) {
    return AuctionsValidationMessages.LOT_END_TIME_BEFORE_START;
  }
  return null;
}

/**
 * Full lot write schedule rules for create / update / import:
 * end > start, end > now (auction date + time as IST).
 * Returns a fieldErrors map (import / API shape) or null when all ok.
 * Incomplete times are skipped (required checks belong elsewhere).
 * When the auction calendar day is already past, both fields get a clear
 * message (wall-clock times alone cannot be "in the future").
 * When end ≤ start, skip the end-future message on that field (same as import
 * Zod short-circuit).
 * `publishedAt`, when given, must be on or before the lot's start instant —
 * this is the only check on lot start against a point in time (there is no
 * separate "start > now" rule: Published At is always on/before now once an
 * auction is live, so this subsumes it).
 */
export function collectLotWriteScheduleErrors(
  lotStartTime: string,
  lotEndTime: string,
  auctionDate: string,
  now: Date = new Date(),
  publishedAt?: string | null,
): Record<string, string[]> | null {
  if (!lotStartTime || !lotEndTime || !auctionDate) return null;

  if (isAuctionDateBeforeToday(auctionDate, now)) {
    const msg = AuctionsValidationMessages.LOT_TIMES_REQUIRE_FUTURE_AUCTION_DATE;
    return {
      lotStartTime: [msg],
      lotEndTime: [msg],
    };
  }

  const fieldErrors: Record<string, string[]> = {};

  const endVsStart = lotEndTimeVsStartError(lotEndTime, lotStartTime);
  if (endVsStart) {
    fieldErrors.lotEndTime = [endVsStart];
  } else if (!isLotEndTimeAfterNow(lotEndTime, auctionDate, now)) {
    fieldErrors.lotEndTime = [
      AuctionsValidationMessages.LOT_END_TIME_MUST_BE_FUTURE,
    ];
  }

  if (!isLotStartOnOrAfterPublishedAt(lotStartTime, auctionDate, publishedAt)) {
    fieldErrors.lotStartTime = [
      AuctionsValidationMessages.LOT_START_TIME_BEFORE_PUBLISHED_AT,
    ];
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}
