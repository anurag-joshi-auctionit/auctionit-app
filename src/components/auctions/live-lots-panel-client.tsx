import { useAuth } from "@auctionit/lib";
import { ClientPortalAuctionMessages } from "@auctionit/messages/auctions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  DataPanelError,
  IllustratedEmpty,
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
  Skeleton,
} from "@auctionit/ui";
import {
  FILTER_CLEAR,
  isFilterClear,
} from "@auctionit/ui/lib/filters/constants";
import type { ExpandedState, OnChangeFn } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LotBiddersPanelClient } from "@/components/auctions/lot-expand-panels-client";
import {
  createLiveLotsColumnsClient,
  lotRowKey,
  type ClientExpandSection,
} from "@/components/auctions/live-lots-columns-client";
import { LIVE_LOT_PAGE_SIZE } from "@/components/auctions/live-lots-table-bidder";
import {
  LotItemsPanel,
  LotOtherPanel,
} from "@/components/live-auction/lot-detail-panels";
import {
  parseFirstIdParam,
  parseIdListParam,
  stringArraysEqual,
} from "@/lib/live-auction-url";
import {
  compareLotsByDisplayOrder,
  useLiveAuctions,
  type LiveAuctionListItem,
  type LiveTransportKind,
  type MergedLot,
} from "@/lib/use-live-auction";
import {
  auctionDisplayLabel,
  companyDisplayLabel,
} from "@/lib/portal-display-labels";

function parseClientIdParam(value: string | null): string {
  return parseFirstIdParam(value) ?? FILTER_CLEAR;
}

type LiveFilterOption = { value: string; label: string };

/** Isolated so socket/lot updates do not rebuild company/auction selects. */
const LiveLotsFilterBarClient = memo(function LiveLotsFilterBarClient({
  hasClientSelection,
  clientId,
  selectedClientLabel,
  clientOptions,
  auctionOptions,
  auctionIds,
  onClientChange,
  onAuctionIdsChange,
}: {
  hasClientSelection: boolean;
  clientId: string;
  selectedClientLabel: string | null;
  clientOptions: LiveFilterOption[];
  auctionOptions: LiveFilterOption[];
  auctionIds: string[];
  onClientChange: (value: string) => void;
  onAuctionIdsChange: (value: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SelectSearch
        value={hasClientSelection ? clientId : FILTER_CLEAR}
        onValueChange={onClientChange}
      >
        <SelectSearchTrigger className="w-[min(100vw-2rem,260px)]">
          <SelectSearchValue placeholder="Company">
            {selectedClientLabel ?? undefined}
          </SelectSearchValue>
        </SelectSearchTrigger>
        <SelectSearchContent>
          <SelectSearchCommand>
            <SelectSearchInput placeholder="Search companies…" />
            <SelectSearchList>
              <SelectSearchEmpty emptyText="No companies found." />
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
          className="w-[min(100vw-2rem,300px)]"
          disabled={!hasClientSelection}
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
  );
});

export function LiveLotsPanelClient({
  onStatusChange,
}: {
  onStatusChange?: (status: {
    connected: boolean;
    lastRefreshedAt: number;
    watching: boolean;
    transport: LiveTransportKind;
    degraded: boolean;
  }) => void;
}) {
  const { api } = useAuth();
  const [searchParams] = useSearchParams();
  const urlClient = useMemo(
    () => parseClientIdParam(searchParams.get("clients")),
    [searchParams],
  );
  const urlAuctions = useMemo(
    () => parseIdListParam(searchParams.get("auctions")),
    [searchParams],
  );

  const [clientId, setClientId] = useState(urlClient);
  const [auctionIds, setAuctionIds] = useState<string[]>(() => urlAuctions);
  const [manualAuctionSelection, setManualAuctionSelection] = useState(
    () => urlAuctions.length > 0,
  );
  const [expandedSections, setExpandedSections] = useState<
    Record<string, ClientExpandSection | null>
  >({});
  const [closedAuctionIds, setClosedAuctionIds] = useState<Set<string>>(
    () => new Set(),
  );
  const skipAuctionAutoFillRef = useRef(manualAuctionSelection);

  const listQuery = useQuery({
    queryKey: ["client-live-auctions"],
    queryFn: () => api.get<LiveAuctionListItem[]>("/live/auctions"),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
  const auctions = useMemo(() => listQuery.data ?? [], [listQuery.data]);

  useEffect(() => {
    if (!listQuery.isSuccess) return;
    if (urlAuctions.length === 0 || !isFilterClear(urlClient)) return;
    const match = auctions.find((a) => urlAuctions.includes(String(a.id)));
    if (match?.clientId != null) setClientId(String(match.clientId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listQuery.isSuccess]);

  const clientOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const a of auctions) {
      if (a.clientId != null && !seen.has(String(a.clientId))) {
        seen.set(String(a.clientId), companyDisplayLabel(a.clientName));
      }
    }
    return [...seen.entries()].map(([value, label]) => ({ value, label }));
  }, [auctions]);

  useEffect(() => {
    if (!listQuery.isSuccess) return;
    if (!isFilterClear(urlClient) || urlAuctions.length > 0) return;
    if (!isFilterClear(clientId)) return;
    const first = clientOptions[0]?.value;
    if (!first) return;
    setClientId(first);
    setManualAuctionSelection(false);
    skipAuctionAutoFillRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listQuery.isSuccess, clientOptions]);

  const hasClientSelection = !isFilterClear(clientId) && Boolean(clientId);
  const auctionOptions = useMemo(() => {
    if (!hasClientSelection) return [];
    return auctions
      .filter((a) => String(a.clientId) === clientId)
      .map((a) => ({
        value: String(a.id),
        label: auctionDisplayLabel(a.auctionNumber),
      }));
  }, [auctions, clientId, hasClientSelection]);

  const selectedClientLabel = useMemo(
    () =>
      hasClientSelection
        ? (clientOptions.find((c) => c.value === clientId)?.label ?? null)
        : null,
    [clientId, clientOptions, hasClientSelection],
  );

  useEffect(() => {
    if (!listQuery.isSuccess) return;
    if (!hasClientSelection) {
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
  }, [
    auctionOptions,
    hasClientSelection,
    listQuery.isSuccess,
    manualAuctionSelection,
  ]);

  const watchedIds = useMemo(() => {
    if (!hasClientSelection || auctionIds.length === 0) return [];
    return auctionIds
      .map((id) => Number(id))
      .filter((n) => Number.isInteger(n) && n > 0);
  }, [auctionIds, hasClientSelection]);

  const { lots, connected, transport, degraded, lastRefreshedAt, hasSnapshot } =
    useLiveAuctions(watchedIds, api.appId ?? "app", api.baseUrl);
  const awaitingSnapshot = watchedIds.length > 0 && !hasSnapshot;

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

  const groups = useMemo(() => {
    if (watchedIds.length === 0) return [];
    const byAuction = new Map<number, MergedLot[]>();
    for (const lot of lots) {
      const arr = byAuction.get(lot.auctionId);
      if (arr) arr.push(lot);
      else byAuction.set(lot.auctionId, [lot]);
    }
    return [...byAuction.entries()]
      .map(([auctionId, ls]) => ({
        auctionId,
        auctionNumber: ls[0]?.auctionNumber ?? null,
        lots: [...ls].sort(compareLotsByDisplayOrder),
      }))
      .sort((a, b) =>
        (a.auctionNumber ?? "").localeCompare(b.auctionNumber ?? "", "en", {
          numeric: true,
        }),
      );
  }, [lots, watchedIds.length]);

  const handleClientChange = useCallback((value: string) => {
    setClientId(isFilterClear(value) || !value ? FILTER_CLEAR : value);
    setAuctionIds([]);
    setManualAuctionSelection(false);
    skipAuctionAutoFillRef.current = false;
    setExpandedSections({});
    setClosedAuctionIds(new Set());
  }, []);

  const handleAuctionIdsChange = useCallback((value: string[]) => {
    setAuctionIds(value);
    setManualAuctionSelection(true);
    skipAuctionAutoFillRef.current = true;
    setExpandedSections({});
    setClosedAuctionIds(new Set());
  }, []);

  const toggleSection = useCallback((lot: MergedLot, section: ClientExpandSection) => {
    const key = lotRowKey(lot);
    setExpandedSections((prev) => ({
      ...prev,
      [key]: prev[key] === section ? null : section,
    }));
  }, []);

  const columns = useMemo(
    () => createLiveLotsColumnsClient({ onToggle: toggleSection }),
    [toggleSection],
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
      const next = typeof updater === "function" ? updater(expanded) : updater;
      if (next === true) return;
      setExpandedSections((prev) => {
        const out: Record<string, ClientExpandSection | null> = {};
        for (const [key, section] of Object.entries(prev)) {
          if (next[key]) out[key] = section;
        }
        return out;
      });
    },
    [expanded],
  );

  const renderSubComponent = useCallback(
    ({ row }: { row: { original: MergedLot } }) => {
      const lot = row.original;
      const section = expandedSections[lotRowKey(lot)];
      if (!section) return null;
      const onClose = () => toggleSection(lot, section);
      if (section === "item") {
        return <LotItemsPanel lot={lot} onClose={onClose} />;
      }
      if (section === "other") {
        return <LotOtherPanel lot={lot} onClose={onClose} />;
      }
      return (
        <LotBiddersPanelClient
          lotId={lot.id}
          bidCount={lot.bidCount}
          onClose={onClose}
        />
      );
    },
    [expandedSections, toggleSection],
  );

  const visibleGroups = useMemo(
    () => groups.filter((g) => g.lots.length > 0),
    [groups],
  );
  const openAccordionIds = useMemo(
    () =>
      visibleGroups
        .map((g) => String(g.auctionId))
        .filter((id) => !closedAuctionIds.has(id)),
    [visibleGroups, closedAuctionIds],
  );

  const emptyTitle = !hasClientSelection
    ? ClientPortalAuctionMessages.LIVE_EMPTY_SELECT_CLIENT_TITLE
    : watchedIds.length === 0
      ? ClientPortalAuctionMessages.LIVE_EMPTY_SELECT_AUCTIONS_TITLE
      : ClientPortalAuctionMessages.LIVE_EMPTY_LOTS_TITLE;
  const emptyDescription = !hasClientSelection
    ? ClientPortalAuctionMessages.LIVE_EMPTY_SELECT_CLIENT_DESCRIPTION
    : watchedIds.length === 0
      ? ClientPortalAuctionMessages.LIVE_EMPTY_SELECT_AUCTIONS_DESCRIPTION
      : ClientPortalAuctionMessages.LIVE_EMPTY_LOTS_DESCRIPTION;

  if (listQuery.isError) {
    return (
      <DataPanelError
        title={ClientPortalAuctionMessages.LIVE_LOAD_ERROR_TITLE}
        message={
          listQuery.error instanceof Error
            ? listQuery.error.message
            : ClientPortalAuctionMessages.LIVE_LOAD_ERROR_DESCRIPTION
        }
        onRetry={() => void listQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <LiveLotsFilterBarClient
        hasClientSelection={hasClientSelection}
        clientId={clientId}
        selectedClientLabel={selectedClientLabel}
        clientOptions={clientOptions}
        auctionOptions={auctionOptions}
        auctionIds={auctionIds}
        onClientChange={handleClientChange}
        onAuctionIdsChange={handleAuctionIdsChange}
      />

      {listQuery.isLoading || awaitingSnapshot ? (
        <Skeleton className="h-64 w-full" />
      ) : watchedIds.length === 0 || visibleGroups.length === 0 ? (
        <IllustratedEmpty title={emptyTitle} description={emptyDescription} />
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
          className="space-y-4"
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
                  <span className="text-muted-foreground shrink-0 text-xs font-normal">
                    {g.lots.length} {g.lots.length === 1 ? "lot" : "lots"}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="border-border bg-background border-t">
                  <ListDataTable
                    columns={columns}
                    data={g.lots}
                    getRowId={lotRowKey}
                    clientPagination={g.lots.length > LIVE_LOT_PAGE_SIZE}
                    showPagination={g.lots.length > LIVE_LOT_PAGE_SIZE}
                    initialState={
                      g.lots.length > LIVE_LOT_PAGE_SIZE
                        ? {
                            pagination: {
                              pageIndex: 0,
                              pageSize: LIVE_LOT_PAGE_SIZE,
                            },
                          }
                        : undefined
                    }
                    tableClassName="w-full"
                    containerClassName="rounded-none border-0"
                    getRowCanExpand={() => true}
                    expanded={expanded}
                    onExpandedChange={onExpandedChange}
                    renderSubComponent={renderSubComponent}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
