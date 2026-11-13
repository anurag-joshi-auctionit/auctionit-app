export const LIFTING_CLIENTS_REMARKS_MAX_LENGTH = 5000;

export const LiftingClientsValidationMessages = {
  VALIDATION_FAILED: "Please check the form and try again.",
  LIFTED_QTY_REQUIRED: "Lifted quantity is required.",
  LIFTED_QTY_NOT_NUMBER: "Lifted quantity must be a number.",
  LIFTED_QTY_CANNOT_BE_NEGATIVE: "Lifted quantity cannot be negative.",
  REMARKS_MAX: (max: number) => `Remarks must be at most ${max} characters.`,
  LOT_ID_REQUIRED: "Lot ID is required.",
  AUCTION_NAME_REQUIRED: "Auction name is required.",
  LOT_NUMBER_REQUIRED: "Lot number is required.",
  LIFTED_DATE_REQUIRED: "Lifted date is required.",
  LIFTED_DATE_MUST_BE_ISO: "Lifted date must be YYYY-MM-DD.",
  LIFTED_DATE_FUTURE: "Lifted date cannot be a future date.",
  DATE_INVALID: "Invalid date.",
  DATE_UNRECOGNIZED_FORMAT:
    "Unrecognized date format. Use YYYY-MM-DD (recommended) or an unambiguous DD/MM/YYYY or MM/DD/YYYY value.",
  DATE_AMBIGUOUS:
    "Ambiguous date (could be DD/MM or MM/DD). Use YYYY-MM-DD, e.g. 2026-06-03.",
  DATE_INVALID_EXCEL_SERIAL: "Invalid Excel date serial.",
  DISPOSITION_INVALID: "Invalid disposition status.",
  LIFTED_DATE_INVALID: "Invalid lifted date.",
  INVALID_SCOPE: "Select at least one client and one auction.",
  CLIENT_IDS_REQUIRED: "Select at least one client.",
  AUCTION_IDS_REQUIRED: "Select at least one auction.",
  MISSING_IMPORT_FILE: "Missing import file.",
  XLSX_ONLY: "Only .xlsx files are supported.",
  FILE_TOO_LARGE: (mb: number) => `File exceeds the maximum size of ${mb}MB.`,
  IMPORT_FILE_HINT: (mb: number) => `XLSX only, max ${mb} MB.`,
  NO_DATA_ROWS: "No data rows to import.",
  ROW_LIMIT_EXCEEDED: (max: number) =>
    `Import exceeds the maximum of ${max.toLocaleString()} rows.`,
  INVALID_LOT_ID: "Invalid lot ID",
  LOT_NOT_FOUND_OR_NOT_APPROVED: "Lot not found or not approved",
  LOT_OUT_OF_SCOPE: "Lot is outside the selected client/auction scope",
  AUCTION_LOT_MISMATCH: "Auction or lot number does not match the lot ID",
  DUPLICATE_LOT_IN_FILE: (keptRow: number) =>
    `Duplicate lot ID in file (row ${keptRow} kept)`,
  ROW_SKIPPED_NO_LIFTED_QTY: "No lifted quantity — row skipped",
  NO_LOT_ITEMS: "No active items found for this lot",
  IMPORT_EXCEL_DISPOSITION_TITLE: "Invalid disposition",
  IMPORT_EXCEL_DISPOSITION_ERROR: "Choose a disposition from the list.",
} as const;

export const LiftingClientsSuccessMessages = {
  LOG_SAVED: "Lifting log saved.",
  LOGS_SAVED: "Lifting logs saved.",
  LOG_UPDATED: "Lifting log updated.",
  LOGS_UPDATED: "Lifting logs updated.",
  IMPORT_ROW_UPLOADED: "Lifting log imported successfully",
} as const;

export const LiftingClientsErrorMessages = {
  FAILED_TO_SAVE: "Failed to save lifting logs.",
  FAILED_TO_UPDATE: "Failed to update lifting logs.",
  FAILED_TO_IMPORT: "Failed to import lifting logs.",
  FAILED_TO_DOWNLOAD_TEMPLATE: "Failed to download import template.",
  LOT_NOT_FOUND: "Lifting lot not found.",
  LOG_NOT_FOUND: "Lifting log not found.",
  LOAD_OVERVIEW_GENERIC: "Could not load lifting overview.",
  LOAD_HISTORY_GENERIC: "Could not load lifting history.",
  LOAD_TABLE_GENERIC: "We couldn't load lifting lots. Try again.",
  LOAD_TABLE_TITLE: "Could not load lifting lots",
  LOAD_OVERVIEW_TITLE: "Could not load lifting overview",
  LOAD_HISTORY_TITLE: "Could not load lifting history",
  IMPORT_UNEXPECTED: "Import failed unexpectedly.",
  REQUEST_FAILED: "Request failed.",
} as const;

export const LiftingClientsImportUiMessages = {
  TOAST_ID: "lifting-clients-bulk-import",
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
    "Select client(s) and auction(s) before downloading the template",
    "Fill lifted quantity (and lifted date) only on rows you want to import",
    "Use YYYY-MM-DD for lifted date (or pick a date cell in Excel)",
    "Lifted date cannot be a future date",
    "Lifted quantity must be greater than zero",
    "Disposition must match the template dropdown values",
  ],
} as const;

export function buildLiftingClientsImportResultMessage(result: {
  imported: number;
  failed: number;
  skipped: number;
}): string {
  const { imported, failed, skipped } = result;
  const logWord = (n: number) => (n === 1 ? "log" : "logs");
  const parts: string[] = [
    `Imported ${imported.toLocaleString()} ${logWord(imported)}`,
  ];
  if (failed > 0) parts.push(`${failed.toLocaleString()} failed`);
  if (skipped > 0) parts.push(`${skipped.toLocaleString()} skipped`);
  return `${parts.join("; ")}.`;
}

export function formatImportFieldErrors(
  fieldErrors?: Record<string, string[]>,
): string {
  if (!fieldErrors) return "";
  const parts: string[] = [];
  for (const [field, messages] of Object.entries(fieldErrors)) {
    for (const message of messages) {
      parts.push(field === "_root" ? message : `${field}: ${message}`);
    }
  }
  return parts.join("; ");
}

export function listImportFieldErrorEntries(
  fieldErrors?: Record<string, string[]>,
): { field: string; message: string }[] {
  if (!fieldErrors) return [];
  const entries: { field: string; message: string }[] = [];
  for (const [field, messages] of Object.entries(fieldErrors)) {
    for (const message of messages) {
      entries.push({ field, message });
    }
  }
  return entries;
}

export type LiftingClientsImportRowErrorLike = {
  rowNumber: number;
};

export function formatLiftingClientsImportErrorToast(
  rowErrors: LiftingClientsImportRowErrorLike[],
): { title: string; description: string } {
  const failedRows =
    rowErrors.length > 0 ? rowErrors.map((r) => r.rowNumber).join(", ") : null;

  const checklist = LiftingClientsImportUiMessages.CHECKLIST.map(
    (line) => `• ${line}`,
  ).join("\n");
  const footer = failedRows ? `\n\nFailed rows: ${failedRows}` : "";

  return {
    title: LiftingClientsImportUiMessages.COULD_NOT_COMPLETE,
    description: `Please review your file and check:\n${checklist}${footer}`,
  };
}
