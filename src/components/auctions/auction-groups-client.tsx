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
} from "@auctionit/ui";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@auctionit/lib";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useClosedAuctionDateRange } from "@/components/auctions/closed-auctions-date-filter";
import { ClosedAuctionsFilters } from "@/components/auctions/closed-auctions-filters";
import {
  AuctionGroupAccordion,
  groupAuctionsByClient,
} from "@/components/auctions/auction-groups-shared";
import { auctionDisplayLabel } from "@/lib/portal-display-labels";

export type PortalAuctionStatus = "live" | "upcoming" | "closed";
export type ClientAuctionListVariant = "today" | "future" | "closed";

export type PortalAuction = {
  clientId: number | null;
  clientName: string | null;
  auctionId: number;
  auctionNumber: string | null;
  auctionType: string | null;
  startTime: string | null;
  auctionDate: string | null;
  status: PortalAuctionStatus;
  catalogueUrl: string | null;
  tncUrl: string | null;
  lotCount?: number;
  approvedLotCount?: number;
};

function startTimeLabel(iso: string | null): string {
  if (!iso) return "—";
  const m = /T(\d{2}:\d{2}:\d{2})/.exec(iso);
  if (!m) return "—";
  return formatTimeOfDay(m[1]) || "—";
}

function auctionDateLabel(value: string | null): string {
  if (!value) return "—";
  return formatDate(value) || "—";
}

export function portalAuctionHref(
  a: PortalAuction,
  variant: ClientAuctionListVariant,
): string | null {
  if (variant === "closed" || a.status === "closed") {
    return `/auctions/${a.auctionId}`;
  }
  if (a.status === "live") {
    const params = new URLSearchParams();
    if (a.clientId != null) params.set("clients", String(a.clientId));
    params.set("auctions", String(a.auctionId));
    return `/auctions/live?${params.toString()}`;
  }
  return `/auctions/${a.auctionId}`;
}

function StatusBadge({ status }: { status: PortalAuctionStatus }) {
  if (status === "closed") return null;
  if (status === "live") return <Badge color="green">Live</Badge>;
  return <Badge color="lime">Upcoming</Badge>;
}

function DocLinkCell({ href }: { href: string | null }) {
  if (!href) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }
  return (
    <Button variant="link" asChild className="h-auto p-0">
      <a href={href} target="_blank" rel="noreferrer">
        View
      </a>
    </Button>
  );
}

function ApprovedLotsCell({ auction }: { auction: PortalAuction }) {
  const total = auction.lotCount ?? 0;
  if (!total) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }
  const approved = auction.approvedLotCount ?? 0;
  return (
    <Button
      variant="link"
      href={`/auctions/approval?auctionId=${auction.auctionId}`}
      className="h-auto p-0 tabular-nums"
    >
      {approved} / {total}
    </Button>
  );
}

function AuctionDetailsCell({
  auction,
  href,
  showStatusBadge,
}: {
  auction: PortalAuction;
  href: string | null;
  showStatusBadge: boolean;
}) {
  const label = auctionDisplayLabel(auction.auctionNumber);
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {href ? (
        <Button
          variant="link"
          href={href}
          className="h-auto max-w-full justify-start p-0 text-left whitespace-normal wrap-break-word"
        >
          {label}
        </Button>
      ) : (
        <span className="font-medium wrap-break-word">{label}</span>
      )}
      {showStatusBadge ? <StatusBadge status={auction.status} /> : null}
    </div>
  );
}

export function AuctionGroupsClient({
  variant,
  title,
  description,
  queryKey,
  path,
  emptyTitle,
  emptyDescription,
  loadErrorTitle,
  loadErrorDescription,
  defaultCollapsed = false,
}: {
  variant: ClientAuctionListVariant;
  title: string;
  description: string;
  queryKey: string;
  path: string;
  emptyTitle: string;
  emptyDescription: string;
  loadErrorTitle: string;
  loadErrorDescription: string;
  defaultCollapsed?: boolean;
}) {
  const { api } = useAuth();
  const showAuctionDate = variant === "future" || variant === "closed";
  const showStartTime = variant !== "closed";
  const [clientId, setClientId] = useState<number | null>(null);
  const dateRange = useClosedAuctionDateRange();
  const listPath =
    variant === "closed" && dateRange.from && dateRange.to
      ? `${path}?from=${dateRange.from}&to=${dateRange.to}`
      : path;

  const query = useQuery({
    queryKey: [queryKey, variant === "closed" ? listPath : path],
    queryFn: () => api.get<PortalAuction[]>(listPath),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  const rows = query.data ?? [];

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

  const groups = useMemo(
    () => groupAuctionsByClient(filteredRows),
    [filteredRows],
  );

  let body: ReactNode;
  if (query.isLoading) {
    body = (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
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
                {showAuctionDate ? (
                  <TableHead className="w-40">Auction Date</TableHead>
                ) : null}
                {showStartTime ? (
                  <TableHead className="w-40">Start Time</TableHead>
                ) : null}
                {variant === "closed" ? (
                  <TableHead className="w-44">Approved / Total Lots</TableHead>
                ) : null}
                <TableHead className="w-32">Catalogue</TableHead>
                <TableHead className="w-28">TnC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {g.rows.map((a) => (
                <TableRow key={a.auctionId}>
                  <TableCell className="whitespace-normal">
                    <AuctionDetailsCell
                      auction={a}
                      href={portalAuctionHref(a, variant)}
                      showStatusBadge={variant === "today"}
                    />
                  </TableCell>
                  {showAuctionDate ? (
                    <TableCell className="whitespace-nowrap">
                      {auctionDateLabel(a.auctionDate)}
                    </TableCell>
                  ) : null}
                  {showStartTime ? (
                    <TableCell className="whitespace-nowrap">
                      {startTimeLabel(a.startTime)}
                    </TableCell>
                  ) : null}
                  {variant === "closed" ? (
                    <TableCell className="whitespace-nowrap">
                      <ApprovedLotsCell auction={a} />
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <DocLinkCell href={a.catalogueUrl} />
                  </TableCell>
                  <TableCell>
                    <DocLinkCell href={a.tncUrl} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      />
    );
  }

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title={title}
        description={description}
        actions={
          variant === "closed" ? (
            <ClosedAuctionsFilters
              clients={clientOptions}
              clientId={clientId}
              dateRange={dateRange.range}
              onClientChange={setClientId}
              onDateRangeChange={dateRange.onChange}
              entity="company"
            />
          ) : null
        }
      />
      {body}
    </div>
  );
}
