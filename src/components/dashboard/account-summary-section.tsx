import { useMemo } from "react";
import { useAuth } from "@auctionit/lib";
import { ClientDashboardMessages } from "@auctionit/messages/client-dashboard";
import {
  ListDataTable,
  STATS_CARD_CLASS,
  STATS_STRIP_CLASS,
  type ColumnDef,
} from "@auctionit/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { dashboardKeys } from "@/components/dashboard/query-keys";
import { DashboardStatCard } from "@/components/dashboard/stat-card";
import type {
  DashboardSummary,
  DelayReasonRow,
} from "@/components/dashboard/types";

const QTY_HELP = ClientDashboardMessages.QTY_PMT_HELP;

function getDelayReasonColumns(): ColumnDef<DelayReasonRow>[] {
  return [
    {
      accessorKey: "reason",
      header: "Reason for Delay / Late Lifting",
      cell: ({ row }) => (
        <span className="whitespace-normal break-words">
          {row.original.reason}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "lotCount",
      header: () => <div className="text-right">Lot Count</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums">{row.original.lotCount}</div>
      ),
      size: 100,
      minSize: 100,
      maxSize: 100,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

export function AccountSummarySection({
  clientId,
  from,
  to,
}: {
  clientId: number;
  from: string;
  to: string;
}) {
  const { api } = useAuth();
  const delayColumns = useMemo(() => getDelayReasonColumns(), []);
  const { data } = useSuspenseQuery({
    queryKey: dashboardKeys.summary(clientId, from, to),
    queryFn: () =>
      api.get<DashboardSummary>(
        `/client/dashboard/summary?clientId=${clientId}&from=${from}&to=${to}`,
      ),
  });

  return (
    <div className="space-y-4">
      <div className={STATS_STRIP_CLASS}>
        <DashboardStatCard
          className={STATS_CARD_CLASS}
          tone="purple"
          label="Total Auctions Held"
          metric={data.totalAuctions}
        />
        <DashboardStatCard
          className={STATS_CARD_CLASS}
          tone="rose"
          label="Total Bid Qty."
          helpMessage={QTY_HELP}
          metric={data.totalBidQtyMt}
          format="qty"
        />
        <DashboardStatCard
          className={STATS_CARD_CLASS}
          tone="lime"
          label="Total Bid Value"
          metric={data.totalBidValueCr}
          format="cr"
        />
        <DashboardStatCard
          className={STATS_CARD_CLASS}
          tone="blue"
          label="Total Approved Qty."
          helpMessage={QTY_HELP}
          metric={data.totalApprovedQtyMt}
          format="qty"
        />
        <DashboardStatCard
          className={STATS_CARD_CLASS}
          tone="green"
          label="Total Lifted Qty. (till date)"
          helpMessage={QTY_HELP}
          metric={data.totalLiftedQtyMt}
          format="qty"
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[2fr_3fr]">
        <div className="grid grid-cols-2 gap-4">
          <DashboardStatCard
            tone="grey"
            label="Bidders Attached"
            metric={data.attachedBidders}
          />
          <DashboardStatCard
            tone="grey"
            label="Bidders Participated"
            metric={data.participatedBidders}
          />
          <DashboardStatCard
            tone="grey"
            label="New Bidders"
            metric={data.newBidders}
          />
          <DashboardStatCard
            tone="grey"
            label="No. of Auctions (Bidder < 5)"
            metric={data.auctionsBidderLt5}
          />
          <DashboardStatCard
            tone="grey"
            label="No. of Auctions (Bidder 5-10)"
            metric={data.auctionsBidder5To10}
          />
          <DashboardStatCard
            tone="grey"
            label="No. of Auctions (Bidder 10+)"
            metric={data.auctionsBidderGt10}
          />
        </div>

        <ListDataTable
          columns={delayColumns}
          data={data.delayReasons}
          getRowId={(row) => row.reason}
          showPagination
          initialState={{ pagination: { pageIndex: 0, pageSize: 5 } }}
          tableClassName="w-full"
          emptyTitle={ClientDashboardMessages.DELAY_EMPTY_TITLE}
          emptyDescription={ClientDashboardMessages.DELAY_EMPTY_DESCRIPTION}
        />
      </div>
    </div>
  );
}
