import { io, type Socket } from "socket.io-client";

// Socket.IO transports, configurable per environment. Default connects via HTTP
// long-polling then upgrades to WebSocket where the proxy allows it. On an
// environment whose reverse proxy doesn't forward the WS upgrade (e.g. staging),
// build with VITE_SOCKET_TRANSPORTS=polling to stay on long-polling and avoid
// the failed-WebSocket console error.
//
// Read transports via a direct member access so Vite can statically replace it
// in app bundles.
const SOCKET_TRANSPORTS = (
  (
    import.meta as ImportMeta & {
      env?: { VITE_SOCKET_TRANSPORTS?: string };
    }
  ).env?.VITE_SOCKET_TRANSPORTS ?? "polling,websocket"
)
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean) as ("polling" | "websocket")[];

/** Transport policy set by an admin and served by GET /live/transport. */
export type LiveTransportMode = "auto" | "socket" | "sse" | "poll";

/** The channel a client is actually receiving pushes on right now. */
export type LiveTransportKind = "socket" | "sse" | "poll" | "none";

export type LiveTransportConfig = {
  mode: LiveTransportMode;
  sseEnabled: boolean;
  failoverConnectMs: number;
  failoverSilenceMs: number;
  pollIntervalMs: number;
  sseRetryMs: number;
};

/** Used until GET /live/transport answers, and if it ever stops answering. */
export const DEFAULT_LIVE_TRANSPORT_CONFIG: LiveTransportConfig = {
  mode: "auto",
  sseEnabled: true,
  failoverConnectMs: 8_000,
  failoverSilenceMs: 30_000,
  pollIntervalMs: 10_000,
  sseRetryMs: 3_000,
};

/** How long SSE stays out of rotation after it went silent or errored. */
export const SSE_SUSPEND_MS = 60_000;

/** How often the client re-reads the admin transport policy. */
export const TRANSPORT_CONFIG_REFRESH_MS = 30_000;

export type TransportDecisionInput = {
  mode: LiveTransportMode;
  sseEnabled: boolean;
  socketConnected: boolean;
  /** ms since the socket was last connected; 0 while connected. */
  socketDownMs: number;
  /** SSE is benched after a failure — see SSE_SUSPEND_MS. */
  sseSuspended: boolean;
  failoverConnectMs: number;
};

/**
 * Which channel should be live, given the admin policy and current health.
 *
 * Pure so the failover rules can be tested without sockets: the manager feeds
 * it observed state on a tick and opens/closes channels to match the answer.
 */
export function decideTransport(
  input: TransportDecisionInput,
): LiveTransportKind {
  if (input.mode === "socket") return "socket";
  if (input.mode === "poll") return "poll";
  if (input.mode === "sse") return input.sseEnabled ? "sse" : "poll";

  // auto: Socket.IO is primary and keeps its own reconnect loop. We only step
  // in once it has been unreachable long enough that a bidder would notice.
  if (input.socketConnected) return "socket";
  if (input.socketDownMs < input.failoverConnectMs) return "socket";
  if (input.sseEnabled && !input.sseSuspended) return "sse";
  return "poll";
}

export type LiveChannelStatus = {
  /** The active channel is delivering events. */
  connected: boolean;
  transport: LiveTransportKind;
  /** True whenever we are not on the transport the policy prefers. */
  degraded: boolean;
  mode: LiveTransportMode;
};

export type LiveChannelHandlers<TSnapshot, TDelta, TStanding> = {
  onSnapshot: (snapshot: TSnapshot) => void;
  onLot: (delta: TDelta) => void;
  onStanding: (event: TStanding) => void;
  onStatus: (status: LiveChannelStatus) => void;
};

export type LiveChannelOptions<TSnapshot, TDelta, TStanding> = {
  apiUrl: string;
  appId: string;
  /**
   * "join" mirrors a single-auction room (portal client audiences included);
   * "watch" reconciles a set of rooms over one socket for the monitor views.
   */
  subscribe: "join" | "watch";
  handlers: LiveChannelHandlers<TSnapshot, TDelta, TStanding>;
};

export type LiveChannel = {
  setAuctionIds: (ids: number[]) => void;
  /** Ask the server to re-push snapshots for everything we watch. */
  refresh: () => void;
  close: () => void;
};

const HEALTH_TICK_MS = 1_000;

function sameIds(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/**
 * Keeps live pushes flowing over whichever channel is currently working.
 *
 * Socket.IO is primary; SSE is a server→client fallback for environments where
 * the WebSocket/polling handshake is broken or stuck reconnecting; REST
 * snapshot polling is the last resort. Writes (bids, proxies) never travel this
 * channel — they stay on the REST endpoints — so a downgrade costs freshness,
 * not the ability to bid.
 *
 * Payloads are identical on every channel and carry per-lot `rev`, so the
 * caller's merge logic discards anything stale when two channels briefly
 * overlap during a handover.
 */
export function createLiveChannel<TSnapshot, TDelta, TStanding>(
  options: LiveChannelOptions<TSnapshot, TDelta, TStanding>,
): LiveChannel {
  const { apiUrl, appId, subscribe, handlers } = options;

  let config = DEFAULT_LIVE_TRANSPORT_CONFIG;
  let auctionIds: number[] = [];
  let closed = false;

  let socket: Socket | null = null;
  let socketConnected = false;
  let socketDownSince = Date.now();

  let source: EventSource | null = null;
  let sourceIds: number[] = [];
  let sseLastFrameAt = 0;
  let sseSuspendedUntil = 0;

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let pollOk = false;

  let active: LiveTransportKind = "none";
  let lastStatus: LiveChannelStatus | null = null;

  function emitStatus(): void {
    const connected =
      (active === "socket" && socketConnected) ||
      (active === "sse" && source != null && sseLastFrameAt > 0) ||
      (active === "poll" && pollOk);
    const status: LiveChannelStatus = {
      connected,
      transport: active,
      degraded: active !== "socket" && config.mode !== "socket",
      mode: config.mode,
    };
    if (
      lastStatus &&
      lastStatus.connected === status.connected &&
      lastStatus.transport === status.transport &&
      lastStatus.degraded === status.degraded &&
      lastStatus.mode === status.mode
    ) {
      return;
    }
    lastStatus = status;
    handlers.onStatus(status);
  }

  // --- Socket.IO ------------------------------------------------------------

  function sendSubscription(): void {
    if (!socket?.connected || auctionIds.length === 0) return;
    if (subscribe === "watch") {
      socket.emit("live:watch", auctionIds);
    } else {
      socket.emit("live:join", auctionIds[0]);
    }
  }

  function openSocket(): void {
    if (socket) return;
    // socket.io-client treats any path in the URL as the namespace, so passing
    // apiUrl (which ends in /api/v1) would connect to the "/api/v1" namespace
    // instead of the default "/". Use the page's own origin so the socket always
    // lands on the right host regardless of what VITE_API_URL is baked into the
    // image.
    const next = io(window.location.origin, {
      auth: { appId },
      withCredentials: true,
      transports: SOCKET_TRANSPORTS,
    });
    socket = next;

    next.on("connect", () => {
      socketConnected = true;
      socketDownSince = 0;
      sendSubscription();
      emitStatus();
    });
    const markDown = () => {
      if (socketConnected) socketDownSince = Date.now();
      socketConnected = false;
      emitStatus();
    };
    next.on("disconnect", markDown);
    next.on("connect_error", markDown);
    next.on("live:snapshot", (snap: TSnapshot) => handlers.onSnapshot(snap));
    next.on("live:lot", (delta: TDelta) => handlers.onLot(delta));
    next.on("live:standing", (event: TStanding) => handlers.onStanding(event));
  }

  function closeSocket(): void {
    if (!socket) return;
    if (subscribe === "join" && socket.connected && auctionIds.length > 0) {
      socket.emit("live:leave", auctionIds[0]);
    }
    socket.disconnect();
    socket = null;
    socketConnected = false;
    socketDownSince = Date.now();
  }

  // --- SSE ------------------------------------------------------------------

  function openSse(): void {
    if (auctionIds.length === 0) return;
    if (source && sameIds(sourceIds, auctionIds)) return;
    closeSse();

    const url = `${apiUrl}/live/stream?auctionIds=${auctionIds.join(
      ",",
    )}&app_id=${encodeURIComponent(appId)}`;
    const next = new EventSource(url, { withCredentials: true });
    source = next;
    sourceIds = [...auctionIds];
    sseLastFrameAt = 0;

    const touch = () => {
      sseLastFrameAt = Date.now();
    };
    next.addEventListener("live:ping", touch);
    next.addEventListener("live:meta", () => {
      touch();
      emitStatus();
    });
    next.addEventListener("live:snapshot", (event) => {
      touch();
      handlers.onSnapshot(JSON.parse((event as MessageEvent<string>).data));
      emitStatus();
    });
    next.addEventListener("live:lot", (event) => {
      touch();
      handlers.onLot(JSON.parse((event as MessageEvent<string>).data));
    });
    next.addEventListener("live:standing", (event) => {
      touch();
      handlers.onStanding(JSON.parse((event as MessageEvent<string>).data));
    });
    next.onerror = () => {
      // EventSource retries on its own; only a stream that never delivered
      // anything is treated as broken, so a single blip doesn't cost us the
      // channel.
      if (sseLastFrameAt === 0) suspendSse();
      emitStatus();
    };
  }

  function closeSse(): void {
    if (!source) return;
    source.close();
    source = null;
    sourceIds = [];
    sseLastFrameAt = 0;
  }

  function suspendSse(): void {
    closeSse();
    sseSuspendedUntil = Date.now() + SSE_SUSPEND_MS;
  }

  // --- REST polling ---------------------------------------------------------

  async function pollOnce(): Promise<void> {
    if (auctionIds.length === 0) return;
    const results = await Promise.allSettled(
      auctionIds.map(async (id) => {
        const res = await fetch(`${apiUrl}/live/auctions/${id}`, {
          credentials: "include",
          headers: { "x-app-id": appId },
        });
        if (!res.ok) throw new Error(`live poll failed: ${res.status}`);
        return (await res.json()) as TSnapshot;
      }),
    );
    let any = false;
    for (const result of results) {
      if (result.status === "fulfilled") {
        any = true;
        handlers.onSnapshot(result.value);
      }
    }
    pollOk = any;
    emitStatus();
  }

  function openPoll(): void {
    if (pollTimer) return;
    void pollOnce();
    pollTimer = setInterval(() => void pollOnce(), config.pollIntervalMs);
  }

  function closePoll(): void {
    if (!pollTimer) return;
    clearInterval(pollTimer);
    pollTimer = null;
    pollOk = false;
  }

  // --- Supervision ----------------------------------------------------------

  function applyTransport(next: LiveTransportKind): void {
    if (next !== active) {
      active = next;
    }
    // Socket.IO stays open while we're on SSE in auto mode: its own reconnect
    // loop is how we get back to the primary channel.
    const keepSocketWarm = config.mode !== "poll" && config.mode !== "sse";
    if (next === "socket" || keepSocketWarm) openSocket();
    else closeSocket();

    if (next === "sse") openSse();
    else closeSse();

    if (next === "poll") openPoll();
    else closePoll();

    emitStatus();
  }

  function evaluate(): void {
    if (closed) return;
    // Nothing to watch yet: hold the primary channel open and don't report a
    // downgrade for an idle screen.
    if (auctionIds.length === 0) {
      applyTransport(config.mode === "poll" ? "poll" : "socket");
      return;
    }
    if (sseSuspendedUntil && Date.now() > sseSuspendedUntil) {
      sseSuspendedUntil = 0;
    }
    // A stream that stopped sending even heartbeats is wedged; bench it so the
    // next decision falls through to polling.
    if (
      active === "sse" &&
      source != null &&
      sseLastFrameAt > 0 &&
      Date.now() - sseLastFrameAt > config.failoverSilenceMs
    ) {
      suspendSse();
    }
    applyTransport(
      decideTransport({
        mode: config.mode,
        sseEnabled: config.sseEnabled,
        socketConnected,
        socketDownMs: socketDownSince === 0 ? 0 : Date.now() - socketDownSince,
        sseSuspended: sseSuspendedUntil > 0,
        failoverConnectMs: config.failoverConnectMs,
      }),
    );
  }

  async function loadConfig(): Promise<void> {
    try {
      const res = await fetch(`${apiUrl}/live/transport`, {
        credentials: "include",
        headers: { "x-app-id": appId },
      });
      if (!res.ok) return;
      const next = (await res.json()) as Partial<LiveTransportConfig>;
      config = { ...DEFAULT_LIVE_TRANSPORT_CONFIG, ...next };
      if (pollTimer) {
        closePoll();
        openPoll();
      }
      evaluate();
    } catch {
      // Keep the last known policy; the channel must survive a config blip.
    }
  }

  const healthTimer = setInterval(evaluate, HEALTH_TICK_MS);
  const configTimer = setInterval(
    () => void loadConfig(),
    TRANSPORT_CONFIG_REFRESH_MS,
  );
  void loadConfig();
  evaluate();

  return {
    setAuctionIds(ids: number[]) {
      const next = [...ids].sort((a, b) => a - b);
      if (sameIds(auctionIds, next)) return;
      auctionIds = next;
      sendSubscription();
      // EventSource can't renegotiate its subscription, so a changed watch set
      // means a new stream.
      if (active === "sse") openSse();
      if (active === "poll") void pollOnce();
      evaluate();
    },
    refresh() {
      if (active === "socket" && socket?.connected) {
        socket.emit("live:refresh");
        return;
      }
      void pollOnce();
    },
    close() {
      closed = true;
      clearInterval(healthTimer);
      clearInterval(configTimer);
      closeSocket();
      closeSse();
      closePoll();
      active = "none";
    },
  };
}
