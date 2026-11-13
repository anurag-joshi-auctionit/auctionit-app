import {
  Badge,
  Button,
  cn,
  formatCurrency,
  HammerIcon,
  type ColumnDef,
} from "@auctionit/ui";
import { InfoCircle } from "@untitledui/icons";
import {
  formatCountdown,
  lotDisplayStatus,
  lotStartLeft,
  lotTimeLeft,
  useSharedSecondTick,
  type MergedLot,
} from "@/lib/use-live-auction";
import { lotDisplayLabel } from "@/lib/portal-display-labels";

export type ClientExpandSection = "item" | "bidders" | "other";

export function lotRowKey(lot: MergedLot): string {
  return `${lot.auctionId}:${lot.id}`;
}

function isClosed(lot: MergedLot): boolean {
  return lot.closed;
}

function TimeLeftCell({ lot }: { lot: MergedLot }) {
  useSharedSecondTick();
  const secs = lotTimeLeft(lot, lot.receivedAt);
  const startLeft = lotStartLeft(lot, lot.receivedAt);
  if (isClosed(lot)) {
    return (
      <Badge color="red" className="w-fit">
        Closed
      </Badge>
    );
  }
  const processing = lotDisplayStatus(lot, lot.receivedAt) === "processing";
  return (
    <span
      className={cn(
        "whitespace-nowrap tabular-nums",
        startLeft <= 0 && secs <= 300 ? "text-red-foreground" : "",
      )}
    >
      {startLeft > 0
        ? `Starts in ${formatCountdown(startLeft)}`
        : processing
          ? "Processing"
          : formatCountdown(secs)}
    </span>
  );
}

function formatStartTime(iso: string | null): string {
  if (!iso) return "—";
  const m = /T(\d{2}):(\d{2})/.exec(iso);
  if (!m) return "—";
  let h = Number(m[1]);
  const min = m[2];
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${min}${ampm}`;
}

function formatEndTime(iso: string | null): string {
  if (!iso) return "—";
  const m = /T(\d{2}):(\d{2}):(\d{2})/.exec(iso);
  if (!m) return formatStartTime(iso);
  let h = Number(m[1]);
  const min = m[2];
  const sec = m[3];
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${min}:${sec}${ampm}`;
}

function EmptyCell() {
  return <span className="text-muted-foreground">—</span>;
}

export function createLiveLotsColumnsClient({
  onToggle,
}: {
  onToggle: (lot: MergedLot, section: ClientExpandSection) => void;
}): ColumnDef<MergedLot, unknown>[] {
  return [
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Additional Information"
          tooltip="Additional Information"
          onClick={() => onToggle(row.original, "other")}
        >
          <InfoCircle className="size-4" />
        </Button>
      ),
    },
    {
      id: "lot",
      header: "Lot No.",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="link"
          className="h-auto max-w-full justify-start p-0 text-left whitespace-normal wrap-break-word"
          onClick={() => onToggle(row.original, "item")}
        >
          {lotDisplayLabel(row.original.lotNumber)}
        </Button>
      ),
    },
    {
      id: "startsAt",
      header: "Start Time",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatStartTime(row.original.startsAt)}
        </span>
      ),
    },
    {
      id: "endsAt",
      header: "End Time",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums">
          {formatEndTime(row.original.endsAt)}
        </span>
      ),
    },
    {
      id: "timeLeft",
      header: "Time Left",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => <TimeLeftCell lot={row.original} />,
    },
    {
      id: "quantity",
      header: "Qty.",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.quantity ?? "—"}</span>
      ),
    },
    {
      id: "uom",
      header: "Unit",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => row.original.uom ?? "—",
    },
    {
      id: "startBidPrice",
      header: "Start Bid Price",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatCurrency(row.original.startBidPrice)}
        </span>
      ),
    },
    {
      id: "currentBid",
      header: "Winning Price",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        const lot = row.original;
        if (lot.winnerBidderId == null) return <EmptyCell />;
        return (
          <span className="font-semibold tabular-nums">
            {formatCurrency(lot.currentBid)}
          </span>
        );
      },
    },
    {
      id: "winner",
      header: "Winning Bidder",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        const lot = row.original;
        if (!lot.winnerBidderName) return <EmptyCell />;
        return (
          <span className="inline-flex items-center gap-2">
            <span>{lot.winnerBidderName}</span>
            <HammerIcon
              className="fill-yellow-foreground text-yellow-foreground size-5 shrink-0"
              aria-label="Winner"
            />
          </span>
        );
      },
    },
    {
      id: "bidCount",
      header: "No. of Bids",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => <span>{row.original.bidCount}</span>,
    },
    {
      id: "bidderCount",
      header: "No. of Bidders",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="link"
          className="h-auto p-0"
          onClick={() => onToggle(row.original, "bidders")}
        >
          {row.original.bidderCount}
        </Button>
      ),
    },
  ];
}
