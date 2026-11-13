import { describe, expect, it } from "vitest";
import { WINNER_LABEL, type WinnerRankLabel } from "./winner-rank";

describe("WINNER_LABEL", () => {
  it("is Winning", () => {
    expect(WINNER_LABEL).toBe("Winning");
    const label: WinnerRankLabel = WINNER_LABEL;
    expect(label).toBe("Winning");
  });
});
