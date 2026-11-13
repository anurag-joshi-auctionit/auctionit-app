import { describe, expect, it } from "vitest";
import {
  hasStandingBid,
  mergeSnapshot,
  mergeYourStatus,
  mergeReceivedAtByLot,
  minBidFor,
  minProxyMaxFor,
  maxBidFor,
  incrementCap,
  MAX_INCREMENT_STEPS,
  MAX_COUNTDOWN_TRANSIT_MS,
  snapBidAmount,
  patchSnapshotLot,
  snapshotReceivedAt,
  countdownTransitMs,
  lotTimeLeft,
  lotStartLeft,
  lotDisplayStatus,
  LOT_PROCESSING_LEAD_SEC,
  lotMonitorSortSeconds,
  compareLotsByDisplayOrder,
  type LiveAuctionSnapshot,
  type LiveLot,
  type LiveLotDelta,
} from "./live-auction";

// These fixtures always carry a real currentBid and startBidPrice (the
// bid-bounds math below needs both) — the wire type allows null only for masked
// rank-based / sealed-phase bidder payloads, which these tests don't exercise.
type TestLot = LiveLot & { currentBid: number; startBidPrice: number };
type TestLotOverrides = Partial<
  Omit<LiveLot, "currentBid" | "startBidPrice">
> & { currentBid?: number; startBidPrice?: number };

function baseLot(over: TestLotOverrides = {}): TestLot {
  return {
    id: 1,
    lotNumber: "1",
    title: "Scrap",
    quantity: 1,
    uom: "MT",
    startBidPrice: 60_000,
    bidIncrement: 100,
    currentBid: 60_000,
    winnerBidderId: null,
    winnerBidderName: null,
    startsAt: null,
    endsAt: null,
    startLeftSec: 0,
    timeLeftSec: 100,
    notStarted: false,
    closed: false,
    extensionCount: 0,
    bidCount: 0,
    bidderCount: 0,
    sbpPlusIncrement: true,
    bidLimit: null,
    ...over,
  };
}

function baseSnap(lots: LiveLot[]): LiveAuctionSnapshot {
  return {
    auction: {
      id: 10,
      auctionNumber: "A-1",
      auctionType: "forward",
      clientName: "Client",
      status: "published",
      liveState: "live",
    },
    lots,
    serverTime: new Date().toISOString(),
    seq: 1,
  };
}

describe("minBidFor / hasStandingBid", () => {
  it("uses opening SBP+inc when no bids", () => {
    const lot = baseLot({ bidCount: 0, winnerBidderId: null });
    expect(hasStandingBid(lot)).toBe(false);
    expect(minBidFor(lot)).toBe(60_100);
  });

  it("uses currentBid+inc when bidCount>0 even if winner id is stripped", () => {
    const lot = baseLot({
      bidCount: 2,
      currentBid: 60_400,
      winnerBidderId: null,
    });
    expect(hasStandingBid(lot)).toBe(true);
    expect(minBidFor(lot)).toBe(60_500);
  });
});

describe("minProxyMaxFor", () => {
  it("matches opening minBidFor when the lot has no bids", () => {
    const lot = baseLot({ bidCount: 0, winnerBidderId: null });
    expect(minProxyMaxFor(lot)).toBe(minBidFor(lot));
  });

  it("matches minBidFor once the lot has a standing winning bid", () => {
    const lot = baseLot({
      bidCount: 2,
      currentBid: 60_400,
      winnerBidderId: null,
    });
    expect(minProxyMaxFor(lot)).toBe(60_500);
    expect(minProxyMaxFor(lot)).toBe(minBidFor(lot));
  });
});

describe("maxBidFor / snapBidAmount", () => {
  it("caps at winning + 50 increments when no bidLimit", () => {
    const lot = baseLot({ bidCount: 1, currentBid: 60_400 });
    expect(incrementCap(lot)).toBe(60_400 + MAX_INCREMENT_STEPS * 100);
    expect(maxBidFor(lot)).toBe(65_400);
  });

  it("uses the tighter of increment cap and bidLimit", () => {
    const lot = baseLot({
      bidCount: 1,
      currentBid: 60_400,
      bidLimit: 62_000,
    });
    expect(maxBidFor(lot)).toBe(62_000);
  });

  it("snaps below-min to minBidFor", () => {
    const lot = baseLot({ bidCount: 0 });
    expect(snapBidAmount(lot, 1)).toEqual({ amount: 60_100, kind: "min" });
  });

  it("snaps above bidLimit with maxLimit kind when that bound is tighter", () => {
    const lot = baseLot({
      bidCount: 1,
      currentBid: 60_400,
      bidLimit: 62_000,
    });
    const result = snapBidAmount(lot, 90_000);
    expect(result.kind).toBe("maxLimit");
    expect(result.amount).toBe(62_000);
  });

  it("reports maxLimit when amount exceeds both ceilings", () => {
    // Cap is 65_400; bidLimit sits above the cap. Amount exceeds both.
    const lot = baseLot({
      bidCount: 1,
      currentBid: 60_400,
      bidLimit: 70_000,
    });
    const result = snapBidAmount(lot, 90_000);
    expect(result.kind).toBe("maxLimit");
    expect(result.amount).toBe(65_400);
  });

  it("snaps above increment cap with cap kind when under bidLimit", () => {
    const lot = baseLot({
      bidCount: 1,
      currentBid: 60_400,
      bidLimit: 70_000,
    });
    const result = snapBidAmount(lot, 66_000);
    expect(result.kind).toBe("cap");
    expect(result.amount).toBe(65_400);
  });

  it("snaps above increment cap with cap kind", () => {
    const lot = baseLot({ bidCount: 1, currentBid: 60_400, bidLimit: null });
    const result = snapBidAmount(lot, 90_000);
    expect(result.kind).toBe("cap");
    expect(result.amount).toBe(65_400);
  });

  it("snaps off-grid amounts down toward min", () => {
    const lot = baseLot({ bidCount: 1, currentBid: 60_400 });
    expect(snapBidAmount(lot, 60_550)).toEqual({
      amount: 60_500,
      kind: "increment",
    });
  });

  it("accepts winning + n×increment", () => {
    const lot = baseLot({ bidCount: 1, currentBid: 60_400 });
    expect(snapBidAmount(lot, 60_700)).toEqual({ amount: 60_700, kind: "ok" });
  });

  it("rejects values that are not start price + n×increment before any bid", () => {
    const lot = baseLot({ bidCount: 0, currentBid: 60_000 });
    expect(snapBidAmount(lot, 60_150)).toEqual({
      amount: 60_100,
      kind: "increment",
    });
  });
});

describe("reverse auction bounds", () => {
  const reverseLot = (
    over: TestLotOverrides = {},
  ): TestLot =>
    baseLot({
      sbpPlusIncrement: false,
      bidLimit: 50_000,
      ...over,
    });

  it("next bid is SBP when opening without sbpPlusIncrement", () => {
    const lot = reverseLot({ bidCount: 0, currentBid: 60_000 });
    expect(minBidFor(lot, -1)).toBe(60_000);
  });

  it("next bid is winning − increment once standing", () => {
    const lot = reverseLot({
      bidCount: 2,
      currentBid: 58_000,
    });
    expect(minBidFor(lot, -1)).toBe(57_900);
  });

  it("incrementCap floors at winning − 50×inc", () => {
    const lot = reverseLot({ bidCount: 1, currentBid: 58_000 });
    expect(incrementCap(lot, -1)).toBe(58_000 - MAX_INCREMENT_STEPS * 100);
  });

  it("maxBidFor uses the tighter of increment floor and bidLimit", () => {
    const lot = reverseLot({
      bidCount: 1,
      currentBid: 58_000,
      bidLimit: 55_000,
    });
    // Cap is 53_000; bidLimit 55_000 → max(53k, 55k) = 55k
    expect(maxBidFor(lot, -1)).toBe(55_000);
  });

  it("snapBidAmount clamps above nextBid down to nextBid", () => {
    const lot = reverseLot({ bidCount: 1, currentBid: 58_000 });
    expect(snapBidAmount(lot, 59_000, -1)).toEqual({
      amount: 57_900,
      kind: "min",
    });
  });

  it("snapBidAmount clamps below floor up", () => {
    const lot = reverseLot({
      bidCount: 1,
      currentBid: 58_000,
      bidLimit: 55_000,
    });
    const result = snapBidAmount(lot, 40_000, -1);
    expect(result.kind).toBe("maxLimit");
    expect(result.amount).toBe(55_000);
  });
});

describe("snapshotReceivedAt / lotTimeLeft / transit", () => {
  it("does not treat a server clock ahead of the browser as transit", () => {
    const snap = baseSnap([baseLot()]);
    snap.serverTime = new Date(Date.now() + 55_000).toISOString();
    const receivedAt = snapshotReceivedAt(snap);
    expect(Math.abs(receivedAt - Date.now())).toBeLessThan(50);
    expect(lotTimeLeft(snap.lots[0]!, receivedAt)).toBe(100);
  });

  it("subtracts capped transit when serverTime is slightly in the past", () => {
    const now = Date.now();
    const snap = baseSnap([baseLot()]);
    snap.serverTime = new Date(now - 1_500).toISOString();
    const receivedAt = snapshotReceivedAt(snap, now);
    expect(countdownTransitMs(snap.serverTime, now)).toBe(1_500);
    expect(receivedAt).toBe(now - 1_500);
    expect(lotTimeLeft(snap.lots[0]!, receivedAt, now)).toBe(98);
  });

  it("caps transit so large browser-ahead skew is not applied as elapsed", () => {
    const now = Date.now();
    expect(countdownTransitMs(new Date(now - 55_000).toISOString(), now)).toBe(
      MAX_COUNTDOWN_TRANSIT_MS,
    );
  });
});

describe("compareLotsByDisplayOrder", () => {
  it("orders by displayOrder ascending, nulls last, then id", () => {
    const a = baseLot({ id: 1, displayOrder: 2 });
    const b = baseLot({ id: 2, displayOrder: 1 });
    const c = baseLot({ id: 3, displayOrder: null });
    expect(compareLotsByDisplayOrder(b, a)).toBeLessThan(0);
    expect(compareLotsByDisplayOrder(a, c)).toBeLessThan(0);
    expect(compareLotsByDisplayOrder(b, c)).toBeLessThan(0);
  });
});

describe("lotMonitorSortSeconds", () => {
  const now = 1_000_000;

  it("orders active lots by remaining time left", () => {
    const soon = baseLot({ timeLeftSec: 30, startLeftSec: 0 });
    const later = baseLot({ id: 2, timeLeftSec: 120, startLeftSec: 0 });
    expect(lotMonitorSortSeconds(soon, now, now)).toBe(30);
    expect(lotMonitorSortSeconds(later, now, now)).toBe(120);
    expect(
      lotMonitorSortSeconds(soon, now, now) -
        lotMonitorSortSeconds(later, now, now),
    ).toBeLessThan(0);
  });

  it("orders not-started lots by start-left seconds", () => {
    const lot = baseLot({ startLeftSec: 45, timeLeftSec: 300, notStarted: true });
    expect(lotMonitorSortSeconds(lot, now, now)).toBe(45);
  });

  it("sends closed lots to the bottom", () => {
    const active = baseLot({ timeLeftSec: 500 });
    const closed = baseLot({ id: 2, timeLeftSec: 0, closed: true });
    expect(lotMonitorSortSeconds(closed, now, now)).toBe(Infinity);
    expect(
      lotMonitorSortSeconds(active, now, now) -
        lotMonitorSortSeconds(closed, now, now),
    ).toBeLessThan(0);
  });

  it("accounts for elapsed time since anchor", () => {
    const lot = baseLot({ timeLeftSec: 100, startLeftSec: 0 });
    expect(lotMonitorSortSeconds(lot, now - 5_000, now)).toBe(95);
  });

  it("prefers start-left over time-left when lot has not started", () => {
    const lot = baseLot({ startLeftSec: 10, timeLeftSec: 600, notStarted: true });
    expect(lotStartLeft(lot, now, now)).toBe(10);
    expect(lotMonitorSortSeconds(lot, now, now)).toBe(10);
  });
});

describe("lotDisplayStatus", () => {
  const now = 1_000_000;

  it("is not_started while the lot hasn't opened yet", () => {
    const lot = baseLot({ startLeftSec: 10, timeLeftSec: 600 });
    expect(lotDisplayStatus(lot, now, now)).toBe("not_started");
  });

  it("is open while comfortably within the countdown", () => {
    const lot = baseLot({ timeLeftSec: 30 });
    expect(lotDisplayStatus(lot, now, now)).toBe("open");
  });

  it("is processing once local time left drops to the server's lead window, before close is confirmed", () => {
    const lot = baseLot({ timeLeftSec: LOT_PROCESSING_LEAD_SEC });
    expect(lotDisplayStatus(lot, now, now)).toBe("processing");

    const expired = baseLot({ timeLeftSec: 0 });
    expect(lotDisplayStatus(expired, now, now)).toBe("processing");
  });

  it("is closed only once the server confirms it, even if local time has run out", () => {
    const lot = baseLot({ timeLeftSec: 0, closed: true });
    expect(lotDisplayStatus(lot, now, now)).toBe("closed");
  });
});

describe("mergeReceivedAtByLot", () => {
  it("keeps the prior anchor when mergeSnapshot retains a fresher lot", () => {
    const heldLot = baseLot({
      id: 1,
      bidCount: 4,
      currentBid: 60_400,
      rev: 4,
      timeLeftSec: 80,
    });
    const held = baseSnap([heldLot]);
    const stale = baseSnap([
      baseLot({ id: 1, bidCount: 3, currentBid: 60_300, rev: 3, timeLeftSec: 90 }),
    ]);
    const merged = mergeSnapshot(held, stale);
    expect(merged.lots[0]).toBe(heldLot);

    const prevAnchors = new Map([[1, 1_000]]);
    const anchors = mergeReceivedAtByLot(
      held,
      prevAnchors,
      merged,
      9_999,
    );
    expect(anchors.get(1)).toBe(1_000);
  });

  it("re-anchors lots that took timer state from the new snapshot", () => {
    const held = baseSnap([baseLot({ id: 1, rev: 1, timeLeftSec: 80 })]);
    const incoming = baseSnap([baseLot({ id: 1, rev: 2, timeLeftSec: 70 })]);
    const merged = mergeSnapshot(held, incoming);
    const anchors = mergeReceivedAtByLot(
      held,
      new Map([[1, 1_000]]),
      merged,
      5_000,
    );
    expect(anchors.get(1)).toBe(5_000);
  });
});

describe("mergeYourStatus / patchSnapshotLot standing", () => {
  it("preserves winning when public delta omits yourStatus", () => {
    const snap = baseSnap([baseLot({ yourStatus: "winning", bidCount: 1, currentBid: 60_100 })]);
    const delta: LiveLotDelta = {
      auctionId: 10,
      lotId: 1,
      currentBid: 60_200,
      winnerBidderId: null,
      winnerBidderName: null,
      bidCount: 2,
      bidderCount: 2,
      seq: 2,
    };
    const next = patchSnapshotLot(snap, delta);
    expect(next.lots[0]!.yourStatus).toBe("winning");
    expect(next.lots[0]!.currentBid).toBe(60_200);
  });

  it("preserves standing when public snapshot omits yourStatus", () => {
    const prev = baseSnap([baseLot({ yourStatus: "outbid", bidCount: 1 })]);
    const incoming = baseSnap([baseLot({ bidCount: 1 })]);
    const merged = mergeSnapshot(prev, incoming);
    expect(merged.lots[0]!.yourStatus).toBe("outbid");
  });

  it("clears standing when a personalized snapshot sends none", () => {
    // Join / resync after the only winning bid bid was removed.
    const prev = baseSnap([
      baseLot({ yourStatus: "winning", bidCount: 1, currentBid: 60_100, rev: 1 }),
    ]);
    const incoming = baseSnap([
      baseLot({
        yourStatus: "none",
        bidCount: 0,
        currentBid: 60_000,
        rev: 2,
      }),
    ]);
    expect(mergeSnapshot(prev, incoming).lots[0]!.yourStatus).toBe("none");
  });

  it("keeps rank-based rank and own bid when a shared snapshot omits them", () => {
    const prev = baseSnap([baseLot({ bidCount: 2, yourRank: 2, yourBid: 60_200 })]);
    // Shared resync payload: personal fields absent, winning price masked.
    const shared = baseSnap([baseLot({ bidCount: 3 })]);
    const merged = mergeSnapshot(prev, shared).lots[0]!;
    expect(merged.yourRank).toBe(2);
    expect(merged.yourBid).toBe(60_200);
    expect(merged.bidCount).toBe(3);
  });

  it("takes rank-based fields from a personal snapshot, including null", () => {
    const prev = baseSnap([baseLot({ yourRank: 2, yourBid: 60_200 })]);
    const personal = baseSnap([baseLot({ yourRank: 1, yourBid: 60_500 })]);
    expect(mergeSnapshot(prev, personal).lots[0]!.yourRank).toBe(1);
    const cleared = baseSnap([baseLot({ yourRank: null, yourBid: null })]);
    expect(mergeSnapshot(prev, cleared).lots[0]!.yourRank).toBeNull();
  });

  it("accepts authoritative h1/outbid from standing", () => {
    expect(mergeYourStatus("outbid", "winning")).toBe("winning");
    expect(mergeYourStatus("winning", "none")).toBe("winning");
    expect(mergeYourStatus(undefined, undefined)).toBeUndefined();
  });
});

describe("stale payloads never rewind a lot", () => {
  // A resync snapshot is read across the whole auction, so bids that land while
  // it is being built are missing from it even though it arrives later.
  function bidLot(
    over: TestLotOverrides = {},
  ): TestLot {
    return baseLot({ bidCount: 3, currentBid: 60_300, rev: 3, ...over });
  }

  it("keeps the held lot when a snapshot was read before a bid we applied", () => {
    const held = baseSnap([bidLot({ bidCount: 4, currentBid: 60_400, rev: 4 })]);
    const stale = baseSnap([bidLot()]);
    const merged = mergeSnapshot(held, stale);
    expect(merged.lots[0]!.currentBid).toBe(60_400);
    // mergeSnapshot returns the general wire type (currentBid / startBidPrice
    // nullable for masked bidder payloads); this fixture never masks them.
    const lot = merged.lots[0]!;
    expect(
      minBidFor({ ...lot, currentBid: lot.currentBid!, startBidPrice: lot.startBidPrice! }),
    ).toBe(60_500);
  });

  it("applies a snapshot that removed bids, since corrections bump the rev", () => {
    const held = baseSnap([bidLot({ bidCount: 4, currentBid: 60_400, rev: 4 })]);
    const corrected = baseSnap([bidLot({ bidCount: 0, currentBid: 60_000, rev: 5 })]);
    expect(mergeSnapshot(held, corrected).lots[0]!.currentBid).toBe(60_000);
  });

  it("applies a snapshot for a lot with no rev on either side", () => {
    const held = baseSnap([baseLot({ bidCount: 4, currentBid: 60_400 })]);
    const next = baseSnap([baseLot({ bidCount: 5, currentBid: 60_500 })]);
    expect(mergeSnapshot(held, next).lots[0]!.currentBid).toBe(60_500);
  });

  it("drops a delta older than the lot state held, whatever its seq", () => {
    const snap = baseSnap([bidLot({ bidCount: 4, currentBid: 60_400, rev: 4 })]);
    const stale: LiveLotDelta = {
      auctionId: 10,
      lotId: 1,
      currentBid: 60_300,
      winnerBidderId: null,
      winnerBidderName: null,
      bidCount: 3,
      bidderCount: 2,
      seq: 99,
      rev: 3,
    };
    expect(patchSnapshotLot(snap, stale)).toBe(snap);
  });

  it("carries the delta's rev onto the lot so the next stale payload is caught", () => {
    const snap = baseSnap([bidLot()]);
    const fresh: LiveLotDelta = {
      auctionId: 10,
      lotId: 1,
      currentBid: 60_400,
      winnerBidderId: null,
      winnerBidderName: null,
      bidCount: 4,
      bidderCount: 2,
      seq: 2,
      rev: 4,
    };
    const patched = patchSnapshotLot(snap, fresh);
    expect(patched.lots[0]!.rev).toBe(4);
    expect(mergeSnapshot(patched, baseSnap([bidLot()])).lots[0]!.currentBid).toBe(
      60_400,
    );
  });

  it("applies a delta the auction seq alone would have dropped", () => {
    // The delta's seq was stamped before a slower snapshot finished being read.
    const snap = { ...baseSnap([bidLot()]), seq: 50 };
    const fresh: LiveLotDelta = {
      auctionId: 10,
      lotId: 1,
      currentBid: 60_400,
      winnerBidderId: null,
      winnerBidderName: null,
      bidCount: 4,
      bidderCount: 2,
      seq: 49,
      rev: 4,
    };
    expect(patchSnapshotLot(snap, fresh).lots[0]!.currentBid).toBe(60_400);
  });
});
