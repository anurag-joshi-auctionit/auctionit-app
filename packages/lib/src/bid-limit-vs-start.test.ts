import { describe, expect, it } from "vitest";
import { AuctionsValidationMessages } from "@auctionit/messages/auctions";
import { bidLimitVsStartPriceError } from "./bid-limit-vs-start.js";

describe("bidLimitVsStartPriceError", () => {
  it("forward: rejects bidLimit below startBidPrice", () => {
    expect(bidLimitVsStartPriceError("forward", 100, 200)).toBe(
      AuctionsValidationMessages.BID_LIMIT_VS_START_BID_PRICE_FORWARD,
    );
  });

  it("forward: rejects bidLimit equal to startBidPrice", () => {
    expect(bidLimitVsStartPriceError("forward", 200, 200)).toBe(
      AuctionsValidationMessages.BID_LIMIT_VS_START_BID_PRICE_FORWARD,
    );
  });

  it("forward: allows bidLimit strictly above startBidPrice", () => {
    expect(bidLimitVsStartPriceError("forward", 201, 200)).toBeNull();
  });

  it("forward: allows bidLimit arbitrarily far above startBidPrice", () => {
    expect(bidLimitVsStartPriceError("forward", 20_000, 200)).toBeNull();
    expect(bidLimitVsStartPriceError("forward", 1_000_000, 200)).toBeNull();
  });

  it("reverse: rejects bidLimit at or below zero", () => {
    expect(bidLimitVsStartPriceError("reverse", 0, 200)).toBe(
      AuctionsValidationMessages.BID_LIMIT_MUST_BE_POSITIVE,
    );
    expect(bidLimitVsStartPriceError("reverse", -5, 200)).toBe(
      AuctionsValidationMessages.BID_LIMIT_MUST_BE_POSITIVE,
    );
  });

  it("reverse: rejects bidLimit at or above startBidPrice", () => {
    expect(bidLimitVsStartPriceError("reverse", 200, 200)).toBe(
      AuctionsValidationMessages.BID_LIMIT_VS_START_BID_PRICE_REVERSE,
    );
    expect(bidLimitVsStartPriceError("reverse", 250, 200)).toBe(
      AuctionsValidationMessages.BID_LIMIT_VS_START_BID_PRICE_REVERSE,
    );
  });

  it("reverse: allows bidLimit strictly below startBidPrice", () => {
    expect(bidLimitVsStartPriceError("reverse", 100, 200)).toBeNull();
  });
});
