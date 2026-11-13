import { ApiError, useAuth } from "@auctionit/lib";
import { BidderPortalAuctionMessages } from "@auctionit/messages/auctions";
import {
  Badge,
  Button,
  DataPanelError,
  IllustratedEmpty,
  PageHeader,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  formatDate,
  formatTimeOfDay,
  toast,
} from "@auctionit/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AcceptTncDialog,
  type AcceptTncTarget,
} from "@/components/live-auction/accept-tnc-dialog";
import { useClosedAuctionDateRange } from "@/components/auctions/closed-auctions-date-filter";
import { ClosedAuctionsFilters } from "@/components/auctions/closed-auctions-filters";
import {
  AuctionGroupAccordion,
  groupAuctionsByClient,
} from "@/components/auctions/auction-groups-shared";
import { auctionDisplayLabel } from "@/lib/portal-display-labels";

export type BidderAuctionBucket = "today" | "future" | "closed";
type LiveState = "live" | "upcoming";

type MyAuction = {
  id: number;
  auctionNumber: string | null;
  auctionType: string | null;
  clientId: number | null;
  clientName: string | null;
  auctionDate: string;
  lotStartTime: string | null;
  status: string;
  lotCount: number;
  bucket: BidderAuctionBucket;
  liveState: LiveState | null;
  hasCatalogue: boolean;
  hasTnc: boolean;
  tncAccepted: boolean;
};

type MyAuctionsResponse = {
  items: MyAuction[];
};

function liveAuctionHref(auctionId: number, clientId: number | null): string {
  const params = new URLSearchParams();
  params.set("auctions", String(auctionId));
  if (clientId != null) params.set("clients", String(clientId));
  return `/auctions/live?${params.toString()}`;
}

function auctionDetailHref(auctionId: number): string {
  return `/auctions/${auctionId}`;
}

function GroupHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

function StatusBadge({ liveState }: { liveState: LiveState }) {
  if (liveState === "live") return <Badge color="green">Live</Badge>;
  return <Badge color="lime">Upcoming</Badge>;
}

function AuctionDetailsCell({
  auction,
  bucket,
}: {
  auction: MyAuction;
  bucket: BidderAuctionBucket;
}) {
  const label = auctionDisplayLabel(auction.auctionNumber);
  const href =
    bucket === "today" && auction.liveState === "live"
      ? liveAuctionHref(auction.id, auction.clientId)
      : auctionDetailHref(auction.id);
  const control = (
    <Button
      variant="link"
      href={href}
      className="h-auto max-w-full justify-start p-0 text-left whitespace-normal wrap-break-word"
    >
      {label}
    </Button>
  );

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {control}
      {bucket === "today" && auction.liveState ? (
        <StatusBadge liveState={auction.liveState} />
      ) : null}
    </div>
  );
}

export function AuctionGroupsBidder({
  bucket,
  title,
  description,
  emptyTitle,
  emptyDescription,
  loadErrorTitle,
  loadErrorDescription,
  defaultCollapsed = false,
  embedded = false,
  maxRows,
  viewAllHref,
}: {
  bucket: BidderAuctionBucket;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  loadErrorTitle: string;
  loadErrorDescription: string;
  /** When true, every client group starts collapsed. */
  defaultCollapsed?: boolean;
  /** Hide page header and tighten padding for dashboard embed. */
  embedded?: boolean;
  /** Cap total auction rows shown across groups (dashboard). */
  maxRows?: number;
  /** Shown when maxRows truncates the list. */
  viewAllHref?: string;
}) {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  const [tncTarget, setTncTarget] = useState<AcceptTncTarget | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const dateRange = useClosedAuctionDateRange();
  const listPath =
    bucket === "closed" && dateRange.from && dateRange.to
      ? `/auctions/me?bucket=${bucket}&from=${dateRange.from}&to=${dateRange.to}`
      : `/auctions/me?bucket=${bucket}`;

  const query = useQuery({
    queryKey: ["bidder-auctions", bucket, listPath],
    queryFn: () => api.get<MyAuctionsResponse>(listPath),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  const acceptTnc = useMutation({
    mutationFn: (auctionId: number) =>
      api.post(`/auctions/me/${auctionId}/accept-tnc`, {}),
    onSuccess: () => {
      toast.success(BidderPortalAuctionMessages.TNC_ACCEPTED);
      setTncTarget(null);
      queryClient.invalidateQueries({ queryKey: ["bidder-auctions"] });
      queryClient.invalidateQueries({ queryKey: ["auction"] });
      queryClient.invalidateQueries({ queryKey: ["live-auctions"] });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        const body = error.body as { error?: string } | null;
        toast.error(
          body?.error ?? BidderPortalAuctionMessages.TNC_ACCEPT_FAILED,
        );
      } else {
        toast.error(BidderPortalAuctionMessages.TNC_ACCEPT_FAILED);
      }
    },
  });

  function openDoc(auctionId: number, kind: "catalogue" | "tnc") {
    const suffix = api.appId ? `?app_id=${encodeURIComponent(api.appId)}` : "";
    window.open(
      `${api.baseUrl}/auctions/me/${auctionId}/${kind}${suffix}`,
      "_blank",
      "noopener",
    );
  }

  const rows = query.data?.items ?? [];
  const showDate = bucket === "future" || bucket === "closed";
  const showStartTime = bucket === "today" || bucket === "future";

  const clientOptions = useMemo(() => {
    const seen = new Map<number, string>();
    for (const a of rows) {
      if (a.clientId == null || seen.has(a.clientId)) continue;
      seen.set(a.clientId, a.clientName ?? "Unknown company");
    }
    return [...seen.entries()]
      .map(([id, name]) => ({ clientId: id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  useEffect(() => {
    if (clientId == null) return;
    if (clientOptions.some((c) => c.clientId === clientId)) return;
    setClientId(null);
  }, [clientId, clientOptions]);

  const filteredRows = useMemo(
    () =>
      clientId == null ? rows : rows.filter((a) => a.clientId === clientId),
    [rows, clientId],
  );

  const truncated = useMemo(() => {
    if (maxRows == null || maxRows <= 0 || filteredRows.length <= maxRows) {
      return { rows: filteredRows, truncatedCount: 0 };
    }
    return {
      rows: filteredRows.slice(0, maxRows),
      truncatedCount: filteredRows.length - maxRows,
    };
  }, [filteredRows, maxRows]);

  const groups = useMemo(
    () => groupAuctionsByClient(truncated.rows),
    [truncated.rows],
  );

  let body: ReactNode;
  if (query.isLoading) {
    const fixedColumns = (showDate ? 1 : 0) + (showStartTime ? 1 : 0) + 2;
    body = defaultCollapsed ? (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-border bg-secondary/50 rounded-lg border"
          >
            <GroupHeaderSkeleton />
          </div>
        ))}
      </div>
    ) : (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, group) => (
          <div
            key={group}
            className="border-border bg-secondary/50 overflow-hidden rounded-lg border"
          >
            <GroupHeaderSkeleton />
            <div className="border-border bg-background border-t px-2 py-2">
              <div className="flex gap-2 border-b py-2">
                <Skeleton className="h-3 min-w-0 flex-1" />
                {Array.from({ length: fixedColumns }).map((_, col) => (
                  <Skeleton key={col} className="h-3 w-40 shrink-0" />
                ))}
              </div>
              {Array.from({ length: 3 }).map((_, row) => (
                <div key={row} className="flex gap-2 py-3">
                  <Skeleton className="h-4 min-w-0 flex-1" />
                  {Array.from({ length: fixedColumns }).map((_, col) => (
                    <Skeleton key={col} className="h-4 w-40 shrink-0" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  } else if (query.isError) {
    body = (
      <DataPanelError
        title={loadErrorTitle}
        message={
          query.error instanceof Error
            ? query.error.message
            : loadErrorDescription
        }
        onRetry={() => void query.refetch()}
      />
    );
  } else if (groups.length === 0) {
    body = (
      <IllustratedEmpty title={emptyTitle} description={emptyDescription} />
    );
  } else {
    body = (
      <AuctionGroupAccordion
        groups={groups}
        defaultCollapsed={defaultCollapsed}
        countLabel="auction"
        renderContent={(g) => (
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead>Auction Details</TableHead>
                {showDate ? <TableHead className="w-40">Date</TableHead> : null}
                {showStartTime ? (
                  <TableHead className="w-40">Start Time</TableHead>
                ) : null}
                <TableHead className="w-40">Catalogue</TableHead>
                <TableHead className="w-40">TnC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {g.rows.map((a) => {
                const needsAccept = bucket !== "closed" && !a.tncAccepted;
                return (
                  <TableRow key={a.id}>
                    <TableCell className="whitespace-normal">
                      <AuctionDetailsCell auction={a} bucket={bucket} />
                    </TableCell>
                    {showDate ? (
                      <TableCell className="whitespace-nowrap">
                        {formatDate(a.auctionDate) || "—"}
                      </TableCell>
                    ) : null}
                    {showStartTime ? (
                      <TableCell className="whitespace-nowrap">
                        {a.lotStartTime
                          ? formatTimeOfDay(a.lotStartTime) || "—"
                          : "—"}
                      </TableCell>
                    ) : null}
                    <TableCell>
                      {a.hasCatalogue ? (
                        <Button
                          variant="link"
                          className="h-auto p-0"
                          onClick={() => openDoc(a.id, "catalogue")}
                        >
                          View
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {a.hasTnc ? (
                        <span className="inline-flex flex-wrap items-center gap-2">
                          <Button
                            variant="link"
                            className="h-auto p-0"
                            onClick={() => openDoc(a.id, "tnc")}
                          >
                            View
                          </Button>
                          {needsAccept ? (
                            <Button
                              size="sm"
                              onClick={() =>
                                setTncTarget({
                                  auctionId: a.id,
                                  auctionNumber: a.auctionNumber,
                                  clientName: a.clientName,
                                })
                              }
                            >
                              Accept TnC
                            </Button>
                          ) : (
                            <Badge color="green">Accepted</Badge>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      />
    );
  }

  return (
    <div className={embedded ? "space-y-4" : "space-y-6 p-4"}>
      {embedded ? null : (
        <PageHeader
          title={title}
          description={description}
          actions={
            bucket === "closed" ? (
              <ClosedAuctionsFilters
                clients={clientOptions}
                clientId={clientId}
                dateRange={dateRange.range}
                onClientChange={setClientId}
                onDateRangeChange={dateRange.onChange}
              />
            ) : null
          }
        />
      )}
      {body}
      {truncated.truncatedCount > 0 && viewAllHref ? (
        <div className="flex justify-end">
          <Button variant="link" href={viewAllHref} className="h-auto p-0">
            View All ({rows.length})
          </Button>
        </div>
      ) : null}
      <AcceptTncDialog
        target={tncTarget}
        pending={acceptTnc.isPending}
        onClose={() => setTncTarget(null)}
        onAccept={() => {
          if (tncTarget) acceptTnc.mutate(tncTarget.auctionId);
        }}
        onViewTnc={() => {
          if (tncTarget) openDoc(tncTarget.auctionId, "tnc");
        }}
      />
    </div>
  );
}
