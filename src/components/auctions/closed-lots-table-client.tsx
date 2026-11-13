import { bidStepLabel } from "@auctionit/lib/bid-increment-vs-price";
import { ClientPortalAuctionMessages } from "@auctionit/messages/auctions";
import {
  Button,
  formatCurrency,
  formatTimeOfDay,
  HammerIcon,
  ListDataTable,
  type ColumnDef,
} from "@auctionit/ui";
import { InfoCircle } from "@untitledui/icons";
import type { ExpandedState, OnChangeFn } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import {
  bidderLotSearchFilter,
  buildLotSearchKey,
} from "@/components/auctions/bidder-lot-table-utils";
import { LotBiddersPanelClient } from "@/components/auctions/lot-expand-panels-client";
import {
  LotItemsPanel,
  LotOtherPanel,
} from "@/components/live-auction/lot-detail-panels";
import { lotDisplayLabel } from "@/lib/portal-display-labels";
import type { MergedLot } from "@/lib/use-live-auction";

export type ClosedLot = {
  id: number;
  lotNumber: string | null;
  startTime: string | null;
  endTime: string | null;
  quantity: number | null;
  uom: string | null;
  startBidPrice: number | null;
  bidIncrement: number | null;
  winningPrice: number | null;
  winnerBidderId: number | null;
  winnerBidderName: string | null;
  bidCount: number;
  bidderCount: number;
};

type ExpandSection = "item" | "bidders" | "other";
type ClosedLotRow = ClosedLot & { searchKey: string };

function timeLabel(iso: string | null): string {
  if (!iso) return "—";
  const m = /T(\d{2}:\d{2}:\d{2})/.exec(iso);
  if (!m) return "—";
  return formatTimeOfDay(m[1]) || "—";
}

function asLot(lot: ClosedLot, auctionType: string | null): MergedLot {
  return { id: lot.id, auctionType } as MergedLot;
}

export function ClosedLotsTableClient({
  lots,
  auctionType,
}: {
  lots: ClosedLot[];
  auctionType: string | null;
}) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, ExpandSection | null>
  >({});
  const stepLabel = bidStepLabel(auctionType);

  const data = useMemo(
    (): ClosedLotRow[] =>
      lots.map((lot) => ({
        ...lot,
        searchKey: buildLotSearchKey(lot),
      })),
    [lots],
  );

  const toggle = useCallback((lot: ClosedLot, section: ExpandSection) => {
    const key = String(lot.id);
    setExpandedSections((prev) => ({
      ...prev,
      [key]: prev[key] === section ? null : section,
    }));
  }, []);

  const columns = useMemo<ColumnDef<ClosedLotRow, unknown>[]>(
    () => [
      {
        id: "searchKey",
        accessorKey: "searchKey",
        header: () => null,
        cell: () => null,
        enableSorting: false,
        enableHiding: false,
      },
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
            onClick={() => toggle(row.original, "other")}
          >
            <InfoCircle className="size-4" />
          </Button>
        ),
      },
      {
        id: "lot",
        meta: { label: "Lot No." },
        header: "Lot No.",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            onClick={() => toggle(row.original, "item")}
          >
            {lotDisplayLabel(row.original.lotNumber)}
          </Button>
        ),
      },
      {
        id: "startTime",
        meta: { label: "Start Time" },
        header: "Start Time",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {timeLabel(row.original.startTime)}
          </span>
        ),
      },
      {
        id: "endTime",
        meta: { label: "End Time" },
        header: "End Time",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {timeLabel(row.original.endTime)}
          </span>
        ),
      },
      {
        id: "quantity",
        meta: { label: "Qty." },
        header: "Qty.",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.quantity ?? "—"}</span>
        ),
      },
      {
        id: "uom",
        meta: { label: "Unit" },
        header: "Unit",
        enableSorting: false,
        cell: ({ row }) => row.original.uom ?? "—",
      },
      {
        id: "startBidPrice",
        meta: { label: "Start Bid Price" },
        header: "Start Bid Price",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.startBidPrice != null
              ? formatCurrency(row.original.startBidPrice)
              : "—"}
          </span>
        ),
      },
      {
        id: "bidIncrement",
        meta: { label: stepLabel },
        header: stepLabel,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="tabular-nums">
            {row.original.bidIncrement != null
              ? formatCurrency(row.original.bidIncrement)
              : "—"}
          </span>
        ),
      },
      {
        id: "winningPrice",
        meta: { label: "Winning Price" },
        header: "Winning Price",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.winnerBidderId == null ||
          row.original.winningPrice == null ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <span className="font-semibold tabular-nums">
              {formatCurrency(row.original.winningPrice)}
            </span>
          ),
      },
      {
        id: "winner",
        meta: { label: "Winning Bidder" },
        header: "Winning Bidder",
        enableSorting: false,
        cell: ({ row }) => {
          if (!row.original.winnerBidderName) {
            return <span className="text-muted-foreground">—</span>;
          }
          return (
            <span className="inline-flex items-center gap-2">
              <span>{row.original.winnerBidderName}</span>
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
        meta: { label: "No. of Bids" },
        header: "No. of Bids",
        enableSorting: false,
        cell: ({ row }) => <span>{row.original.bidCount}</span>,
      },
      {
        id: "bidderCount",
        meta: { label: "No. of Bidders" },
        header: "No. of Bidders",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            onClick={() => toggle(row.original, "bidders")}
          >
            {row.original.bidderCount}
          </Button>
        ),
      },
    ],
    [stepLabel, toggle],
  );

  const expanded: ExpandedState = useMemo(() => {
    const next: Record<string, boolean> = {};
    for (const [key, section] of Object.entries(expandedSections)) {
      if (section != null) next[key] = true;
    }
    return next;
  }, [expandedSections]);

  const onExpandedChange: OnChangeFn<ExpandedState> = useCallback(
    (updater) => {
      const next = typeof updater === "function" ? updater(expanded) : updater;
      if (next === true) return;
      setExpandedSections((prev) => {
        const out: Record<string, ExpandSection | null> = {};
        for (const [key, section] of Object.entries(prev)) {
          if (next[key]) out[key] = section;
        }
        return out;
      });
    },
    [expanded],
  );

  const renderSubComponent = useCallback(
    ({ row }: { row: { original: ClosedLotRow } }) => {
      const lot = row.original;
      const section = expandedSections[String(lot.id)];
      if (!section) return null;
      const onClose = () => toggle(lot, section);
      if (section === "item") {
        return (
          <LotItemsPanel lot={asLot(lot, auctionType)} onClose={onClose} />
        );
      }
      if (section === "other") {
        return (
          <LotOtherPanel lot={asLot(lot, auctionType)} onClose={onClose} />
        );
      }
      return (
        <LotBiddersPanelClient
          lotId={lot.id}
          bidCount={lot.bidCount}
          onClose={onClose}
        />
      );
    },
    [auctionType, expandedSections, toggle],
  );

  return (
    <ListDataTable
      columns={columns}
      data={data}
      getRowId={(lot) => String(lot.id)}
      initialState={{ columnVisibility: { searchKey: false } }}
      filterColumns={[bidderLotSearchFilter]}
      filterClassName="w-full max-w-xs shrink-0"
      showPagination
      tableClassName="w-full"
      getRowCanExpand={() => true}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      renderSubComponent={renderSubComponent}
      emptyTitle={ClientPortalAuctionMessages.UPCOMING_EMPTY_TITLE}
      emptyDescription={ClientPortalAuctionMessages.UPCOMING_EMPTY_DESCRIPTION}
    />
  );
}
