import { useCallback, useEffect, useMemo, useState } from "react";
import { downloadAuthenticatedBlob, useAuth } from "@auctionit/lib";
import { ClientReportsMessages } from "@auctionit/messages/reports";
import {
  DataPanelError,
  IllustratedEmpty,
  PageHeader,
  Skeleton,
  formatDateParam,
} from "@auctionit/ui";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { BidOverviewFilters } from "@/components/reports/bid-overview-filters";
import {
  BidOverviewReportTable,
  bidOverviewReportQs,
  type BidOverviewAppliedFilters,
} from "@/components/reports/bid-overview-report-table";
import { reportKeys } from "@/components/reports/query-keys";
import {
  readStoredBidOverviewFilters,
  writeStoredBidOverviewFilters,
  type StoredBidOverviewFilters,
} from "@/components/reports/report-filters-storage";
import type {
  BidOverviewMode,
  BidOverviewReportRow,
  ReportAuctionOption,
  ReportClientOption,
} from "@/components/reports/report-types";

type DateRange = { from?: Date; to?: Date };

function parseIsoDate(value: string | null): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function BidOverviewReportPage() {
  const { api, user } = useAuth();
  const userId = user?.userId;

  const [draft, setDraft] = useState<StoredBidOverviewFilters | null>(null);
  const [applied, setApplied] = useState<BidOverviewAppliedFilters | null>(
    null,
  );
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (userId == null) return;
    setDraft(readStoredBidOverviewFilters(userId));
  }, [userId]);

  useEffect(() => {
    if (userId == null || draft == null) return;
    writeStoredBidOverviewFilters(userId, draft);
  }, [userId, draft]);

  const clientsQuery = useQuery({
    queryKey: reportKeys.clients(),
    queryFn: () => api.get<ReportClientOption[]>("/client/reports/clients"),
  });

  const clients = clientsQuery.data ?? [];
  const clientIds = draft?.clientIds ?? [];
  const from = draft?.from ?? undefined;
  const to = draft?.to ?? undefined;
  const auctionIds = draft?.auctionIds ?? [];
  const bidMode = draft?.bidMode ?? null;

  const dateRange = useMemo((): DateRange | undefined => {
    const fromDate = parseIsoDate(draft?.from ?? null);
    const toDate = parseIsoDate(draft?.to ?? null);
    if (fromDate && toDate) return { from: fromDate, to: toDate };
    return undefined;
  }, [draft?.from, draft?.to]);

  const auctionsEnabled =
    clientIds.length > 0 && from != null && to != null;

  const auctionsQuery = useQuery({
    queryKey: reportKeys.auctions(clientIds, from!, to!),
    queryFn: () =>
      api.get<ReportAuctionOption[]>(
        `/client/reports/auctions?clientIds=${clientIds.join(",")}&from=${from}&to=${to}`,
      ),
    enabled: auctionsEnabled,
  });

  const auctions = auctionsQuery.data ?? [];

  useEffect(() => {
    if (
      draft == null ||
      !auctionsEnabled ||
      auctionsQuery.isLoading ||
      auctionIds.length === 0
    ) {
      return;
    }
    const valid = new Set(auctions.map((a) => a.auctionId));
    const next = auctionIds.filter((id) => valid.has(id));
    if (next.length === auctionIds.length) return;
    setDraft((prev) =>
      prev == null ? prev : { ...prev, auctionIds: next },
    );
  }, [
    auctions,
    auctionsEnabled,
    auctionsQuery.isLoading,
    auctionIds,
    draft,
  ]);

  useEffect(() => {
    if (draft == null || clientsQuery.isLoading || clientIds.length === 0) {
      return;
    }
    const valid = new Set(clients.map((c) => c.clientId));
    const next = clientIds.filter((id) => valid.has(id));
    if (next.length === clientIds.length) return;
    setDraft((prev) =>
      prev == null
        ? prev
        : { ...prev, clientIds: next, auctionIds: [] },
    );
  }, [clients, clientsQuery.isLoading, clientIds, draft]);

  const onClientIdsChange = (nextClientIds: number[]) => {
    setDraft((prev) =>
      prev == null
        ? prev
        : {
            ...prev,
            clientIds: nextClientIds,
            auctionIds: [],
          },
    );
  };

  const onAuctionIdsChange = (nextAuctionIds: number[]) => {
    setDraft((prev) =>
      prev == null ? prev : { ...prev, auctionIds: nextAuctionIds },
    );
  };

  const onBidModeChange = (next: BidOverviewMode | null) => {
    setDraft((prev) =>
      prev == null ? prev : { ...prev, bidMode: next },
    );
  };

  const onDateRangeChange = (range: DateRange | undefined) => {
    setDraft((prev) =>
      prev == null
        ? prev
        : {
            ...prev,
            auctionIds: [],
            from: range?.from && range.to ? formatDateParam(range.from) : null,
            to: range?.from && range.to ? formatDateParam(range.to) : null,
          },
    );
  };

  const canGetData = from != null && to != null;

  const onGetData = () => {
    if (draft?.from == null || draft.to == null) return;
    setApplied({
      from: draft.from,
      to: draft.to,
      clientIds: draft.clientIds,
      auctionIds: draft.auctionIds,
      bidMode: draft.bidMode,
    });
  };

  const reportQuery = useQuery({
    queryKey: reportKeys.bidOverview(
      applied ?? {
        from: "",
        to: "",
        clientIds: [],
        auctionIds: [],
        bidMode: null,
      },
    ),
    queryFn: () =>
      api.get<BidOverviewReportRow[]>(
        `/client/reports/bid-overview?${bidOverviewReportQs(applied!)}`,
      ),
    enabled: applied != null,
  });

  const canExport =
    applied != null &&
    !reportQuery.isLoading &&
    (reportQuery.data?.length ?? 0) > 0;

  const onExport = useCallback(async () => {
    if (applied == null) return;
    setExporting(true);
    try {
      await downloadAuthenticatedBlob(
        api,
        `/client/reports/bid-overview/export?${bidOverviewReportQs(applied)}`,
        { fallbackFilename: "bid-overview-report.xlsx" },
      );
    } catch {
      toast.error(ClientReportsMessages.EXPORT_FAILED);
    } finally {
      setExporting(false);
    }
  }, [api, applied]);

  let body;
  if (userId == null || draft == null) {
    body = <Skeleton className="h-64 w-full" />;
  } else if (clientsQuery.isError) {
    body = (
      <DataPanelError
        title={ClientReportsMessages.CLIENTS_LOAD_ERROR_TITLE}
        message={ClientReportsMessages.CLIENTS_LOAD_ERROR_DESCRIPTION}
        onRetry={() => void clientsQuery.refetch()}
      />
    );
  } else if (!clientsQuery.isLoading && clients.length === 0) {
    body = (
      <IllustratedEmpty
        title={ClientReportsMessages.CLIENTS_EMPTY_TITLE}
        description={ClientReportsMessages.CLIENTS_EMPTY_DESCRIPTION}
      />
    );
  } else {
    body = (
      <div className="space-y-4">
        <BidOverviewFilters
          clients={clients}
          auctions={auctions}
          clientIds={clientIds}
          auctionIds={auctionIds}
          bidMode={bidMode}
          dateRange={dateRange}
          clientsLoading={clientsQuery.isFetching}
          auctionsEnabled={auctionsEnabled}
          auctionsLoading={auctionsEnabled && auctionsQuery.isFetching}
          canGetData={canGetData}
          canExport={canExport}
          exporting={exporting}
          onClientIdsChange={onClientIdsChange}
          onAuctionIdsChange={onAuctionIdsChange}
          onBidModeChange={onBidModeChange}
          onDateRangeChange={onDateRangeChange}
          onGetData={onGetData}
          onExport={() => void onExport()}
        />

        {auctionsQuery.isError ? (
          <DataPanelError
            title={ClientReportsMessages.AUCTIONS_LOAD_ERROR_TITLE}
            message={ClientReportsMessages.AUCTIONS_LOAD_ERROR_DESCRIPTION}
            onRetry={() => void auctionsQuery.refetch()}
          />
        ) : null}

        {applied ? (
          <BidOverviewReportTable
            from={applied.from}
            to={applied.to}
            clientIds={applied.clientIds}
            auctionIds={applied.auctionIds}
            bidMode={applied.bidMode}
          />
        ) : (
          <IllustratedEmpty
            title={ClientReportsMessages.SELECT_DATE_RANGE_TITLE}
            description={ClientReportsMessages.SELECT_DATE_RANGE_DESCRIPTION}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title="Bid Overview Report"
        description="Combined no-bid and winners view for closed auctions."
      />
      {body}
    </div>
  );
}
