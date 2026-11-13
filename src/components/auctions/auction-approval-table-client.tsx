import { useCallback, useEffect, useMemo, useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";
import { ApiError, useAuth } from "@auctionit/lib";
import {
  AuctionsErrorMessages,
  AuctionsSuccessMessages,
  ClientPortalAuctionMessages,
} from "@auctionit/messages/auctions";
import {
  Badge,
  Button,
  Card,
  CardContent,
  formatDate,
  Input,
  ListDataTable,
  SelectSearch,
  SelectSearchCommand,
  SelectSearchContent,
  SelectSearchEmpty,
  SelectSearchGroup,
  SelectSearchInput,
  SelectSearchItem,
  SelectSearchList,
  SelectSearchTrigger,
  SelectSearchValue,
  Skeleton,
} from "@auctionit/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loading02, Save01, XClose } from "@untitledui/icons";
import { toast } from "sonner";
import { createApprovalLotColumns } from "@/components/auctions/auction-approval-columns";
import {
  ApprovalDraftProvider,
  EMPTY_DRAFT,
} from "@/components/auctions/auction-approval-draft";
import {
  FieldRow,
  serverStatus,
  statusToIsApproved,
  type ApprovalDraftContextValue,
  type ApprovalLotsResponse,
  type AuctionApprovalTableClientProps,
  type LotDraft,
  type PortalApprovalLot,
} from "@/components/auctions/auction-approval-types";
import {
  ViewLotBiddersDialogClient,
  ViewLotBidsDialogClient,
} from "@/components/auctions/lot-expand-panels-client";
import {
  auctionDisplayLabel,
  clientDisplayLabel,
} from "@/lib/portal-display-labels";

export type { PortalApprovalLot } from "@/components/auctions/auction-approval-types";

export function AuctionApprovalTableClient({
  auctionId,
  clientName,
  auctionDate,
  auctions,
  onAuctionChange,
}: AuctionApprovalTableClientProps) {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<number, LotDraft>>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [bidsLot, setBidsLot] = useState<PortalApprovalLot | null>(null);
  const [biddersLot, setBiddersLot] = useState<PortalApprovalLot | null>(null);

  const lotsQuery = useQuery({
    queryKey: ["client-approval-lots", auctionId],
    queryFn: () =>
      api.get<ApprovalLotsResponse>(
        `/client/auctions/${auctionId}/approval-lots`,
      ),
  });

  const lots = lotsQuery.data?.lots ?? [];
  const selectedAuction = auctions.find((a) => a.auctionId === auctionId);
  const selectedLabel = selectedAuction
    ? auctionDisplayLabel(selectedAuction.auctionNumber)
    : undefined;

  useEffect(() => {
    setDrafts({});
    setRowSelection({});
  }, [auctionId]);

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const lot of lots) {
        if (!(lot.lotId in next)) {
          next[lot.lotId] = { status: serverStatus(lot) };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [lots]);

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ["client-approval-lots", auctionId],
    });
    void queryClient.invalidateQueries({
      queryKey: ["client-closed-auctions"],
    });
  }, [auctionId, queryClient]);

  const saveMutation = useMutation({
    mutationFn: (
      entries: Array<{ lotId: number; isApproved?: boolean | null }>,
    ) => api.post(`/client/auctions/${auctionId}/save-approvals`, { entries }),
    onSuccess: () => {
      toast.success(AuctionsSuccessMessages.LOT_APPROVALS_SAVED);
      setDrafts({});
      invalidate();
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? ((error.body as { error?: string } | null)?.error ??
            AuctionsErrorMessages.FAILED_TO_SAVE_LOT_APPROVALS)
          : AuctionsErrorMessages.FAILED_TO_SAVE_LOT_APPROVALS;
      toast.error(message);
    },
  });

  const selectedLotIds = useMemo(
    () =>
      Object.keys(rowSelection)
        .filter((id) => rowSelection[id])
        .map(Number),
    [rowSelection],
  );
  const selectedCount = selectedLotIds.length;

  const bulkMutation = useMutation({
    mutationFn: (action: "approve" | "reject") => {
      const body =
        selectedLotIds.length > 0 ? { lotIds: selectedLotIds } : { all: true };
      return action === "approve"
        ? api.post(`/client/auctions/${auctionId}/approve-lots`, body)
        : api.post(`/client/auctions/${auctionId}/reject-lots`, body);
    },
    onSuccess: (_data, action) => {
      toast.success(
        action === "approve"
          ? AuctionsSuccessMessages.ALL_LOTS_APPROVED
          : AuctionsSuccessMessages.ALL_LOTS_REJECTED,
      );
      setDrafts({});
      setRowSelection({});
      invalidate();
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? ((error.body as { error?: string } | null)?.error ??
            AuctionsErrorMessages.FAILED_TO_UPDATE_ALL_LOTS)
          : AuctionsErrorMessages.FAILED_TO_UPDATE_ALL_LOTS;
      toast.error(message);
    },
  });

  const busy = saveMutation.isPending || bulkMutation.isPending;

  const dirtyEntries = useMemo(() => {
    const entries: Array<{ lotId: number; isApproved?: boolean | null }> = [];
    for (const lot of lots) {
      const draft = drafts[lot.lotId];
      if (!draft) continue;
      if (draft.status !== serverStatus(lot)) {
        entries.push({
          lotId: lot.lotId,
          isApproved: statusToIsApproved(draft.status),
        });
      }
    }
    return entries;
  }, [lots, drafts]);

  const ctxValue = useMemo<ApprovalDraftContextValue>(
    () => ({
      getDraft: (lotId) => drafts[lotId] ?? EMPTY_DRAFT,
      setStatus: (lotId, status) =>
        setDrafts((prev) => ({
          ...prev,
          [lotId]: { status },
        })),
      disabled: busy,
    }),
    [drafts, busy],
  );

  const columns = useMemo(
    () =>
      createApprovalLotColumns({
        onOpenBids: setBidsLot,
        onOpenBidders: setBiddersLot,
      }),
    [],
  );

  if (lotsQuery.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (lotsQuery.isError) {
    return (
      <div className="text-destructive text-sm">
        {ClientPortalAuctionMessages.CLOSED_LOAD_ERROR_DESCRIPTION}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="w-full border-border bg-muted/50 py-0 shadow-none">
        <CardContent className="flex flex-wrap items-end gap-x-6 gap-y-3 px-4 py-4">
          <FieldRow label="Auction No." htmlFor="approval-auction">
            <SelectSearch
              value={String(auctionId)}
              onValueChange={onAuctionChange}
              placeholder="Auction No."
            >
              <SelectSearchTrigger
                id="approval-auction"
                className="w-[min(100vw-2rem,320px)]"
                aria-label="Auction No."
              >
                <SelectSearchValue placeholder="Auction No.">
                  {selectedLabel}
                </SelectSearchValue>
              </SelectSearchTrigger>
              <SelectSearchContent popoverWidth="w-[min(100vw-2rem,360px)]">
                <SelectSearchCommand>
                  <SelectSearchInput placeholder="Search auction no.…" />
                  <SelectSearchList>
                    <SelectSearchEmpty emptyText="No auctions found." />
                    <SelectSearchGroup>
                      {auctions.map((a) => {
                        const label = auctionDisplayLabel(a.auctionNumber);
                        return (
                          <SelectSearchItem
                            key={a.auctionId}
                            value={String(a.auctionId)}
                            searchText={label}
                            label={label}
                          >
                            {label}
                          </SelectSearchItem>
                        );
                      })}
                    </SelectSearchGroup>
                  </SelectSearchList>
                </SelectSearchCommand>
              </SelectSearchContent>
            </SelectSearch>
          </FieldRow>

          <FieldRow label="Client" htmlFor="approval-client">
            <Input
              id="approval-client"
              value={clientDisplayLabel(clientName)}
              disabled
              className="w-[min(100vw-2rem,240px)]"
            />
          </FieldRow>

          <FieldRow label="Auction Date" htmlFor="approval-auction-date">
            <Input
              id="approval-auction-date"
              value={formatDate(auctionDate) || "—"}
              disabled
              className="w-[min(100vw-2rem,180px)]"
            />
          </FieldRow>
        </CardContent>
      </Card>

      <div className="flex min-h-8 items-center justify-between gap-2">
        <div className="text-lg font-medium">Lot Approval</div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <Button
            variant="outline"
            disabled={lots.length === 0 || busy}
            onClick={() => bulkMutation.mutate("reject")}
          >
            <XClose className="size-4" />
            {selectedCount > 0 ? "Reject Selected" : "Reject All"}
            {selectedCount > 0 ? <Badge>{selectedCount}</Badge> : null}
          </Button>
          <Button
            variant="outline"
            disabled={lots.length === 0 || busy}
            onClick={() => bulkMutation.mutate("approve")}
          >
            <Check className="size-4" />
            {selectedCount > 0 ? "Approve Selected" : "Approve All"}
            {selectedCount > 0 ? <Badge>{selectedCount}</Badge> : null}
          </Button>
          <Button
            size="sm"
            disabled={dirtyEntries.length === 0 || busy}
            onClick={() => saveMutation.mutate(dirtyEntries)}
          >
            {saveMutation.isPending ? (
              <Loading02 className="size-4 animate-spin" />
            ) : (
              <Save01 className="size-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      <ApprovalDraftProvider value={ctxValue}>
        <ListDataTable
          columns={columns}
          data={lots}
          getRowId={(row) => String(row.lotId)}
          showPagination
          state={{ rowSelection }}
          onRowSelectionChange={setRowSelection}
          emptyTitle={ClientPortalAuctionMessages.APPROVAL_LOTS_EMPTY_TITLE}
          emptyDescription={
            ClientPortalAuctionMessages.APPROVAL_LOTS_EMPTY_DESCRIPTION
          }
        />
      </ApprovalDraftProvider>

      {bidsLot ? (
        <ViewLotBidsDialogClient
          lotId={bidsLot.lotId}
          lotNumber={bidsLot.lotNumber}
          bidCount={bidsLot.bidCount}
          winnerBidderId={bidsLot.winnerBidderId}
          winningAmount={bidsLot.winningPrice}
          onClose={() => setBidsLot(null)}
        />
      ) : null}
      {biddersLot ? (
        <ViewLotBiddersDialogClient
          lotId={biddersLot.lotId}
          lotNumber={biddersLot.lotNumber}
          bidCount={biddersLot.bidCount}
          onClose={() => setBiddersLot(null)}
        />
      ) : null}
    </div>
  );
}
