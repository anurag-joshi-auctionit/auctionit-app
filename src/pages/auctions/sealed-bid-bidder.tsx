import { useAuth } from "@auctionit/lib";
import { sealedBidAmountError } from "@auctionit/lib/live-bid-bounds";
import {
  BidderPortalAuctionMessages,
  LiveBidMessages,
} from "@auctionit/messages/auctions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  DataPanelError,
  ListDataTable,
  PageHeader,
  Skeleton,
  toast,
} from "@auctionit/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ExpandedState, OnChangeFn } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { ExpandSection } from "@/components/auctions/live-lots-columns-bidder";
import {
  useSealedBidColumns,
  type SealedWindowClock,
} from "@/components/auctions/sealed-lots-columns-bidder";
import { AcceptTncDialog } from "@/components/live-auction/accept-tnc-dialog";
import {
  LotItemsPanel,
  LotOtherPanel,
} from "@/components/live-auction/lot-detail-panels";
import { errMsg } from "@/hooks/use-live-bid-utils";
import {
  usePlaceSealedBid,
  useSealedBidView,
  type SealedBidLot,
  type SealedBidView,
} from "@/hooks/use-sealed-bids";
import { formatAgo } from "@/lib/live-auction-url";
import { auctionDisplayLabel } from "@/lib/portal-display-labels";
import { TickProvider, useSharedSecondTick } from "@/lib/use-live-auction";

/** Window state at `now` (server-anchored ms). */
function windowClockAt(
  view: SealedBidView | undefined,
  now: number,
): SealedWindowClock {
  if (!view?.windowStartsAt || !view.windowEndsAt) {
    return { state: "closed", secondsLeft: 0, secondsToStart: 0 };
  }
  const start = new Date(view.windowStartsAt).getTime();
  const end = new Date(view.windowEndsAt).getTime();
  const state =
    view.status !== "published" || now >= end
      ? "closed"
      : now < start
        ? "upcoming"
        : "open";
  return {
    state,
    secondsLeft: Math.max(0, Math.floor((end - now) / 1000)),
    secondsToStart: Math.max(0, Math.floor((start - now) / 1000)),
  };
}

const lotRowKey = (lot: SealedBidLot) => String(lot.lotId);

export function SealedBidPageBidder() {
  return (
    <TickProvider>
      <SealedBidPageContent />
    </TickProvider>
  );
}

function SealedBidPageContent() {
  useSharedSecondTick();
  const { api } = useAuth();
  const queryClient = useQueryClient();
  const params = useParams();
  const auctionId = Number(params.auctionId);
  const viewQuery = useSealedBidView(auctionId);
  const view = viewQuery.data;
  const placeBid = usePlaceSealedBid(auctionId);
  const [tncOpen, setTncOpen] = useState(false);
  const [bidReject, setBidReject] = useState<Record<number, string | null>>({});
  const [bidReset, setBidReset] = useState<Record<number, number>>({});
  const [expandedSections, setExpandedSections] = useState<
    Record<string, ExpandSection | null>
  >({});

  // Anchor the countdown to the server clock; re-anchor on each fresh view.
  const offset = useMemo(
    () => (view ? new Date(view.serverTime).getTime() - Date.now() : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view?.serverTime],
  );
  const clockNow = useCallback(
    () => windowClockAt(view, Date.now() + offset),
    [view, offset],
  );
  const clockState = clockNow().state;

  // Window just ended (or opened) — refresh so the page reflects the server.
  useEffect(() => {
    if (view && clockState !== "open") void viewQuery.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clockState]);

  const acceptTnc = useMutation({
    mutationFn: () => api.post(`/auctions/me/${auctionId}/accept-tnc`, {}),
    onSuccess: () => {
      toast.success(BidderPortalAuctionMessages.TNC_ACCEPTED);
      setTncOpen(false);
      void queryClient.invalidateQueries({
        queryKey: ["sealed-bids", auctionId],
      });
      void queryClient.invalidateQueries({ queryKey: ["sealed-auctions"] });
    },
    onError: (err) =>
      toast.error(errMsg(err, BidderPortalAuctionMessages.TNC_ACCEPT_FAILED)),
  });

  const submit = async (lot: SealedBidLot, amount: number | null) => {
    const local = sealedBidAmountError(
      {
        // Start price and bid limit are withheld — the server reports those.
        startBidPrice: null,
        bidLimit: null,
        ownLatest: lot.yourBid,
        auctionType: view?.auctionType ?? null,
      },
      amount ?? 0,
    );
    if (local) {
      setBidReject((p) => ({ ...p, [lot.lotId]: local }));
      return;
    }
    setBidReject((p) => ({ ...p, [lot.lotId]: null }));
    try {
      await placeBid.mutateAsync({ lotId: lot.lotId, amount: amount! });
      setBidReset((p) => ({ ...p, [lot.lotId]: (p[lot.lotId] ?? 0) + 1 }));
    } catch (err) {
      setBidReject((p) => ({
        ...p,
        [lot.lotId]: errMsg(err, LiveBidMessages.PLACE_BID_FAILED),
      }));
    }
  };

  const toggleSection = useCallback(
    (lot: SealedBidLot, section: ExpandSection) => {
      const key = lotRowKey(lot);
      setExpandedSections((prev) => ({
        ...prev,
        [key]: prev[key] === section ? null : section,
      }));
    },
    [],
  );

  const expanded: ExpandedState = useMemo(() => {
    const next: Record<string, boolean> = {};
    for (const [key, section] of Object.entries(expandedSections)) {
      if (section != null) next[key] = true;
    }
    return next;
  }, [expandedSections]);

  const onExpandedChange: OnChangeFn<ExpandedState> = useCallback(
    (updater) => {
      const next = (typeof updater === "function"
        ? updater(expanded)
        : updater) as unknown as Record<string, boolean>;
      setExpandedSections((prev) => {
        const out: Record<string, ExpandSection | null> = {};
        for (const [key, section] of Object.entries(prev)) {
          if (next[key]) out[key] = section;
        }
        return out;
      });
    },
    [expanded],
  );

  const columns = useSealedBidColumns({
    tncRequired: view?.tncRequired === true,
    clock: clockNow,
    isPending: (lotId) =>
      placeBid.isPending && placeBid.variables?.lotId === lotId,
    resetKey: (lotId) => bidReset[lotId] ?? 0,
    rejectReason: (lotId) => bidReject[lotId] ?? null,
    onSubmit: (lot, amount) => void submit(lot, amount),
    onToggle: toggleSection,
  });

  if (viewQuery.isError) {
    return (
      <div className="p-4">
        <DataPanelError
          message={errMsg(
            viewQuery.error,
            LiveBidMessages.SEALED_BIDS_LOAD_FAILED,
          )}
          onRetry={() => void viewQuery.refetch()}
        />
      </div>
    );
  }

  const lots = view?.lots ?? [];

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title="Sealed-bid"
        description="Only your own bid is shown. Your latest bid on each lot counts, and each new bid must improve on your previous one."
        actions={
          view ? (
            <div className="text-muted-foreground text-xs tabular-nums">
              Updated {formatAgo(viewQuery.dataUpdatedAt, Date.now())}
            </div>
          ) : null
        }
      />

      {viewQuery.isLoading || !view ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <Accordion
          type="multiple"
          defaultValue={[String(view.auctionId)]}
          className="w-full space-y-6"
        >
          <AccordionItem
            value={String(view.auctionId)}
            className="border-border bg-secondary/50 overflow-hidden rounded-lg border last:border-b"
          >
            <AccordionTrigger className="hover:bg-muted/40 items-center rounded-none px-4 py-3 hover:no-underline">
              <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {auctionDisplayLabel(view.auctionNumber)}
                  </span>
                  <Badge color="green">Sealed-bid</Badge>
                  {view.clientName ? (
                    <span className="text-muted-foreground text-xs font-normal">
                      {view.clientName}
                    </span>
                  ) : null}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="text-muted-foreground text-xs font-normal">
                    {lots.length} {lots.length === 1 ? "lot" : "lots"}
                  </span>
                  {view.tncRequired ? (
                    <Button
                      asChild
                      size="sm"
                      className="shrink-0"
                      disabled={acceptTnc.isPending}
                    >
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (acceptTnc.isPending) return;
                          setTncOpen(true);
                        }}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        {acceptTnc.isPending ? "Accepting…" : "Accept T&C"}
                      </span>
                    </Button>
                  ) : null}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <div className="border-border bg-background border-t">
                <ListDataTable
                  columns={columns}
                  data={lots}
                  getRowId={lotRowKey}
                  clientPagination={false}
                  tableClassName="w-full"
                  containerClassName="rounded-none border-0"
                  isFetching={viewQuery.isFetching && !viewQuery.isLoading}
                  expanded={expanded}
                  onExpandedChange={onExpandedChange}
                  getRowCanExpand={() => true}
                  renderSubComponent={({ row }) => {
                    const key = row.id;
                    const section = expandedSections[key] ?? null;
                    if (!section) return null;
                    const lot = {
                      id: row.original.lotId,
                      auctionType: view.auctionType,
                    };
                    const onClose = () =>
                      setExpandedSections((prev) => ({
                        ...prev,
                        [key]: null,
                      }));
                    if (section === "item") {
                      return <LotItemsPanel lot={lot} onClose={onClose} />;
                    }
                    return <LotOtherPanel lot={lot} onClose={onClose} />;
                  }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <AcceptTncDialog
        target={
          tncOpen && view
            ? {
                auctionId: view.auctionId,
                auctionNumber: view.auctionNumber,
                clientName: view.clientName,
              }
            : null
        }
        pending={acceptTnc.isPending}
        onClose={() => setTncOpen(false)}
        onAccept={() => acceptTnc.mutate()}
        onViewTnc={() => {
          const suffix = api.appId
            ? `?app_id=${encodeURIComponent(api.appId)}`
            : "";
          window.open(
            `${api.baseUrl}/auctions/me/${auctionId}/tnc${suffix}`,
            "_blank",
            "noopener",
          );
        }}
      />
    </div>
  );
}
