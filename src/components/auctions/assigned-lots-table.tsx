import { bidStepLabel } from "@auctionit/lib";
import { BidderAccountMessages } from "@auctionit/messages/emd";
import {
  formatCurrency,
  formatTimeOfDay,
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

export type AssignedLot = {
  id: number;
  lotNumber: string | null;
  startTime: string | null;
  endTime: string | null;
  quantity: number | null;
  uom: string | null;
  bidIncrement: number | null;
  plantLocation: string | null;
  materialLocation: string | null;
};

type AssignedLotRow = AssignedLot & { searchKey: string };

export function AssignedLotsTable({
  lots,
  auctionType,
  isFetching,
}: {
  lots: AssignedLot[];
  auctionType: string | null;
  isFetching?: boolean;
}) {
  const stepHeader = bidStepLabel(auctionType);
  const plants = usePlantLocationFilter(lots);

  const data = useMemo(
    (): AssignedLotRow[] =>
      plants.filtered.map((lot) => ({
        ...lot,
        searchKey: buildLotSearchKey(lot),
      })),
    [plants.filtered],
  );

  const columns = useMemo((): ColumnDef<AssignedLotRow, unknown>[] => {
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
        cell: ({ row }) => (
          <span className="font-medium whitespace-normal wrap-break-word">
            {lotDisplayLabel(row.original.lotNumber)}
          </span>
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
        id: "startTime",
        meta: { label: "Start Time" },
        header: "Start Time",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm whitespace-nowrap">
            {row.original.startTime
              ? formatTimeOfDay(row.original.startTime) || "—"
              : "—"}
          </span>
        ),
      },
      {
        id: "endTime",
        meta: { label: "End Time" },
        header: "End Time",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm whitespace-nowrap">
            {row.original.endTime
              ? formatTimeOfDay(row.original.endTime) || "—"
              : "—"}
          </span>
        ),
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
        id: "bidIncrement",
        meta: { label: stepHeader },
        header: stepHeader,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">
            {formatCurrency(row.original.bidIncrement) || "—"}
          </span>
        ),
      },
    ];
  }, [stepHeader]);

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
