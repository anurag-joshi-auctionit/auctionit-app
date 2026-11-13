export const SubscriptionsValidationMessages = {
  VALIDATION_FAILED: "Please check the form and try again.",
  BIDDER_REQUIRED: "Bidder is required.",
  SUBSCRIPTION_TYPE_REQUIRED: "Subscription type is required.",
  NAME_REQUIRED: "Name is required.",
  AMOUNT_REQUIRED: "Amount is required.",
  AMOUNT_MUST_BE_POSITIVE: "Amount must be greater than 0.",
  AMOUNT_MUST_BE_NON_NEGATIVE: "Enter a valid amount.",
  GST_PERCENT_REQUIRED: "GST % is required.",
  GST_PERCENT_INVALID: "Select a valid GST %.",
  MONTHS_REQUIRED: "Months is required.",
  MONTHS_MUST_BE_NON_NEGATIVE_INTEGER: "Enter a whole number of months (≥ 0).",
  MONTHS_MUST_BE_POSITIVE_INTEGER: "Enter a whole number of months (≥ 1).",
  PAYMENT_MODE_REQUIRED: "Payment mode is required.",
  PAYMENT_DATE_REQUIRED: "Payment date is required.",
  PAYMENT_DATE_INVALID: "Payment date must be a valid date (YYYY-MM-DD).",
  PAYMENT_DATE_FUTURE: "Payment date cannot be a future date.",
  FROM_DATE_REQUIRED: "From date is required.",
  FROM_DATE_INVALID: "From date must be a valid date (YYYY-MM-DD).",
  FROM_DATE_BEFORE_PAYMENT_MONTH:
    "Subscription period cannot start before the payment month.",
  TO_DATE_REQUIRED: "To date is required.",
  TO_DATE_INVALID: "To date must be a valid date (YYYY-MM-DD).",
  TRANSACTION_ID_REQUIRED: "Transaction reference is required.",
  TRANSACTION_ID_MAX: "Transaction ID must be at most 100 characters.",
  TRANSACTION_ID_DUPLICATE: "Transaction reference already exists.",
  REMARKS_MAX: "Remarks must be at most 2000 characters.",
  PDF_FILE_REQUIRED: "Please upload a PDF file.",
  PDF_FILE_INVALID: "Upload a valid PDF file.",
  PDF_FILE_TOO_LARGE: (mb: number) => `PDF file must be at most ${mb} MB.`,
  PDF_FILE_HINT: (mb: number) => `PDF only, max ${mb} MB.`,
  INVOICE_NUMBER_REQUIRED: "Invoice number is required.",
  INVOICE_NUMBER_MAX: "Invoice number must be at most 30 characters.",
  INVOICE_NUMBER_INVALID: "Enter a valid invoice number.",
  INVOICE_NUMBER_DUPLICATE: "Invoice number should not be duplicate.",
  INVOICE_DATE_REQUIRED: "Invoice date is required.",
  INVOICE_DATE_INVALID: "Invoice date must be a valid date (YYYY-MM-DD).",
  INVOICE_DATE_FUTURE: "Invoice date cannot be a future date.",
  STATUS_REQUIRED: "Status is required.",
  ACCOUNTS_STATUS_INVALID: "Status must be recheck or cancelled.",
  ADMIN_STATUS_INVALID: "Status must be requested.",
  INVALID_ACCOUNTS_TRANSITION:
    "This subscription invoice cannot be updated from its current status.",
  INVALID_ADMIN_TRANSITION:
    "Only recheck invoices can be returned to requested.",
  UPLOAD_ONLY_REQUESTED:
    "Invoice PDF can only be uploaded for requested or generated invoices.",
  INVOICE_IMPORT_MISSING_FILE: "Missing import spreadsheet.",
  INVOICE_IMPORT_XLSX_ONLY:
    "Only .xlsx files are supported for the spreadsheet.",
  INVOICE_IMPORT_FILE_TOO_LARGE: (mb: number) =>
    `Spreadsheet exceeds the maximum size of ${mb}MB.`,
  INVOICE_IMPORT_FILE_HINT: (mb: number) => `XLSX only, max ${mb} MB.`,
  INVOICE_IMPORT_PDF_HINT: (mb: number) => `PDF only, max ${mb} MB each.`,
  INVOICE_IMPORT_PDFS_REQUIRED: "Select at least one invoice PDF file.",
  INVOICE_IMPORT_PDF_INVALID: "Upload valid PDF files only.",
  INVOICE_IMPORT_PDF_TOO_LARGE: (mb: number) =>
    `Each PDF must be at most ${mb} MB.`,
  INVOICE_IMPORT_PDF_DUPLICATE: (name: string) =>
    `Duplicate PDF filename in upload: ${name}.`,
  INVOICE_IMPORT_NO_DATA_ROWS: "No data rows to import.",
  INVOICE_IMPORT_ROW_LIMIT_EXCEEDED: (max: number) =>
    `Import exceeds the maximum of ${max.toLocaleString()} rows.`,
  INVOICE_IMPORT_SPREADSHEET_EMPTY: "Spreadsheet is empty.",
  INVOICE_IMPORT_HEADER_MISSING: (cols: string) =>
    `Missing required column(s): ${cols}.`,
  INVOICE_IMPORT_INVOICE_ID_REQUIRED: "Invoice ID is required.",
  INVOICE_IMPORT_INVOICE_ID_INVALID: "Invoice ID must be a positive integer.",
  INVOICE_IMPORT_BIDDER_ID_REQUIRED: "Bidder ID is required.",
  INVOICE_IMPORT_BIDDER_ID_INVALID: "Bidder ID must be a positive integer.",
  INVOICE_IMPORT_PDF_FILENAME_REQUIRED: "Invoice PDF filename is required.",
  INVOICE_IMPORT_INVOICE_ID_NOT_FOUND: "Invoice ID not found.",
  INVOICE_IMPORT_COMBO_MISMATCH: "Invoice ID and Bidder ID combo do not match.",
  INVOICE_IMPORT_PDF_MISSING: (name: string) =>
    `PDF file not found in upload: ${name}.`,
  INVOICE_IMPORT_PDF_ALREADY_USED: (name: string) =>
    `PDF file already used by another row: ${name}.`,
  INVOICE_IMPORT_ROW_INVALID: "Row failed validation.",
} as const;

export const SubscriptionsErrorMessages = {
  FAILED_TO_REQUEST: "Failed to request subscription invoice",
  FAILED_TO_UPDATE: "Failed to update subscription invoice",
  FAILED_TO_SAVE_TYPE: "Failed to save subscription type",
  SUBSCRIPTION_TYPE_NOT_FOUND: "Subscription type not found",
  INVALID_SUBSCRIPTION_TYPE_ID: "Invalid subscription type id",
  SUBSCRIPTION_TYPE_NOT_FOUND_BY_ID: (id: number | string) =>
    `Subscription type not found: ${id}`,
  SUBSCRIPTION_TYPE_NAME_EXISTS:
    "A subscription type with this name already exists.",
  SUBSCRIPTION_TYPE_ID_ZERO: "Cannot create subscription type with id 0.",
  SUBSCRIPTION_TYPE_PLACEHOLDER_LOCKED:
    "The placeholder subscription type cannot be edited.",
  SUBSCRIPTION_TYPE_CREATE_FAILED: "Failed to create subscription type.",
  SUBSCRIPTION_TYPE_UPDATE_FAILED: "Failed to update subscription type.",
  FAILED_TO_LOAD: "Failed to load subscriptions.",
  NOT_FOUND: "Subscription not found",
  FORBIDDEN: "You do not have permission to perform this action",
  PDF_UPLOAD_FAILED: "Failed to upload PDF",
  PDF_FILE_REQUIRED: "Please upload a PDF file.",
  EXPORT_FAILED: "Failed to export subscriptions.",
  BIDDER_EMAIL_MISSING: "Bidder has no active login user email configured.",
  BIDDER_NOT_FOUND: "Bidder not found",
  INVOICE_PDF_MISSING: "Subscription invoice PDF not found.",
  NOT_GENERATED: "Only generated invoices can be emailed.",
  SEND_FAILED: "Failed to queue email for this subscription.",
  BULK_SEND_FAILED: "Failed to queue email for this subscription.",
  BULK_SEND_IDS_REQUIRED: "Select at least one subscription.",
  LOCKED: "Only recheck invoices can be edited",
  CANCELLED_LOCKED:
    "Cancelled invoices are locked; files and downloads are unavailable",
  STATUS_UPDATE_FAILED: "Failed to update subscription invoice status",
  FAILED_TO_IMPORT_INVOICES: "Failed to import invoices",
  FAILED_TO_DOWNLOAD_INVOICE_IMPORT_TEMPLATE:
    "Failed to download invoice import template",
  PAYMENTS_DISABLED: "Online payments are currently unavailable",
  PAYMENT_LINK_SEND_FAILED: "Failed to queue subscription payment link email",
  PAYMENT_REQUEST_NOT_FOUND: "Payment request not found",
  MISSING_TRANSACTION_REFERENCE: "Missing transaction reference",
} as const;

export const SubscriptionsSuccessMessages = {
  INVOICE_REQUESTED: "Subscription invoice requested",
  INVOICE_UPDATED: "Subscription invoice updated",
  INVOICE_PDF_UPLOADED: "Invoice PDF uploaded",
  BULK_SEND_QUEUED: "Emails queued for sending",
  SEND_QUEUED: "Email queued for sending",
  PAYMENT_LINK_QUEUED: "Payment link email queued for sending",
  MARKED_RECHECK: "Invoice marked for recheck",
  MARKED_CANCELLED: "Invoice cancelled",
  MARKED_REQUESTED: "Invoice returned to requested",
  INVOICE_IMPORT_COMPLETED: "Invoice import completed",
  INVOICE_IMPORT_ROW_UPLOADED: "Invoice uploaded",
} as const;

export const SubscriptionInvoiceStatusLabels = {
  requested: "Requested",
  recheck: "Recheck",
  generated: "Generated",
  cancelled: "Cancelled",
} as const;

/** Bidder portal labels — hide admin invoice workflow jargon. */
export const BidderSubscriptionInvoiceStatusLabels = {
  requested: "Processing",
  recheck: "Processing",
  generated: "Generated",
  cancelled: "Cancelled",
} as const;

export const BidderSubscriptionMessages = {
  PLAN_REQUIRED: "Select a subscription plan.",
  PAY_START_FAILED: "Could not start the payment",
  PAY_OPENED_NEW_TAB:
    "Complete your payment in the new tab. This page will update when you're done.",
  PAY_SUCCESS: "Payment successful. Your subscription is now active.",
  PAY_FAILED: "Payment did not go through. You can try again.",
  PAY_STILL_PROCESSING:
    "Payment is still being confirmed. If money was deducted, it will reflect shortly — please check back in a few minutes.",
  RETURN_CONFIRMING_TITLE: "Confirming your payment…",
  RETURN_CONFIRMING_BODY:
    "Please wait while we confirm your subscription payment.",
  RETURN_NO_TXN_TITLE: "No payment to confirm",
  RETURN_NO_TXN_BODY: "We couldn't identify a payment to confirm.",
  RETURN_ERROR_TITLE: "Couldn't confirm the payment",
  RETURN_ERROR_BODY:
    "We couldn't confirm your payment right now. If money was deducted, it will reflect shortly — please check your subscription in a few minutes.",
  RETURN_COMPLETED_TITLE: "Subscription active",
  RETURN_COMPLETED_BODY:
    "Your payment was successful and your subscription is now active.",
  RETURN_FAILED_TITLE: "Payment not completed",
  RETURN_FAILED_BODY:
    "Your payment did not go through. You can try again from the subscriptions page.",
  RETURN_TIMEOUT_TITLE: "Still processing",
  RETURN_TIMEOUT_BODY:
    "Your payment is still being confirmed. If money was deducted, it will reflect shortly — please check back in a few minutes.",
} as const;

export const SubscriptionsInvoiceImportUiMessages = {
  TOAST_ID: "subscription-invoice-bulk-import",
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
  UPLOADING: "Uploading spreadsheet and PDFs…",
  READING: "Reading spreadsheet…",
  PARSED_ROWS: (n: number) => `Parsed ${n.toLocaleString()} rows`,
  IMPORTING_ROWS: (processed: number, total: number) =>
    `Importing rows (${processed.toLocaleString()} / ${total.toLocaleString()})`,
  CHECKLIST: [
    "Download the template and keep the header row unchanged",
    "Invoice Id + Bidder must match an existing requested subscription",
    "Invoice no is required",
    "Invoice PDF column must match an uploaded PDF filename exactly",
    "Only PDFs listed in the spreadsheet are uploaded; extra files are ignored",
  ],
} as const;

export function buildSubscriptionInvoiceImportResultMessage(result: {
  imported: number;
  failed: number;
  skipped: number;
}): string {
  const { imported, failed, skipped } = result;
  const invoiceWord = (n: number) => (n === 1 ? "invoice" : "invoices");
  const parts: string[] = [
    `Imported ${imported.toLocaleString()} ${invoiceWord(imported)}`,
  ];
  if (failed > 0) parts.push(`${failed.toLocaleString()} failed`);
  if (skipped > 0) parts.push(`${skipped.toLocaleString()} skipped`);
  return `${parts.join("; ")}.`;
}
