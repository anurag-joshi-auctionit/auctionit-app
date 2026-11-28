import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createLiveChannel,
  type LiveChannel,
  type LiveChannelStatus,
} from "./live-transport";

export {
  DEFAULT_LIVE_TRANSPORT_CONFIG,
  SSE_SUSPEND_MS,
  TRANSPORT_CONFIG_REFRESH_MS,
  createLiveChannel,
  decideTransport,
  type LiveChannel,
  type LiveChannelStatus,
  type LiveTransportConfig,
  type LiveTransportKind,
  type LiveTransportMode,
} from "./live-transport";

const IDLE_STATUS: LiveChannelStatus = {
  connected: false,
  transport: "none",
  degraded: false,
  mode: "auto",
};

export type LiveState = "live" | "upcoming" | "ended";

export type LiveLot = {
  id: number;
  lotNumber: string | null;
  /** Catalogue display order within the auction (null = last). */
  displayOrder?: number | null;
  title: string | null;
  materialLocation?: string | null;
  quantity: number | null;
  uom: string | null;
  // Bidder audience, sealed-bid phase only (sealed-bid-only auction, or the
  // sealed window has not closed): null — the server alone enforces it.
  startBidPrice: number | null;
  bidIncrement: number;
  // Bidder audience: null on rank-based auctions (the winning amount is never
  // sent to the bidder; yourRank replaces it) and during the sealed-bid phase.
  currentBid: number | null;
  winnerBidderId: number | null;
  winnerBidderName: string | null;
  startsAt: string | null;
  endsAt: string | null;
  startLeftSec: number;
  timeLeftSec: number;
  notStarted: boolean;
  closed: boolean;
  // Admin reopened this lot: own end time, outside lot staggering, no extensions.
  reopened?: boolean;
  extensionCount: number;
  bidCount: number;
  bidderCount: number;
  bidLimit?: number | null;
  // Monotonic per-lot revision, bumped by the server inside the lot's row lock
  // on every write it broadcasts. Orders payloads by the state they were read
  // from, which the auction-wide `seq` cannot: `seq` is stamped when a payload
  // finishes being read, so a slow whole-auction snapshot outranks the delta of
  // a bid that landed while it was being built.
  rev?: number;
  // "First Bid = Start Bid Price + Increment": when true the opening bid must
  // clear SBP + one increment; when false the opening bid is the SBP itself.
  sbpPlusIncrement?: boolean;
  // Bidder audience only: relative standing vs winning (never competitor identity).
  yourStatus?: "winning" | "outbid" | "none";
  // Bidder's personal payloads, rank-based auctions only: their live position on
  // the lot (1 = current winner) and their own best bid. Null until they've bid
  // on the lot; omitted from shared payloads, which must not overwrite them.
  yourRank?: number | null;
  yourBid?: number | null;
};

export type LiveAuctionSnapshot = {
  auction: {
    id: number;
    auctionNumber: string | null;
    auctionType: string | null;
    clientName: string | null;
    status: string;
    liveState: LiveState;
    // Display bidder rank instead of the winning amount (bidder audience only).
    isRankBased?: boolean;
  };
  lots: LiveLot[];
  /** Postgres `now()` at snapshot read (UTC ISO). Used for capped transit anchoring. */
  serverTime: string;
  seq?: number;
};

// Per-lot update pushed after a bid/proxy — patches the changed lot's winning /
// winner / counts (and timer fields when present).
export type LiveLotDelta = {
  auctionId: number;
  lotId: number;
  currentBid: number | null;
  winnerBidderId: number | null;
  winnerBidderName: string | null;
  bidCount: number;
  bidderCount: number;
  seq?: number;
  rev?: number;
  /** Rank-based auctions mask currentBid for the bidder (see LiveLot.currentBid). */
  isRankBased?: boolean;
  /** Sealed-bid phase masks currentBid for the bidder (see LiveLot.currentBid). */
  sealedPhase?: boolean;
  timeLeftSec?: number;
  startLeftSec?: number;
  endsAt?: string | null;
  extensionCount?: number;
  closed?: boolean;
  notStarted?: boolean;
  yourStatus?: "winning" | "outbid" | "none";
  /** Postgres `now()` when timer fields were read (UTC ISO). */
  serverTime?: string;
};

/** POST /live/.../bid — includes post-proxy-settlement standing. */
export type LivePlaceBidResponse = {
  ok: true;
  amount: number;
  /** Null for rank-based auctions — the winning amount is never sent to the bidder. */
  finalAmount: number | null;
  yourStatus: "winning" | "outbid";
  rev: number;
  extended: boolean;
  /** Rank-based auctions only (see LiveLot.yourRank / yourBid). */
  yourRank?: number | null;
  yourBid?: number | null;
};

/** POST /live/.../proxy — same standing fields as place-bid. */
export type LiveSetProxyResponse = {
  ok: true;
  maxAmount: number;
  /** Null for rank-based auctions — the winning amount is never sent to the bidder. */
  finalAmount: number | null;
  yourStatus: "winning" | "outbid";
  rev: number;
  extended: boolean;
  /** Rank-based auctions only (see LiveLot.yourRank / yourBid). */
  yourRank?: number | null;
  yourBid?: number | null;
};

export type LiveAuctionListItem = {
  id: number;
  auctionNumber: string | null;
  clientId: number | null;
  clientName: string | null;
  auctionDate: string;
  lotCount: number;
  liveState: LiveState;
  tncRequired: boolean;
  // Lot ids this bidder is attached to; null = all lots (auction-wide map).
  attachedLotIds?: number[] | null;
};

// A lot merged into a combined multi-auction view, tagged with the auction it
// came from and the per-lot timestamp that its countdowns animate from.
export type MergedLot = LiveLot & {
  auctionId: number;
  auctionNumber: string | null;
  clientName: string | null;
  auctionType: string | null;
  isRankBased: boolean;
  receivedAt: number;
};

/**
 * Cap on how much of (browser now − Postgres serverTime) we treat as transit
 * when anchoring countdowns (LA-14). Larger gaps are clock skew — applying them
 * as elapsed reintroduced the ~50s "early close" bug when host clocks diverged.
 */
export const MAX_COUNTDOWN_TRANSIT_MS = 3_000;

/**
 * How far behind Postgres the remaining-seconds stamp is, for countdown
 * anchoring. Negative (server ahead of browser) → 0 so skew cannot make
 * auctions look early. Positive values are capped at MAX_COUNTDOWN_TRANSIT_MS.
 */
export function countdownTransitMs(
  serverTime: string | null | undefined,
  now: number = Date.now(),
): number {
  if (!serverTime) return 0;
  const serverMs = Date.parse(serverTime);
  if (!Number.isFinite(serverMs)) return 0;
  const delta = now - serverMs;
  if (delta <= 0) return 0;
  return Math.min(delta, MAX_COUNTDOWN_TRANSIT_MS);
}

/**
 * Browser-clock anchor for a timer payload stamped at Postgres `serverTime`.
 * `receivedAt = now − transit` so elapsed starts at transit and removes the
 * optimistic bias of counting from packet arrival alone.
 */
export function timerReceivedAt(
  serverTime?: string | null,
  now: number = Date.now(),
): number {
  return now - countdownTransitMs(serverTime, now);
}

/**
 * Anchor countdowns for a full snapshot (Postgres `serverTime` + remaining).
 *
 * Never treat a large browser−server gap as transit: that mixed PG remaining
 * with a skewed host clock and made no-bid extend / auto-close look tens of
 * seconds early. Small positive gaps (≤ MAX_COUNTDOWN_TRANSIT_MS) are transit.
 */
export function snapshotReceivedAt(
  snap: LiveAuctionSnapshot,
  now: number = Date.now(),
): number {
  return timerReceivedAt(snap.serverTime, now);
}

/**
 * After mergeSnapshot: re-anchor lots whose timer state came from `merged`,
 * keep prior anchors when merge kept the previous lot object (stale rev).
 */
export function mergeReceivedAtByLot(
  prevSnap: LiveAuctionSnapshot | undefined,
  prevAnchors: Map<number, number> | undefined,
  merged: LiveAuctionSnapshot,
  snapshotAnchor: number,
): Map<number, number> {
  const prevById = new Map(prevSnap?.lots.map((l) => [l.id, l]) ?? []);
  const next = new Map<number, number>();
  for (const lot of merged.lots) {
    const prevLot = prevById.get(lot.id);
    if (prevLot != null && prevLot === lot && prevAnchors?.has(lot.id)) {
      next.set(lot.id, prevAnchors.get(lot.id)!);
    } else {
      next.set(lot.id, snapshotAnchor);
    }
  }
  return next;
}

/**
 * True when `incoming` describes a lot as it was before state the client has
 * already applied. Revisions only move forward per lot, including the admin bid
 * removals that lower winning amount, so this is a freshness test and not a "prices only go
 * up" rule. A missing revision (older server) compares as equal — never stale —
 * so nothing is dropped for want of the field.
 */
function isStaleRev(held?: number, incoming?: number): boolean {
  return held != null && incoming != null && incoming < held;
}

/**
 * Apply a lot delta to a snapshot. Skips deltas that are older than the lot
 * state already held, and patches timer fields when present on the delta.
 *
 * Public-room deltas omit personalized `yourStatus` (or send `"none"`). Never
 * wipe a local `"winning"` / `"outbid"` with a blank shared payload — standing is
 * updated via join snapshots and private `live:standing` events.
 */
export function patchSnapshotLot(
  snap: LiveAuctionSnapshot,
  delta: LiveLotDelta,
): LiveAuctionSnapshot {
  const target = snap.lots.find((l) => l.id === delta.lotId);
  if (!target) return snap;

  if (target.rev != null && delta.rev != null) {
    if (isStaleRev(target.rev, delta.rev)) return snap;
  } else if (delta.seq != null && snap.seq != null && delta.seq <= snap.seq) {
    // Pre-`rev` server: fall back to the auction-wide sequence.
    return snap;
  }

  const lots = snap.lots.map((l) => {
    if (l.id !== delta.lotId) return l;
    const nextStatus = mergeYourStatus(l.yourStatus, delta.yourStatus);
    return {
      ...l,
      ...(delta.rev != null ? { rev: delta.rev } : {}),
      currentBid: delta.currentBid,
      winnerBidderId: delta.winnerBidderId,
      winnerBidderName: delta.winnerBidderName,
      bidCount: delta.bidCount,
      bidderCount: delta.bidderCount,
      ...(delta.timeLeftSec != null ? { timeLeftSec: delta.timeLeftSec } : {}),
      ...(delta.startLeftSec != null ? { startLeftSec: delta.startLeftSec } : {}),
      ...(delta.endsAt !== undefined ? { endsAt: delta.endsAt } : {}),
      ...(delta.extensionCount != null
        ? { extensionCount: delta.extensionCount }
        : {}),
      ...(delta.closed != null ? { closed: delta.closed } : {}),
      ...(delta.notStarted != null ? { notStarted: delta.notStarted } : {}),
      ...(nextStatus !== undefined ? { yourStatus: nextStatus } : {}),
    };
  });
  return {
    ...snap,
    lots,
    ...(delta.seq != null ? { seq: delta.seq } : {}),
  };
}

export {
  MAX_INCREMENT_STEPS,
  beatsAmount,
  bidDirectionFor,
  failsToBeatStanding,
  hasStandingBid,
  incrementCap,
  incrementGridBase,
  isOnIncrementGrid,
  isReverseAuction,
  manualBidAmountError,
  maxBidFor,
  minBidFor,
  minProxyMaxFor,
  rankBidAmountError,
  rankBoundsLot,
  snapBidAmount,
  snapDownToIncrement,
  type BidBoundsLot,
  type BidDirection,
  type SnapBidKind,
  type SnapBidResult,
} from "./live-bid-bounds";

type YourStatus = NonNullable<LiveLot["yourStatus"]>;

/** Keep personalized standing when a shared payload has none/missing. */
export function mergeYourStatus(
  prev: LiveLot["yourStatus"] | undefined,
  incoming: LiveLot["yourStatus"] | undefined,
): YourStatus | undefined {
  if (incoming === "winning" || incoming === "outbid") return incoming;
  if (prev === "winning" || prev === "outbid") return prev;
  if (incoming === "none") return "none";
  return prev;
}

/**
 * Merge a full snapshot into what we already hold: keep per-lot standing the
 * shared payload doesn't carry, and keep any lot the snapshot describes at an
 * older revision than we have.
 *
 * A whole-auction snapshot takes far longer to build than a single-lot delta,
 * so bids that land while a resync is being read are missing from it. Applying
 * it wholesale rewinds winning amount for those lots, and the bidder's next-bid field then
 * sits an increment behind until the next bid on that lot — which is exactly
 * the amount they are about to be told is below winning + increment.
 */
export function mergeSnapshot(
  prev: LiveAuctionSnapshot | undefined,
  next: LiveAuctionSnapshot,
): LiveAuctionSnapshot {
  if (!prev) return next;
  const prevById = new Map(prev.lots.map((l) => [l.id, l]));
  return {
    ...next,
    lots: next.lots.map((lot) => {
      const old = prevById.get(lot.id);
      if (!old) return lot;
      if (isStaleRev(old.rev, lot.rev)) return old;
      // Personalized join snaps include yourStatus (even "none" after a bid
      // removal). Shared public snaps omit the field — keep prior standing.
      const yourStatus =
        lot.yourStatus !== undefined
          ? lot.yourStatus
          : old.yourStatus;
      // Same for rank-based personal fields: shared payloads omit them.
      const yourRank = lot.yourRank !== undefined ? lot.yourRank : old.yourRank;
      const yourBid = lot.yourBid !== undefined ? lot.yourBid : old.yourBid;
      if (
        yourStatus === lot.yourStatus &&
        yourRank === lot.yourRank &&
        yourBid === lot.yourBid
      ) {
        return lot;
      }
      return { ...lot, yourStatus, yourRank, yourBid };
    }),
  };
}

export type LiveStandingEvent = {
  auctionId: number;
  lotId: number;
  yourStatus: "winning" | "outbid" | "none";
  currentBid?: number | null;
  seq?: number;
  rev?: number;
  /** Rank-based lots: this bidder's refreshed rank and own best bid. */
  yourRank?: number | null;
  yourBid?: number | null;
};

function applyStandingToSnapshot(
  snap: LiveAuctionSnapshot,
  event: LiveStandingEvent,
): LiveAuctionSnapshot {
  const target = snap.lots.find((l) => l.id === event.lotId);
  if (!target) return snap;

  if (target.rev != null && event.rev != null) {
    if (isStaleRev(target.rev, event.rev)) return snap;
  } else if (event.seq != null && snap.seq != null && event.seq < snap.seq) {
    return snap;
  }

  const lots = snap.lots.map((l) => {
    if (l.id !== event.lotId) return l;
    return {
      ...l,
      ...(event.rev != null ? { rev: event.rev } : {}),
      yourStatus: event.yourStatus,
      ...(event.currentBid != null ? { currentBid: event.currentBid } : {}),
      ...(event.yourRank !== undefined ? { yourRank: event.yourRank } : {}),
      ...(event.yourBid !== undefined ? { yourBid: event.yourBid } : {}),
    };
  });
  // A standing ping shares the seq of the lot delta it accompanies and carries
  // only status + price, so it must not advance the snapshot's seq: the delta
  // holds the rest of the lot's state and would be dropped as a duplicate if it
  // arrived second.
  return { ...snap, lots };
}

/**
 * Subscribes to the live feed for `auctionId` and keeps the latest server
 * snapshot. Per-lot `receivedAtByLot` anchors let the UI animate countdowns
 * without resetting sibling lots when one lot gets a bid delta.
 * `appId` must match AuthProvider (cookie `session_<appId>`), not the user role.
 *
 * The underlying channel fails over between Socket.IO, SSE and REST polling on
 * its own; `transport` reports which one is carrying the feed right now.
 */
export function useLiveAuction(
  auctionId: number | null,
  appId: string,
  /** Must match AuthProvider `apiUrl` so the session cookie is sent to the same host. */
  apiUrl: string,
) {
  const [snapshot, setSnapshot] = useState<LiveAuctionSnapshot | null>(null);
  const [status, setStatus] = useState<LiveChannelStatus>(IDLE_STATUS);
  const [receivedAtByLot, setReceivedAtByLot] = useState<Map<number, number>>(
    () => new Map(),
  );
  // Keep latest snapshot + anchors for out-of-band decisions in event handlers.
  const snapRef = useRef<LiveAuctionSnapshot | null>(null);
  const anchorsRef = useRef<Map<number, number>>(receivedAtByLot);
  snapRef.current = snapshot;
  anchorsRef.current = receivedAtByLot;

  useEffect(() => {
    if (!auctionId) {
      setSnapshot(null);
      setReceivedAtByLot(new Map());
      setStatus(IDLE_STATUS);
      return;
    }
    const channel = createLiveChannel<
      LiveAuctionSnapshot,
      LiveLotDelta,
      LiveStandingEvent
    >({
      apiUrl,
      appId,
      subscribe: "join",
      handlers: {
        onStatus: setStatus,
        onSnapshot: (snap) => {
          if (snap.auction.id !== auctionId) return;
          const prev = snapRef.current ?? undefined;
          const merged = mergeSnapshot(prev, snap);
          setSnapshot(merged);
          setReceivedAtByLot(
            mergeReceivedAtByLot(
              prev,
              anchorsRef.current,
              merged,
              snapshotReceivedAt(snap),
            ),
          );
        },
        onLot: (delta) => {
          if (delta.auctionId !== auctionId) return;
          const prev = snapRef.current;
          if (!prev) return;
          const next = patchSnapshotLot(prev, delta);
          if (next === prev) return;
          setSnapshot(next);
          // Re-anchor only the lot whose timers were refreshed — never the whole auction.
          if (delta.timeLeftSec != null || delta.startLeftSec != null) {
            setReceivedAtByLot((prevAnchors) => {
              const nextAnchors = new Map(prevAnchors);
              nextAnchors.set(delta.lotId, timerReceivedAt(delta.serverTime));
              return nextAnchors;
            });
          }
        },
        onStanding: (event) => {
          if (event.auctionId !== auctionId) return;
          const prev = snapRef.current;
          if (!prev) return;
          const next = applyStandingToSnapshot(prev, event);
          if (next === prev) return;
          setSnapshot(next);
        },
      },
    });
    channel.setAuctionIds([auctionId]);

    return () => channel.close();
  }, [auctionId, appId, apiUrl]);

  return {
    snapshot,
    connected: status.connected,
    transport: status.transport,
    degraded: status.degraded,
    receivedAtByLot,
  };
}

type AuctionLiveEntry = {
  snap: LiveAuctionSnapshot;
  /** Per-lot countdown anchors — never reset siblings on a single-lot delta. */
  receivedAtByLot: Map<number, number>;
};

/**
 * Watches several auction rooms at once over a single socket. Keeps the latest
 * snapshot per auction and returns every lot flattened into one list, each
 * tagged with its auction and its own timer anchor so per-lot countdowns stay
 * accurate. Re-selecting auctions reconciles the watched set without reconnecting.
 * `appId` must match AuthProvider (cookie `session_<appId>`), not the user role.
 */
export function useLiveAuctions(
  auctionIds: number[],
  appId: string,
  /** Must match AuthProvider `apiUrl` so the session cookie is sent to the same host. */
  apiUrl: string,
) {
  const idsKey = [...auctionIds].sort((a, b) => a - b).join(",");
  const [byId, setById] = useState<Map<number, AuctionLiveEntry>>(new Map());
  const [status, setStatus] = useState<LiveChannelStatus>(IDLE_STATUS);
  // When the newest snapshot arrived (any watched auction), for the "last
  // refreshed" indicator. 0 until the first snapshot lands.
  const [lastRefreshedAt, setLastRefreshedAt] = useState(0);
  const channelRef = useRef<LiveChannel | null>(null);
  // A rebuilt channel starts with no subscription, and the reconcile effect
  // below only runs when the selection changes — so seed it here.
  const idsRef = useRef<number[]>(auctionIds);
  idsRef.current = auctionIds;

  // One channel per appId + API host; rebuild when either changes.
  useEffect(() => {
    const channel = createLiveChannel<
      LiveAuctionSnapshot,
      LiveLotDelta,
      LiveStandingEvent
    >({
      apiUrl,
      appId,
      subscribe: "watch",
      handlers: {
        onStatus: setStatus,
        onSnapshot: (snap) => {
          setById((prev) => {
            const next = new Map(prev);
            const existing = prev.get(snap.auction.id);
            const merged = mergeSnapshot(existing?.snap, snap);
            next.set(snap.auction.id, {
              snap: merged,
              receivedAtByLot: mergeReceivedAtByLot(
                existing?.snap,
                existing?.receivedAtByLot,
                merged,
                snapshotReceivedAt(snap),
              ),
            });
            return next;
          });
          setLastRefreshedAt(Date.now());
        },
        // Patch the changed lot; re-anchor only that lot's countdown when timers move.
        onLot: (delta) => {
          setById((prev) => {
            const entry = prev.get(delta.auctionId);
            if (!entry) return prev;
            const snap = patchSnapshotLot(entry.snap, delta);
            if (snap === entry.snap) return prev;
            const receivedAtByLot = new Map(entry.receivedAtByLot);
            if (delta.timeLeftSec != null || delta.startLeftSec != null) {
              receivedAtByLot.set(
                delta.lotId,
                timerReceivedAt(delta.serverTime),
              );
            }
            const next = new Map(prev);
            next.set(delta.auctionId, { snap, receivedAtByLot });
            return next;
          });
          setLastRefreshedAt(Date.now());
        },
        onStanding: (event) => {
          setById((prev) => {
            const entry = prev.get(event.auctionId);
            if (!entry) return prev;
            const snap = applyStandingToSnapshot(entry.snap, event);
            if (snap === entry.snap) return prev;
            const next = new Map(prev);
            next.set(event.auctionId, {
              snap,
              receivedAtByLot: entry.receivedAtByLot,
            });
            return next;
          });
        },
      },
    });
    channelRef.current = channel;
    channel.setAuctionIds(idsRef.current);

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [appId, apiUrl]);

  // Reconcile the watched set when the selection changes; drop snapshots for
  // auctions no longer selected so their lots leave the grid immediately.
  useEffect(() => {
    channelRef.current?.setAuctionIds(auctionIds);
    setById((prev) => {
      const keep = new Set(auctionIds);
      let changed = false;
      const next = new Map(prev);
      for (const id of prev.keys()) {
        if (!keep.has(id)) {
          next.delete(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  const lots: MergedLot[] = useMemo(() => {
    const out: MergedLot[] = [];
    for (const id of auctionIds) {
      const entry = byId.get(id);
      if (!entry) continue;
      for (const lot of entry.snap.lots) {
        out.push({
          ...lot,
          auctionId: id,
          auctionNumber: entry.snap.auction.auctionNumber,
          clientName: entry.snap.auction.clientName,
          auctionType: entry.snap.auction.auctionType,
          isRankBased: entry.snap.auction.isRankBased === true,
          receivedAt: entry.receivedAtByLot.get(lot.id) ?? 0,
        });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byId, idsKey]);

  // Ask the server to re-push a snapshot for every watched auction. Used by
  // manual Refresh (not a periodic poll — bids arrive via live:lot / standing).
  const refresh = useCallback(() => {
    channelRef.current?.refresh();
  }, []);

  const hasSnapshot =
    auctionIds.length > 0 && auctionIds.every((id) => byId.has(id));

  return {
    lots,
    connected: status.connected,
    transport: status.transport,
    degraded: status.degraded,
    watching: auctionIds.length,
    hasSnapshot,
    refresh,
    lastRefreshedAt,
  };
}

/** Re-render every second so countdowns tick. Prefer TickProvider for lists. */
export function useSecondTick(): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return n;
}

const TickContext = createContext(0);

/** Single shared 1s interval for a subtree of countdown UIs. */
export function TickProvider({ children }: { children: ReactNode }) {
  const tick = useSecondTick();
  return createElement(TickContext.Provider, { value: tick }, children);
}

/** Subscribe to the TickProvider interval (0 if used outside a provider). */
export function useSharedSecondTick(): number {
  return useContext(TickContext);
}

/** Remaining seconds for a lot, animated from the last timer anchor. */
export function lotTimeLeft(
  lot: LiveLot,
  receivedAt: number,
  now: number = Date.now(),
): number {
  const elapsed = receivedAt ? (now - receivedAt) / 1000 : 0;
  return Math.max(0, Math.floor(lot.timeLeftSec - elapsed));
}

/** Seconds until a lot opens, animated from the last timer anchor (0 once open). */
export function lotStartLeft(
  lot: LiveLot,
  receivedAt: number,
  now: number = Date.now(),
): number {
  const elapsed = receivedAt ? (now - receivedAt) / 1000 : 0;
  return Math.max(0, Math.floor(lot.startLeftSec - elapsed));
}

/**
 * Mirrors the server's no-bid-extension lead time (`NO_BID_EXTENSION_LEAD_SEC`
 * in apps/api/src/lib/auctions/no-bid-extension.ts): a lot this close to its
 * locally-known end time may already be a pending extend-or-close decision on
 * the server, which only resolves (and broadcasts) on its next ~2s tick.
 */
export const LOT_PROCESSING_LEAD_SEC = 1;

export type LotDisplayStatus = "not_started" | "open" | "processing" | "closed";

/**
 * Server-confirmed vs. locally-predicted lot state. `lot.closed` only flips
 * once the server has actually decided to close — it never marks a lot closed
 * while a no-bid extension is pending. Until that confirmation reaches the
 * client, a lot whose local countdown has run out is "processing", not
 * "closed": the UI should not claim the lot has ended, and bidding should stay
 * enabled, since it may well still extend.
 */
export function lotDisplayStatus(
  lot: LiveLot,
  receivedAt: number,
  now: number = Date.now(),
): LotDisplayStatus {
  if (lotStartLeft(lot, receivedAt, now) > 0) return "not_started";
  if (lot.closed) return "closed";
  const left = lotTimeLeft(lot, receivedAt, now);
  return left <= LOT_PROCESSING_LEAD_SEC ? "processing" : "open";
}

/** Sort lots by catalogue display order, then id. */
export function compareLotsByDisplayOrder(a: LiveLot, b: LiveLot): number {
  const ao = a.displayOrder;
  const bo = b.displayOrder;
  if (ao != null && bo != null) {
    if (ao !== bo) return ao - bo;
  } else if (ao != null) return -1;
  else if (bo != null) return 1;
  return a.id - b.id;
}

/** Seconds used to order live-monitor rows (asc = soonest first). */
export function lotMonitorSortSeconds(
  lot: LiveLot,
  receivedAt: number,
  now: number = Date.now(),
): number {
  const startLeft = lotStartLeft(lot, receivedAt, now);
  if (startLeft > 0) return startLeft;
  const left = lotTimeLeft(lot, receivedAt, now);
  if (left <= 0 || lot.closed) return Infinity;
  return left;
}

export function formatCountdown(totalSec: number): string {
  if (totalSec <= 0) return "Ended";
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  const pad = (x: number) => String(x).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
