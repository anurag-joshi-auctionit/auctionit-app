import { type ColumnDef, formatCurrency, formatDate } from "@auctionit/ui";
import type { MyEmdForfeiture } from "@/lib/emd/types";

export function getBidderForfeitureColumns(): ColumnDef<MyEmdForfeiture>[] {
  return [
    {
      accessorKey: "reviewedAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{formatDate(row.original.reviewedAt) || "—"}</span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "auctionNumber",
      header: "Auction Details",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.auctionNumber ?? "—"}</span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums">{formatCurrency(row.original.amount)}</span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "dispositionLabel",
      header: "Reason",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm whitespace-normal">
          {row.original.dispositionLabel ?? "—"}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
