import { Button, createSelectColumn, formatCurrency, formatDateTime, type ColumnDef } from "@auctionit/ui";
import { StatusCell } from "@/components/auctions/auction-approval-draft";
import type { PortalApprovalLot } from "@/components/auctions/auction-approval-types";
import { lotDisplayLabel } from "@/lib/portal-display-labels";

function fmtPercent(value: number | null | undefined): string {
  return value == null ? "—" : `${value}%`;
}

function fmtMoney(value: number | null | undefined): string {
  return value == null ? "—" : formatCurrency(value) || "—";
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm leading-snug">
      <span className="text-muted-foreground">{label}: </span>
      <span>{value}</span>
    </div>
  );
}

export function createApprovalLotColumns(opts: {
  onOpenBids: (lot: PortalApprovalLot) => void;
  onOpenBidders: (lot: PortalApprovalLot) => void;
}): ColumnDef<PortalApprovalLot>[] {
  return [
    createSelectColumn<PortalApprovalLot>({
      selectAllAriaLabel: "Select all lots",
      getRowAriaLabel: (rowIndex) => `Select lot ${rowIndex + 1}`,
    }),
    {
      id: "lotDetails",
      header: "Lot Details",
      enableSorting: false,
      enableHiding: false,
      size: 400,
      minSize: 400,
      cell: ({ row }) => {
        const lot = row.original;
        return (
          <div className="min-w-[400px] space-y-0.5 py-1">
            <DetailLine
              label="Lot No."
              value={lotDisplayLabel(lot.lotNumber)}
            />
            <DetailLine
              label="Item Name"
              value={lot.itemName?.trim() || "—"}
            />
            <DetailLine
              label="Plant Location"
              value={lot.plantLocationName?.trim() || "—"}
            />
            <DetailLine
              label="Quantity"
              value={lot.quantity != null ? String(lot.quantity) : "—"}
            />
            <DetailLine label="UOM" value={lot.uom?.trim() || "—"} />
          </div>
        );
      },
    },
    {
      id: "bidDetails",
      header: "Bid Details",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const lot = row.original;
        return (
          <div className="min-w-44 space-y-0.5 py-1">
            <DetailLine
              label="Start Bid Price"
              value={fmtMoney(lot.startBidPrice)}
            />
            <DetailLine
              label="Winning Price"
              value={fmtMoney(lot.winningPrice)}
            />
            <DetailLine
              label="Winning Bidder"
              value={lot.winnerBidderName?.trim() || "—"}
            />
          </div>
        );
      },
    },
    {
      id: "otherCharges",
      header: "Other Charges Details",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="min-w-28 space-y-0.5 py-1">
          <DetailLine
            label="GST %"
            value={fmtPercent(row.original.gstPercentage)}
          />
          <DetailLine
            label="TCS %"
            value={fmtPercent(row.original.tcsPercentage)}
          />
        </div>
      ),
    },
    {
      id: "bidCount",
      header: "No. of Bids",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 tabular-nums"
          onClick={() => opts.onOpenBids(row.original)}
        >
          {row.original.bidCount}
        </Button>
      ),
    },
    {
      id: "bidderCount",
      header: "No. of Bidders",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 tabular-nums"
          onClick={() => opts.onOpenBidders(row.original)}
        >
          {row.original.bidderCount}
        </Button>
      ),
    },
    {
      id: "status",
      header: "Status",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => <StatusCell lot={row.original} />,
    },
    {
      id: "reviewedAt",
      header: "Reviewed At",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {formatDateTime(row.original.reviewedAt) || "—"}
        </span>
      ),
    },
  ];
}
