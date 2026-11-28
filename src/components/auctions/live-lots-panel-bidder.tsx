import { useAuth } from "@auctionit/lib";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  IllustratedEmpty,
  Skeleton,
  cn,
  SelectSearch,
  SelectSearchCommand,
  SelectSearchContent,
  SelectSearchEmpty,
  SelectSearchGroup,
  SelectSearchInput,
  SelectSearchItem,
  SelectSearchList,
  SelectSearchMulti,
  SelectSearchMultiCommand,
  SelectSearchMultiContent,
  SelectSearchMultiEmpty,
  SelectSearchMultiGroup,
  SelectSearchMultiInput,
  SelectSearchMultiItem,
  SelectSearchMultiList,
  SelectSearchMultiTrigger,
  SelectSearchMultiValue,
  SelectSearchTrigger,
  SelectSearchValue,
} from "@auctionit/ui";
import {
  FILTER_CLEAR,
  isFilterClear,
} from "@auctionit/ui/lib/filters/constants";
import type { ExpandedState, OnChangeFn } from "@tanstack/react-table";
import { AlertTriangle, Heart } from "@untitledui/icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  LIVE_AUCTION_SORTS,
  type SortKey,
} from "@/components/auctions/live-lots-filters-bidder";
import {
  LotItemsPanel,
  LotOtherPanel,
} from "@/components/live-auction/lot-detail-panels";
import { AcceptTncDialog } from "@/components/live-auction/accept-tnc-dialog";
import {
  lotRowKey,
  type ExpandSection,
} from "@/components/auctions/live-lots-columns-bidder";
import { LiveAuctionLotsTable } from "@/components/auctions/live-lots-table-bidder";
import { useLiveBidMutations } from "@/hooks/use-live-bid-mutations";
import { useLiveBidderQueries } from "@/hooks/use-live-bidder-queries";
import {
  parseFirstIdParam,
  parseIdListParam,
  stringArraysEqual,
} from "@/lib/live-auction-url";
import {
  type LiveTransportKind,
  type MergedLot,
  beatsAmount,
  bidDirectionFor,
  compareLotsByDisplayOrder,
  useLiveAuctions,
} from "@/lib/use-live-auction";
import {
  auctionDisplayLabel,
  clientDisplayLabel,
} from "@/lib/portal-display-labels";
import { LiveBidMessages } from "@auctionit/messages";
import { BidderAccountMessages } from "@auctionit/messages/emd";

export type LiveLotsPanelBidderStatus = {
  connected: boolean;
  lastRefreshedAt: number;
  watching: boolean;
  transport: LiveTransportKind;
  /** Feed is working but not on the primary transport. */
  degraded: boolean;
};

type LiveFilterOption = { value: string; label: string };

/** Isolated so socket/lot updates do not rebuild filter selects. */
const LiveLotsFilterBarBidder = memo(function LiveLotsFilterBarBidder({
  clientId,
  clientOptions,
  auctionOptions,
  auctionIds,
  sortBy,
  watchOnly,
  onClientChange,
  onAuctionIdsChange,
  onSortByChange,
  onWatchOnlyToggle,
}: {
  clientId: string;
  clientOptions: LiveFilterOption[];
  auctionOptions: LiveFilterOption[];
  auctionIds: string[];
  sortBy: string;
  watchOnly: boolean;
  onClientChange: (value: string) => void;
  onAuctionIdsChange: (value: string[]) => void;
  onSortByChange: (value: string) => void;
  onWatchOnlyToggle: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <span className="sr-only">Client</span>
        <SelectSearch value={clientId} onValueChange={onClientChange}>
          <SelectSearchTrigger className="w-[min(100vw-2rem,240px)]">
            <SelectSearchValue placeholder="Client">
              {clientOptions.find((c) => c.value === clientId)?.label}
            </SelectSearchValue>
          </SelectSearchTrigger>
          <SelectSearchContent>
            <SelectSearchCommand>
              <SelectSearchInput placeholder="Search clients…" />
              <SelectSearchList>
                <SelectSearchEmpty emptyText="No clients found." />
                <SelectSearchGroup>
                  {clientOptions.map((c) => (
                    <SelectSearchItem
                      key={c.value}
                      value={c.value}
                      searchText={c.label}
                    >
                      {c.label}
                    </SelectSearchItem>
                  ))}
                </SelectSearchGroup>
              </SelectSearchList>
            </SelectSearchCommand>
          </SelectSearchContent>
        </SelectSearch>
      </div>

      <div className="flex flex-col gap-1">
        <span className="sr-only">Auctions</span>
        <SelectSearchMulti
          clearable
          selectAll
          options={auctionOptions.map((a) => ({
            value: a.value,
            label: a.label,
            searchText: a.label,
          }))}
          value={auctionIds}
          onValueChange={onAuctionIdsChange}
        >
          <SelectSearchMultiTrigger
            className="w-[min(100vw-2rem,280px)]"
            disabled={!clientId}
          >
            <SelectSearchMultiValue placeholder="Auctions" />
          </SelectSearchMultiTrigger>
          <SelectSearchMultiContent>
            <SelectSearchMultiCommand>
              <SelectSearchMultiInput placeholder="Search auctions…" />
              <SelectSearchMultiList>
                <SelectSearchMultiEmpty emptyText="No auctions found." />
                <SelectSearchMultiGroup>
                  {auctionOptions.map((a) => (
                    <SelectSearchMultiItem
                      key={a.value}
                      value={a.value}
                      searchText={a.label}
                      label={a.label}
                    >
                      {a.label}
                    </SelectSearchMultiItem>
                  ))}
                </SelectSearchMultiGroup>
              </SelectSearchMultiList>
            </SelectSearchMultiCommand>
          </SelectSearchMultiContent>
        </SelectSearchMulti>
      </div>

      <div className="flex flex-col gap-1">
        <span className="sr-only">Sort by</span>
        <SelectSearch
          clearable
          value={isFilterClear(sortBy) ? FILTER_CLEAR : sortBy}
          onValueChange={onSortByChange}
        >
          <SelectSearchTrigger className="w-[min(100vw-2rem,320px)]">
            <SelectSearchValue placeholder="Sort by">
              {isFilterClear(sortBy)
                ? undefined
                : (LIVE_AUCTION_SORTS.find((s) => s.value === sortBy)?.label ??
                  "Display Order")}
            </SelectSearchValue>
          </SelectSearchTrigger>
          <SelectSearchContent>
            <SelectSearchCommand>
              <SelectSearchInput placeholder="Search sort options…" />
              <SelectSearchList>
                <SelectSearchEmpty emptyText="No sort options." />
                <SelectSearchGroup>
                  {LIVE_AUCTION_SORTS.map((s) => (
                    <SelectSearchItem
                      key={s.value}
                      value={s.value}
                      searchText={s.label}
                    >
                      {s.label}
                    </SelectSearchItem>
                  ))}
                </SelectSearchGroup>
              </SelectSearchList>
            </SelectSearchCommand>
          </SelectSearchContent>
        </SelectSearch>
      </div>
      <Button
        type="button"
        variant={watchOnly ? "outline" : "secondary"}
        aria-pressed={watchOnly}
        className={cn(
          "gap-2",
          watchOnly &&
            "border-transparent bg-yellow-background text-yellow-foreground hover:bg-yellow-background/90 hover:text-yellow-foreground/90",
        )}
        onClick={onWatchOnlyToggle}
      >
        <Heart
          className={cn("size-4 shrink-0", watchOnly && "fill-current")}
        />
        Watchlist
      </Button>
    </div>
  );
});

export function LiveLotsPanelBidder({
  onStatusChange,
}: {
  onStatusChange?: (status: LiveLotsPanelBidderStatus) => void;
}) {
  const { api, user } = useAuth();
  const linked = user?.bidderCompId != null;

  const [searchParams] = useSearchParams();
  const urlClient = parseFirstIdParam(searchParams.get("clients"));
  const urlAuctions = useMemo(
    () => parseIdListParam(searchParams.get("auctions")),
    [searchParams],
  );

  const [clientId, setClientId] = useState<string>(urlClient ?? "");
  const [auctionIds, setAuctionIds] = useState<string[]>(() => urlAuctions);
  const [manualAuctionSelection, setManualAuctionSelection] = useState(
    () => urlAuctions.length > 0,
  );
  const [sortBy, setSortBy] = useState<string>("lot");
  const [watchOnly, setWatchOnly] = useState(false);
  const [closedAuctionIds, setClosedAuctionIds] = useState<Set<string>>(
    () => new Set(),
  );
  const skipAuctionAutoFillRef = useRef(manualAuctionSelection);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, ExpandSection | null>
  >({});

  const {
    bidReject,
    bidReset,
    proxyChecked,
    setProxyChecked,
    bidOverlays,
    setBidOverlays,
    error,
    setError,
    tncTarget,
    setTncTarget,
    placeBid,
    setProxy,
    acceptTnc,
    openTncDocument,
    toggleWatch,
    submit,
    queryClient,
  } = useLiveBidMutations();

  const { listQuery, auctions, watched, proxyAmounts, participated } =
    useLiveBidderQueries(linked);

  useEffect(() => {
    if (!listQuery.isSuccess) return;
    if (urlAuctions.length === 0 || urlClient != null) return;
    if (clientId) return;

    const match = auctions.find((a) => urlAuctions.includes(String(a.id)));
    if (match?.clientId != null) {
      setClientId(String(match.clientId));
    }
  }, [auctions, clientId, listQuery.isSuccess, urlAuctions, urlClient]);

  const tncByAuction = useMemo(() => {
    const m = new Map<number, boolean>();
    for (const a of auctions) m.set(a.id, a.tncRequired === true);
    return m;
  }, [auctions]);

  const attachedByAuction = useMemo(() => {
    const m = new Map<number, Set<number> | null>();
    for (const a of auctions) {
      m.set(a.id, a.attachedLotIds ? new Set(a.attachedLotIds) : null);
    }
    return m;
  }, [auctions]);

  const clientOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const a of auctions) {
      if (a.clientId != null && !seen.has(String(a.clientId))) {
        seen.set(String(a.clientId), clientDisplayLabel(a.clientName));
      }
    }
    return [...seen.entries()].map(([value, label]) => ({ value, label }));
  }, [auctions]);

  const auctionOptions = useMemo(() => {
    if (!clientId) return [];
    return auctions
      .filter((a) => String(a.clientId) === clientId)
      .map((a) => ({
        value: String(a.id),
        label: auctionDisplayLabel(a.auctionNumber),
      }));
  }, [auctions, clientId]);

  useEffect(() => {
    if (!listQuery.isSuccess) return;
    if (clientId) return;
    const firstClient = clientOptions[0]?.value ?? "";
    if (firstClient) setClientId(firstClient);
  }, [clientId, clientOptions, listQuery.isSuccess]);

  useEffect(() => {
    if (!listQuery.isSuccess) return;
    if (!clientId) {
      setAuctionIds((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    const available = auctionOptions.map((o) => o.value);
    setAuctionIds((prev) => {
      if (manualAuctionSelection || skipAuctionAutoFillRef.current) {
        const next = prev.filter((id) => available.includes(id));
        return stringArraysEqual(prev, next) ? prev : next;
      }
      return stringArraysEqual(prev, available) ? prev : available;
    });
  }, [auctionOptions, manualAuctionSelection, clientId, listQuery.isSuccess]);

  const watchedIds = useMemo(() => {
    if (!clientId || auctionIds.length === 0) return [];
    return auctionIds
      .map((id) => Number(id))
      .filter((n) => Number.isInteger(n) && n > 0);
  }, [auctionIds, clientId]);

  const { lots, connected, transport, degraded, lastRefreshedAt, hasSnapshot } =
    useLiveAuctions(watchedIds, api.appId ?? "app", api.baseUrl);

  useEffect(() => {
    onStatusChange?.({
      connected,
      lastRefreshedAt,
      watching: watchedIds.length > 0,
      transport,
      degraded,
    });
  }, [
    connected,
    lastRefreshedAt,
    watchedIds.length,
    transport,
    degraded,
    onStatusChange,
  ]);

  const effectiveSortBy: SortKey =
    isFilterClear(sortBy) || !sortBy ? "lot" : (sortBy as SortKey);
  const lotRevRef = useRef<Map<number, number>>(new Map());

  const attachedLots = useMemo(() => {
    return lots.filter((l) => {
      const attached = attachedByAuction.get(l.auctionId);
      if (attached === undefined || attached === null) return true;
      return attached.has(l.id);
    });
  }, [lots, attachedByAuction]);

  const groups = useMemo(() => {
    let visible = attachedLots;
    if (watchOnly) {
      visible = visible.filter((l) => watched.has(l.id));
    }
    const filtered = visible.map((l) => {
      const ov = bidOverlays[l.id];
      if (!ov) return l;
      const next: MergedLot = { ...l };
      if (l.isRankBased) {
        // In flight: show the bidder's own amount; confirmed: server's values.
        if (ov.amount != null) next.yourBid = ov.amount;
        if (ov.yourBid !== undefined) next.yourBid = ov.yourBid;
        if (ov.yourRank !== undefined) next.yourRank = ov.yourRank;
      } else if (
        ov.amount != null &&
        (l.currentBid == null ||
          beatsAmount(ov.amount, l.currentBid, bidDirectionFor(l.auctionType)))
      ) {
        next.currentBid = ov.amount;
        next.bidCount = Math.max(l.bidCount, 1);
      }
      if (ov.status != null) next.yourStatus = ov.status;
      return next;
    });
    const sortFn = (a: MergedLot, b: MergedLot): number => {
      if (effectiveSortBy === "price")
        return (
          (a.startBidPrice ?? 0) - (b.startBidPrice ?? 0) ||
          compareLotsByDisplayOrder(a, b)
        );
      if (effectiveSortBy === "nobid")
        return (
          Number(a.bidCount > 0) - Number(b.bidCount > 0) ||
          compareLotsByDisplayOrder(a, b)
        );
      if (effectiveSortBy === "participated")
        return (
          Number(participated.has(b.id)) - Number(participated.has(a.id)) ||
          compareLotsByDisplayOrder(a, b)
        );
      return compareLotsByDisplayOrder(a, b);
    };
    const byAuction = new Map<number, MergedLot[]>();
    for (const l of filtered) {
      const arr = byAuction.get(l.auctionId);
      if (arr) arr.push(l);
      else byAuction.set(l.auctionId, [l]);
    }
    return [...byAuction.entries()]
      .map(([auctionId, ls]) => ({
        auctionId,
        auctionNumber: ls[0]!.auctionNumber,
        clientName: ls[0]!.clientName,
        tncRequired: tncByAuction.get(auctionId) === true,
        lots: [...ls].sort(sortFn),
      }))
      .sort((a, b) =>
        (a.auctionNumber ?? "").localeCompare(b.auctionNumber ?? "", "en", {
          numeric: true,
        }),
      );
  }, [
    attachedLots,
    watchOnly,
    watched,
    effectiveSortBy,
    participated,
    tncByAuction,
    bidOverlays,
  ]);

  const hasLots = groups.some((g) => g.lots.length > 0);
  const visibleGroups = useMemo(
    () => groups.filter((g) => g.lots.length > 0),
    [groups],
  );
  const openAccordionKey = visibleGroups
    .map((g) => String(g.auctionId))
    .filter((id) => !closedAuctionIds.has(id))
    .join(",");
  const openAccordionIds = useMemo(
    () => (openAccordionKey === "" ? [] : openAccordionKey.split(",")),
    [openAccordionKey],
  );

  const toggleSection = useCallback(
    (lot: MergedLot, section: ExpandSection) => {
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

  useEffect(() => {
    setBidOverlays((prev) => {
      const ids = Object.keys(prev);
      if (ids.length === 0) return prev;
      const byId = new Map(lots.map((l) => [l.id, l]));
      let changed = false;
      const next = { ...prev };
      for (const key of ids) {
        const lotId = Number(key);
        const ov = prev[lotId]!;
        const lot = byId.get(lotId);
        if (!lot) {
          delete next[lotId];
          changed = true;
          continue;
        }
        if (ov.pending) continue;
        const revCaughtUp =
          lot.rev != null && ov.rev != null && lot.rev >= ov.rev;
        const amountCaughtUp =
          ov.amount == null ||
          lot.currentBid == null ||
          !beatsAmount(ov.amount, lot.currentBid, bidDirectionFor(lot.auctionType));
        const revUnknown = lot.rev == null || ov.rev == null;
        const standingCaughtUp =
          ov.status == null ||
          lot.yourStatus === "winning" ||
          lot.yourStatus === "outbid" ||
          lot.yourStatus === "none";
        // Rank-based: keep the overlay until the private standing ping has
        // delivered this bid, so the old figure never flickers back.
        const ownBidCaughtUp =
          ov.yourBid == null || lot.yourBid === ov.yourBid;
        if (
          standingCaughtUp &&
          ownBidCaughtUp &&
          (revCaughtUp || (revUnknown && amountCaughtUp))
        ) {
          delete next[lotId];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [lots, setBidOverlays]);

  useEffect(() => {
    let shouldRefetchProxy = false;
    const clearProxyModeFor: number[] = [];

    for (const lot of lots) {
      const prevRev = lotRevRef.current.get(lot.id);
      if (lot.rev != null) {
        if (prevRev != null && lot.rev > prevRev) {
          shouldRefetchProxy = true;
          const standingMax = proxyAmounts[lot.id];
          if (standingMax != null && standingMax > 0) {
            clearProxyModeFor.push(lot.id);
          }
        }
        lotRevRef.current.set(lot.id, lot.rev);
      }
    }

    if (!shouldRefetchProxy) return;

    queryClient.invalidateQueries({ queryKey: ["live-my-proxies-all"] });
    queryClient.invalidateQueries({ queryKey: ["live-my-participation"] });
    if (clearProxyModeFor.length === 0) return;
    setProxyChecked((p) => {
      if (!clearProxyModeFor.some((id) => p[id])) return p;
      const next = { ...p };
      for (const id of clearProxyModeFor) delete next[id];
      return next;
    });
  }, [lots, proxyAmounts, queryClient, setProxyChecked]);

  const handleClientChange = useCallback((value: string) => {
    setClientId(value);
    setAuctionIds([]);
    setManualAuctionSelection(false);
    skipAuctionAutoFillRef.current = false;
    setClosedAuctionIds(new Set());
  }, []);

  const handleAuctionIdsChange = useCallback((value: string[]) => {
    setAuctionIds(value);
    setManualAuctionSelection(true);
    skipAuctionAutoFillRef.current = true;
    setClosedAuctionIds(new Set());
  }, []);

  const handleSortByChange = useCallback((v: string) => {
    setSortBy(isFilterClear(v) || !v ? FILTER_CLEAR : v);
  }, []);

  const handleWatchOnlyToggle = useCallback(() => {
    setWatchOnly((v) => !v);
  }, []);

  return (
    <>
      <LiveLotsFilterBarBidder
        clientId={clientId}
        clientOptions={clientOptions}
        auctionOptions={auctionOptions}
        auctionIds={auctionIds}
        sortBy={sortBy}
        watchOnly={watchOnly}
        onClientChange={handleClientChange}
        onAuctionIdsChange={handleAuctionIdsChange}
        onSortByChange={handleSortByChange}
        onWatchOnlyToggle={handleWatchOnlyToggle}
      />

      <div>
        {!linked ? (
          <IllustratedEmpty
            title={BidderAccountMessages.UNLINKED_TITLE}
            description={
              BidderAccountMessages.UNLINKED_LIVE_BIDDING_DESCRIPTION
            }
            className="border-0"
          />
        ) : listQuery.isLoading || (watchedIds.length > 0 && !hasSnapshot) ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : watchedIds.length === 0 ? (
          <IllustratedEmpty
            title={BidderAccountMessages.SELECT_AUCTION_TITLE}
            description={BidderAccountMessages.SELECT_AUCTION_DESCRIPTION}
            className="border-0"
          />
        ) : !hasLots ? (
          watchOnly ? (
            <Empty className="min-h-[280px] py-12">
              <EmptyMedia>
                <img
                  src="/illustrations/no-data.webp"
                  alt=""
                  width={160}
                  height={160}
                  className="size-20 object-contain"
                  loading="eager"
                />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>{LiveBidMessages.NO_WATCHLIST_LOTS}</EmptyTitle>
                <EmptyDescription>
                  {LiveBidMessages.NO_WATCHLIST_LOTS_DESCRIPTION}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <IllustratedEmpty
              title={BidderAccountMessages.WAITING_FOR_LOTS_TITLE}
              description={BidderAccountMessages.WAITING_FOR_LOTS_DESCRIPTION}
              showIllustration={false}
              className="min-h-0 border-0 py-8"
            />
          )
        ) : (
          <Accordion
            type="multiple"
            value={openAccordionIds}
            onValueChange={(next) => {
              const open = new Set(next);
              setClosedAuctionIds(
                new Set(
                  visibleGroups
                    .map((g) => String(g.auctionId))
                    .filter((id) => !open.has(id)),
                ),
              );
            }}
            className="w-full space-y-6"
          >
            {visibleGroups.map((g) => (
              <AccordionItem
                key={g.auctionId}
                value={String(g.auctionId)}
                className="border-border bg-secondary/50 overflow-hidden rounded-lg border last:border-b"
              >
                <AccordionTrigger className="hover:bg-muted/40 items-center rounded-none px-4 py-3 hover:no-underline">
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <span className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="font-medium">
                        {auctionDisplayLabel(g.auctionNumber)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-muted-foreground text-xs font-normal">
                        {g.lots.length} {g.lots.length === 1 ? "lot" : "lots"}
                      </span>
                      {g.tncRequired ? (
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
                              setTncTarget({
                                auctionId: g.auctionId,
                                auctionNumber: g.auctionNumber,
                                clientName: g.clientName,
                              });
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
                    <LiveAuctionLotsTable
                      lots={g.lots}
                      callbacks={{
                        tncRequired: g.tncRequired,
                        auctionType: g.lots[0]?.auctionType,
                        isWatched: (lotId) => watched.has(lotId),
                        isParticipated: (lotId) => participated.has(lotId),
                        isAmWinning: (lot) => lot.yourStatus === "winning",
                        isPending: (lotId) =>
                          bidOverlays[lotId]?.pending === true ||
                          (placeBid.isPending &&
                            placeBid.variables?.lotId === lotId) ||
                          (setProxy.isPending &&
                            setProxy.variables?.lotId === lotId),
                        resetKey: (lotId) => bidReset[lotId] ?? 0,
                        proxyOn: (lotId) => proxyChecked[lotId] ?? false,
                        onProxyToggle: (lotId, v) =>
                          setProxyChecked((p) => ({ ...p, [lotId]: v })),
                        onSubmit: submit,
                        submitting: (lotId) =>
                          bidOverlays[lotId]?.pending === true ||
                          (placeBid.isPending &&
                            placeBid.variables?.lotId === lotId) ||
                          (setProxy.isPending &&
                            setProxy.variables?.lotId === lotId),
                        rejectReason: (lotId) => bidReject[lotId] ?? null,
                        proxyAmount: (lotId) => proxyAmounts[lotId] ?? null,
                        onToggle: toggleSection,
                        onToggleWatch: (lotId) =>
                          toggleWatch.mutate({
                            lotId,
                            watch: !watched.has(lotId),
                          }),
                      }}
                      expanded={expanded}
                      onExpandedChange={onExpandedChange}
                      renderSubComponent={({ row }) => {
                        const key = row.id;
                        const section = expandedSections[key] ?? null;
                        if (!section) return null;
                        const lot = row.original;
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
            ))}
          </Accordion>
        )}
      </div>

      <AcceptTncDialog
        target={tncTarget}
        pending={acceptTnc.isPending}
        onClose={() => setTncTarget(null)}
        onAccept={() => {
          if (tncTarget) acceptTnc.mutate(tncTarget.auctionId);
        }}
        onViewTnc={() => {
          if (tncTarget) openTncDocument(tncTarget.auctionId);
        }}
      />

      <Dialog
        open={error != null}
        onOpenChange={(open) => !open && setError(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-foreground flex items-center gap-2">
              <AlertTriangle className="size-5" aria-hidden />
              Bid Error
            </DialogTitle>
            <DialogDescription>{error?.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setError(null)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
