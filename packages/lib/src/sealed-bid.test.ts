import { describe, expect, it } from "vitest";
import { LiveBidMessages } from "@auctionit/messages/auctions";
import { sealedBidWindowState } from "./auction-modes.js";
import { formatCurrency } from "./currency.js";
import { sealedBidAmountError } from "./live-bid-bounds.js";

describe("sealedBidAmountError", () => {
  const fa = {
    startBidPrice: 500,
    bidLimit: 2000,
    ownLatest: null,
    auctionType: "forward",
  };
  const ra = { ...fa, startBidPrice: 2000, bidLimit: 500, auctionType: "reverse" };

  it("rejects zero / negative / non-finite", () => {
    expect(sealedBidAmountError(fa, 0)).toBe(LiveBidMessages.BID_GREATER_THAN_ZERO);
    expect(sealedBidAmountError(fa, -1)).toBe(LiveBidMessages.BID_GREATER_THAN_ZERO);
    expect(sealedBidAmountError(fa, NaN)).toBe(LiveBidMessages.BID_GREATER_THAN_ZERO);
  });

  it("forward: first bid needs SBP, no increment grid", () => {
    expect(sealedBidAmountError(fa, 499.99)).toBe(
      LiveBidMessages.SEALED_BID_AT_LEAST(formatCurrency(500)),
    );
    expect(sealedBidAmountError(fa, 500)).toBeNull();
    expect(sealedBidAmountError(fa, 777.77)).toBeNull();
  });

  it("forward: must strictly beat own latest bid", () => {
    const own = { ...fa, ownLatest: 900 };
    expect(sealedBidAmountError(own, 900)).toBe(LiveBidMessages.SEALED_BID_MUST_EXCEED_OWN);
    expect(sealedBidAmountError(own, 800)).toBe(LiveBidMessages.SEALED_BID_MUST_EXCEED_OWN);
    expect(sealedBidAmountError(own, 900.01)).toBeNull();
  });

  it("forward: bid limit is a ceiling", () => {
    expect(sealedBidAmountError(fa, 2000)).toBeNull();
    expect(sealedBidAmountError(fa, 2000.01)).toBe(
      LiveBidMessages.SEALED_BID_AT_MOST(formatCurrency(2000)),
    );
  });

  it("reverse: mirrors every bound", () => {
    expect(sealedBidAmountError(ra, 2000.01)).toBe(
      LiveBidMessages.SEALED_BID_AT_MOST(formatCurrency(2000)),
    );
    expect(sealedBidAmountError(ra, 1500)).toBeNull();
    expect(sealedBidAmountError({ ...ra, ownLatest: 1500 }, 1500)).toBe(
      LiveBidMessages.SEALED_BID_MUST_BE_BELOW_OWN,
    );
    expect(sealedBidAmountError(ra, 499)).toBe(
      LiveBidMessages.SEALED_BID_AT_LEAST(formatCurrency(500)),
    );
  });

  it("client mode (withheld SBP / limit) only checks amount and own bid", () => {
    const client = { startBidPrice: null, bidLimit: null, ownLatest: 900, auctionType: "forward" };
    expect(sealedBidAmountError(client, 1)).toBe(LiveBidMessages.SEALED_BID_MUST_EXCEED_OWN);
    expect(sealedBidAmountError(client, 1_000_000)).toBeNull();
  });
});

describe("sealedBidWindowState", () => {
  const a = {
    isSealedBid: true,
    sealedBidDate: "2026-08-31T00:00:00.000Z",
    sealedBidStartTime: "10:00:00",
    sealedBidEndTime: "14:00:00",
  };
  // 10:00 IST = 04:30 UTC; 14:00 IST = 08:30 UTC
  it("classifies now against the IST window", () => {
    expect(sealedBidWindowState(a, new Date("2026-08-31T04:29:59Z"))).toBe("upcoming");
    expect(sealedBidWindowState(a, new Date("2026-08-31T04:30:00Z"))).toBe("open");
    expect(sealedBidWindowState(a, new Date("2026-08-31T08:29:59Z"))).toBe("open");
    expect(sealedBidWindowState(a, new Date("2026-08-31T08:30:00Z"))).toBe("closed");
  });

  it("is null without a configured window", () => {
    expect(sealedBidWindowState({ ...a, isSealedBid: false })).toBeNull();
    expect(sealedBidWindowState({ ...a, sealedBidEndTime: null })).toBeNull();
  });
});
