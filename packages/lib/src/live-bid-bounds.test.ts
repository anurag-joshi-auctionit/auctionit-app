import { describe, expect, it } from "vitest";
import { LiveBidMessages } from "@auctionit/messages/auctions";
import {
  manualBidAmountError,
  MAX_INCREMENT_STEPS,
  minBidFor,
  rankBidAmountError,
  rankBoundsLot,
  type BidBoundsLot,
} from "./live-bid-bounds.js";

function lot(over: Partial<BidBoundsLot> = {}): BidBoundsLot {
  return {
    bidCount: 1,
    currentBid: 1000,
    bidIncrement: 10,
    startBidPrice: 500,
    sbpPlusIncrement: false,
    bidLimit: 2000,
    auctionType: "forward",
    ...over,
  };
}

describe("manualBidAmountError", () => {
  it("accepts the next legal forward bid on the increment grid", () => {
    expect(manualBidAmountError(lot(), 1010)).toBeNull();
    expect(manualBidAmountError(lot(), 1100)).toBeNull();
  });

  it("rejects a forward price that does not clear winning + increment", () => {
    expect(manualBidAmountError(lot(), 1000)).toBe(LiveBidMessages.BID_AT_LEAST);
    expect(manualBidAmountError(lot(), 990)).toBe(LiveBidMessages.BID_AT_LEAST);
  });

  it("rejects a forward price above the bid limit before the 50× cap", () => {
    expect(manualBidAmountError(lot({ bidLimit: 1500 }), 1600)).toBe(
      LiveBidMessages.BID_LIMIT_CEILING,
    );
  });

  it("rejects a forward price beyond 50 increments when still under the limit", () => {
    const cap = 1000 + MAX_INCREMENT_STEPS * 10;
    expect(manualBidAmountError(lot({ bidLimit: 10_000 }), cap)).toBeNull();
    expect(manualBidAmountError(lot({ bidLimit: 10_000 }), cap + 10)).toBe(
      LiveBidMessages.BID_CAP,
    );
  });

  it("rejects a forward price that is not a multiple of the increment", () => {
    expect(manualBidAmountError(lot(), 1015)).toBe(LiveBidMessages.BID_INCREMENT);
  });

  it("uses opening rules when there is no standing bid", () => {
    const opening = lot({
      bidCount: 0,
      currentBid: 500,
      startBidPrice: 500,
      bidLimit: 2000,
    });
    expect(manualBidAmountError(opening, 500)).toBeNull();
    expect(manualBidAmountError(opening, 490)).toBe(
      LiveBidMessages.BID_AT_LEAST_START,
    );
    expect(
      manualBidAmountError(
        { ...opening, sbpPlusIncrement: true },
        500,
      ),
    ).toBe(LiveBidMessages.BID_AT_LEAST_START_PLUS_INCREMENT);
    expect(
      manualBidAmountError({ ...opening, sbpPlusIncrement: true }, 510),
    ).toBeNull();
  });

  it("applies reverse floor, decrement grid, and bid-limit floor", () => {
    const reverse = lot({
      auctionType: "reverse",
      currentBid: 1000,
      startBidPrice: 1500,
      bidLimit: 800,
    });
    expect(manualBidAmountError(reverse, 990)).toBeNull();
    expect(manualBidAmountError(reverse, 1000)).toBe(LiveBidMessages.BID_AT_MOST);
    expect(manualBidAmountError(reverse, 985)).toBe(LiveBidMessages.BID_DECREMENT);
    expect(manualBidAmountError(reverse, 790)).toBe(LiveBidMessages.BID_LIMIT_FLOOR);
    const floor = 1000 - MAX_INCREMENT_STEPS * 10;
    expect(manualBidAmountError({ ...reverse, bidLimit: 100 }, floor - 10)).toBe(
      LiveBidMessages.BID_FLOOR_CAP,
    );
  });

  it("rejects a missing increment or a non-positive amount", () => {
    expect(manualBidAmountError(lot({ bidIncrement: 0 }), 1010)).toBe(
      LiveBidMessages.NO_INCREMENT,
    );
    expect(manualBidAmountError(lot(), 0)).toBe(
      LiveBidMessages.BID_GREATER_THAN_ZERO,
    );
  });
});

describe("rank-based own-bid bounds", () => {
  const forward = lot({ bidLimit: null });
  const reverse = lot({ auctionType: "reverse", bidLimit: null });
  const winningWorded = [
    LiveBidMessages.BID_AT_LEAST,
    LiveBidMessages.BID_AT_MOST,
    LiveBidMessages.BID_CAP,
    LiveBidMessages.BID_FLOOR_CAP,
    LiveBidMessages.OUTBID_EQUAL_OR_HIGHER,
    LiveBidMessages.OUTBID_EQUAL_OR_LOWER,
  ];

  it("opens at SBP (or SBP ± step) before the bidder's first bid", () => {
    expect(minBidFor(rankBoundsLot(forward, null))).toBe(500);
    expect(
      minBidFor(rankBoundsLot(lot({ sbpPlusIncrement: true }), null)),
    ).toBe(510);
    expect(minBidFor(rankBoundsLot(reverse, null))).toBe(500);
  });

  it("steps from the bidder's own bid, ignoring the winning price", () => {
    // currentBid on the source lot (1000) must have no effect.
    expect(minBidFor(rankBoundsLot(forward, 700))).toBe(710);
    expect(minBidFor(rankBoundsLot(reverse, 300))).toBe(290);
  });

  it("accepts a bid below the leader as long as it beats the bidder's own", () => {
    expect(rankBidAmountError(rankBoundsLot(forward, 700), 710)).toBeNull();
    expect(rankBidAmountError(rankBoundsLot(reverse, 300), 290)).toBeNull();
  });

  it("rejects equal or worse than own bid with own-bid wording", () => {
    expect(rankBidAmountError(rankBoundsLot(forward, 700), 700)).toBe(
      LiveBidMessages.BID_AT_LEAST_OWN,
    );
    expect(rankBidAmountError(rankBoundsLot(forward, 700), 690)).toBe(
      LiveBidMessages.BID_AT_LEAST_OWN,
    );
    expect(rankBidAmountError(rankBoundsLot(reverse, 300), 300)).toBe(
      LiveBidMessages.BID_AT_MOST_OWN,
    );
  });

  it("caps at own bid ± 50 steps with own-bid wording", () => {
    const cap = 700 + MAX_INCREMENT_STEPS * 10;
    expect(rankBidAmountError(rankBoundsLot(forward, 700), cap)).toBeNull();
    expect(rankBidAmountError(rankBoundsLot(forward, 700), cap + 10)).toBe(
      LiveBidMessages.BID_CAP_OWN,
    );
    const highReverse = lot({
      auctionType: "reverse",
      startBidPrice: 5000,
      bidLimit: null,
    });
    const floor = 3000 - MAX_INCREMENT_STEPS * 10;
    expect(rankBidAmountError(rankBoundsLot(highReverse, 3000), floor)).toBeNull();
    expect(
      rankBidAmountError(rankBoundsLot(highReverse, 3000), floor - 10),
    ).toBe(LiveBidMessages.BID_FLOOR_CAP_OWN);
  });

  it("keeps the SBP increment grid", () => {
    expect(rankBidAmountError(rankBoundsLot(forward, 700), 715)).toBe(
      LiveBidMessages.BID_INCREMENT,
    );
  });

  it("never returns a message that mentions the winning price", () => {
    for (const amount of [0, 600, 700, 715, 5000]) {
      const err = rankBidAmountError(rankBoundsLot(forward, 700), amount);
      expect(winningWorded).not.toContain(err);
    }
  });
});
