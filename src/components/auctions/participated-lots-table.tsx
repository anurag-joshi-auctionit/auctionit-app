import { useAuth } from "@auctionit/lib";
import { BidderAccountMessages } from "@auctionit/messages/emd";
import {
  formatCurrency,
  HammerIcon,
  IllustratedEmpty,
  ListDataTable,
  type ColumnDef,
} from "@auctionit/ui";
import { useMemo } from "react";
import {
  bidderLotSearchFilter,
  buildLotSearchKey,
  PlantLocationFilter,
  usePlantLocationFilter,
} from "@/components/auctions/bidder-lot-table-utils";
import { lotDisplayLabel } from "@/lib/portal-display-labels";

export type ParticipatedLot = {
  id: number;
  lotNumber: string | null;
  quantity: number | null;
  uom: string | null;
  plantLocation: string | null;
  materialLocation: string | null;
  myLastBid: number | null;
  winningAmount: number | null;
  winnerBidderId: number | null;
};

type ParticipatedLotRow = ParticipatedLot & { searchKey: string };

export function ParticipatedLotsTable({
  lots,
  isFetching,
}: {
  lots: ParticipatedLot[];
  isFetching?: boolean;
}) {
  const { user } = useAuth();
  const plants = usePlantLocationFilter(lots);

  const data = useMemo(
    (): ParticipatedLotRow[] =>
      plants.filtered.map((lot) => ({
        ...lot,
        searchKey: buildLotSearchKey(lot),
      })),
    [plants.filtered],
  );

  const columns = useMemo((): ColumnDef<ParticipatedLotRow, unknown>[] => {
    return [
      {
        id: "searchKey",
        accessorKey: "searchKey",
        header: () => null,
        cell: () => null,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "lotNumber",
        accessorKey: "lotNumber",
        meta: { label: "Lot No." },
        header: "Lot No.",
        enableHiding: false,
        enableSorting: false,
        size: 300,
        minSize: 300,
        maxSize: 300,
        cell: ({ row }) => {
          const lot = row.original;
          return (
            <span className="flex w-full min-w-0 items-start gap-2 font-medium">
              <span className="min-w-0 flex-1 whitespace-normal wrap-break-word">
                {lotDisplayLabel(lot.lotNumber)}
              </span>
            </span>
          );
        },
      },
      {
        id: "quantity",
        meta: { label: "Qty." },
        header: "Qty.",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">
            {row.original.quantity != null ? row.original.quantity : "—"}
          </span>
        ),
      },
      {
        id: "uom",
        accessorKey: "uom",
        meta: { label: "Unit" },
        header: "Unit",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.uom ?? "—"}</span>
        ),
      },
      {
        id: "plantLocation",
        meta: { label: "Plant Location" },
        header: "Plant Location",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm whitespace-normal wrap-break-word">
            {row.original.plantLocation ?? "—"}
          </span>
        ),
      },
      {
        id: "materialLocation",
        accessorKey: "materialLocation",
        meta: { label: "Material Location" },
        header: "Material Location",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm whitespace-normal wrap-break-word">
            {row.original.materialLocation ?? "—"}
          </span>
        ),
      },
      {
        id: "winningAmount",
        meta: { label: "Winning Price" },
        header: "Winning Price",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">
            {formatCurrency(row.original.winningAmount) || "—"}
          </span>
        ),
      },
      {
        id: "myLastBid",
        meta: { label: "My Price" },
        header: "My Price",
        enableSorting: false,
        cell: ({ row }) => {
          const lot = row.original;
          const iWon =
            lot.winnerBidderId != null &&
            lot.winnerBidderId === user?.bidderCompId;
          return (
            <span className="inline-flex items-center gap-2">
              <span className="text-sm tabular-nums">
                {formatCurrency(lot.myLastBid) || "—"}
              </span>
              {iWon ? (
                <HammerIcon
                  className="fill-yellow-foreground text-yellow-foreground size-5 shrink-0"
                  aria-label="Won"
                />
              ) : null}
            </span>
          );
        },
      },
    ];
  }, [user?.bidderCompId]);

  if (lots.length === 0) {
    return (
      <IllustratedEmpty
        title={BidderAccountMessages.NO_LOTS_ASSIGNED_TITLE}
        description={BidderAccountMessages.NO_LOTS_ASSIGNED_DESCRIPTION}
      />
    );
  }

  return (
    <ListDataTable
      columns={columns}
      data={data}
      getRowId={(row) => String(row.id)}
      initialState={{ columnVisibility: { searchKey: false } }}
      filterColumns={[bidderLotSearchFilter]}
      filterClassName="w-full max-w-xs shrink-0"
      toolbarExtra={
        <PlantLocationFilter
          options={plants.options}
          value={plants.selected}
          onChange={plants.setSelected}
        />
      }
      showPagination
      isFetching={isFetching}
      emptyTitle={BidderAccountMessages.NO_LOTS_ASSIGNED_TITLE}
      emptyDescription={BidderAccountMessages.NO_LOTS_ASSIGNED_DESCRIPTION}
    />
  );
}
