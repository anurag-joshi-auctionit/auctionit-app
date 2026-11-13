import { describe, expect, it } from "vitest";
import { formatCurrencyCrore, formatCurrencyIndian } from "./currency.js";

describe("formatCurrencyIndian", () => {
  it.each([
    [45_000, "₹45,000"],
    [99_999, "₹99,999"],
    [100_000, "₹1L"],
    [2_500_000, "₹25L"],
    [2_550_000, "₹25.5L"],
    [9_999_999, "₹1Cr."],
    [10_000_000, "₹1Cr."],
    [12_500_000, "₹1.25Cr."],
    [250_000_000, "₹25Cr."],
  ] as const)("%s → %s", (input, expected) => {
    expect(formatCurrencyIndian(input)).toBe(expected);
  });

  it("formats negative amounts in the lakh tier", () => {
    expect(formatCurrencyIndian(-2_500_000)).toBe("-₹25L");
  });

  it("returns empty for null, undefined, and empty string", () => {
    expect(formatCurrencyIndian(null)).toBe("");
    expect(formatCurrencyIndian(undefined)).toBe("");
    expect(formatCurrencyIndian("")).toBe("");
  });
});

describe("formatCurrencyCrore", () => {
  it.each([
    [0, "₹0.00Cr."],
    [4_500_000, "₹0.45Cr."],
    [12_500_000, "₹1.25Cr."],
    [12_345_000_000, "₹1,234.50Cr."],
    [-25_000_000, "-₹2.50Cr."],
  ] as const)("%s → %s", (input, expected) => {
    expect(formatCurrencyCrore(input)).toBe(expected);
  });

  it("returns empty for null, undefined, and empty string", () => {
    expect(formatCurrencyCrore(null)).toBe("");
    expect(formatCurrencyCrore(undefined)).toBe("");
    expect(formatCurrencyCrore("")).toBe("");
  });
});
