import { describe, expect, it } from "vitest";
import { AuctionsValidationMessages } from "@auctionit/messages/auctions";
import {
  bidIncrementVsPriceError,
  bidStepLabel,
} from "./bid-increment-vs-price.js";

describe("bidStepLabel", () => {
  it("uses Bid Increment for forward / unknown", () => {
    expect(bidStepLabel("forward")).toBe("Bid Increment");
    expect(bidStepLabel(null)).toBe("Bid Increment");
  });

  it("uses Bid Decrement for reverse", () => {
    expect(bidStepLabel("reverse")).toBe("Bid Decrement");
  });
});

describe("bidIncrementVsPriceError", () => {
  it("rejects zero and negative with direction label", () => {
    expect(bidIncrementVsPriceError(0, 1000, { auctionType: "forward" })).toBe(
      AuctionsValidationMessages.BID_STEP_MUST_BE_POSITIVE("Bid Increment"),
    );
    expect(bidIncrementVsPriceError(-5, 1000, { auctionType: "reverse" })).toBe(
      AuctionsValidationMessages.BID_STEP_MUST_BE_POSITIVE("Bid Decrement"),
    );
  });

  it("allows a bid step arbitrarily far above start bid price", () => {
    expect(
      bidIncrementVsPriceError(201, 1000, { auctionType: "forward" }),
    ).toBeNull();
    expect(
      bidIncrementVsPriceError(1_000_000, 1000, { auctionType: "forward" }),
    ).toBeNull();
  });
});
