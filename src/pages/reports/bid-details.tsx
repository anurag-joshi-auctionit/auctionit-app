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
import { BidDetailsFilters } from "@/components/reports/bid-details-filters";
import {
  BidDetailsReportTable,
  bidDetailsReportQs,
} from "@/components/reports/bid-details-report-table";
import { reportKeys } from "@/components/reports/query-keys";
import {
  readStoredBidDetailsFilters,
  writeStoredBidDetailsFilters,
  type StoredBidDetailsFilters,
} from "@/components/reports/report-filters-storage";
import type {
  BidDetailsReportRow,
  ReportAuctionOption,
  ReportClientOption,
} from "@/components/reports/report-types";

type DateRange = { from?: Date; to?: Date };

type AppliedDetailsFilters = {
  clientId: number;
  auctionId: number;
};

function parseIsoDate(value: string | null): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function BidDetailsReportPage() {
  const { api, user } = useAuth();
  const userId = user?.userId;

  const [draft, setDraft] = useState<StoredBidDetailsFilters | null>(null);
  const [applied, setApplied] = useState<AppliedDetailsFilters | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (userId == null) return;
    setDraft(readStoredBidDetailsFilters(userId));
  }, [userId]);

  useEffect(() => {
    if (userId == null || draft == null) return;
    writeStoredBidDetailsFilters(userId, draft);
  }, [userId, draft]);

  const clientsQuery = useQuery({
    queryKey: reportKeys.clients(),
    queryFn: () => api.get<ReportClientOption[]>("/client/reports/clients"),
  });

  const clients = clientsQuery.data ?? [];
  const clientId = draft?.clientId ?? null;
  const from = draft?.from ?? undefined;
  const to = draft?.to ?? undefined;
  const auctionId = draft?.auctionId ?? null;

  const dateRange = useMemo((): DateRange | undefined => {
    const fromDate = parseIsoDate(draft?.from ?? null);
    const toDate = parseIsoDate(draft?.to ?? null);
    if (fromDate && toDate) return { from: fromDate, to: toDate };
    return undefined;
  }, [draft?.from, draft?.to]);

  const auctionsEnabled = clientId != null && from != null && to != null;

  const auctionsQuery = useQuery({
    queryKey: reportKeys.auctions(
      clientId != null ? [clientId] : [],
      from!,
      to!,
    ),
    queryFn: () =>
      api.get<ReportAuctionOption[]>(
        `/client/reports/auctions?clientIds=${clientId}&from=${from}&to=${to}`,
      ),
    enabled: auctionsEnabled,
  });

  const auctions = auctionsQuery.data ?? [];
  const auctionReady =
    auctionId != null && auctions.some((a) => a.auctionId === auctionId);

  useEffect(() => {
    if (
      draft == null ||
      !auctionsEnabled ||
      auctionsQuery.isLoading ||
      auctionId == null
    ) {
      return;
    }
    if (auctions.some((a) => a.auctionId === auctionId)) return;
    setDraft((prev) => (prev == null ? prev : { ...prev, auctionId: null }));
  }, [
    auctions,
    auctionsEnabled,
    auctionsQuery.isLoading,
    auctionId,
    draft,
  ]);

  useEffect(() => {
    if (draft == null || clientsQuery.isLoading || clientId == null) return;
    if (clients.some((c) => c.clientId === clientId)) return;
    setDraft((prev) =>
      prev == null
        ? prev
        : { ...prev, clientId: null, auctionId: null },
    );
  }, [clients, clientsQuery.isLoading, clientId, draft]);

  const onClientChange = (nextClientId: number | null) => {
    setDraft((prev) =>
      prev == null
        ? prev
        : {
            ...prev,
            clientId: nextClientId,
            auctionId: null,
          },
    );
  };

  const onAuctionChange = (nextAuctionId: number | null) => {
    setDraft((prev) =>
      prev == null ? prev : { ...prev, auctionId: nextAuctionId },
    );
  };

  const onDateRangeChange = (range: DateRange | undefined) => {
    setDraft((prev) =>
      prev == null
        ? prev
        : {
            ...prev,
            auctionId: null,
            from: range?.from && range.to ? formatDateParam(range.from) : null,
            to: range?.from && range.to ? formatDateParam(range.to) : null,
          },
    );
  };

  const canGetData =
    clientId != null && auctionReady && from != null && to != null;

  const onGetData = () => {
    if (clientId == null || auctionId == null || !auctionReady) return;
    setApplied({ clientId, auctionId });
  };

  const reportQuery = useQuery({
    queryKey: reportKeys.bidDetails(
      applied?.clientId ?? 0,
      applied?.auctionId ?? 0,
    ),
    queryFn: () =>
      api.get<BidDetailsReportRow[]>(
        `/client/reports/bid-details?${bidDetailsReportQs(applied!.clientId, applied!.auctionId)}`,
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
        `/client/reports/bid-details/export?${bidDetailsReportQs(applied.clientId, applied.auctionId)}`,
        { fallbackFilename: "bid-details-report.xlsx" },
      );
    } catch {
      toast.error(ClientReportsMessages.EXPORT_FAILED);
    } finally {
      setExporting(false);
    }
  }, [api, applied]);

  const empty = applied
    ? null
    : auctionsEnabled && !auctionsQuery.isLoading && auctions.length === 0
      ? {
          title: ClientReportsMessages.AUCTIONS_EMPTY_TITLE,
          description: ClientReportsMessages.AUCTIONS_EMPTY_DESCRIPTION,
        }
      : auctionId == null && clientId != null && from != null && to != null
        ? {
            title: ClientReportsMessages.SELECT_AUCTION_TITLE,
            description: ClientReportsMessages.SELECT_AUCTION_DESCRIPTION,
          }
        : {
            title: ClientReportsMessages.SELECT_FILTERS_TITLE,
            description: ClientReportsMessages.SELECT_FILTERS_DESCRIPTION,
          };

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
        <BidDetailsFilters
          clients={clients}
          auctions={auctions}
          clientId={clientId}
          auctionId={auctionId}
          dateRange={dateRange}
          clientsLoading={clientsQuery.isFetching}
          auctionsEnabled={auctionsEnabled}
          auctionsLoading={auctionsEnabled && auctionsQuery.isFetching}
          canGetData={canGetData}
          canExport={canExport}
          exporting={exporting}
          onClientChange={onClientChange}
          onAuctionChange={onAuctionChange}
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

        {empty ? (
          <IllustratedEmpty
            title={empty.title}
            description={empty.description}
          />
        ) : (
          <BidDetailsReportTable
            clientId={applied!.clientId}
            auctionId={applied!.auctionId}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title="Bid Details Report"
        description="Bid-level detail for a closed auction."
      />
      {body}
    </div>
  );
}
