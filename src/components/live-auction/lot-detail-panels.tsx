import { useAuth } from "@auctionit/lib";
import { bidStepLabel } from "@auctionit/lib/bid-increment-vs-price";
import { ClientPortalAuctionMessages } from "@auctionit/messages/auctions";
import {
  Button,
  ListDataTable,
  Spinner,
  formatCurrency,
  type ColumnDef,
} from "@auctionit/ui";
import { useQuery } from "@tanstack/react-query";
import { XClose } from "@untitledui/icons";
import { useMemo, type ReactNode } from "react";
import type { MergedLot } from "@/lib/use-live-auction";

/** Panels only need the lot id (and type for labels) — sealed rows reuse them. */
type PanelLot = Pick<MergedLot, "id" | "auctionType">;

function Panel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose?: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-lg font-medium">{title}</div>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close"
            className="-mr-1"
            onClick={onClose}
          >
            <XClose className="size-4" />
          </Button>
        ) : null}
      </div>
      {children}
    </>
  );
}

function Loading() {
  return (
    <div className="text-muted-foreground flex items-center gap-2 py-3 text-sm">
      <Spinner className="size-4" /> Loading…
    </div>
  );
}

type LotDetails = {
  quantity: number | null;
  uom: string | null;
  startBidPrice: number | null;
  bidIncrement: number | null;
  plantLocation: string | null;
  materialLocation: string | null;
  materialLiftingDays: number | null;
  gstPercentage: number | null;
  tcsPercentage: number | null;
  items: {
    id: number;
    itemName: string | null;
    materialName: string | null;
    materialDescription: string | null;
    quantity: number | null;
    uom: string | null;
  }[];
};

function useLotDetails(lotId: number, enabled: boolean) {
  const { api } = useAuth();
  return useQuery({
    queryKey: ["live-lot-details", lotId],
    queryFn: () => api.get<LotDetails>(`/live/lots/${lotId}/details`),
    enabled,
  });
}

// ---- Item Details -----------------------------------------------------------

type LotItem = LotDetails["items"][number];

const LOT_ITEM_COLUMNS: ColumnDef<LotItem, unknown>[] = [
  {
    id: "name",
    header: "Name",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => (
      <span className="font-medium">{row.original.itemName ?? "—"}</span>
    ),
  },
  {
    id: "uom",
    header: "Unit",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => row.original.uom ?? "—",
  },
  {
    id: "quantity",
    header: () => <span className="block text-right">Qty.</span>,
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => (
      <span className="block text-right tabular-nums">
        {row.original.quantity ?? "—"}
      </span>
    ),
  },
  {
    id: "description",
    header: "Description",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.materialDescription ?? "—"}
      </span>
    ),
  },
];

export function LotItemsPanel({
  lot,
  onClose,
}: {
  lot: PanelLot;
  onClose?: () => void;
}) {
  const { data, isLoading } = useLotDetails(lot.id, true);
  if (isLoading) {
    return (
      <Panel title="Item Details" onClose={onClose}>
        <Loading />
      </Panel>
    );
  }

  const items = data?.items ?? [];
  return (
    <Panel title="Item Details" onClose={onClose}>
      <ListDataTable
        columns={LOT_ITEM_COLUMNS}
        data={items}
        getRowId={(it) => String(it.id)}
        clientPagination={false}
        tableClassName="w-full"
        emptyTitle={ClientPortalAuctionMessages.ITEMS_EMPTY_TITLE}
        emptyDescription={ClientPortalAuctionMessages.ITEMS_EMPTY_DESCRIPTION}
      />
    </Panel>
  );
}

// ---- Others (additional info) ----------------------------------------------

type LotOther = {
  gstPercentage: number | null;
  tcsPercentage: number | null;
  plantLocation: string | null;
  materialLocation: string | null;
  materialLiftingDays: number | null;
  bidIncrement: number | null;
};

function pct(value: number | null): string {
  return value != null ? `${value}%` : "—";
}

function lotOtherColumns(
  auctionType: string | null | undefined,
): ColumnDef<LotOther, unknown>[] {
  const stepLabel = bidStepLabel(auctionType);
  return [
  {
    id: "gst",
    header: "GST",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => pct(row.original.gstPercentage),
  },
  {
    id: "tcs",
    header: "TCS",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => pct(row.original.tcsPercentage),
  },
  {
    id: "plantLocation",
    header: "Plant Location",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => row.original.plantLocation ?? "—",
  },
  {
    id: "materialLocation",
    header: "Material Location",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) => row.original.materialLocation ?? "—",
  },
  {
    id: "materialLiftingDays",
    header: "Material Lifting Days",
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) =>
      row.original.materialLiftingDays != null
        ? String(row.original.materialLiftingDays)
        : "—",
  },
  {
    id: "bidIncrement",
    header: stepLabel,
    enableHiding: false,
    enableSorting: false,
    cell: ({ row }) =>
      row.original.bidIncrement != null
        ? formatCurrency(row.original.bidIncrement)
        : "—",
  },
];
}

export function LotOtherPanel({
  lot,
  onClose,
}: {
  lot: PanelLot;
  onClose?: () => void;
}) {
  const { data, isLoading } = useLotDetails(lot.id, true);
  const columns = useMemo(
    () => lotOtherColumns(lot.auctionType),
    [lot.auctionType],
  );
  if (isLoading) {
    return (
      <Panel title="Additional Information" onClose={onClose}>
        <Loading />
      </Panel>
    );
  }

  if (!data) return null;

  const row: LotOther = {
    gstPercentage: data.gstPercentage,
    tcsPercentage: data.tcsPercentage,
    plantLocation: data.plantLocation,
    materialLocation: data.materialLocation,
    materialLiftingDays: data.materialLiftingDays,
    bidIncrement: data.bidIncrement,
  };

  return (
    <Panel title="Additional Information" onClose={onClose}>
      <ListDataTable
        columns={columns}
        data={[row]}
        getRowId={() => String(lot.id)}
        clientPagination={false}
        tableClassName="w-full"
      />
    </Panel>
  );
}

