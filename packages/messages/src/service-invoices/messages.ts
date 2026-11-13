export const SERVICE_INVOICE_TYPES = ["auto", "manual"] as const;
export type ServiceInvoiceType = (typeof SERVICE_INVOICE_TYPES)[number];

export const SERVICE_INVOICE_TYPE_LABELS: Record<ServiceInvoiceType, string> = {
  auto: "Auto",
  manual: "Manual",
};

export const SERVICE_INVOICE_STATUSES = [
  "draft",
  "requested",
  "generated",
  "recheck",
  "cancelled",
] as const;
export type ServiceInvoiceStatus = (typeof SERVICE_INVOICE_STATUSES)[number];

export const SERVICE_INVOICE_STATUS_LABELS: Record<
  ServiceInvoiceStatus,
  string
> = {
  draft: "Draft",
  requested: "Requested",
  generated: "Generated",
  recheck: "Recheck",
  cancelled: "Cancelled",
};

export const SERVICE_INVOICE_PAYMENT_STATUSES = [
  "unpaid",
  "partially_paid",
  "paid",
] as const;
export type ServiceInvoicePaymentStatus =
  (typeof SERVICE_INVOICE_PAYMENT_STATUSES)[number];

export const SERVICE_INVOICE_PAYMENT_STATUS_LABELS: Record<
  ServiceInvoicePaymentStatus,
  string
> = {
  unpaid: "Unpaid",
  partially_paid: "Partially Paid",
  paid: "Paid",
};

export const ServiceInvoicesValidationMessages = {
  VALIDATION_FAILED: "Please check the form and try again.",
  CLIENT_REQUIRED: "Client is required.",
  PLANT_REQUIRED: "Plant location is required.",
  FROM_DATE_REQUIRED: "From date is required.",
  FROM_DATE_INVALID: "From date must be a valid date (YYYY-MM-DD).",
  TO_DATE_REQUIRED: "To date is required.",
  TO_DATE_INVALID: "To date must be a valid date (YYYY-MM-DD).",
  PERIOD_REQUIRED: "Period is required.",
  DATE_RANGE_INVALID: "To date cannot be earlier than from date.",
  TYPE_REQUIRED: "Type is required.",
  FEE_TYPE_REQUIRED: "Service fee type is required.",
  FEE_VALUE_REQUIRED: "Service fee value is required.",
  FEE_VALUE_POSITIVE: "Service fee value must be 0 or greater.",
  TOTAL_QUANTITY_REQUIRED: "Total quantity is required.",
  TOTAL_QUANTITY_INVALID: "Total quantity must be 0 or greater.",
  TOTAL_AMOUNT_REQUIRED: "Total amount is required.",
  TOTAL_AMOUNT_INVALID: "Total amount must be 0 or greater.",
  GST_PERCENT_REQUIRED: "GST % is required.",
  GST_PERCENT_INVALID: "GST % must be 0 or greater.",
  DESCRIPTION_REQUIRED: "Service charge description is required.",
  DESCRIPTION_MAX: "Description must be at most 3000 characters.",
  GRACE_PERIOD_REQUIRED: "Grace period is required.",
  GRACE_PERIOD_INVALID: "Grace period must be 0 or greater.",
  PLANT_NOT_FOR_CLIENT:
    "Plant location does not belong to the selected client.",
  ANNEXURE_REQUIRED: "Annexure file is required.",
  ANNEXURE_EMPTY: "No annexure lines found for this period.",
  ANNEXURE_FILE_REQUIRED: "Please upload an annexure Excel file.",
  ANNEXURE_FILE_INVALID: "Upload a valid .xlsx annexure file.",
  ANNEXURE_NOT_FOUND: "Annexure file not found for this invoice.",
  ANNEXURE_FILE_TOO_LARGE: (mb: number) =>
    `Annexure file must be at most ${mb} MB.`,
  ANNEXURE_FILE_HINT: (mb: number) => `XLSX only, max ${mb} MB.`,
  ANNEXURE_TOO_MANY_ROWS: (max: number) =>
    `Annexure may contain at most ${max.toLocaleString()} data rows.`,
  ANNEXURE_HEADER_MISSING: (cols: string) =>
    `Missing required column(s): ${cols}. Re-download the template.`,
  ANNEXURE_RANK_HEADERS_MIXED:
    "Use Winning Price and Winning Bidder columns (or a single legacy H1, L1, or H1/L1 pair), not mixed rank pairs.",
  ANNEXURE_RANK_HEADERS_INCOMPLETE: (rank: string) =>
    `${rank} Price and ${rank} Bidder are both required.`,
  ANNEXURE_SPREADSHEET_EMPTY: "Spreadsheet is empty. Re-download the template.",
  ANNEXURE_AMOUNT_MISMATCH: "Amount must equal Winning Price × Lifted Qty.",
  ANNEXURE_ROW_INVALID: "Row failed validation.",
  ANNEXURE_LOAD_FAILED: "Failed to load annexure for this period.",
  STATUS_REQUIRED: "Status is required.",
  STATUS_INVALID: "Status must be draft or requested.",
  ACCOUNTS_STATUS_INVALID: "Status must be generated, recheck, or cancelled.",
  ACCOUNTS_ACTION_EMPTY: "Provide invoice fields and/or a status change.",
  INVOICE_NUMBER_REQUIRED: "Invoice number is required.",
  INVOICE_NUMBER_MAX: "Invoice number must be at most 30 characters.",
  INVOICE_NUMBER_INVALID:
    "Invoice number may only contain letters, numbers, spaces, and - / # .",
  INVOICE_NUMBER_DUPLICATE: "Invoice number should not be duplicate.",
  INVOICE_DATE_REQUIRED: "Invoice date is required.",
  INVOICE_DATE_INVALID: "Invoice date must be a valid date (YYYY-MM-DD).",
  INVOICE_DATE_FUTURE: "Invoice date cannot be a future date.",
  PAYMENT_DUE_DATE_REQUIRED: "Payment due date is required.",
  PAYMENT_DUE_DATE_INVALID:
    "Payment due date must be a valid date (YYYY-MM-DD).",
  PAYMENT_DUE_DATE_BEFORE_INVOICE_DATE:
    "Payment due date cannot be earlier than invoice date.",
  INVOICE_DETAILS_BOTH_REQUIRED:
    "Invoice number, invoice date, and payment due date are all required.",
  INVOICE_DETAILS_REQUIRED_FOR_GENERATED:
    "Save invoice number, invoice date, and payment due date before marking generated.",
  PDF_FILE_REQUIRED: "Please upload a PDF file.",
  PDF_FILE_INVALID: "Upload a valid PDF file.",
  PDF_FILE_TOO_LARGE: (mb: number) => `PDF file must be at most ${mb} MB.`,
  PDF_FILE_HINT: (mb: number) => `PDF only, max ${mb} MB.`,
  BOTH_PDFS_REQUIRED:
    "Upload both annexure PDF and invoice PDF before marking generated.",
  INVOICE_PDF_REQUIRED: "Upload invoice PDF before marking generated.",
  ANNEXURE_PDF_GENERATE_FAILED:
    "Failed to generate annexure PDF from the Excel file.",
  INVALID_ACCOUNTS_TRANSITION:
    "This invoice cannot be updated from its current status.",
  PATCH_EMPTY: "At least one field is required",
  PAID_AMOUNT_REQUIRED: "Paid amount is required.",
  PAID_AMOUNT_INVALID: "Paid amount must be a valid number.",
  PAID_AMOUNT_POSITIVE: "Paid amount must be greater than 0.",
  PAID_AT_REQUIRED: "Paid at date is required.",
  PAID_AT_INVALID: "Paid at must be a valid date.",
  PAID_AT_FUTURE: "Paid at cannot be a future date.",
  PAYMENT_ONLY_GENERATED:
    "Payments can only be recorded for generated invoices.",
  PAYMENT_EXCEEDS_GRAND_TOTAL:
    "Total payments cannot exceed outstanding amount.",
  PAYMENT_IMPORT_MISSING_FILE: "Missing import file.",
  PAYMENT_IMPORT_XLSX_ONLY: "Only .xlsx files are supported.",
  PAYMENT_IMPORT_FILE_TOO_LARGE: (mb: number) =>
    `File exceeds the maximum size of ${mb}MB.`,
  PAYMENT_IMPORT_FILE_HINT: (mb: number) => `XLSX only, max ${mb} MB.`,
  PAYMENT_IMPORT_NO_DATA_ROWS: "No data rows to import.",
  PAYMENT_IMPORT_ROW_LIMIT_EXCEEDED: (max: number) =>
    `Import exceeds the maximum of ${max.toLocaleString()} rows.`,
  PAYMENT_IMPORT_SPREADSHEET_EMPTY:
    "Spreadsheet is empty. Re-download the template.",
  PAYMENT_IMPORT_HEADER_MISSING: (cols: string) =>
    `Missing required column(s): ${cols}. Re-download the template.`,
  PAYMENT_IMPORT_INVOICE_ID_REQUIRED: "Invoice ID is required.",
  PAYMENT_IMPORT_INVOICE_ID_INVALID: "Invoice ID must be a positive integer.",
  PAYMENT_IMPORT_INVOICE_NO_REQUIRED: "Invoice number is required.",
  PAYMENT_IMPORT_INVOICE_ID_NOT_FOUND: "Invoice ID not found.",
  PAYMENT_IMPORT_COMBO_MISMATCH:
    "Invoice ID and Invoice Number combo do not match.",
  PAYMENT_IMPORT_ROW_INVALID: "Row failed validation.",
} as const;

export const ServiceInvoicesSuccessMessages = {
  CREATED: "Service invoice created",
  UPDATED: "Service invoice updated",
  INVOICE_FIELDS_SAVED: "Invoice details saved",
  MARKED_RECHECK: "Invoice marked for recheck",
  MARKED_GENERATED: "Invoice marked as generated",
  MARKED_CANCELLED: "Invoice cancelled",
  ANNEXURE_PDF_UPLOADED: "Annexure PDF uploaded",
  INVOICE_PDF_UPLOADED: "Invoice PDF uploaded",
  ANNEXURE_VALIDATE_COMPLETED: "Annexure validated",
  PAYMENT_SAVED: "Payment details saved",
  PAYMENTS_SAVED: "Payment details saved",
  PAYMENT_IMPORT_COMPLETED: "Payment import completed",
  PAYMENT_IMPORT_ROW_UPLOADED: "Payment recorded",
  BULK_SEND_QUEUED: "Emails queued for sending",
  SEND_QUEUED: "Email queued for sending",
} as const;

export const ServiceInvoicesErrorMessages = {
  NOT_FOUND: "Service invoice not found",
  INVALID_ID: "Invalid service invoice id",
  CLIENT_NOT_FOUND: "Client not found",
  PLANT_NOT_FOUND: "Plant location not found",
  LOCKED: "Only draft or recheck records can be edited",
  CANCELLED_LOCKED:
    "Cancelled invoices are locked; files and downloads are unavailable",
  FORBIDDEN: "You do not have permission for this action",
  SAVE_FAILED: "Failed to save service invoice",
  ANNEXURE_DOWNLOAD_FAILED: "Failed to download annexure",
  ANNEXURE_PDF_DOWNLOAD_FAILED: "Failed to download annexure PDF",
  ANNEXURE_OPEN_FAILED: "Failed to open annexure",
  ANNEXURE_TEMPLATE_DOWNLOAD_FAILED: "Failed to download annexure template",
  ANNEXURE_VALIDATE_FAILED: "Annexure validation failed",
  ANNEXURE_COULD_NOT_COMPLETE: "Could not complete annexure validation",
  PDF_UPLOAD_FAILED: "Failed to upload PDF",
  PAYMENT_LOG_NOT_FOUND: "Payment record not found",
  FAILED_TO_SAVE_PAYMENT: "Failed to save payment details",
  FAILED_TO_IMPORT_PAYMENTS: "Failed to import payments.",
  FAILED_TO_DOWNLOAD_PAYMENT_IMPORT_TEMPLATE:
    "Failed to download payment import template.",
  BILLING_EMAIL_MISSING: "Plant location has no billing email (To) configured.",
  PDF_ATTACHMENT_MISSING:
    "Annexure PDF and Invoice PDF must both exist before sending email.",
  INVOICE_PDF_ATTACHMENT_MISSING:
    "Invoice PDF must exist before sending email.",
  NOT_GENERATED: "Only generated invoices can be emailed.",
  SEND_FAILED: "Failed to queue email for this invoice.",
  BULK_SEND_FAILED: "Failed to queue email for this invoice.",
  BULK_SEND_IDS_REQUIRED: "Select at least one service invoice.",
} as const;

export const ServiceInvoicesAnnexureUiMessages = {
  DOWNLOAD_AS_XLSX: "Download as XLSX",
  DOWNLOAD_AS_PDF: "Download as PDF",
  DOWNLOAD_PREPARING: "Preparing…",
} as const;

export const ServiceInvoicesPaymentImportUiMessages = {
  TOAST_ID: "service-invoice-payment-bulk-import",
  STARTING: "Starting import…",
  COMPLETE: "Import complete",
  IN_PROGRESS: "Import In Progress",
  COMPLETED: "Import Completed",
  FAILED: "Import Failed",
  COULD_NOT_COMPLETE: "Import could not be completed",
  OUTCOME_SUCCESS: "Imported",
  OUTCOME_FAILED: "Failed",
  OUTCOME_SKIPPED: "Skipped",
  OUTCOME_TOTAL: "Total Records",
  UPLOADING: "Uploading spreadsheet…",
  READING: "Reading spreadsheet…",
  PARSED_ROWS: (n: number) => `Parsed ${n.toLocaleString()} rows`,
  IMPORTING_ROWS: (processed: number, total: number) =>
    `Importing rows (${processed.toLocaleString()} / ${total.toLocaleString()})`,
  CHECKLIST: [
    "Download the template and keep the header row unchanged",
    "Invoice ID must match an existing generated service invoice",
    "Invoice No. must exactly match the invoice number on that invoice",
    "Paid Amount must be greater than zero and within outstanding balance",
    "Paid At must be a valid date on or before today (YYYY-MM-DD recommended)",
  ],
} as const;

export function buildServiceInvoicePaymentImportResultMessage(result: {
  imported: number;
  failed: number;
  skipped: number;
}): string {
  const { imported, failed, skipped } = result;
  const paymentWord = (n: number) => (n === 1 ? "payment" : "payments");
  const parts: string[] = [
    `Imported ${imported.toLocaleString()} ${paymentWord(imported)}`,
  ];
  if (failed > 0) parts.push(`${failed.toLocaleString()} failed`);
  if (skipped > 0) parts.push(`${skipped.toLocaleString()} skipped`);
  return `${parts.join("; ")}.`;
}

export function formatServiceInvoicePaymentImportErrorToast(
  rowErrors: { rowNumber: number }[],
): { title: string; description: string } {
  const failedRows =
    rowErrors.length > 0 ? rowErrors.map((r) => r.rowNumber).join(", ") : null;

  const checklist = ServiceInvoicesPaymentImportUiMessages.CHECKLIST.map(
    (line) => `• ${line}`,
  ).join("\n");
  const footer = failedRows ? `\n\nFailed rows: ${failedRows}` : "";

  return {
    title: ServiceInvoicesPaymentImportUiMessages.COULD_NOT_COMPLETE,
    description: `Please review your file and check:\n${checklist}${footer}`,
  };
}
