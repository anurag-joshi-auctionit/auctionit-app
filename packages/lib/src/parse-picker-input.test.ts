import { describe, expect, it } from "vitest";
import {
  parseTypedDate,
  parseTypedDateTime,
  parseTypedTime,
} from "./parse-picker-input.js";

describe("parseTypedDate", () => {
  it("parses ISO date", () => {
    const d = parseTypedDate("2026-08-27");
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(7);
    expect(d?.getDate()).toBe(27);
  });

  it("parses display format", () => {
    const d = parseTypedDate("27 Aug 2026");
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(7);
    expect(d?.getDate()).toBe(27);
  });

  it("parses dd/MM/yyyy", () => {
    const d = parseTypedDate("27/08/2026");
    expect(d?.getDate()).toBe(27);
    expect(d?.getMonth()).toBe(7);
  });

  it("rejects invalid", () => {
    expect(parseTypedDate("not-a-date")).toBeUndefined();
    expect(parseTypedDate("")).toBeUndefined();
  });
});

describe("parseTypedTime", () => {
  it("parses 24h", () => {
    expect(parseTypedTime("23:59")).toEqual({
      hours: 23,
      minutes: 59,
      seconds: 0,
    });
    expect(parseTypedTime("9:05:30")).toEqual({
      hours: 9,
      minutes: 5,
      seconds: 30,
    });
  });

  it("parses 12h", () => {
    expect(parseTypedTime("11:30 PM")).toEqual({
      hours: 23,
      minutes: 30,
      seconds: 0,
    });
    expect(parseTypedTime("12:00 am")).toEqual({
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it("parses compact digits", () => {
    expect(parseTypedTime("2359")).toEqual({
      hours: 23,
      minutes: 59,
      seconds: 0,
    });
    expect(parseTypedTime("959")).toEqual({
      hours: 9,
      minutes: 59,
      seconds: 0,
    });
  });

  it("rejects invalid", () => {
    expect(parseTypedTime("25:00")).toBeUndefined();
    expect(parseTypedTime("abc")).toBeUndefined();
  });
});

describe("parseTypedDateTime", () => {
  it("parses datetime-local", () => {
    const d = parseTypedDateTime("2026-08-27T14:30");
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getHours()).toBe(14);
    expect(d?.getMinutes()).toBe(30);
  });

  it("parses display format", () => {
    const d = parseTypedDateTime("27 Aug 2026, 2:30 PM");
    expect(d?.getDate()).toBe(27);
    expect(d?.getHours()).toBe(14);
    expect(d?.getMinutes()).toBe(30);
  });

  it("parses split date + time", () => {
    const d = parseTypedDateTime("2026-08-27 23:59");
    expect(d?.getHours()).toBe(23);
    expect(d?.getMinutes()).toBe(59);
  });

  it("rejects invalid", () => {
    expect(parseTypedDateTime("nope")).toBeUndefined();
  });
});
