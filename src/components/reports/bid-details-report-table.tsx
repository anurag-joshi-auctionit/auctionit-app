import { useMemo } from "react";
import { ApiError, useAuth } from "@auctionit/lib";
import { ClientReportsMessages } from "@auctionit/messages/reports";
import {
  DataPanelError,
  formatCurrency,
  formatDate,
  formatDateTimeMicroseconds,
  formatTimeOfDay,
  ListDataTable,
  type ColumnDef,
} from "@auctionit/ui";
import { useQuery } from "@tanstack/react-query";
import type { BidDetailsReportRow } from "@/components/reports/report-types";
import { reportKeys } from "@/components/reports/query-keys";
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

export function bidDetailsReportQs(clientId: number, auctionId: number): string {
  return `clientId=${clientId}&auctionId=${auctionId}`;
}

export function BidDetailsReportTable({
  clientId,
  auctionId,
}: {
  clientId: number;
  auctionId: number;
}) {
  const { api } = useAuth();
  const qs = bidDetailsReportQs(clientId, auctionId);

  const query = useQuery({
    queryKey: reportKeys.bidDetails(clientId, auctionId),
    queryFn: () =>
      api.get<BidDetailsReportRow[]>(`/client/reports/bid-details?${qs}`),
  });

  const columns = useMemo<ColumnDef<BidDetailsReportRow, unknown>[]>(
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
        id: "bidderName",
        accessorKey: "bidderName",
        header: "Bidder Name",
        meta: { label: "Bidder Name" },
        cell: ({ row }) => row.original.bidderName?.trim() || "—",
      },
      {
        id: "bidTime",
        accessorKey: "bidTime",
        header: "Bid Time",
        meta: { label: "Bid Time" },
        cell: ({ row }) =>
          formatDateTimeMicroseconds(row.original.bidTime) ||
          row.original.bidTime?.replace("T", " ") ||
          "—",
      },
      {
        id: "bidBasis",
        accessorKey: "bidBasis",
        header: "Unit",
        meta: { label: "Unit" },
        cell: ({ row }) => row.original.bidBasis?.trim() || "—",
      },
      {
        id: "bidPrice",
        accessorKey: "bidPrice",
        header: "Bid Price",
        meta: { label: "Bid Price" },
        cell: ({ row }) => money(row.original.bidPrice),
      },
      {
        id: "bidType",
        accessorKey: "bidType",
        header: "Bid Type",
        meta: { label: "Bid Type" },
        cell: ({ row }) => row.original.bidType || "—",
      },
      {
        id: "quantity",
        accessorKey: "quantity",
        header: "Quantity",
        meta: { label: "Quantity" },
        cell: ({ row }) =>
          row.original.quantity != null ? String(row.original.quantity) : "—",
      },
    ],
    [],
  );

  if (query.isError) {
    const message =
      query.error instanceof ApiError
        ? query.error.message
        : ClientReportsMessages.BID_DETAILS_LOAD_ERROR_DESCRIPTION;
    return (
      <DataPanelError
        title={ClientReportsMessages.BID_DETAILS_LOAD_ERROR_TITLE}
        message={message}
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
      emptyTitle={ClientReportsMessages.BID_DETAILS_EMPTY_TITLE}
      emptyDescription={ClientReportsMessages.BID_DETAILS_EMPTY_DESCRIPTION}
      initialState={{
        columnVisibility: { auctionNumber: false, auctionDate: false },
      }}
    />
  );
}
