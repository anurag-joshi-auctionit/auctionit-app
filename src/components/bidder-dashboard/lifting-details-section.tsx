import { useMemo } from "react";
import { useAuth } from "@auctionit/lib";
import { BidderDashboardMessages } from "@auctionit/messages/bidder-dashboard";
import {
  HelpText,
  ListDataTable,
  formatCurrencyIndian,
  type ColumnDef,
} from "@auctionit/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { bidderDashboardKeys } from "@/components/bidder-dashboard/query-keys";
import {
  DashboardSimpleStatCard,
  formatMetricValue,
} from "@/components/dashboard/stat-card";
import type {
  BidderLiftingDetails,
  BidderLiftingSellerRow,
} from "@/components/bidder-dashboard/types";

const QTY_HELP = BidderDashboardMessages.QTY_PMT_HELP;

function QtyCell({ value }: { value: number }) {
  return (
    <span className="tabular-nums">{formatMetricValue(value, "qty")}</span>
  );
}

function MoneyCell({ value }: { value: number }) {
  return (
    <span className="tabular-nums">
      {formatCurrencyIndian(value) || "—"}
    </span>
  );
}

function QtyHeader({ title }: { title: string }) {
  return (
    <div className="inline-flex items-center justify-end gap-1">
      <span>{title}</span>
      <HelpText message={QTY_HELP} />
    </div>
  );
}

function getColumns(): ColumnDef<BidderLiftingSellerRow>[] {
  return [
    {
      accessorKey: "clientName",
      header: "Seller",
      cell: ({ row }) => row.original.clientName ?? "—",
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "materialApprovedMt",
      header: () => (
        <div className="text-right">
          <QtyHeader title="Approved Qty." />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          <QtyCell value={row.original.materialApprovedMt} />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "materialLiftedMt",
      header: () => (
        <div className="text-right">
          <QtyHeader title="Lifted Qty." />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          <QtyCell value={row.original.materialLiftedMt} />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "materialPendingMt",
      header: () => (
        <div className="text-right">
          <QtyHeader title="Balance Qty." />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          <QtyCell value={row.original.materialPendingMt} />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "approvedValue",
      header: () => <div className="text-right">Approved Value</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <MoneyCell value={row.original.approvedValue} />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "liftedValue",
      header: () => <div className="text-right">Lifted Value</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <MoneyCell value={row.original.liftedValue} />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

export function LiftingDetailsPanel({
  from,
  to,
  clientId,
  plantLocationId,
  itemId,
}: {
  from: string;
  to: string;
  clientId: number | null;
  plantLocationId: number | null;
  itemId: number | null;
}) {
  const { api } = useAuth();
  const { data, isFetching } = useSuspenseQuery({
    queryKey: bidderDashboardKeys.lifting(
      from,
      to,
      clientId,
      plantLocationId,
      itemId,
    ),
    queryFn: () => {
      const qs = new URLSearchParams({ from, to });
      if (clientId != null) qs.set("clientId", String(clientId));
      if (plantLocationId != null) {
        qs.set("plantLocationId", String(plantLocationId));
      }
      if (itemId != null) qs.set("itemId", String(itemId));
      return api.get<BidderLiftingDetails>(
        `/bidder/dashboard/lifting?${qs.toString()}`,
      );
    },
  });

  const columns = useMemo(() => getColumns(), []);
  const { summary, rows } = data;

  const tableRows = useMemo(() => {
    if (rows.length === 0) return rows;
    const total: BidderLiftingSellerRow = {
      clientId: -1,
      clientName: "Total",
      materialApprovedMt: summary.materialApprovedMt,
      materialLiftedMt: summary.materialLiftedMt,
      materialPendingMt: summary.materialPendingMt,
      approvedValue: summary.approvedValue,
      liftedValue: summary.liftedValue,
    };
    return [...rows, total];
  }, [rows, summary]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <DashboardSimpleStatCard
          tone="blue"
          label="Approved Qty."
          helpMessage={QTY_HELP}
          value={summary.materialApprovedMt}
          format="qty"
        />
        <DashboardSimpleStatCard
          tone="green"
          label="Lifted Qty."
          helpMessage={QTY_HELP}
          value={summary.materialLiftedMt}
          format="qty"
        />
        <DashboardSimpleStatCard
          tone="yellow"
          label="Balance Qty."
          helpMessage={QTY_HELP}
          value={summary.materialPendingMt}
          format="qty"
        />
        <DashboardSimpleStatCard
          tone="grey"
          label="Approved Value"
          value={summary.approvedValue}
          format="cr"
        />
        <DashboardSimpleStatCard
          tone="grey"
          label="Lifted Value"
          value={summary.liftedValue}
          format="cr"
        />
      </div>

      <ListDataTable
        columns={columns}
        data={tableRows}
        getRowId={(row) => String(row.clientId)}
        isFetching={isFetching}
        showPagination
        emptyTitle={BidderDashboardMessages.LIFTING_EMPTY_TITLE}
        emptyDescription={BidderDashboardMessages.LIFTING_EMPTY_DESCRIPTION}
      />
    </div>
  );
}
