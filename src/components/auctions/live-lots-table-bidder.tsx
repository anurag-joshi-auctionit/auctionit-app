import { ListDataTable } from "@auctionit/ui";
import type { ExpandedState, OnChangeFn, Row } from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { MergedLot } from "@/lib/use-live-auction";
import {
  lotRowKey,
  useLiveAuctionColumns,
  type LiveAuctionColumnCallbacks,
} from "./live-lots-columns-bidder";

export type LiveAuctionLotsTableProps = {
  lots: MergedLot[];
  callbacks: LiveAuctionColumnCallbacks;
  expanded: ExpandedState;
  onExpandedChange: OnChangeFn<ExpandedState>;
  renderSubComponent: (props: { row: Row<MergedLot> }) => ReactNode;
};

/** Paginate large auction panels so the live DOM stays bounded. */
export const LIVE_LOT_PAGE_SIZE = 40;

export function LiveAuctionLotsTable({
  lots,
  callbacks,
  expanded,
  onExpandedChange,
  renderSubComponent,
}: LiveAuctionLotsTableProps) {
  const columns = useLiveAuctionColumns(callbacks);
  const paginate = lots.length > LIVE_LOT_PAGE_SIZE;

  return (
    <ListDataTable
      columns={columns}
      data={lots}
      getRowId={(lot) => lotRowKey(lot)}
      clientPagination={paginate}
      showPagination={paginate}
      initialState={
        paginate
          ? { pagination: { pageIndex: 0, pageSize: LIVE_LOT_PAGE_SIZE } }
          : undefined
      }
      tableClassName="w-full"
      containerClassName="rounded-none border-0"
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      getRowCanExpand={() => true}
      renderSubComponent={renderSubComponent}
    />
  );
}
