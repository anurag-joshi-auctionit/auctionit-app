import { describe, expect, it } from "vitest";
import {
  dateInputToIso,
  datetimeLocalToIso,
  formatDate,
  formatDateTime,
  formatDateTimeMilliseconds,
  formatDateTimeMicroseconds,
  formatDateTimeSeconds,
  formatIstWallNow,
  formatUtcNow,
  isoToDateInput,
  isoToDatetimeLocalInput,
  last30IstDateRange,
  parseUtcDateTime,
} from "./date.js";

describe("parseUtcDateTime / formatDateTime", () => {
  it("formats calendar dates as DD MMM YYYY", () => {
    expect(formatDate("2025-03-22")).toBe("22 Mar 2025");
    // IST midnight of 22 Mar = 21 Mar 18:30 UTC
    expect(formatDate("2025-03-21T18:30:00.000Z")).toBe("22 Mar 2025");
  });

  it("keeps naive Postgres timestamps as wall-clock (no +Z shift)", () => {
    expect(formatDateTime("2026-08-21 16:48:00")).toBe("21 Aug 2026, 4:48 PM");
    expect(formatDateTime("2026-08-21T16:48:00")).toBe("21 Aug 2026, 4:48 PM");
    expect(formatDateTime("2026-08-21 16:48:00.123456")).toBe(
      "21 Aug 2026, 4:48 PM",
    );
  });

  it("formats zoned UTC instants in Asia/Kolkata", () => {
    // 10:00 IST == 04:30 UTC
    expect(formatDateTime("2026-08-21T04:30:00.000Z")).toBe(
      "21 Aug 2026, 10:00 AM",
    );
  });

  it("parses naive components without treating them as UTC", () => {
    const d = parseUtcDateTime("2026-08-21 16:48:00");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(21);
    expect(d.getHours()).toBe(16);
    expect(d.getMinutes()).toBe(48);
  });

  it("formats with seconds when requested", () => {
    expect(formatDateTimeSeconds("2026-08-21T16:55:26")).toBe(
      "21 Aug 2026, 4:55:26 PM",
    );
  });

  it("formats with milliseconds from the source string", () => {
    expect(formatDateTimeMilliseconds("2026-08-21T16:55:26.123456")).toBe(
      "21 Aug 2026, 4:55:26.123 PM",
    );
    expect(formatDateTimeMilliseconds("2026-08-21 16:55:26.12")).toBe(
      "21 Aug 2026, 4:55:26.120 PM",
    );
    expect(formatDateTimeMilliseconds("2026-08-21T16:55:26")).toBe(
      "21 Aug 2026, 4:55:26.000 PM",
    );
  });

  it("formats with microseconds from the source string", () => {
    expect(formatDateTimeMicroseconds("2026-08-21T16:55:26.123456")).toBe(
      "21 Aug 2026, 4:55:26.123456 PM",
    );
    expect(formatDateTimeMicroseconds("2026-08-21 16:55:26.123")).toBe(
      "21 Aug 2026, 4:55:26.123000 PM",
    );
    expect(formatDateTimeMicroseconds("2026-08-21T16:55:26")).toBe(
      "21 Aug 2026, 4:55:26.000000 PM",
    );
  });

  it("returns empty for nullish values", () => {
    expect(formatDateTime(null)).toBe("");
    expect(formatDateTime(undefined)).toBe("");
    expect(formatDateTime("")).toBe("");
    expect(formatDateTimeMilliseconds(null)).toBe("");
    expect(formatDateTimeMicroseconds("")).toBe("");
  });
});

describe("dateInputToIso / datetimeLocalToIso (IST → UTC)", () => {
  it("writes date-only as IST midnight UTC ISO", () => {
    expect(dateInputToIso("2025-03-22")).toBe("2025-03-21T18:30:00.000Z");
    expect(dateInputToIso("")).toBeNull();
  });

  it("writes datetime-local IST digits as UTC ISO", () => {
    expect(datetimeLocalToIso("2026-08-21T10:00")).toBe(
      "2026-08-21T04:30:00.000Z",
    );
    expect(datetimeLocalToIso("2026-08-21T10:00:30")).toBe(
      "2026-08-21T04:30:30.000Z",
    );
    expect(datetimeLocalToIso("")).toBeNull();
    expect(datetimeLocalToIso("not-a-date")).toBeNull();
  });

  it("round-trips auction date and published at in IST", () => {
    const dateStored = dateInputToIso("2025-03-22")!;
    expect(isoToDateInput(dateStored)).toBe("2025-03-22");
    expect(formatDate(dateStored)).toBe("22 Mar 2025");

    const publishedStored = datetimeLocalToIso("2026-08-21T10:00")!;
    expect(publishedStored).toBe("2026-08-21T04:30:00.000Z");
    expect(isoToDatetimeLocalInput(publishedStored)).toBe("2026-08-21T10:00");
    expect(formatDateTime(publishedStored)).toBe("21 Aug 2026, 10:00 AM");
  });

  it("formatIstWallNow returns IST form digits; formatUtcNow returns Z", () => {
    const instant = new Date("2026-08-21T04:30:00.000Z");
    expect(formatIstWallNow(instant)).toBe("2026-08-21T10:00");
    expect(formatUtcNow(instant)).toBe("2026-08-21T04:30:00.000Z");
  });

  it("last 30 IST days is today minus 29 through today", () => {
    // 10:00 IST on 21 Aug 2026
    const range = last30IstDateRange(new Date("2026-08-21T04:30:00.000Z"));
    expect(range).toEqual({ from: "2026-07-23", to: "2026-08-21" });
  });
});
