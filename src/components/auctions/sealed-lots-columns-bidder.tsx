import { Button, formatCurrency, type ColumnDef } from "@auctionit/ui";
import { InfoCircle } from "@untitledui/icons";
import { useMemo, useRef } from "react";
import { SealedBidCell } from "@/components/live-auction/sealed-bid-cell";
import type { SealedBidLot } from "@/hooks/use-sealed-bids";
import { lotDisplayLabel } from "@/lib/portal-display-labels";
import { useSharedSecondTick } from "@/lib/use-live-auction";
import {
  BidStatusCell,
  TimeLeftBadge,
  gatedValue,
  type ExpandSection,
} from "./live-lots-columns-bidder";

export type SealedWindowClock = {
  state: "upcoming" | "open" | "closed";
  secondsLeft: number;
  secondsToStart: number;
};

export type SealedBidColumnCallbacks = {
  tncRequired: boolean;
  /** Read on every tick so the Time column counts down. */
  clock: () => SealedWindowClock;
  isPending: (lotId: number) => boolean;
  resetKey: (lotId: number) => number;
  rejectReason: (lotId: number) => string | null;
  onSubmit: (lot: SealedBidLot, amount: number | null) => void;
  onToggle: (lot: SealedBidLot, section: ExpandSection) => void;
};

function WindowTimeCell({ clock }: { clock: () => SealedWindowClock }) {
  useSharedSecondTick();
  const c = clock();
  return (
    <TimeLeftBadge
      startLeft={c.state === "upcoming" ? c.secondsToStart : 0}
      secs={c.secondsLeft}
      closed={c.state === "closed"}
    />
  );
}

function SealedBidCellGate({
  lot,
  callbacks,
}: {
  lot: SealedBidLot;
  callbacks: Omit<SealedBidColumnCallbacks, "tncRequired">;
}) {
  useSharedSecondTick();
  if (callbacks.clock().state !== "open") return gatedValue();
  return (
    <SealedBidCell
      disabled={false}
      resetKey={callbacks.resetKey(lot.lotId)}
      onSubmit={(n) => callbacks.onSubmit(lot, n)}
      submitting={callbacks.isPending(lot.lotId)}
    />
  );
}

/** The live Bid Status cell, gated on the sealed window instead of lot timers. */
function SealedBidStatusCell({
  lot,
  callbacks,
}: {
  lot: SealedBidLot;
  callbacks: Omit<SealedBidColumnCallbacks, "tncRequired">;
}) {
  useSharedSecondTick();
  const state = callbacks.clock().state;
  return (
    <BidStatusCell
      tncRequired={false}
      notStarted={state === "upcoming"}
      closed={state === "closed"}
      rejectReason={callbacks.rejectReason(lot.lotId)}
      pending={callbacks.isPending(lot.lotId)}
      // Sealed-bids have no outbid state; an accepted bid stays accepted.
      winning={lot.yourBid != null}
      outbid={false}
      proxyAmount={null}
      // Headlines a failed attempt as "Bid Rejected", like rank-based lots.
      rankBased
    />
  );
}

/**
 * Same column ids, headers and sizes as the live bidder table — only the Bid
 * cell differs (plain amount field). Callbacks go through a ref so cell
 * identity stays stable (see useLiveAuctionColumns).
 */
export function useSealedBidColumns(
  callbacks: SealedBidColumnCallbacks,
): ColumnDef<SealedBidLot, unknown>[] {
  const ref = useRef(callbacks);
  ref.current = callbacks;

  const { tncRequired } = callbacks;

  return useMemo(() => {
    const cb: Omit<SealedBidColumnCallbacks, "tncRequired"> = {
      clock: () => ref.current.clock(),
      isPending: (lotId) => ref.current.isPending(lotId),
      resetKey: (lotId) => ref.current.resetKey(lotId),
      rejectReason: (lotId) => ref.current.rejectReason(lotId),
      onSubmit: (lot, amount) => ref.current.onSubmit(lot, amount),
      onToggle: (lot, section) => ref.current.onToggle(lot, section),
    };
    return createSealedBidColumns(tncRequired, cb);
  }, [tncRequired]);
}

function createSealedBidColumns(
  tncRequired: boolean,
  cb: Omit<SealedBidColumnCallbacks, "tncRequired">,
): ColumnDef<SealedBidLot, unknown>[] {
  return [
    {
      id: "lot",
      header: "Lot No.",
      enableHiding: false,
      enableSorting: false,
      maxSize: 300,
      cell: ({ row }) => {
        const lot = row.original;
        return (
          <div className="flex w-[300px] min-w-0 items-center gap-2 overflow-hidden">
            <Button
              type="button"
              variant="link"
              className="h-auto min-w-0 justify-start overflow-hidden p-0 text-left"
              onClick={() => cb.onToggle(lot, "item")}
            >
              <span className="block truncate">
                {lotDisplayLabel(lot.lotNumber)}
              </span>
            </Button>
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
      cell: () => <WindowTimeCell clock={cb.clock} />,
    },
    {
      id: "price",
      header: "Price",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        if (tncRequired) return gatedValue();
        const lot = row.original;
        return (
          <div className="flex flex-col gap-0.5 leading-tight">
            {lot.yourBid != null ? (
              <span className="text-green-foreground font-medium tabular-nums">
                Your Bid: {formatCurrency(lot.yourBid)}
              </span>
            ) : (
              <span className="text-muted-foreground">Your Bid: —</span>
            )}
          </div>
        );
      },
    },
    {
      id: "bid",
      header: "Bid",
      enableHiding: false,
      enableSorting: false,
      size: 220,
      minSize: 220,
      cell: ({ row }) => {
        if (tncRequired) return gatedValue();
        return <SealedBidCellGate lot={row.original} callbacks={cb} />;
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
        if (tncRequired) return gatedValue();
        return <SealedBidStatusCell lot={row.original} callbacks={cb} />;
      },
    },
    {
      id: "action",
      header: "",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Additional Information"
            tooltip="Additional Information"
            onClick={() => cb.onToggle(row.original, "other")}
          >
            <InfoCircle className="size-4" />
          </Button>
        </div>
      ),
    },
  ];
}
