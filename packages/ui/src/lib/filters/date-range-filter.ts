import type { DateRange } from "react-day-picker";
import { formatDateParam, parseUtcDateTime } from "../utils/date";

export const BIDDER_DATE_FILTER_FIELDS = [
  "createdAt",
  "assignedAt",
  "onboardedAt",
  "lastFollowup",
  "nextFollowup",
] as const;

export type BidderDateFilterField = (typeof BIDDER_DATE_FILTER_FIELDS)[number];

/** @deprecated Use {@link BidderDateFilterField} for bidder leads; {@link LiftingDateFilterField} for lifting. */
export type DateFilterField = BidderDateFilterField;

export const LIFTING_DATE_FILTER_FIELDS = [
  "auctionDate",
  "lotConfirmation",
  "liftingDue",
  "nextFollowup",
  "lastModified",
] as const;

export type LiftingDateFilterField =
  (typeof LIFTING_DATE_FILTER_FIELDS)[number];

export type ColumnDateRangeFilterValue<
  TField extends string = BidderDateFilterField,
> = {
  field: TField;
  range?: DateRange;
};

export type DateFilterColumnOption<
  TField extends string = BidderDateFilterField,
> = {
  value: TField;
  label: string;
};

export const BIDDER_DATE_FILTER_COLUMNS: DateFilterColumnOption<BidderDateFilterField>[] =
  [
    { value: "createdAt", label: "Created At" },
    { value: "assignedAt", label: "Assigned At" },
    { value: "onboardedAt", label: "Onboarded At" },
    { value: "lastFollowup", label: "Last Modified" },
    { value: "nextFollowup", label: "Next Follow-up" },
  ];

export const LIFTING_DATE_FILTER_COLUMNS: DateFilterColumnOption<LiftingDateFilterField>[] =
  [
    { value: "auctionDate", label: "Auction Date" },
    { value: "lotConfirmation", label: "Lot Confirmation" },
    { value: "liftingDue", label: "Lifting Due" },
    { value: "nextFollowup", label: "Next Follow-up" },
    { value: "lastModified", label: "Last Modified" },
  ];

/** Calendar-day compare for client-side list filters (inclusive range). */
export function rowDateInRange(
  isoValue: string | null | undefined,
  range?: DateRange,
): boolean {
  if (!range?.from) return true;
  if (!isoValue) return false;
  const d = parseUtcDateTime(isoValue);
  if (Number.isNaN(d.getTime())) return false;
  const day = formatDateParam(d);
  const from = formatDateParam(range.from);
  const to = range.to ? formatDateParam(range.to) : from;
  return day >= from && day <= to;
}

export type LiftingDateFilterRow = {
  auctionDate: string;
  lotConfirmation: string | null;
  liftingDue: string | null;
  nextFollowup: string | null;
  lastModified: string;
};

export function matchesLiftingDateFilter(
  row: LiftingDateFilterRow,
  field: LiftingDateFilterField,
  range?: DateRange,
): boolean {
  if (!range?.from) return true;
  switch (field) {
    case "auctionDate":
      return rowDateInRange(row.auctionDate, range);
    case "lotConfirmation":
      return rowDateInRange(row.lotConfirmation, range);
    case "liftingDue":
      return rowDateInRange(row.liftingDue, range);
    case "nextFollowup":
      return rowDateInRange(row.nextFollowup, range);
    case "lastModified":
      return rowDateInRange(row.lastModified, range);
    default:
      return true;
  }
}

export const CLIENT_DATE_FILTER_FIELDS = ["createdAt"] as const;

export type ClientDateFilterField = (typeof CLIENT_DATE_FILTER_FIELDS)[number];

export const CLIENT_DATE_FILTER_COLUMNS: DateFilterColumnOption<ClientDateFilterField>[] =
  [{ value: "createdAt", label: "Created At" }];

export type ClientsDateFilterRow = { createdAt: string };

export function matchesClientsDateFilter(
  row: ClientsDateFilterRow,
  field: ClientDateFilterField,
  range?: DateRange,
): boolean {
  if (!range?.from) return true;
  if (field === "createdAt") {
    return rowDateInRange(row.createdAt, range);
  }
  return true;
}

export const SERVICE_INVOICE_DATE_FILTER_FIELDS = [
  "createdAt",
  "period",
  "requestedAt",
  "generatedAt",
  "recheckedAt",
  "cancelledAt",
] as const;

export type ServiceInvoiceDateFilterField =
  (typeof SERVICE_INVOICE_DATE_FILTER_FIELDS)[number];

export const SERVICE_INVOICE_DATE_FILTER_COLUMNS: DateFilterColumnOption<ServiceInvoiceDateFilterField>[] =
  [
    { value: "createdAt", label: "Created At" },
    { value: "period", label: "Period" },
    { value: "requestedAt", label: "Requested At" },
    { value: "generatedAt", label: "Generated At" },
    { value: "recheckedAt", label: "Rechecked At" },
    { value: "cancelledAt", label: "Cancelled At" },
  ];

export type ServiceInvoiceDateFilterRow = {
  createdAt: string;
  fromDate: string;
  toDate: string;
  requestedAt?: string | null;
  generatedAt?: string | null;
  recheckedAt?: string | null;
  cancelledAt?: string | null;
};

/** Invoice period overlaps the selected range (inclusive calendar days). */
function rowPeriodOverlapsRange(
  fromDate: string | null | undefined,
  toDate: string | null | undefined,
  range?: DateRange,
): boolean {
  if (!range?.from) return true;
  if (!fromDate || !toDate) return false;
  const periodFrom = parseUtcDateTime(fromDate);
  const periodTo = parseUtcDateTime(toDate);
  if (Number.isNaN(periodFrom.getTime()) || Number.isNaN(periodTo.getTime())) {
    return false;
  }
  const periodFromDay = formatDateParam(periodFrom);
  const periodToDay = formatDateParam(periodTo);
  const rangeFrom = formatDateParam(range.from);
  const rangeTo = range.to ? formatDateParam(range.to) : rangeFrom;
  return periodFromDay <= rangeTo && periodToDay >= rangeFrom;
}

export function matchesServiceInvoiceDateFilter(
  row: ServiceInvoiceDateFilterRow,
  field: ServiceInvoiceDateFilterField,
  range?: DateRange,
): boolean {
  if (!range?.from) return true;
  switch (field) {
    case "createdAt":
      return rowDateInRange(row.createdAt, range);
    case "period":
      return rowPeriodOverlapsRange(row.fromDate, row.toDate, range);
    case "requestedAt":
      return row.requestedAt ? rowDateInRange(row.requestedAt, range) : false;
    case "generatedAt":
      return row.generatedAt ? rowDateInRange(row.generatedAt, range) : false;
    case "recheckedAt":
      return row.recheckedAt ? rowDateInRange(row.recheckedAt, range) : false;
    case "cancelledAt":
      return row.cancelledAt ? rowDateInRange(row.cancelledAt, range) : false;
    default:
      return true;
  }
}

export const BANK_UPDATE_DATE_FILTER_FIELDS = [
  "requestedAt",
  "reviewedAt",
] as const;

export type BankUpdateDateFilterField =
  (typeof BANK_UPDATE_DATE_FILTER_FIELDS)[number];

export const BANK_UPDATE_DATE_FILTER_COLUMNS: DateFilterColumnOption<BankUpdateDateFilterField>[] =
  [
    { value: "requestedAt", label: "Requested At" },
    { value: "reviewedAt", label: "Reviewed At" },
  ];

export type BankUpdateDateFilterRow = {
  requestedAt: string;
  reviewedAt: string | null;
};

export function matchesBankUpdateDateFilter(
  row: BankUpdateDateFilterRow,
  field: BankUpdateDateFilterField,
  range?: DateRange,
): boolean {
  if (!range?.from) return true;
  switch (field) {
    case "requestedAt":
      return rowDateInRange(row.requestedAt, range);
    case "reviewedAt":
      return row.reviewedAt ? rowDateInRange(row.reviewedAt, range) : false;
    default:
      return true;
  }
}

export const SUBSCRIPTION_DATE_FILTER_FIELDS = [
  "paymentDate",
  "fromDate",
  "toDate",
  "createdAt",
] as const;

export type SubscriptionDateFilterField =
  (typeof SUBSCRIPTION_DATE_FILTER_FIELDS)[number];

export const SUBSCRIPTION_DATE_FILTER_COLUMNS: DateFilterColumnOption<SubscriptionDateFilterField>[] =
  [
    { value: "paymentDate", label: "Payment Date" },
    { value: "fromDate", label: "From Date" },
    { value: "toDate", label: "To Date" },
    { value: "createdAt", label: "Created At" },
  ];

export type SubscriptionDateFilterRow = {
  paymentDate: string | null;
  fromDate: string | null;
  toDate: string | null;
  createdAt: string;
};

export function matchesSubscriptionDateFilter(
  row: SubscriptionDateFilterRow,
  field: SubscriptionDateFilterField,
  range?: DateRange,
): boolean {
  if (!range?.from) return true;
  switch (field) {
    case "paymentDate":
      return rowDateInRange(row.paymentDate, range);
    case "fromDate":
      return rowDateInRange(row.fromDate, range);
    case "toDate":
      return rowDateInRange(row.toDate, range);
    case "createdAt":
      return rowDateInRange(row.createdAt, range);
    default:
      return true;
  }
}

export function dateRangeFilterToApi<TField extends string>(
  field: TField,
  range?: DateRange,
): { dateField?: TField; dateFrom?: string; dateTo?: string } {
  if (!range?.from) return {};
  return {
    dateField: field,
    dateFrom: formatDateParam(range.from),
    ...(range.to ? { dateTo: formatDateParam(range.to) } : {}),
  };
}
