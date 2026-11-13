import { useAuth } from "@auctionit/lib";
import { formatDateTimeMicroseconds } from "@auctionit/lib/date";
import { ClientPortalAuctionMessages } from "@auctionit/messages/auctions";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  formatCurrency,
  HammerIcon,
  ListDataTable,
  Skeleton,
  Spinner,
  type ColumnDef,
} from "@auctionit/ui";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { XClose } from "@untitledui/icons";
import { useMemo, type ReactNode } from "react";
import { lotDisplayLabel } from "@/lib/portal-display-labels";

function Panel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose?: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-lg font-medium">{title}</div>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close"
            className="-mr-1"
            onClick={onClose}
          >
            <XClose className="size-4" />
          </Button>
        ) : null}
      </div>
      {children}
    </>
  );
}

function Loading() {
  return (
    <div className="text-muted-foreground flex items-center gap-2 py-3 text-sm">
      <Spinner className="size-4" /> Loading…
    </div>
  );
}

function formatBidTime(iso: string | null): string {
  if (!iso) return "—";
  return formatDateTimeMicroseconds(iso) || "—";
}

function WinnerMark() {
  return (
    <HammerIcon
      className="fill-yellow-foreground text-yellow-foreground size-5 shrink-0"
      aria-label="Winner"
    />
  );
}

type LotBid = {
  id: number;
  bidderId: number;
  bidderName: string | null;
  amount: number;
  isProxy: boolean;
  proxyAmount: number | null;
  placedAt: string | null;
};

type LotBidder = {
  bidderId: number;
  bidderName: string | null;
  bids: number;
  bestAmount: number | null;
  lastBidAt: string | null;
  isWinner: boolean;
  /** Live rank on rank-based auctions; null otherwise. */
  rank: number | null;
};

function lotBidColumns(opts?: {
  winnerBidderId?: number | null;
  winningAmount?: number | null;
}): ColumnDef<LotBid, unknown>[] {
  const hasWinnerMatch =
    opts?.winnerBidderId != null && opts?.winningAmount != null;
  return [
    {
      id: "company",
      header: "Company",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        const isWinner = hasWinnerMatch
          ? row.original.bidderId === opts!.winnerBidderId &&
            row.original.amount === opts!.winningAmount
          : row.index === 0;
        return (
          <span className="inline-flex items-center gap-2 font-medium">
            {row.original.bidderName ?? `#${row.original.bidderId}`}
            {isWinner ? <WinnerMark /> : null}
          </span>
        );
      },
    },
    {
      id: "placedAt",
      header: "Bid Time",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatBidTime(row.original.placedAt)}
        </span>
      ),
    },
    {
      id: "amount",
      header: () => <span className="block text-right">Bid Placed</span>,
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="block text-right font-semibold tabular-nums">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      id: "bidType",
      header: "Bid Type",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) =>
        row.original.isProxy ? (
          <Badge color="blue">Proxy</Badge>
        ) : (
          <Badge color="grey">Manual</Badge>
        ),
    },
    {
      id: "proxyAmount",
      header: () => <span className="block text-right">Proxy Bid</span>,
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="block text-right tabular-nums">
          {row.original.proxyAmount != null
            ? formatCurrency(row.original.proxyAmount)
            : "—"}
        </span>
      ),
    },
  ];
}

// Shown only on rank-based auctions — the API sends ranks only there, already
// sorted by rank.
const LOT_BIDDER_RANK_COLUMN: ColumnDef<LotBidder, unknown> = {
    id: "rank",
    header: "Rank",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) =>
      row.original.rank != null ? (
        <Badge color={row.original.rank === 1 ? "green" : "grey"}>
          #{row.original.rank}
        </Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  };

function lotBidderColumns(
  bidders: LotBidder[] | undefined,
): ColumnDef<LotBidder, unknown>[] {
  return bidders?.some((b) => b.rank != null)
    ? [
        LOT_BIDDER_COLUMNS[0],
        LOT_BIDDER_RANK_COLUMN,
        ...LOT_BIDDER_COLUMNS.slice(1),
      ]
    : LOT_BIDDER_COLUMNS;
}

const LOT_BIDDER_COLUMNS: ColumnDef<LotBidder, unknown>[] = [
  {
    id: "company",
    header: "Company",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2 font-medium">
        {row.original.bidderName ?? "—"}
        {row.original.isWinner ? <WinnerMark /> : null}
      </span>
    ),
  },
  {
    id: "bids",
    header: () => <span className="block text-right">Bids</span>,
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => (
      <span className="block text-right tabular-nums">{row.original.bids}</span>
    ),
  },
  {
    id: "bestAmount",
    header: () => <span className="block text-right">Best Bid</span>,
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => (
      <span className="block text-right tabular-nums">
        {row.original.bestAmount != null
          ? formatCurrency(row.original.bestAmount)
          : "—"}
      </span>
    ),
  },
  {
    id: "lastBidAt",
    header: "Last Bid",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs whitespace-nowrap">
        {formatBidTime(row.original.lastBidAt)}
      </span>
    ),
  },
];

export function LotBidsPanelClient({
  lotId,
  bidCount,
  winnerBidderId = null,
  winningAmount = null,
  onClose,
  showTitle = true,
}: {
  lotId: number;
  bidCount: number;
  winnerBidderId?: number | null;
  winningAmount?: number | null;
  onClose?: () => void;
  showTitle?: boolean;
}) {
  const { api } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["client-lot-bids", lotId, bidCount],
    queryFn: () => api.get<LotBid[]>(`/live/lots/${lotId}/bids`),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo(
    () => lotBidColumns({ winnerBidderId, winningAmount }),
    [winnerBidderId, winningAmount],
  );

  const table = isLoading ? (
    <Loading />
  ) : (
    <ListDataTable
      columns={columns}
      data={data ?? []}
      getRowId={(b) => String(b.id)}
      clientPagination={false}
      tableClassName="w-full"
      emptyTitle={ClientPortalAuctionMessages.BIDS_EMPTY_TITLE}
      emptyDescription={ClientPortalAuctionMessages.BIDS_EMPTY_DESCRIPTION}
    />
  );

  if (!showTitle) return table;
  if (isLoading) {
    return (
      <Panel title="Bid Details" onClose={onClose}>
        <Loading />
      </Panel>
    );
  }
  return (
    <Panel title="Bid Details" onClose={onClose}>
      {table}
    </Panel>
  );
}

export function LotBiddersPanelClient({
  lotId,
  bidCount,
  onClose,
  showTitle = true,
}: {
  lotId: number;
  bidCount: number;
  onClose?: () => void;
  showTitle?: boolean;
}) {
  const { api } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["client-lot-bidders", lotId, bidCount],
    queryFn: () => api.get<LotBidder[]>(`/live/lots/${lotId}/bidders`),
    placeholderData: keepPreviousData,
  });
  const columns = useMemo(() => lotBidderColumns(data), [data]);

  const table = isLoading ? (
    <Loading />
  ) : (
    <ListDataTable
      columns={columns}
      data={data ?? []}
      getRowId={(b) => String(b.bidderId)}
      clientPagination={false}
      tableClassName="w-full"
      emptyTitle={ClientPortalAuctionMessages.BIDDERS_EMPTY_TITLE}
      emptyDescription={
        ClientPortalAuctionMessages.BIDDERS_EMPTY_DESCRIPTION
      }
    />
  );

  if (!showTitle) return table;
  if (isLoading) {
    return (
      <Panel title="Bidder Details" onClose={onClose}>
        <Loading />
      </Panel>
    );
  }
  return (
    <Panel title="Bidder Details" onClose={onClose}>
      {table}
    </Panel>
  );
}

export function ViewLotBidsDialogClient({
  lotId,
  lotNumber,
  bidCount,
  winnerBidderId = null,
  winningAmount = null,
  onClose,
}: {
  lotId: number;
  lotNumber?: string | null;
  bidCount: number;
  winnerBidderId?: number | null;
  winningAmount?: number | null;
  onClose: () => void;
}) {
  const { api } = useAuth();
  const query = useQuery({
    queryKey: ["client-lot-bids", lotId, bidCount],
    queryFn: () => api.get<LotBid[]>(`/live/lots/${lotId}/bids`),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo(
    () => lotBidColumns({ winnerBidderId, winningAmount }),
    [winnerBidderId, winningAmount],
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[min(70vh,50rem)] max-h-[min(80vh,50rem)] flex-col gap-4 overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bid Details</DialogTitle>
          <DialogDescription>
            {lotDisplayLabel(lotNumber)}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {query.isLoading && !query.data ? (
            <div className="space-y-2 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <ListDataTable
              columns={columns}
              data={query.data ?? []}
              getRowId={(b) => String(b.id)}
              clientPagination={false}
              tableClassName="w-full"
              isFetching={query.isFetching}
              emptyTitle={ClientPortalAuctionMessages.BIDS_EMPTY_TITLE}
              emptyDescription={
                ClientPortalAuctionMessages.BIDS_EMPTY_DESCRIPTION
              }
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ViewLotBiddersDialogClient({
  lotId,
  lotNumber,
  bidCount,
  onClose,
}: {
  lotId: number;
  lotNumber?: string | null;
  bidCount: number;
  onClose: () => void;
}) {
  const { api } = useAuth();
  const query = useQuery({
    queryKey: ["client-lot-bidders", lotId, bidCount],
    queryFn: () => api.get<LotBidder[]>(`/live/lots/${lotId}/bidders`),
    placeholderData: keepPreviousData,
  });
  const columns = useMemo(() => lotBidderColumns(query.data), [query.data]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bidder Details</DialogTitle>
          <DialogDescription>
            {lotDisplayLabel(lotNumber)}
          </DialogDescription>
        </DialogHeader>
        {query.isLoading && !query.data ? (
          <div className="space-y-2 py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : (
          <ListDataTable
            columns={columns}
            data={query.data ?? []}
            getRowId={(b) => String(b.bidderId)}
            showPagination
            tableClassName="w-full"
            isFetching={query.isFetching}
            emptyTitle={ClientPortalAuctionMessages.BIDDERS_EMPTY_TITLE}
            emptyDescription={
              ClientPortalAuctionMessages.BIDDERS_EMPTY_DESCRIPTION
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
