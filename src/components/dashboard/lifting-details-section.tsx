import { useMemo } from "react";
import { useAuth } from "@auctionit/lib";
import { ClientDashboardMessages } from "@auctionit/messages/client-dashboard";
import {
  HelpText,
  ListDataTable,
  formatDate,
  type ColumnDef,
} from "@auctionit/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { dashboardKeys } from "@/components/dashboard/query-keys";
import {
  DashboardSimpleStatCard,
  formatMetricValue,
} from "@/components/dashboard/stat-card";
import type {
  LiftingAuctionRow,
  LiftingDetails,
} from "@/components/dashboard/types";

const QTY_HELP = ClientDashboardMessages.QTY_PMT_HELP;

function QtyCell({ value }: { value: number }) {
  return (
    <span className="tabular-nums">{formatMetricValue(value, "qty")}</span>
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

function getLiftingColumns(): ColumnDef<LiftingAuctionRow>[] {
  return [
    {
      accessorKey: "auctionNumber",
      header: "Auction No.",
      cell: ({ row }) => (
        <span className="max-w-[280px] truncate text-xs">
          {row.original.auctionNumber ?? "—"}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "auctionDate",
      header: "Auction Date",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDate(row.original.auctionDate) || "—"}
        </span>
      ),
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
          <QtyHeader title="Pending Qty." />
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
      accessorKey: "breakUp0To5",
      header: () => <div className="text-right">Lifted Qty. (0–5 days)</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <QtyCell value={row.original.breakUp0To5} />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "breakUp6To10",
      header: () => <div className="text-right">Lifted Qty. (6-10 days)</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <QtyCell value={row.original.breakUp6To10} />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "breakUpBeyond10",
      header: () => <div className="text-right">Lifted Qty. (10+ days)</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <QtyCell value={row.original.breakUpBeyond10} />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

export function LiftingDetailsSection({
  clientId,
  from,
  to,
}: {
  clientId: number;
  from: string;
  to: string;
}) {
  const { api } = useAuth();
  const { data, isFetching } = useSuspenseQuery({
    queryKey: dashboardKeys.lifting(clientId, from, to),
    queryFn: () =>
      api.get<LiftingDetails>(
        `/client/dashboard/lifting?clientId=${clientId}&from=${from}&to=${to}`,
      ),
  });

  const { summary, rows } = data;
  const columns = useMemo(() => getLiftingColumns(), []);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          label="Pending Qty."
          helpMessage={QTY_HELP}
          value={summary.materialPendingMt}
          format="qty"
        />
        <DashboardSimpleStatCard
          tone="grey"
          label="Lifted Qty. (0–5 days)"
          value={summary.breakUp0To5}
          format="qty"
        />
        <DashboardSimpleStatCard
          tone="grey"
          label="Lifted Qty. (6-10 days)"
          value={summary.breakUp6To10}
          format="qty"
        />
        <DashboardSimpleStatCard
          tone="grey"
          label="Lifted Qty. (10+ days)"
          value={summary.breakUpBeyond10}
          format="qty"
        />
      </div>

      <ListDataTable
        columns={columns}
        data={rows}
        getRowId={(row) => String(row.auctionId)}
        isFetching={isFetching}
        showPagination
        emptyTitle={ClientDashboardMessages.LIFTING_EMPTY_TITLE}
        emptyDescription={ClientDashboardMessages.LIFTING_EMPTY_DESCRIPTION}
      />
    </div>
  );
}
