import {
  Badge,
  Button,
  cn,
  formatCurrency,
  HammerIcon,
  type ColumnDef,
} from "@auctionit/ui";
import { LiveBidMessages } from "@auctionit/messages";
import { Heart, InfoCircle } from "@untitledui/icons";
import { useMemo, useRef } from "react";
import type { MergedLot } from "@/lib/use-live-auction";
import {
  formatCountdown,
  hasStandingBid,
  isReverseAuction,
  lotDisplayStatus,
  lotStartLeft,
  lotTimeLeft,
  useSharedSecondTick,
} from "@/lib/use-live-auction";
import { lotDisplayLabel } from "@/lib/portal-display-labels";
import { BidCell } from "@/components/live-auction/bid-cell";

export function lotRowKey(lot: MergedLot): string {
  return `${lot.auctionId}:${lot.id}`;
}

export type ExpandSection = "item" | "other";

export function isLotClosed(lot: MergedLot): boolean {
  return lot.closed;
}

export function isOutbidLot(lot: MergedLot): boolean {
  // Rank-based lots have no outbid state: a lower bid just changes rank.
  if (lot.isRankBased) return false;
  if (isLotClosed(lot)) return false;
  // Only trust explicit standing — public socket payloads omit yourStatus.
  return lot.yourStatus === "outbid";
}

export type LiveAuctionColumnCallbacks = {
  tncRequired: boolean;
  auctionType?: string | null;
  isWatched: (lotId: number) => boolean;
  isParticipated: (lotId: number) => boolean;
  isAmWinning: (lot: MergedLot) => boolean;
  isPending: (lotId: number) => boolean;
  resetKey: (lotId: number) => number;
  proxyOn: (lotId: number) => boolean;
  onProxyToggle: (lotId: number, v: boolean) => void;
  onSubmit: (lot: MergedLot, amount: number | null) => void;
  submitting: (lotId: number) => boolean;
  rejectReason: (lotId: number) => string | null;
  proxyAmount: (lotId: number) => number | null;
  onToggle: (lot: MergedLot, section: ExpandSection) => void;
  onToggleWatch: (lotId: number) => void;
};

function TimeLeftCell({ lot }: { lot: MergedLot }) {
  useSharedSecondTick();
  const startLeft = lotStartLeft(lot, lot.receivedAt);
  const secs = lotTimeLeft(lot, lot.receivedAt);
  const processing = lotDisplayStatus(lot, lot.receivedAt) === "processing";
  return (
    <TimeLeftBadge
      startLeft={startLeft}
      secs={secs}
      closed={lot.closed}
      processing={processing}
    />
  );
}

/** Starts in / Closes in / Processing / Closed badge shared by live and sealed lot tables. */
export function TimeLeftBadge({
  startLeft,
  secs,
  closed,
  processing = false,
}: {
  startLeft: number;
  secs: number;
  closed: boolean;
  /**
   * Local countdown has run out but the server hasn't confirmed close yet —
   * a no-bid extension may still land. Not used by callers with no extension
   * concept (e.g. the sealed-bid window), which can leave this unset.
   */
  processing?: boolean;
}) {
  const notStarted = startLeft > 0;

  if (notStarted) {
    return (
      <Badge color="grey" className="w-fit">
        Starts in {formatCountdown(startLeft)}
      </Badge>
    );
  }

  if (closed) {
    return (
      <Badge color="red" className="w-fit">
        Closed
      </Badge>
    );
  }

  if (processing) {
    return (
      <Badge color="yellow" className="w-fit">
        Processing
      </Badge>
    );
  }

  return (
    <Badge color={secs <= 300 ? "red" : "yellow"} className="w-fit">
      Closes in {formatCountdown(secs)}
    </Badge>
  );
}

export function gatedValue() {
  return <span className="text-muted-foreground">—</span>;
}

export function BidStatusCell({
  tncRequired,
  notStarted,
  closed,
  rejectReason,
  pending,
  winning,
  outbid,
  proxyAmount,
  rankBased,
}: {
  tncRequired: boolean;
  notStarted: boolean;
  closed: boolean;
  rejectReason: string | null;
  pending: boolean;
  winning: boolean;
  outbid: boolean;
  proxyAmount: number | null;
  rankBased: boolean;
}) {
  if (tncRequired || notStarted || closed) return gatedValue();

  // Standing (Bid Accepted / Outbid) is from the last successful participation.
  // Attempt outcome is separate: Placing while in flight, or rejectReason under
  // standing when the latest Place Bid / proxy failed. Pending wins over
  // standing so we never flash Accepted while a rival proxy may still settle.
  // Rank-based has no standing beyond the rank badge, so a failed attempt is
  // headlined as rejected rather than left under an earlier "Bid Accepted".
  const standing = pending ? (
    <span className="text-muted-foreground block text-sm font-medium wrap-break-word whitespace-normal">
      {LiveBidMessages.BID_PLACING}
    </span>
  ) : rankBased && rejectReason ? (
    <span className="text-red-foreground block text-sm font-medium wrap-break-word whitespace-normal">
      {LiveBidMessages.BID_REJECTED}
    </span>
  ) : winning ? (
    <span className="text-green-foreground block text-sm font-medium wrap-break-word whitespace-normal">
      {LiveBidMessages.BID_ACCEPTED}
    </span>
  ) : outbid ? (
    <span className="text-red-foreground block text-sm font-medium wrap-break-word whitespace-normal">
      {LiveBidMessages.OUTBID}
    </span>
  ) : null;

  const proxyLine =
    proxyAmount != null && proxyAmount > 0 ? (
      <span className="text-muted-foreground block text-sm wrap-break-word whitespace-normal">
        {LiveBidMessages.PROXY_AMT(formatCurrency(proxyAmount))}
      </span>
    ) : null;

  const errorLine = rejectReason ? (
    <span className="text-red-foreground block text-sm wrap-break-word whitespace-normal">
      {rejectReason}
    </span>
  ) : null;

  if (!standing && !proxyLine && !errorLine) return gatedValue();

  return (
    <div className="flex min-w-0 w-full flex-col gap-0.5">
      {standing}
      {proxyLine}
      {errorLine}
    </div>
  );
}

/**
 * Column identity must stay stable: `flexRender` renders each `cell` via
 * `createElement(cell, props)`, so a fresh `cell` function is a new component
 * type and React remounts the whole cell — losing input focus and local state
 * on every snapshot and countdown tick. Callbacks are read through a ref so the
 * memo only rebuilds when the values baked into the cells change.
 */
export function useLiveAuctionColumns(
  callbacks: LiveAuctionColumnCallbacks,
): ColumnDef<MergedLot, unknown>[] {
  const ref = useRef(callbacks);
  ref.current = callbacks;

  const { tncRequired } = callbacks;

  return useMemo(
    () =>
      createLiveAuctionTableColumns({
        tncRequired,
        isWatched: (lotId) => ref.current.isWatched(lotId),
        isParticipated: (lotId) => ref.current.isParticipated(lotId),
        isAmWinning: (lot) => ref.current.isAmWinning(lot),
        isPending: (lotId) => ref.current.isPending(lotId),
        resetKey: (lotId) => ref.current.resetKey(lotId),
        proxyOn: (lotId) => ref.current.proxyOn(lotId),
        onProxyToggle: (lotId, v) => ref.current.onProxyToggle(lotId, v),
        onSubmit: (lot, amount) => ref.current.onSubmit(lot, amount),
        submitting: (lotId) => ref.current.submitting(lotId),
        rejectReason: (lotId) => ref.current.rejectReason(lotId),
        proxyAmount: (lotId) => ref.current.proxyAmount(lotId),
        onToggle: (lot, section) => ref.current.onToggle(lot, section),
        onToggleWatch: (lotId) => ref.current.onToggleWatch(lotId),
      }),
    [tncRequired],
  );
}

function createLiveAuctionTableColumns({
  tncRequired,
  isWatched,
  isParticipated,
  isAmWinning,
  isPending,
  resetKey,
  proxyOn,
  onProxyToggle,
  onSubmit,
  submitting,
  rejectReason,
  proxyAmount,
  onToggle,
  onToggleWatch,
}: LiveAuctionColumnCallbacks): ColumnDef<MergedLot, unknown>[] {
  return [
    {
      id: "lot",
      header: "Lot No.",
      enableHiding: false,
      enableSorting: false,
      maxSize: 300,
      cell: ({ row }) => {
        const lot = row.original;
        const notStarted = lotStartLeft(lot, lot.receivedAt) > 0;
        const winning = isAmWinning(lot);
        return (
          <div className="flex w-[300px] min-w-0 items-center gap-2 overflow-hidden">
            <Button
              type="button"
              variant="link"
              className="h-auto min-w-0 justify-start overflow-hidden p-0 text-left"
              onClick={() => onToggle(lot, "item")}
            >
              <span className="block truncate">
                {lotDisplayLabel(lot.lotNumber)}
              </span>
            </Button>
            {winning ? (
              <HammerIcon className="fill-yellow-foreground text-yellow-foreground size-5 shrink-0" />
            ) : null}
            {notStarted ? (
              <Badge color="yellow" className="shrink-0">
                Upcoming
              </Badge>
            ) : null}
          </div>
        );
      },
    },
    {
      id: "qty",
      header: "Qty.",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.quantity ?? "—"}</span>
      ),
    },
    {
      id: "unit",
      header: "Unit",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => row.original.uom ?? "—",
    },
    {
      id: "time",
      header: "Time",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => <TimeLeftCell lot={row.original} />,
    },
    {
      id: "price",
      header: "Price",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        if (tncRequired) return gatedValue();

        const lot = row.original;
        const winning = isAmWinning(lot);
        const outbid = isOutbidLot(lot);
        const standing = hasStandingBid(lot);
        const standingClass = cn(
          "font-medium tabular-nums",
          winning
            ? "text-green-foreground"
            : outbid
              ? "text-red-foreground"
              : "text-foreground",
        );

        return (
          <div className="flex flex-col gap-0.5 leading-tight">
            {lot.isRankBased || lot.startBidPrice == null ? null : (
              <span className="tabular-nums">
                Start: {formatCurrency(lot.startBidPrice)}
              </span>
            )}
            {lot.isRankBased ? (
              lot.yourBid != null ? (
                <span className="flex items-center gap-1.5">
                  <span className={standingClass}>
                    Your Bid: {formatCurrency(lot.yourBid)}
                  </span>
                  {lot.yourRank != null ? (
                    <Badge color={lot.yourRank === 1 ? "green" : "grey"}>
                      {LiveBidMessages.RANK_BADGE(lot.yourRank)}
                    </Badge>
                  ) : null}
                </span>
              ) : (
                <span className="text-muted-foreground">Your Bid: —</span>
              )
            ) : standing ? (
              <span className={standingClass}>
                {isReverseAuction(lot.auctionType) ? "Lowest" : "Winning"}: {formatCurrency(lot.currentBid)}
              </span>
            ) : (
              <span className="text-muted-foreground">{isReverseAuction(lot.auctionType) ? "Lowest" : "Winning"}: —</span>
            )}
          </div>
        );
      },
    },
    {
      id: "bid",
      header: "Bid / Proxy",
      enableHiding: false,
      enableSorting: false,
      size: 220,
      minSize: 220,
      cell: ({ row }) => {
        if (tncRequired) return gatedValue();

        const lot = row.original;

        return (
          <BidCell
            key={lotRowKey(lot)}
            lot={lot}
            tncRequired={tncRequired}
            resetKey={resetKey(lot.id)}
            proxyOn={proxyOn(lot.id)}
            onProxyToggle={(v) => onProxyToggle(lot.id, v)}
            onSubmit={(n) => onSubmit(lot, n)}
            submitting={submitting(lot.id)}
          />
        );
      },
    },
    {
      id: "bidStatus",
      header: "Bid Status",
      enableHiding: false,
      enableSorting: false,
      size: 200,
      minSize: 200,
      maxSize: 200,
      cell: ({ row }) => {
        const lot = row.original;
        const notStarted = lotStartLeft(lot, lot.receivedAt) > 0;
        const closed = isLotClosed(lot);
        // Rank-based: any accepted bid stays "Bid Accepted"; rank shows position.
        const winning = lot.isRankBased
          ? lot.yourBid != null
          : isAmWinning(lot);
        const outbid = !lot.isRankBased && lot.yourStatus === "outbid";

        return (
          <BidStatusCell
            tncRequired={tncRequired}
            notStarted={notStarted}
            closed={closed}
            rejectReason={rejectReason(lot.id)}
            pending={isPending(lot.id)}
            winning={winning}
            outbid={outbid}
            proxyAmount={proxyAmount(lot.id)}
            rankBased={lot.isRankBased}
          />
        );
      },
    },
    {
      id: "action",
      header: "",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        const lot = row.original;
        const watched = isWatched(lot.id);
        return (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Additional Information"
              tooltip="Additional Information"
              onClick={() => onToggle(lot, "other")}
            >
              <InfoCircle className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onToggleWatch(lot.id)}
              aria-label={watched ? "Remove from Watch List" : "Watch List"}
              tooltip={watched ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              <Heart
                className={cn(
                  "size-4",
                  watched && "fill-yellow-foreground text-yellow-foreground",
                )}
                aria-hidden
              />
            </Button>
          </div>
        );
      },
    },
  ];
}
