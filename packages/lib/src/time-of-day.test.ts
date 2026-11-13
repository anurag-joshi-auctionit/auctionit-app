import { describe, expect, it } from "vitest";
import { parseTimeOfDayString } from "./time-of-day.js";

describe("parseTimeOfDayString", () => {
  it.each([
    ["13:00", "13:00:00"],
    ["13:30", "13:30:00"],
    ["00:00", "00:00:00"],
    ["23:59:59", "23:59:59"],
  ] as const)("24h %s → %s", (input, expected) => {
    expect(parseTimeOfDayString(input)).toBe(expected);
  });

  it.each([
    ["1:00 PM", "13:00:00"],
    ["1:00PM", "13:00:00"],
    ["1:30 pm", "13:30:00"],
    ["12:00 am", "00:00:00"],
    ["12:00PM", "12:00:00"],
  ] as const)("12h defensive %s → %s", (input, expected) => {
    expect(parseTimeOfDayString(input)).toBe(expected);
  });

  it("rejects invalid values", () => {
    expect(parseTimeOfDayString("")).toBeNull();
    expect(parseTimeOfDayString("25:00")).toBeNull();
    expect(parseTimeOfDayString("13:00 XM")).toBeNull();
  });
});
