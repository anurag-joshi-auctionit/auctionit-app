import { describe, expect, it } from "vitest";
import {
  fuzzyMatchScore,
  matchAgainstCorpus,
  normalizeFuzzyText,
} from "./fuzzy-match.js";

describe("normalizeFuzzyText", () => {
  it("lowercases and trims", () => {
    expect(normalizeFuzzyText("  Plastic Drum  ")).toBe("plastic drum");
  });

  it("collapses extra spaces and NBSP", () => {
    expect(normalizeFuzzyText("plastic\u00a0\u00a0drum")).toBe("plastic drum");
    expect(normalizeFuzzyText("plastic   drum")).toBe("plastic drum");
  });

  it("strips light punctuation to spaces", () => {
    expect(normalizeFuzzyText("MS Scrap, Coil/End")).toBe("ms scrap coil end");
  });
});

describe("fuzzyMatchScore", () => {
  it("scores word-order flips highly via token sort", () => {
    expect(fuzzyMatchScore("plastic drum", "drum plastic")).toBeGreaterThanOrEqual(
      90,
    );
  });

  it("ignores extra spaces", () => {
    expect(fuzzyMatchScore("plastic  drum", "plastic drum")).toBe(100);
  });

  it("returns 100 for exact normalized match", () => {
    expect(fuzzyMatchScore("Plastic Drum", "plastic drum")).toBe(100);
  });
});

describe("matchAgainstCorpus", () => {
  const corpus = [
    { normalizedName: "plastic drum", itemId: 10 },
    { normalizedName: "steel scrap", itemId: 20 },
    { normalizedName: "hdpe bag", itemId: 30 },
  ];

  it("exact match → candidate 1 score 100", () => {
    const r = matchAgainstCorpus("Plastic Drum", corpus);
    expect(r.fuzzyCandidate).toBe(1);
    expect(r.score).toBe(100);
    expect(r.selectedItemId).toBe(10);
    expect(r.suggestedItemIds).toEqual([10]);
  });

  it("token-sort confident match → candidate 1", () => {
    const r = matchAgainstCorpus("drum plastic", corpus);
    expect(r.fuzzyCandidate).toBe(1);
    expect(r.selectedItemId).toBe(10);
    expect(r.score).toBeGreaterThanOrEqual(90);
  });

  it("weak match → candidate 2 with top suggestions", () => {
    const r = matchAgainstCorpus("random unrelated xyz", corpus, {
      confidentThreshold: 90,
      topK: 3,
    });
    expect(r.fuzzyCandidate).toBe(2);
    expect(r.selectedItemId).toBeNull();
    expect(r.suggestedItemIds.length).toBeGreaterThan(0);
    expect(r.suggestedItemIds.length).toBeLessThanOrEqual(3);
  });

  it("empty corpus → candidate 2 empty suggestions", () => {
    const r = matchAgainstCorpus("plastic drum", []);
    expect(r).toEqual({
      fuzzyCandidate: 2,
      score: 0,
      suggestedItemIds: [],
      selectedItemId: null,
    });
  });

  it("dedupes by itemId keeping best score", () => {
    const dupCorpus = [
      { normalizedName: "plastic drum blue", itemId: 10 },
      { normalizedName: "plastic drum", itemId: 10 },
      { normalizedName: "steel scrap", itemId: 20 },
    ];
    const r = matchAgainstCorpus("plastic drum", dupCorpus);
    expect(r.selectedItemId).toBe(10);
    expect(r.suggestedItemIds.filter((id) => id === 10)).toHaveLength(1);
  });
});
