import { useMemo } from "react";
import { useAuth } from "@auctionit/lib";
import { ClientReportsMessages } from "@auctionit/messages/reports";
import {
  DataPanelError,
  formatCurrency,
  formatDate,
  formatTimeOfDay,
  ListDataTable,
  type ColumnDef,
} from "@auctionit/ui";
import { useQuery } from "@tanstack/react-query";
import { reportKeys } from "@/components/reports/query-keys";
import type {
  BidOverviewMode,
  BidOverviewReportRow,
} from "@/components/reports/report-types";
import { lotDisplayLabel } from "@/lib/portal-display-labels";

function timeLabel(iso: string | null): string {
  if (!iso) return "—";
  const m = /T(\d{2}:\d{2}:\d{2})/.exec(iso);
  if (!m) return "—";
  return formatTimeOfDay(m[1]) || "—";
}

function money(value: number | null): string {
  return value == null ? "—" : formatCurrency(value) || "—";
}

export type BidOverviewAppliedFilters = {
  from: string;
  to: string;
  clientIds: number[];
  auctionIds: number[];
  bidMode: BidOverviewMode | null;
};

export function bidOverviewReportQs(applied: BidOverviewAppliedFilters): string {
  const params = new URLSearchParams({ from: applied.from, to: applied.to });
  if (applied.clientIds.length > 0) {
    params.set("clientIds", applied.clientIds.join(","));
  }
  if (applied.auctionIds.length > 0) {
    params.set("auctionIds", applied.auctionIds.join(","));
  }
  if (applied.bidMode) params.set("bidMode", applied.bidMode);
  return params.toString();
}

export function BidOverviewReportTable({
  from,
  to,
  clientIds,
  auctionIds,
  bidMode,
}: BidOverviewAppliedFilters) {
  const { api } = useAuth();

  const qs = useMemo(
    () => bidOverviewReportQs({ from, to, clientIds, auctionIds, bidMode }),
    [from, to, clientIds, auctionIds, bidMode],
  );

  const query = useQuery({
    queryKey: reportKeys.bidOverview({
      from,
      to,
      clientIds,
      auctionIds,
      bidMode,
    }),
    queryFn: () =>
      api.get<BidOverviewReportRow[]>(`/client/reports/bid-overview?${qs}`),
  });

  const columns = useMemo<ColumnDef<BidOverviewReportRow, unknown>[]>(
    () => [
      {
        id: "auctionNumber",
        accessorKey: "auctionNumber",
        header: "Auction No.",
        meta: { label: "Auction No." },
        cell: ({ row }) => row.original.auctionNumber?.trim() || "—",
      },
      {
        id: "auctionDate",
        accessorKey: "auctionDate",
        header: "Auction Date",
        meta: { label: "Auction Date" },
        cell: ({ row }) =>
          formatDate(row.original.auctionDate) ||
          row.original.auctionDate ||
          "—",
      },
      {
        id: "lotNumber",
        accessorKey: "lotNumber",
        header: "Lot No.",
        meta: { label: "Lot No." },
        cell: ({ row }) => lotDisplayLabel(row.original.lotNumber),
      },
      {
        id: "plantLocationName",
        accessorKey: "plantLocationName",
        header: "Plant Location",
        meta: { label: "Plant Location" },
        cell: ({ row }) => row.original.plantLocationName?.trim() || "—",
      },
      {
        id: "quantity",
        accessorKey: "quantity",
        header: "Quantity",
        meta: { label: "Quantity" },
        cell: ({ row }) =>
          row.original.quantity != null ? String(row.original.quantity) : "—",
      },
      {
        id: "unit",
        accessorKey: "unit",
        header: "Unit",
        meta: { label: "Unit" },
        cell: ({ row }) => row.original.unit?.trim() || "—",
      },
      {
        id: "startBidPrice",
        accessorKey: "startBidPrice",
        header: "Start Bid Price",
        meta: { label: "Start Bid Price" },
        cell: ({ row }) => money(row.original.startBidPrice),
      },
      {
        id: "startTime",
        accessorKey: "startTime",
        header: "Start Time",
        meta: { label: "Start Time" },
        cell: ({ row }) => timeLabel(row.original.startTime),
      },
      {
        id: "endTime",
        accessorKey: "endTime",
        header: "End Time",
        meta: { label: "End Time" },
        cell: ({ row }) => timeLabel(row.original.endTime),
      },
      {
        id: "winningBidder",
        accessorKey: "winningBidder",
        header: "Winning Bidder",
        meta: { label: "Winning Bidder" },
        cell: ({ row }) => row.original.winningBidder?.trim() || "—",
      },
      {
        id: "winningPrice",
        accessorKey: "winningPrice",
        header: "Winning Price",
        meta: { label: "Winning Price" },
        cell: ({ row }) => money(row.original.winningPrice),
      },
      {
        id: "bidCount",
        accessorKey: "bidCount",
        header: "No. of Bids",
        meta: { label: "No. of Bids" },
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.bidCount}</span>
        ),
      },
      {
        id: "bidderCount",
        accessorKey: "bidderCount",
        header: "No. of Bidders",
        meta: { label: "No. of Bidders" },
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.bidderCount}</span>
        ),
      },
    ],
    [],
  );

  if (query.isError) {
    return (
      <DataPanelError
        title={ClientReportsMessages.BID_OVERVIEW_LOAD_ERROR_TITLE}
        message={ClientReportsMessages.BID_OVERVIEW_LOAD_ERROR_DESCRIPTION}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <ListDataTable
      columns={columns}
      data={query.data ?? []}
      isFetching={query.isFetching}
      showPagination
      emptyTitle={ClientReportsMessages.BID_OVERVIEW_EMPTY_TITLE}
      emptyDescription={ClientReportsMessages.BID_OVERVIEW_EMPTY_DESCRIPTION}
    />
  );
}
