import { bidStepLabel } from "@auctionit/lib/bid-increment-vs-price";
import { ClientPortalAuctionMessages } from "@auctionit/messages/auctions";
import {
  Button,
  formatCurrency,
  formatTimeOfDay,
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
import {
  LotItemsPanel,
  LotOtherPanel,
} from "@/components/live-auction/lot-detail-panels";
import { lotDisplayLabel } from "@/lib/portal-display-labels";
import type { MergedLot } from "@/lib/use-live-auction";

export type UpcomingLot = {
  id: number;
  lotNumber: string | null;
  startTime: string | null;
  endTime: string | null;
  quantity: number | null;
  uom: string | null;
  startBidPrice: number | null;
  bidIncrement: number | null;
};

type ExpandSection = "item" | "other";
type UpcomingLotRow = UpcomingLot & { searchKey: string };

function timeLabel(iso: string | null): string {
  if (!iso) return "—";
  const m = /T(\d{2}:\d{2}:\d{2})/.exec(iso);
  if (!m) return "—";
  return formatTimeOfDay(m[1]) || "—";
}

function asLot(lot: UpcomingLot, auctionType: string | null): MergedLot {
  return { id: lot.id, auctionType } as MergedLot;
}

export function UpcomingLotsTableClient({
  lots,
  auctionType,
}: {
  lots: UpcomingLot[];
  auctionType: string | null;
}) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, ExpandSection | null>
  >({});
  const stepLabel = bidStepLabel(auctionType);

  const data = useMemo(
    (): UpcomingLotRow[] =>
      lots.map((lot) => ({
        ...lot,
        searchKey: buildLotSearchKey(lot),
      })),
    [lots],
  );

  const toggle = useCallback((lot: UpcomingLot, section: ExpandSection) => {
    const key = String(lot.id);
    setExpandedSections((prev) => ({
      ...prev,
      [key]: prev[key] === section ? null : section,
    }));
  }, []);

  const columns = useMemo<ColumnDef<UpcomingLotRow, unknown>[]>(
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
    ({ row }: { row: { original: UpcomingLotRow } }) => {
      const lot = row.original;
      const section = expandedSections[String(lot.id)];
      if (!section) return null;
      const merged = asLot(lot, auctionType);
      const onClose = () => toggle(lot, section);
      if (section === "item") {
        return <LotItemsPanel lot={merged} onClose={onClose} />;
      }
      return <LotOtherPanel lot={merged} onClose={onClose} />;
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
