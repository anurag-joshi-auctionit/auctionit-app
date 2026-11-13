import { useAuth } from "@auctionit/lib";
import {
  BidderAccountMessages,
  EMD_REFUND_STATUS_LABELS,
  EMD_FORFEITED_TYPE_LABEL,
  EMD_TYPE_LABELS,
  EmdEmptyMessages,
  EmdFailureMessages,
  EmdUiMessages,
  EmdValidationMessages,
  type EmdRefundStatus,
} from "@auctionit/messages/emd";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  type ColumnDef,
  cn,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  formatCurrency,
  formatCurrencyAccounting,
  formatDate,
  formatDateTime,
  getCurrencySymbol,
  copyToClipboard,
  HelpText,
  InputCurrency,
  ListDataTable,
  PageHeader,
  Skeleton,
  STATS_CARD_CLASS,
  STATS_STRIP_CLASS,
  Textarea,
  toast,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  UnderlineTabs,
  UnderlineTabsContent,
  UnderlineTabsList,
  UnderlineTabsTrigger,
} from "@auctionit/ui";
import { Tag } from "@auctionit/ui/components/ui/tag";
import { Check, Copy01, Plus, SlashOctagon } from "@untitledui/icons";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { BidderAccountUnlinkedEmpty } from "@/components/bidder-account-unlinked-empty";
import { getBidderForfeitureColumns } from "@/components/emd/forfeitures/bidder-forfeitures-columns";
import { useEmdPagination } from "@/components/emd/use-emd-pagination";
import { FormSheet } from "@/components/form-sheet";
import { applyFormApiErrors } from "@/lib/api/apply-api-validation-errors";
import { useClearFieldErrorOnChange } from "@/lib/forms/use-clear-field-error-on-change";
import {
  toastMyEmdError,
  useCancelMyEmdRefundMutation,
  useMyEmdForfeituresQuery,
  useMyEmdBlockedQuery,
  useMyEmdPassbookQuery,
  useMyEmdRefundsQuery,
  useMyEmdSummaryQuery,
  useRaiseMyEmdRefundMutation,
} from "@/lib/emd/queries";
import type {
  MyEmdForfeiture,
  MyEmdBlocked,
  MyEmdPassbookEntry,
  MyEmdRefund,
  MyEmdSummary,
} from "@/lib/emd/types";

type StatCard = {
  key: keyof Pick<
    MyEmdSummary,
    "available" | "blocked" | "refundPending" | "forfeited"
  >;
  label: string;
  className: string;
};

const STAT_CARDS: StatCard[] = [
  {
    key: "available",
    label: "Withdrawable",
    className: "bg-green-background text-green-foreground",
  },
  {
    key: "blocked",
    label: "Blocked",
    className: "bg-red-background text-red-foreground",
  },
  {
    key: "refundPending",
    label: "Refund in Process",
    className: "bg-yellow-background text-yellow-foreground",
  },
  {
    key: "forfeited",
    label: "Forfeited",
    className: "bg-grey-background text-grey-foreground",
  },
];

const VALID_TABS = ["passbook", "blocked", "refunds", "forfeitures"] as const;
type TabValue = (typeof VALID_TABS)[number];

function isValidTab(v: string | null): v is TabValue {
  return VALID_TABS.includes(v as TabValue);
}

// ---- Passbook tab ----

const LOT_CODE_LENGTH = 8;
const LOTS_SHOWN = 5;
const LOTS_IN_TOOLTIP = 20;

function lotCode(lot: string) {
  const t = lot.trim();
  return t.length > LOT_CODE_LENGTH
    ? `${t.slice(0, LOT_CODE_LENGTH).trimEnd()}…`
    : t;
}

function LotsCell({ lots }: { lots: string[] }) {
  if (lots.length === 0)
    return <span className="text-muted-foreground">—</span>;
  const hidden = lots.slice(LOTS_SHOWN);
  return (
    <div className="flex flex-wrap gap-1">
      {lots.slice(0, LOTS_SHOWN).map((lot, i) => (
        <Tag key={`${i}-${lot}`} title={lot}>
          {lotCode(lot)}
        </Tag>
      ))}
      {hidden.length > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Tag className="cursor-default">+{hidden.length}</Tag>
          </TooltipTrigger>
          <TooltipContent className="max-w-md text-left">
            <ul className="space-y-0.5">
              {hidden.slice(0, LOTS_IN_TOOLTIP).map((lot, i) => (
                <li key={`${i}-${lot}`}>{lot}</li>
              ))}
              {hidden.length > LOTS_IN_TOOLTIP ? (
                <li>+{hidden.length - LOTS_IN_TOOLTIP}</li>
              ) : null}
            </ul>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}

function amountCell(value: number) {
  return value > 0 ? (
    <span className="tabular-nums whitespace-nowrap">
      {formatCurrency(value)}
    </span>
  ) : (
    <span className="text-muted-foreground">—</span>
  );
}

function getPassbookColumns(): ColumnDef<MyEmdPassbookEntry>[] {
  return [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDate(row.original.createdAt) || "—"}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "emdType",
      header: "Type",
      cell: ({ row }) => (
        <Badge className="whitespace-nowrap">
          {row.original.isForfeited
            ? EMD_FORFEITED_TYPE_LABEL
            : EMD_TYPE_LABELS[row.original.emdType]}
        </Badge>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "narration",
      header: "Narration",
      size: 300,
      minSize: 300,
      maxSize: 300,
      cell: ({ row }) => (
        <div className="text-sm whitespace-normal wrap-break-word">
          {row.original.narration || "—"}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "auctionNumber",
      header: "Auction Details",
      cell: ({ row }) =>
        row.original.auctionNumber ? (
          <span className="text-sm">{row.original.auctionNumber}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "lots",
      header: "Lot(s)",
      size: 300,
      minSize: 300,
      maxSize: 300,
      cell: ({ row }) => <LotsCell lots={row.original.lots} />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "credit",
      header: "Credit",
      cell: ({ row }) => amountCell(row.original.credit),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "debit",
      header: "Debit",
      cell: ({ row }) => amountCell(row.original.debit),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "runningBalance",
      header: "Balance",
      cell: ({ row }) => {
        const balance = row.original.runningBalance;
        if (balance == null)
          return <span className="text-muted-foreground">—</span>;
        return (
          <span
            className={cn(
              "font-medium tabular-nums whitespace-nowrap",
              balance < 0 && "text-red-foreground",
            )}
          >
            {formatCurrencyAccounting(balance)}
          </span>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

function PassbookPanel({ enabled }: { enabled: boolean }) {
  const { params, tableProps } = useEmdPagination(10);
  const query = useMyEmdPassbookQuery(params.page, params.pageSize, enabled);
  const columns = useMemo(() => getPassbookColumns(), []);

  return (
    <div className="space-y-3">
      <ListDataTable
        columns={columns}
        data={query.data?.items ?? []}
        {...tableProps(query.data?.total ?? 0)}
        getRowId={(row) => String(row.id)}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        emptyTitle={EmdEmptyMessages.PASSBOOK_EMPTY_TITLE}
        emptyDescription={EmdEmptyMessages.MY_PASSBOOK_EMPTY_DESCRIPTION}
      />
    </div>
  );
}

// ---- Blocked tab ----

function getBlockedColumns(): ColumnDef<MyEmdBlocked>[] {
  return [
    {
      accessorKey: "blockedAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDate(row.original.blockedAt) || "—"}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "clientName",
      header: "Client",
      cell: ({ row }) => row.original.clientName ?? "—",
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "auctionNumber",
      header: "Auction Details",
      cell: ({ row }) => (
        <span className="text-xs">{row.original.auctionNumber ?? "—"}</span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "blocked",
      header: "Blocked",
      cell: ({ row }) =>
        row.original.blocked > 0 ? (
          <span className="tabular-nums">
            {formatCurrency(row.original.blocked)}
          </span>
        ) : (
          "—"
        ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

function BlockedPanel({ enabled }: { enabled: boolean }) {
  const { params, tableProps } = useEmdPagination(10);
  const query = useMyEmdBlockedQuery(params.page, params.pageSize, enabled);
  const columns = useMemo(() => getBlockedColumns(), []);

  return (
    <div className="space-y-3">
      <ListDataTable
        columns={columns}
        data={query.data?.items ?? []}
        {...tableProps(query.data?.total ?? 0)}
        getRowId={(row) => String(row.auctionId)}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        emptyTitle={EmdEmptyMessages.BLOCKED_EMPTY_TITLE}
        emptyDescription={EmdEmptyMessages.MY_BLOCKED_EMPTY_DESCRIPTION}
      />
    </div>
  );
}

// ---- Refunds tab ----

const CANCELLABLE: EmdRefundStatus[] = ["requested", "reviewed"];

function getRefundColumns(
  onCancel: (r: MyEmdRefund) => void,
): ColumnDef<MyEmdRefund>[] {
  return [
    {
      accessorKey: "id",
      header: "Request ID",
      cell: ({ row }) => <Badge>#{row.original.id}</Badge>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums">
          {formatCurrency(row.original.amount)}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "requestedAt",
      header: "Requested At",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDateTime(row.original.requestedAt) || "—"}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "requestedRemarks",
      header: "Requested Remark",
      cell: ({ row }) => (
        <span className="text-muted-foreground max-w-xs text-sm whitespace-normal">
          {row.original.requestedRemarks ?? "—"}
        </span>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge>{EMD_REFUND_STATUS_LABELS[row.original.status]}</Badge>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) =>
        CANCELLABLE.includes(row.original.status) ? (
          <Button
            variant="ghost"
            size="icon-sm"
            tooltip="Cancel Request"
            aria-label="Cancel request"
            onClick={() => onCancel(row.original)}
          >
            <SlashOctagon className="size-4" />
          </Button>
        ) : null,
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

type RefundFormValues = {
  amount: number | null;
  remarks: string;
};

const EMPTY_REFUND: RefundFormValues = { amount: null, remarks: "" };

function RefundsPanel({
  enabled,
  sheetOpen,
  onSheetOpenChange,
}: {
  enabled: boolean;
  sheetOpen: boolean;
  onSheetOpenChange: (open: boolean) => void;
}) {
  const [cancelTarget, setCancelTarget] = useState<MyEmdRefund | null>(null);

  const { params, tableProps } = useEmdPagination(10);
  const refundsQuery = useMyEmdRefundsQuery(
    params.page,
    params.pageSize,
    enabled,
  );
  const summaryQuery = useMyEmdSummaryQuery(enabled);
  const raise = useRaiseMyEmdRefundMutation();
  const cancel = useCancelMyEmdRefundMutation();

  const available = summaryQuery.data?.available ?? 0;

  const form = useForm<RefundFormValues>({ defaultValues: EMPTY_REFUND });
  useClearFieldErrorOnChange(form);

  useEffect(() => {
    if (sheetOpen) form.reset(EMPTY_REFUND);
  }, [sheetOpen, form]);

  const onSubmit = form.handleSubmit((values) => {
    raise.mutate(
      { amount: values.amount ?? 0, remarks: values.remarks.trim() },
      {
        onSuccess: () => onSheetOpenChange(false),
        onError: (err) =>
          applyFormApiErrors(form, err, {
            fallbackMessage: EmdFailureMessages.REFUND_REQUEST_FAILED,
          }),
      },
    );
  });

  const columns = useMemo(() => getRefundColumns(setCancelTarget), []);

  const onConfirmCancel = () => {
    if (!cancelTarget) return;
    cancel.mutate(cancelTarget.id, {
      onSuccess: () => setCancelTarget(null),
      onError: (err) =>
        toastMyEmdError(err, EmdFailureMessages.REFUND_CANCEL_FAILED),
    });
  };

  return (
    <div className="space-y-3">
      <ListDataTable
        showColumnToggle={false}
        columns={columns}
        data={refundsQuery.data?.items ?? []}
        {...tableProps(refundsQuery.data?.total ?? 0)}
        getRowId={(row) => String(row.id)}
        isLoading={refundsQuery.isLoading}
        isFetching={refundsQuery.isFetching}
        emptyTitle={EmdEmptyMessages.REFUNDS_EMPTY_TITLE}
        emptyDescription={EmdEmptyMessages.MY_REFUNDS_EMPTY_DESCRIPTION}
      />

      <FormSheet
        open={sheetOpen}
        onOpenChange={onSheetOpenChange}
        title="Request Refund"
        submitLabel="Submit"
        isSubmitting={raise.isPending}
        onSubmit={onSubmit}
      >
        <Form {...form}>
          <div className="space-y-4">
            <Card className="bg-purple-background text-purple-foreground border-purple-foreground/20">
              <CardContent>
                <p className="text-sm">Withdrawable Amount</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {formatCurrency(available)}
                </p>
              </CardContent>
            </Card>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1">
                    <FormLabel required>
                      {`Amount (${getCurrencySymbol()})`}
                    </FormLabel>
                    <HelpText message={EmdUiMessages.REFUND_REQUEST_HINT} />
                  </div>
                  <FormControl>
                    <InputCurrency
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      allowEmptyAsZero={false}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Remark</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      maxLength={500}
                      placeholder="Reason for the refund request"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </FormSheet>

      <AlertDialog
        open={cancelTarget != null}
        onOpenChange={(open) => {
          if (!open && !cancel.isPending) setCancelTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Refund Request</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget ? (
                <>
                  Cancel request #{cancelTarget.id} of{" "}
                  <span className="text-foreground font-semibold">
                    {formatCurrency(cancelTarget.amount)}
                  </span>
                  ? The amount goes back to your available EMD right away.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancel.isPending}>
              Keep Request
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={cancel.isPending}
              onClick={(e) => {
                e.preventDefault();
                onConfirmCancel();
              }}
            >
              {cancel.isPending ? "Cancelling…" : "Cancel Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---- Forfeitures tab ----

function ForfeituresPanel({ enabled }: { enabled: boolean }) {
  const { params, tableProps } = useEmdPagination(10);
  const query = useMyEmdForfeituresQuery(params.page, params.pageSize, enabled);
  const columns = useMemo(() => getBidderForfeitureColumns(), []);

  return (
    <div className="space-y-3">
      <ListDataTable
        showColumnToggle={false}
        columns={columns}
        data={query.data?.items ?? []}
        {...tableProps(query.data?.total ?? 0)}
        getRowId={(row: MyEmdForfeiture) => String(row.id)}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        emptyTitle={EmdEmptyMessages.FORFEITURES_EMPTY_TITLE}
        emptyDescription="No EMD forfeitures on your account."
      />
    </div>
  );
}

// ---- Main page ----

const VAN_HELPTEXT =
  "Deposit EMD to this virtual account number. Credits are matched to your account automatically.";

export function EmdPage() {
  const { user } = useAuth();
  const linked = user?.bidderCompId != null;

  const summaryQuery = useMyEmdSummaryQuery(linked);
  const summary = summaryQuery.data;

  const van = summary?.van ?? user?.bidderVan ?? null;

  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const [refundSheetOpen, setRefundSheetOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: TabValue = isValidTab(rawTab) ? rawTab : "passbook";

  const onTabChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", value);
      return next;
    });
  };

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            EMD
            {linked && van ? (
              <>
                <Badge
                  color="grey"
                  className="flex items-center gap-2 text-base font-bold"
                >
                  <span className="font-bold">VAN:</span>
                  {van}
                  <HelpText message={VAN_HELPTEXT} />
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    void copyToClipboard(van).then((ok) => ok && setCopied(true));
                  }}
                  aria-label="Copy VAN"
                  tooltip={copied ? "Copied" : "Copy VAN"}
                >
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy01 className="size-4" />
                  )}
                </Button>
              </>
            ) : null}
          </span>
        }
        description="Your earnest money deposit — balance, passbook, blocked amounts, refunds, and forfeitures."
        actions={
          linked ? (
            <Button
              onClick={() => {
                onTabChange("refunds");
                setRefundSheetOpen(true);
              }}
            >
              <Plus className="size-4" />
              Request Refund
            </Button>
          ) : undefined
        }
      />

      {!linked ? (
        <BidderAccountUnlinkedEmpty
          description={BidderAccountMessages.UNLINKED_EMD_OVERVIEW_DESCRIPTION}
          className="border-0"
        />
      ) : (
        <>
          <div className={STATS_STRIP_CLASS}>
            {STAT_CARDS.map((card) => (
              <Card
                key={card.key}
                className={cn(
                  STATS_CARD_CLASS,
                  "border-2 border-transparent",
                  card.className,
                )}
              >
                <CardContent className="flex flex-col gap-1">
                  <div className="text-xs tracking-wide">{card.label}</div>
                  <div className="text-2xl font-semibold tabular-nums">
                    {summaryQuery.isLoading ? (
                      <Skeleton className="h-8 w-32" />
                    ) : summaryQuery.isError || !summary ? (
                      "—"
                    ) : (
                      formatCurrency(summary[card.key])
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {summary && summary.settlementPendingCount > 0 ? (
            <Badge>{EmdUiMessages.SETTLEMENT_PENDING}</Badge>
          ) : null}

          <UnderlineTabs
            value={activeTab}
            onValueChange={onTabChange}
            className="space-y-4"
          >
            <UnderlineTabsList>
              <UnderlineTabsTrigger value="passbook">
                Passbook
              </UnderlineTabsTrigger>
              <UnderlineTabsTrigger value="blocked">
                Blocked
              </UnderlineTabsTrigger>
              <UnderlineTabsTrigger value="refunds">
                Refunds
              </UnderlineTabsTrigger>
              <UnderlineTabsTrigger value="forfeitures">
                Forfeitures
              </UnderlineTabsTrigger>
            </UnderlineTabsList>

            <UnderlineTabsContent value="passbook">
              <PassbookPanel enabled={linked} />
            </UnderlineTabsContent>
            <UnderlineTabsContent value="blocked">
              <BlockedPanel enabled={linked} />
            </UnderlineTabsContent>
            <UnderlineTabsContent value="refunds">
              <RefundsPanel
                enabled={linked}
                sheetOpen={refundSheetOpen}
                onSheetOpenChange={setRefundSheetOpen}
              />
            </UnderlineTabsContent>
            <UnderlineTabsContent value="forfeitures">
              <ForfeituresPanel enabled={linked} />
            </UnderlineTabsContent>
          </UnderlineTabs>
        </>
      )}
    </div>
  );
}
