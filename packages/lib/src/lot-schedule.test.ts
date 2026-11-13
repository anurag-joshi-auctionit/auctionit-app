import { describe, expect, it } from "vitest";
import { AuctionsValidationMessages } from "@auctionit/messages/auctions";
import {
  auctionDateIsoForInstant,
  collectLotWriteScheduleErrors,
  isLotEndTimeAfterNow,
  isLotStartOnOrAfterPublishedAt,
  isPublishedAtAfterNow,
  isPublishedAtOnOrBeforeAuctionDate,
  lotEndTimeVsStartError,
  parseLotDateTimeOnAuctionDate,
} from "./lot-schedule.js";

describe("auctionDateIsoForInstant", () => {
  it("returns UTC-midnight encoding of the IST calendar day", () => {
    // 2026-08-31 10:00 IST = 2026-08-31 04:30 UTC
    const now = new Date("2026-08-31T04:30:00.000Z");
    expect(auctionDateIsoForInstant(now)).toBe("2026-08-31T00:00:00.000Z");
  });
});

describe("parseLotDateTimeOnAuctionDate", () => {
  it("parses HH:mm:ss on UTC-midnight auction_date as IST wall-clock", () => {
    const end = parseLotDateTimeOnAuctionDate(
      "16:00:00",
      "2026-07-31T00:00:00.000Z",
    );
    expect(end).not.toBeNull();
    // 16:00 IST = 10:30 UTC
    expect(end!.toISOString()).toBe("2026-07-31T10:30:00.000Z");
  });
});

describe("isLotEndTimeAfterNow", () => {
  it("passes when end is 5 minutes ahead on today's auction date", () => {
    const now = new Date("2026-08-31T10:00:00.000Z"); // 15:30 IST
    const auctionDate = auctionDateIsoForInstant(now);
    expect(isLotEndTimeAfterNow("15:35:00", auctionDate, now)).toBe(true);
  });

  it("fails when end is 5 minutes behind now", () => {
    const now = new Date("2026-08-31T10:00:00.000Z"); // 15:30 IST
    const auctionDate = auctionDateIsoForInstant(now);
    expect(isLotEndTimeAfterNow("15:25:00", auctionDate, now)).toBe(false);
  });

  it("passes when auction date is tomorrow even if wall-clock time is earlier than now today", () => {
    const now = new Date("2026-08-31T10:00:00.000Z"); // 15:30 IST Aug 31
    const tomorrow = "2026-09-01T00:00:00.000Z";
    expect(isLotEndTimeAfterNow("10:00:00", tomorrow, now)).toBe(true);
  });

  it("fails when lot time cannot be parsed", () => {
    expect(
      isLotEndTimeAfterNow("not-a-time", "2026-08-31T00:00:00.000Z"),
    ).toBe(false);
  });

  it("uses minute precision so HH:mm :00 is not rejected mid-minute", () => {
    // 16:30:45 IST — end 16:32:00 must still pass (TimePicker has no seconds).
    const now = new Date("2026-09-04T11:00:45.000Z");
    const auctionDate = "2026-09-04T00:00:00.000Z";
    expect(isLotEndTimeAfterNow("16:32:00", auctionDate, now)).toBe(true);
    // Same minute as floored now still fails (must be strictly later minute).
    expect(isLotEndTimeAfterNow("16:30:00", auctionDate, now)).toBe(false);
  });

  it("rejects end equal to the current minute even with seconds elapsed on now", () => {
    // 16:32:10 IST vs end 16:32:00 → same minute → false
    const now = new Date("2026-09-04T11:02:10.000Z");
    const auctionDate = "2026-09-04T00:00:00.000Z";
    expect(isLotEndTimeAfterNow("16:32:00", auctionDate, now)).toBe(false);
    expect(isLotEndTimeAfterNow("16:33:00", auctionDate, now)).toBe(true);
  });
});

describe("isPublishedAtAfterNow", () => {
  it("passes when publishedAt is ahead of now", () => {
    const now = new Date("2026-08-31T10:00:00.000Z");
    expect(isPublishedAtAfterNow("2026-08-31T10:05:00.000Z", now)).toBe(true);
  });

  it("fails when publishedAt is at or before now", () => {
    const now = new Date("2026-08-31T10:00:00.000Z");
    expect(isPublishedAtAfterNow("2026-08-31T10:00:00.000Z", now)).toBe(false);
    expect(isPublishedAtAfterNow("2026-08-31T09:55:00.000Z", now)).toBe(false);
  });
});

describe("isPublishedAtOnOrBeforeAuctionDate", () => {
  it("passes when publishedAt's IST calendar day is on the auction date", () => {
    // 2026-08-31 23:00 IST = 2026-08-31T17:30:00.000Z
    expect(
      isPublishedAtOnOrBeforeAuctionDate(
        "2026-08-31T17:30:00.000Z",
        "2026-08-31T00:00:00.000Z",
      ),
    ).toBe(true);
  });

  it("fails when publishedAt's IST calendar day is after the auction date", () => {
    // 2026-09-01 00:30 IST = 2026-08-31T19:00:00.000Z
    expect(
      isPublishedAtOnOrBeforeAuctionDate(
        "2026-08-31T19:00:00.000Z",
        "2026-08-31T00:00:00.000Z",
      ),
    ).toBe(false);
  });
});

describe("isLotStartOnOrAfterPublishedAt", () => {
  const auctionDate = "2026-08-31T00:00:00.000Z";

  it("passes with no publishedAt", () => {
    expect(isLotStartOnOrAfterPublishedAt("15:35:00", auctionDate, null)).toBe(
      true,
    );
  });

  it("passes when the lot start instant is on or after publishedAt", () => {
    // 14:30 IST = 09:00 UTC, before lot start 15:35 IST
    expect(
      isLotStartOnOrAfterPublishedAt(
        "15:35:00",
        auctionDate,
        "2026-08-31T09:00:00.000Z",
      ),
    ).toBe(true);
  });

  it("fails when publishedAt is after the lot start instant", () => {
    // 16:30 IST = 11:00 UTC, after lot start 15:35 IST
    expect(
      isLotStartOnOrAfterPublishedAt(
        "15:35:00",
        auctionDate,
        "2026-08-31T11:00:00.000Z",
      ),
    ).toBe(false);
  });
});

describe("collectLotWriteScheduleErrors", () => {
  const now = new Date("2026-08-31T10:00:00.000Z"); // 15:30 IST
  const auctionDate = "2026-08-31T00:00:00.000Z";

  it("returns null when end > start and both times are future", () => {
    expect(
      collectLotWriteScheduleErrors("15:35:00", "15:40:00", auctionDate, now),
    ).toBeNull();
  });

  it("flags end <= start even when start is in the past (no publishedAt given)", () => {
    expect(
      collectLotWriteScheduleErrors("14:56:00", "14:56:00", auctionDate, now),
    ).toEqual({
      lotEndTime: [AuctionsValidationMessages.LOT_END_TIME_BEFORE_START],
    });
  });

  it("allows a past start when no publishedAt is given", () => {
    expect(
      collectLotWriteScheduleErrors("14:56:00", "16:35:00", auctionDate, now),
    ).toBeNull();
  });

  it("at 16:30:45, end in the same minute as now still fails even with a past start", () => {
    const midMinute = new Date("2026-09-04T11:00:45.000Z");
    expect(
      collectLotWriteScheduleErrors(
        "16:25:00",
        "16:30:00",
        "2026-09-04T00:00:00.000Z",
        midMinute,
      ),
    ).toEqual({
      lotEndTime: [AuctionsValidationMessages.LOT_END_TIME_MUST_BE_FUTURE],
    });
    expect(
      collectLotWriteScheduleErrors(
        "16:25:00",
        "16:31:00",
        "2026-09-04T00:00:00.000Z",
        midMinute,
      ),
    ).toBeNull();
  });

  it("passes when publishedAt is on or before the lot start instant", () => {
    // 14:30 IST, before lot start 15:35 IST
    expect(
      collectLotWriteScheduleErrors(
        "15:35:00",
        "15:40:00",
        auctionDate,
        now,
        "2026-08-31T09:00:00.000Z",
      ),
    ).toBeNull();
  });

  it("flags lot start before publishedAt", () => {
    // 16:30 IST, after lot start 15:35 IST
    expect(
      collectLotWriteScheduleErrors(
        "15:35:00",
        "15:40:00",
        auctionDate,
        now,
        "2026-08-31T11:00:00.000Z",
      ),
    ).toEqual({
      lotStartTime: [
        AuctionsValidationMessages.LOT_START_TIME_BEFORE_PUBLISHED_AT,
      ],
    });
  });

  it("flags lot start before publishedAt even on a past start (no longer gated behind a now check)", () => {
    // start 14:00 IST is in the past relative to `now` (15:30 IST), and also
    // before publishedAt (14:30 IST) — must still report the publishedAt error.
    expect(
      collectLotWriteScheduleErrors(
        "14:00:00",
        "16:35:00",
        auctionDate,
        now,
        "2026-08-31T09:00:00.000Z",
      ),
    ).toEqual({
      lotStartTime: [
        AuctionsValidationMessages.LOT_START_TIME_BEFORE_PUBLISHED_AT,
      ],
    });
  });

  it("when auction date is in the past, explains that instead of wall-clock future", () => {
    const now = new Date("2026-09-04T11:00:00.000Z");
    expect(
      collectLotWriteScheduleErrors(
        "16:34:00",
        "16:39:00",
        "2026-08-21T00:00:00+05:30",
        now,
      ),
    ).toEqual({
      lotStartTime: [
        AuctionsValidationMessages.LOT_TIMES_REQUIRE_FUTURE_AUCTION_DATE,
      ],
      lotEndTime: [
        AuctionsValidationMessages.LOT_TIMES_REQUIRE_FUTURE_AUCTION_DATE,
      ],
    });
  });
});

describe("lotEndTimeVsStartError", () => {
  it("rejects end before start", () => {
    expect(lotEndTimeVsStartError("10:00:00", "12:00:00")).toBe(
      AuctionsValidationMessages.LOT_END_TIME_BEFORE_START,
    );
  });

  it("rejects end equal to start", () => {
    expect(lotEndTimeVsStartError("12:00:00", "12:00:00")).toBe(
      AuctionsValidationMessages.LOT_END_TIME_BEFORE_START,
    );
  });

  it("allows end strictly after start", () => {
    expect(lotEndTimeVsStartError("12:01:00", "12:00:00")).toBeNull();
  });
});
