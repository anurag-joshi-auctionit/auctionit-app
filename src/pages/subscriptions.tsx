import { useAuth } from "@auctionit/lib";
import { BidderAccountMessages } from "@auctionit/messages/emd";
import { PortalEntityDisplayMessages } from "@auctionit/messages/auctions";
import { BidderSubscriptionInvoiceStatusLabels } from "@auctionit/messages/subscriptions";
import {
  Badge,
  Button,
  type ColumnDef,
  DataTableColumnHeader,
  formatDate,
  formatCurrency,
  ListDataTable,
  PageHeader,
  Skeleton,
} from "@auctionit/ui";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { BidderAccountUnlinkedEmpty } from "@/components/bidder-account-unlinked-empty";
import { SubscriptionsPayActions } from "@/components/subscriptions-pay-card";

type InvoiceStatus = "requested" | "recheck" | "generated" | "cancelled";

type SubscriptionEntry = {
  id: number;
  subscriptionTypeId: number;
  subscriptionTypeName: string | null;
  fromDate: string | null;
  toDate: string | null;
  amount: number;
  paymentModeName: string | null;
  transactionId: string | null;
  paymentDate: string | null;
  invoiceStatus: InvoiceStatus;
  invoicePdfUrl: string | null;
  createdAt: string;
};

type SubscriptionStatus = {
  active: boolean;
  activeFrom: string | null;
  activeUntil: string | null;
  currentTypeName: string | null;
};

type ListParams = {
  page: number;
  pageSize: number;
  sortBy?: "paymentDate" | "createdAt" | "amount";
  sortOrder?: "asc" | "desc";
};

type SubscriptionResponse = {
  items: SubscriptionEntry[];
  total: number;
  page: number;
  pageSize: number;
  status: SubscriptionStatus;
  paymentsEnabled: boolean;
};

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORTING: SortingState = [{ id: "paymentDate", desc: true }];
const SORTABLE = new Set<ListParams["sortBy"]>(["paymentDate", "createdAt"]);

function buildHistoryQuery(params: ListParams): string {
  const search = new URLSearchParams();
  search.set("page", String(params.page));
  search.set("pageSize", String(params.pageSize));
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortOrder) search.set("sortOrder", params.sortOrder);
  return `?${search.toString()}`;
}

function formatPeriod(fromDate: string | null, toDate: string | null): string {
  if (!fromDate && !toDate) return "—";
  const from = fromDate ? formatDate(fromDate) || "—" : "—";
  const to = toDate ? formatDate(toDate) || "—" : "—";
  return `${from} – ${to}`;
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const color =
    status === "generated" ? "green" : status === "cancelled" ? "red" : "blue";
  return (
    <Badge color={color}>{BidderSubscriptionInvoiceStatusLabels[status]}</Badge>
  );
}

function ViewFileLink({ url }: { url: string | null | undefined }) {
  if (!url) return "—";
  return (
    <Button variant="link" href={url} target="_blank" rel="noopener noreferrer">
      View
    </Button>
  );
}

function getColumns(): ColumnDef<SubscriptionEntry>[] {
  return [
    {
      accessorKey: "paymentDate",
      meta: { label: "Payment Date" },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Date" />
      ),
      cell: ({ row }) =>
        row.original.paymentDate
          ? formatDate(row.original.paymentDate) || "—"
          : "—",
      enableHiding: false,
    },
    {
      accessorKey: "subscriptionTypeName",
      meta: { label: "Plan" },
      header: "Plan",
      cell: ({ row }) =>
        row.original.subscriptionTypeName ??
        PortalEntityDisplayMessages.PLAN_WITHOUT_NAME,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "period",
      meta: { label: "Period" },
      header: "Period",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatPeriod(row.original.fromDate, row.original.toDate)}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "amount",
      meta: { label: "Amount" },
      header: "Amount",
      cell: ({ row }) => (
        <span>{formatCurrency(row.original.amount)}</span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "paymentModeName",
      meta: { label: "Payment Mode" },
      header: "Payment Mode",
      cell: ({ row }) => row.original.paymentModeName ?? "—",
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "transactionId",
      meta: { label: "Transaction Reference No." },
      header: "Txn. Ref. No.",
      cell: ({ row }) => (
        <span className="block text-xs whitespace-normal wrap-break-word">
          {row.original.transactionId ?? "—"}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "invoiceStatus",
      meta: { label: "Invoice Status" },
      header: "Invoice Status",
      cell: ({ row }) => (
        <InvoiceStatusBadge status={row.original.invoiceStatus} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "invoice",
      meta: { label: "Invoice PDF" },
      header: "Invoice PDF",
      cell: ({ row }) => <ViewFileLink url={row.original.invoicePdfUrl} />,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

export function SubscriptionsPage() {
  const { api, user } = useAuth();
  const linked = user?.bidderCompId != null;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING);

  const listParams = useMemo((): ListParams => {
    const sort = sorting[0];
    const sortBy =
      sort && SORTABLE.has(sort.id as ListParams["sortBy"])
        ? (sort.id as ListParams["sortBy"])
        : undefined;
    return {
      page,
      pageSize,
      sortBy,
      sortOrder: sort ? (sort.desc ? "desc" : "asc") : undefined,
    };
  }, [page, pageSize, sorting]);

  const query = useQuery({
    queryKey: ["my-subscriptions", listParams],
    queryFn: () =>
      api.get<SubscriptionResponse>(
        `/subscriptions${buildHistoryQuery(listParams)}`,
      ),
    enabled: linked,
    placeholderData: keepPreviousData,
  });

  const columns = useMemo(() => getColumns(), []);
  const status = query.data?.status;
  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const paymentsEnabled = query.data?.paymentsEnabled ?? false;

  const pagination: PaginationState = useMemo(
    () => ({ pageIndex: page - 1, pageSize }),
    [page, pageSize],
  );

  const onPaginationChange = useCallback(
    (updater: PaginationState | ((p: PaginationState) => PaginationState)) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      if (next.pageIndex + 1 !== page) setPage(next.pageIndex + 1);
      if (next.pageSize !== pageSize) {
        setPageSize(next.pageSize);
        setPage(1);
      }
    },
    [pagination, page, pageSize],
  );

  const onSortingChange = useCallback(
    (updater: SortingState | ((prev: SortingState) => SortingState)) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(next.length > 0 ? next : DEFAULT_SORTING);
      setPage(1);
    },
    [sorting],
  );

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            <span>Subscriptions</span>
            {linked ? (
              query.isLoading ? (
                <Skeleton className="h-6 w-28" />
              ) : status?.active ? (
                <Badge color="green">Subscribed</Badge>
              ) : (
                <Badge color="red">Not Subscribed</Badge>
              )
            ) : null}
            {linked && status?.active && status.activeUntil ? (
              <span className="text-muted-foreground text-sm font-normal">
                Active until {formatDate(status.activeUntil) || "—"}
              </span>
            ) : null}
          </span>
        }
        description="Your AuctionIt subscription — status, history, and renewal."
        actions={
          linked ? (
            <SubscriptionsPayActions paymentsEnabled={paymentsEnabled} />
          ) : null
        }
      />

      {!linked ? (
        <BidderAccountUnlinkedEmpty
          description={BidderAccountMessages.UNLINKED_SUBSCRIPTION_DESCRIPTION}
          className="border-0"
        />
      ) : (
        <section className="space-y-3">
          <div className="text-lg font-medium">Payment History</div>
          <ListDataTable
            columns={columns}
            data={items}
            getRowId={(row) => String(row.id)}
            manualPagination
            manualSorting
            pageCount={pageCount}
            rowCount={total}
            state={{ pagination, sorting }}
            onPaginationChange={onPaginationChange}
            onSortingChange={onSortingChange}
            isFetching={query.isFetching}
            currentPage={page}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </section>
      )}
    </div>
  );
}
