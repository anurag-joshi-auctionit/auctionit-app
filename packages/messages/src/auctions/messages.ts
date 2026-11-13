export const AuctionsValidationMessages = {
  VALIDATION_FAILED: "Please check the form and try again.",
  REQUIRED: "Required",
  CLIENT_REQUIRED: "Select a client",
  CLIENT_CANNOT_CHANGE: "Client cannot be changed after the auction is created",
  AUCTION_NUMBER_REQUIRED: "Auction number is required",
  AUCTION_NUMBER_TOO_LONG:
    "Auction number (including prefix) must be 50 characters or fewer",
  AUCTION_NUMBER_DUPLICATE: "Auction number should not be duplicate.",
  CLIENT_AUCTION_PREFIX_REQUIRED:
    "Client auction prefix is required. Set it in client auction settings.",
  AUCTION_DATE_REQUIRED: "Auction date is required",
  AUCTION_DATE_MUST_BE_TODAY_OR_LATER: "Auction date must be today or later",
  DATE_RANGE_INVALID: "Enter a valid date range.",
  DATE_RANGE_ORDER: "Start date must be on or before the end date.",
  PUBLISHED_AT_REQUIRED: "Published at is required",
  PUBLISHED_AT_MUST_BE_FUTURE:
    "Published at must be greater than the current time",
  PUBLISHED_AT_MUST_BE_ON_OR_BEFORE_AUCTION_DATE:
    "Published at must be on or before the auction date",
  LOT_NUMBER_REQUIRED: "Lot number is required",
  DISPLAY_ORDER_REQUIRED: "Display order is required",
  DISPLAY_ORDER_MUST_BE_POSITIVE: "Display order must be greater than zero",
  DISPLAY_ORDER_DUPLICATE_IN_AUCTION:
    "Display order cannot be duplicate in same auction.",
  DUPLICATE_DISPLAY_ORDER_IN_FILE: (keptRowNumber: number) =>
    `Duplicate display order in file; kept row ${keptRowNumber}`,
  DUPLICATE_LOT_NUMBER_IN_FILE: (keptRowNumber: number) =>
    `Duplicate lot number in file; kept row ${keptRowNumber}`,
  LOT_NUMBER_ALREADY_EXISTS: "Lot number already exists in this auction",
  IMPORT_ROW_UPLOADED: "Lot imported successfully",
  IMPORT_ROW_UPDATED: "Lot updated successfully",
  IMPORT_ROW_SKIPPED_WITHDRAWN:
    "Display order matches a withdrawn lot; row was not updated",
  LOT_ALREADY_WITHDRAWN: "Lot is already withdrawn",
  LOT_WITHDRAW_NOT_FOUND: "Lot not found",
  BIDDER_MAP_ROW_UPLOADED: "Bidder mapped successfully",
  BIDDER_ALREADY_ATTACHED_TO_SELECTED_LOTS:
    "Already attached to the selected lot(s)",
  BIDDER_ATTACHED_WITH_SKIPPED: (attached: number, skipped: number) =>
    `Attached to ${attached} lot(s); ${skipped} already attached (skipped)`,
  PLANT_LOCATION_REQUIRED: "Plant location is required",
  MATERIAL_LOCATION_REQUIRED: "Material location is required",
  GST_PERCENTAGE_REQUIRED: "GST percentage is required",
  TCS_PERCENTAGE_REQUIRED: "TCS% is required",
  TCS_PERCENTAGE_MUST_BE_NON_NEGATIVE: "TCS% must be zero or greater",
  LOT_START_TIME_REQUIRED: "Lot start time is required",
  LOT_END_TIME_REQUIRED: "Lot end time is required",
  LOT_TIME_INVALID: "Invalid time. Use 24-hour HH:mm (e.g. 13:30).",
  LOT_END_TIME_BEFORE_START: "Lot end time must be greater than lot start time",
  LOT_END_TIME_MUST_BE_FUTURE:
    "Lot end time must be greater than the current time",
  LOT_START_TIME_BEFORE_PUBLISHED_AT:
    "Lot start time must be on or after the auction's Published At time",
  LOT_TIMES_REQUIRE_FUTURE_AUCTION_DATE:
    "Auction date is in the past. Update the auction date to today or later before setting lot start/end times.",
  START_BID_PRICE_REQUIRED: "Start bid price is required",
  START_BID_PRICE_MUST_BE_POSITIVE: "Start bid price must be greater than zero",
  BID_LIMIT_REQUIRED: "Bid limit is required",
  BID_LIMIT_MUST_BE_POSITIVE: "Bid limit must be greater than zero",
  /** @deprecated Prefer BID_LIMIT_REQUIRED — kept for transitional imports. */
  MAX_BID_LIMIT_REQUIRED: "Bid limit is required",
  BID_LIMIT_VS_START_BID_PRICE_FORWARD:
    "Bid limit must be greater than start bid price",
  BID_LIMIT_VS_START_BID_PRICE_REVERSE:
    "Bid limit must be less than start bid price",
  /** @deprecated Prefer BID_LIMIT_VS_START_BID_PRICE_FORWARD. */
  MAX_BID_LIMIT_BELOW_START_BID_PRICE:
    "Bid limit must be greater than start bid price",
  /** Direction-aware: "Bid Increment" (forward) / "Bid Decrement" (reverse). */
  BID_STEP_MUST_BE_POSITIVE: (label: string) =>
    `${label} must be greater than zero`,
  ITEM_REQUIRED: "Item is required",
  ITEM_ID_OPTIONAL_HINT:
    "Item ID is optional when Material Name is filled; blank rows go to review for matching.",
  LOT_IMPORT_SELECT_ALL_ITEMS:
    "Please select an item for every lot and try again.",
  LOT_IMPORT_STAGING_EXPIRED:
    "This import review session has expired. Please upload the file again.",
  LOT_IMPORT_STAGING_NOT_FOUND: "Import review session not found.",
  LOT_IMPORT_HEADER_MISSING: (cols: string) =>
    `Missing required column: ${cols}. Re-download the import template.`,
  LOT_IMPORT_SPREADSHEET_EMPTY:
    "Spreadsheet is empty. Add at least one lot row, or re-download the import template.",
  LOT_BIDDER_MAP_SPREADSHEET_EMPTY:
    "Spreadsheet is empty. Re-download the lot bidder map import template.",
  LOT_BIDDER_MAP_HEADER_MISSING: (cols: string) =>
    `Missing required column(s): ${cols}. Re-download the lot bidder map import template.`,
  LOT_IMPORT_NEEDS_REVIEW: (parsed: number) =>
    `Parsed ${parsed} lot(s) — open Show Details to match items and finish import.`,
  QUANTITY_REQUIRED: "Quantity is required",
  QUANTITY_MUST_BE_NON_NEGATIVE: "Quantity must be zero or greater",
  UOM_REQUIRED: "Unit of measure is required",
  UOM_UNKNOWN: "Unknown unit of measure",
  BENCHMARK_MATERIAL_LOCATION_REQUIRED:
    "Benchmark material location is required",
  LOT_IMPORT_UNKNOWN_BENCHMARK: "Unknown benchmark material location.",
  MATERIAL_NAME_REQUIRED: "Material name is required",
  LOADING_SCOPE_REQUIRED: "Loading scope is required",
  LOADING_SCOPE_INVALID: "Loading scope must be Buyer or Seller",
  MATERIAL_LIFTING_DAYS_REQUIRED: "Material lifting days is required",
  FILL_ALL_REQUIRED_FIELDS: "Please fill all required fields.",
  NUMERIC_FIELDS_INVALID: "Numeric fields must be valid numbers.",
  AUTO_INCREMENT_COUNT_RANGE:
    "Maximum extensions must be a whole number between 0 and 120",
  AUTO_INCREMENT_TIME_RANGE:
    "Extension interval must be a whole number between 0 and 7200 seconds",
  AUTO_INCREMENT_TIME_RANGE_MINUTES:
    "Extension interval must be a whole number between 0 and 120 minutes",
  AUTO_INCREMENT_PAIR:
    "Maximum extensions and extension interval must both be 0, or both greater than 0",
  CONSOLIDATED_EMD_REQUIRED: "Consolidated EMD is required",
  CONSOLIDATED_EMD_MUST_BE_POSITIVE: "Consolidated EMD must be greater than 0",
  EMD_RANGE_FIELDS_REQUIRED: "Enter display order from/to and EMD",
  EMD_RANGE_TO_GTE_FROM:
    "Display order To must be greater than or equal to From",
  EMD_RANGE_OVERLAP: "EMD has already been assigned for a display order.",
  EMD_MAP_ALL_LOTS: "Map all lot display orders before saving.",
  EMD_AT_LEAST_ONE_RANGE: "Add at least one lot-wise EMD range.",
  LOT_DISPLAY_ORDER_WITHDRAWN: (orders: string) =>
    `Lot display order withdrawn (excluded from EMD/bidder mapping): ${orders}`,
  LOT_DISPLAY_ORDER_NOT_FOUND: (orders: string) =>
    `Lot display order not found: ${orders}`,
  EMD_TOTAL_BELOW_CONSOLIDATED:
    "Lot-wise EMD total must be at least the consolidated EMD.",
  EMD_REQUIRED_BEFORE_ATTACH: "Configure EMD ranges before attaching bidders",
  LOT_OUTSIDE_EMD_RANGE:
    "One or more selected lots are outside the configured EMD ranges",
  LOT_OUTSIDE_EMD_RANGE_ORDERS: (orders: string) =>
    `Lot display order(s) outside EMD ranges: ${orders}`,
  BIDDER_BLOCKED_FOR_CLIENT_ATTACH: "Bidder is blocked for this client",
  BIDDER_NOT_VERIFIED_FOR_ATTACH: "Bidder is not verified",
  BIDDERS_ATTACH_REQUIRES_PUBLISHED:
    "Bidders can only be attached once the auction has been published",
  EMD_WRITES_REQUIRE_PUBLISHED:
    "EMD can only be edited while the auction is published",
  EMD_RANGE_LOCKED_AFTER_BIDDERS_ATTACHED:
    "This EMD range cannot be changed, removed, or shrunk while bidders are attached to lots it covers. Detach those bidders first.",
  EMD_LOCKED_AFTER_BIDDERS_ATTACHED:
    "The consolidated EMD amount cannot be changed while bidders are attached. Detach all bidders first.",
  PUBLISH_REQUIRES_DRAFT: "Only draft auctions can be published",
  PUBLISH_REQUIRES_LOTS: "Add at least one lot before publishing",
  PUBLISH_REQUIRES_CATALOGUE: "Upload a catalogue before publishing",
  PUBLISH_REQUIRES_TNC: "Upload terms & conditions before publishing",
  PUBLISH_EARLIEST_LOT_START_PASSED:
    "Cannot publish: lot start time has already passed",
  SEALED_BID_DATE_REQUIRED: "Sealed-bid date is required",
  SEALED_BID_START_TIME_REQUIRED: "Sealed-bid start time is required",
  SEALED_BID_END_TIME_REQUIRED: "Sealed-bid end time is required",
  SEALED_BID_END_BEFORE_START:
    "Sealed-bid end time must be after the start time",
  SEALED_BID_DATE_AFTER_AUCTION_DATE:
    "Sealed-bid date must be on or before the auction date",
  SEALED_BID_WINDOW_START_MUST_BE_FUTURE:
    "Sealed-bid date cannot be earlier than today",
  ARCHIVE_NOT_ALLOWED:
    "Only draft or published (before live) auctions can be archived",
  RESTORE_REQUIRES_ARCHIVED: "Only archived auctions can be restored to draft",
  LOTS_EDIT_REQUIRES_DRAFT_OR_PRE_LIVE:
    "Lots and bidder mappings can only be edited before the auction is closed",
  AUCTION_DATE_EDIT_REQUIRES_NO_BIDS:
    "Auction date can only be changed when no lot has bids. Remove all bids from every lot first, then try again.",
  DOCUMENTS_EDIT_REQUIRES_DRAFT_OR_PRE_LIVE:
    "Documents can only be uploaded while draft or published before live",
  AUCTION_SETTINGS_EDIT_REQUIRES_NOT_CLOSED:
    "Auction settings can only be edited before the auction is closed",
  UNPUBLISH_REQUIRES_PUBLISHED: "Only published auctions can be moved to draft",
  UNPUBLISH_NOT_ALLOWED_BIDDING_STARTED:
    "An auction cannot be moved to draft once bidding has started",
  UNPUBLISH_REQUIRES_BIDDERS_DETACHED:
    "Detach all bidders before moving the auction to draft",
  UNPUBLISH_CONFIRM:
    "Bidders will no longer see this auction until you publish it again.",
  PUBLISHED_EDIT_REQUIRES_DRAFT:
    "Move the auction to draft to make this change",
  DELETE_ALL_LOTS_CONFIRM:
    "This permanently deletes every lot (including withdrawn) and related lot mappings so you can re-import a clean display-order sequence. This cannot be undone.",
  SEALED_BID_SETTINGS_LOCKED:
    "Sealed-bid settings can only be changed while the auction is draft or published",
  SELECT_LOT_AND_BIDDER: "Select at least one lot and one bidder",
  EMD_AMOUNT_MUST_BE_POSITIVE: "Enter EMD amount greater than 0",
  CORRECTION_TYPE_REQUIRED: "Correction type is required",
  BID_REMOVAL_REQUIRES_EXECUTION:
    "Removing bids is only available during the execution phase",
  BID_REMOVAL_REQUIRES_LIVE:
    "Removing bids is only available while the auction is live",
  NO_BIDS_ON_LOT: "This lot has no bids to remove",
  REMOVE_WINNING_BID_BIDDER_REQUIRED:
    "Select the winning bidder whose bid should be removed",
  WINNING_BID_BIDDER_MISMATCH:
    "Selected bidder is not the current winning bidder on this lot",
  LOT_REQUIRED: "Lot is required",
  REOPEN_LOTS_REQUIRED: "Select at least one lot to reopen",
  REOPEN_REQUIRES_CLOSED:
    "Reopen lot is only available while the auction is live or closed",
  REOPEN_REQUIRES_LIVE:
    "Reopen lot during execution is only available while the auction is live",
  REOPEN_LOT_MUST_BE_CLOSED: "Only closed lots can be reopened",
  REOPEN_NOT_ALLOWED_WHEN_LOT_APPROVED:
    "Approved lots cannot be reopened",
  REOPEN_ONLY_SAME_DAY_AS_AUCTION_DATE:
    "Lots can only be reopened on the auction's scheduled date",
  STAGGER_CORRECTION_REQUIRES_LIVE:
    "Lot staggering can only be corrected while the auction is live",
  START_BID_NOT_EDITABLE_WITH_BIDS:
    "Start bid price can only be updated on lots with no bids",
  LOT_START_TIME_NOT_EDITABLE_WITH_BIDS:
    "Start time can only be updated on lots with no bids",
  WINNING_AMOUNT_REQUIRED: "Winning price is required",
  WINNER_BIDDER_REQUIRED: "Winning bidder is required",
  LOT_APPROVAL_REQUIRES_WINNING:
    "Cannot approve lots without Winning bidder and price.",
  LOT_APPROVALS_REQUIRE_CLOSED:
    "Lots can only be updated when auction is closed",
  LOT_APPROVE_REQUIRE_CLOSED:
    "Lots can only be approved when auction is closed",
  LOT_REJECT_REQUIRE_CLOSED: "Lots can only be rejected when auction is closed",
  LOT_REJECTION_LOCKED_EMD_RELEASED: (lots: string) =>
    `${lots} cannot be changed: the winner's EMD was already released on rejection.`,
  LOT_NOTIFY_REQUIRE_CLOSED:
    "Winners can only be notified when auction is closed",
  LOT_NOTIFY_REQUIRE_SELECTION: "Select at least one approved lot",
  LOT_NOTIFY_REQUIRE_APPROVED:
    "Only approved lots with a winner can be notified",
  LOT_NOTIFY_WINNER_EMAIL_MISSING: "Winner has no email configured",
  LOT_CONFIRMATION_PDF_MISSING: "Lot confirmation letter is missing",
  LOT_CONFIRMATION_WINNER_MISSING: "Winner bidder was not found",
  CORRECTION_QUANTITY_REQUIRED: "Quantity is required",
  QUANTITY_MUST_BE_POSITIVE: "Quantity must be greater than zero",
  OFFLINE_NEGOTIATED: "Offline negotiated",
  WINNER_USER_MISSING: "Winning bidder has no active user account",
  WINNER_NOT_MAPPED: "Winning bidder is not mapped to this lot",
  WINNER_NOT_CLIENT_MAPPED: "Winning bidder is not mapped to this client",
  NO_STANDING_BID_FOR_TRANSFER:
    "Cannot transfer winner at the same price: this lot has no standing bid",
  CORRECTION_BID_TIMESTAMP_INVALID:
    "Correction bid time must be before lot end and outside the last-bid extension window",
  UPDATE_LOT_REQUIRES_CLOSED:
    "Update lot is only available when the auction is closed",
  CORRECTION_EMD_WITH_CLIENT_REQUIRED:
    "Specify whether EMD is with the client for the new winner.",
  CORRECTION_EMD_RANGE_MISCONFIGURED:
    "This lot's EMD range configuration is inconsistent; fix the auction's EMD ranges before correcting the winner.",
  MISSING_IMPORT_FILE: "Missing import file.",
  XLSX_ONLY: "Only .xlsx files are supported.",
  FILE_TOO_LARGE: (mb: number) => `File exceeds the maximum size of ${mb}MB.`,
  IMPORT_FILE_HINT: (mb: number) => `XLSX only, max ${mb} MB.`,
  NO_DATA_ROWS: "No data rows to import.",
  ROW_LIMIT_EXCEEDED: (max: number) =>
    `Import exceeds the maximum of ${max.toLocaleString()} rows.`,
  DOCUMENT_FILE_REQUIRED: "File is required.",
  DOCUMENT_FILE_INVALID: "Only PDF and DOCX files are allowed.",
  DOCUMENT_FILE_TOO_LARGE: (mb: number) =>
    `File exceeds the maximum size of ${mb}MB.`,
  DOCUMENT_FILE_HINT: (mb: number) => `PDF or DOCX, max ${mb} MB.`,
  DOCUMENT_FILE_EMPTY: "File is empty.",
  DOCUMENT_FILE_CONTENT_INVALID: "File content is not a valid PDF or DOCX.",
  DOCUMENT_FILE_EXTENSION_MISMATCH: (ext: string, kind: string) =>
    `File extension .${ext} does not match content type ${kind}.`,
  CATALOGUE_TYPE_REQUIRED: "Select catalogue type",
  MATERIALS_SUMMARY_REQUIRED: "Materials being offered is required",
  MATERIALS_SUMMARY_TOO_LONG:
    "Materials being offered must be 300 characters or fewer",
  REASON_FOR_REVISION_REQUIRED: "Reason for revision is required",
  CATALOGUE_NOTIFY_REQUIRES_CATALOGUE:
    "Upload a catalogue before sending the catalogue notification",
  CATALOGUE_NOTIFY_NO_ELIGIBLE_BIDDERS:
    "No eligible bidders found for this auction's materials",
  CATALOGUE_NOTIFY_REQUIRES_PUBLISHED:
    "Catalogue notification can only be sent while the auction is published",
  CATALOGUE_NOTIFY_SELECT_BIDDERS: "Select at least one bidder",
  ADDITIONAL_FIELDS_SPREADSHEET_EMPTY:
    "The spreadsheet is empty. Download the template and fill it in.",
  ADDITIONAL_FIELDS_HEADER_MISSING: (labels: string) =>
    `Missing required column(s): ${labels}. Use the downloaded template.`,
  ADDITIONAL_FIELDS_NO_ROWS: "The spreadsheet has no data rows.",
  ADDITIONAL_FIELDS_ROW_CREATED: "Value added",
  ADDITIONAL_FIELDS_ROW_UPDATED: "Value updated",
  ADDITIONAL_FIELDS_ROW_UNCHANGED: "Value unchanged",
  ADDITIONAL_FIELDS_AUCTION_NO_REQUIRED: "Auction No. is required.",
  ADDITIONAL_FIELDS_AUCTION_NO_MISMATCH: (expected: string) =>
    `Auction No. must be ${expected}.`,
  ADDITIONAL_FIELDS_LOT_NOT_FOUND: (lotNo: string) =>
    `Lot No. "${lotNo}" is not an active lot in this auction.`,
  ADDITIONAL_FIELDS_NAME_REQUIRED: "Additional Field Name is required.",
  ADDITIONAL_FIELDS_NAME_UNKNOWN: (name: string) =>
    `"${name}" is not an active additional field for this client.`,
  ADDITIONAL_FIELDS_NAME_IS_LOT_LEVEL: (name: string) =>
    `"${name}" is a lot-level field — fill Lot No.`,
  ADDITIONAL_FIELDS_NAME_IS_AUCTION_LEVEL: (name: string) =>
    `"${name}" is an auction-level field — leave Lot No. blank.`,
  ADDITIONAL_FIELDS_DUPLICATE_ROW: (row: number) =>
    `Duplicate of row ${row} (same Lot No. and field).`,
  ADDITIONAL_FIELDS_INVALID_NUMBER: (name: string) =>
    `"${name}" must be a number.`,
  ADDITIONAL_FIELDS_INVALID_DATE: (name: string) =>
    `"${name}" must be a date (DD-MM-YYYY).`,
  ADDITIONAL_FIELDS_INVALID_BOOLEAN: (name: string) =>
    `"${name}" must be Yes or No.`,
  ADDITIONAL_FIELDS_TEXT_TOO_LONG: (name: string) =>
    `"${name}" must be at most 2000 characters.`,
  ADDITIONAL_FIELDS_FIELD_NOT_SELECTED:
    "This field is not selected for this auction. Re-import to change the selection.",
  ADDITIONAL_FIELDS_FIELD_ALREADY_USED:
    "This field is already used on this auction.",
  ADDITIONAL_FIELDS_FIELD_INACTIVE_OR_WRONG_SCOPE:
    "Choose an active auction-level field for this client.",
  ADDITIONAL_FIELDS_VALUE_ROW_NOT_FOUND: "Additional field value not found.",
  ADDITIONAL_FIELDS_LOT_NOT_IN_AUCTION: "Lot not found in this auction.",
  /** Excel data-validation popup on the additional-fields template. */
  ADDITIONAL_FIELDS_TEMPLATE_INVALID_FIELD_TITLE: "Invalid field",
  ADDITIONAL_FIELDS_TEMPLATE_CHOOSE_FIELD:
    "Choose an additional field from the list.",
  /** Excel data-validation popup on lot / lot-bidder-map import templates. */
  IMPORT_TEMPLATE_INVALID_VALUE_TITLE: "Invalid value",
  IMPORT_TEMPLATE_CHOOSE_VALUE: "Choose a value from the list.",
  MATERIAL_LIFTING_DAYS_MUST_BE_INTEGER:
    "Material lifting days must be an integer",
  MATERIAL_LIFTING_DAYS_MUST_BE_NON_NEGATIVE:
    "Material lifting days must be zero or greater",
  UOM_CODE_REQUIRED: "UOM is required",
  UOM_CODE_UNKNOWN: (code: string) => `Unknown UOM: ${code}`,
  PLANT_LOCATION_INVALID_FOR_CLIENT: "Invalid plant location for this client",
  MATERIAL_LOCATION_INVALID_FOR_CLIENT:
    "Invalid material location for this client",
  ITEM_INVALID_FOR_CLIENT: "Invalid item for this client",
  BENCHMARK_MATERIAL_LOCATION_INVALID: "Invalid benchmark material location",
  DOCUMENT_TYPE_NOT_FOUND_OR_INACTIVE: "Document type not found or inactive",
  EMD_RANGES_INVALID: "Invalid EMD ranges",
  EMD_RANGE_AMOUNT_MUST_BE_POSITIVE: "EMD amount must be greater than 0",
  BIDDER_NOT_FOUND: "Bidder not found",
  NO_VALID_LOTS_FOR_BIDDER: "No valid lots selected for this bidder",
  DUPLICATE_OF_ROW: (keptRowNumber: number) =>
    `Duplicate of row ${keptRowNumber}`,
  LOT_BIDDER_MAP_BIDDER_ID_REQUIRED: "bidderId is required",
  LOT_BIDDER_MAP_BIDDER_NAME_REQUIRED: "bidderName is required",
  LOT_BIDDER_MAP_BIDDER_ID_NAME_MISMATCH:
    "bidderId and bidderName do not match",
  LOT_BIDDER_MAP_EMD_DISPLAY_ORDERS_REQUIRED: "emdDisplayOrders is required",
  LOT_BIDDER_MAP_EMD_DISPLAY_ORDER_NOT_FOUND: (orders: string) =>
    `EMD display order not found: ${orders}`,
  LOT_BIDDER_MAP_EMD_DISPLAY_ORDERS_COVER_NO_LOTS:
    "emdDisplayOrders cover no lots on this auction",
  LOT_BIDDER_MAP_IS_EMD_WITH_CLIENT_INVALID:
    "isEmdWithClient must be y/yes or n/no",
  NO_BID_EXTENSION_STOP_REQUIRES_PUBLISHED:
    "No-bid extension can only be stopped when the auction is published",
  NO_BID_EXTENSION_STOP_REQUIRES_LIVE:
    "No-bid extension can only be stopped while the auction is live",
  SELECT_AT_LEAST_ONE_LOT: "Select at least one lot",
} as const;

export const AuctionsSuccessMessages = {
  AUCTION_CREATED: "Auction created",
  AUCTION_SETTINGS_SAVED: "Auction settings saved",
  AUCTION_ARCHIVED: "Auction archived",
  AUCTION_RESTORED: "Auction restored to draft",
  SEALED_BID_END_UPDATED: "Sealed-bid end time updated",
  STAGGER_UPDATED: "Lot staggering setting updated",
  AUCTION_MOVED_TO_DRAFT: "Auction moved to draft",
  AUCTION_PUBLISHED: "Auction published",
  LOT_CREATED: "Lot created",
  LOT_UPDATED: "Lot updated",
  LOT_WITHDRAWN: "Lot withdrawn",
  ALL_LOTS_DELETED: "All lots deleted",
  EMD_SETUP_SAVED: "EMD setup saved",
  EMD_RANGE_ADDED: "EMD range added",
  EMD_RANGE_UPDATED: "EMD range updated",
  CORRECTION_APPLIED: "Correction applied",
  BIDDERS_MAPPED: "Bidders mapped",
  BIDDERS_REMOVED: (removed: number, requestedPairs: number) =>
    removed === 0
      ? "No matching lot–bidder mappings found to remove"
      : removed === requestedPairs
        ? `Removed ${removed} lot–bidder mapping${removed === 1 ? "" : "s"}`
        : `Removed ${removed} of ${requestedPairs} selected lot–bidder pairs`,
  LOT_APPROVALS_SAVED: "Changes saved",
  ALL_LOTS_APPROVED: "All lots approved",
  ALL_LOTS_REJECTED: "All lots rejected",
  WINNERS_NOTIFIED: (bidderCount: number) =>
    bidderCount === 1
      ? "Email queued for sending"
      : "Emails queued for sending",
  CATALOGUE_NOTIFICATION_SENT: (count: number) =>
    count === 1
      ? "Catalogue notification queued for 1 bidder"
      : `Catalogue notification queued for ${count} bidders`,
  DOCUMENT_UPLOADED: (title: string) => `${title} uploaded`,
  ADDITIONAL_FIELDS_SAVED: "Additional fields saved",
} as const;

export const AuctionsErrorMessages = {
  FAILED_TO_CREATE: "Failed to create auction",
  FAILED_TO_SAVE: "Failed to save auction settings",
  FAILED_TO_ARCHIVE: "Failed to archive auction",
  FAILED_TO_RESTORE: "Failed to restore auction",
  FAILED_TO_SAVE_LOT: "Failed to save lot",
  FAILED_TO_WITHDRAW_LOT: "Failed to withdraw lot",
  FAILED_TO_DELETE_ALL_LOTS: "Failed to delete all lots",
  FAILED_TO_SAVE_EMD: "Failed to save EMD setup",
  FAILED_TO_APPLY_CORRECTION: "Could not apply correction",
  FAILED_TO_DOWNLOAD_TEMPLATE: "Failed to download import template.",
  FAILED_TO_IMPORT_LOTS: "Failed to import lots",
  FAILED_TO_CONFIRM_LOT_IMPORT: "Failed to confirm lot import",
  FAILED_TO_IMPORT_LOT_BIDDER_MAP: "Failed to import lot bidder map",
  FAILED_TO_EXPORT_LOT_BIDDER_MAP: "Failed to export lot bidder map",
  FAILED_TO_EXPORT_LOTS: "Failed to export lots",
  FAILED_TO_EXPORT_LOT_IMPORT_STAGING: "Failed to export staged lot import",
  FAILED_TO_MAP_BIDDERS: "Failed to map bidders",
  FAILED_TO_REMOVE_BIDDERS: "Failed to remove bidders from lots",
  FAILED_TO_SAVE_LOT_APPROVALS: "Could not save changes",
  FAILED_TO_UPDATE_ALL_LOTS: "Could not update all lots",
  FAILED_TO_NOTIFY_WINNERS: "Could not notify winners",
  FAILED_TO_SEND_CATALOGUE_NOTIFICATION:
    "Could not send catalogue notification",
  INVALID_AUCTION_ID: "Invalid auction id",
  INVALID_ID: "Invalid id",
  INVALID_LOT_ID: "Invalid lot id",
  INVALID_AUCTION_OR_LOT_ID: "Invalid auction or lot id",
  INVALID_AUCTION_OR_STAGING_ID: "Invalid auction or staging id",
  INVALID_ADDITIONAL_FIELD_VALUE_ID: "Invalid additional field value id",
  AUCTION_NOT_FOUND: "Auction not found",
  LOT_NOT_FOUND: "Lot not found",
  ACTIVE_CATALOGUE_NOT_FOUND: "No active catalogue found",
  ACTIVE_TNC_NOT_FOUND: "No active TnC found",
  FAILED_TO_CREATE_LOT_IMPORT_STAGING: "Failed to create staging session",
  CANNOT_SAVE_EMD_RANGES: "Cannot save EMD ranges",
  FAILED_TO_UPLOAD_DOCUMENT: "Failed to upload document",
  DOCUMENT_UPLOAD_NETWORK_FAILED:
    "Upload was blocked before reaching the API (network error or reverse-proxy body limit). Auction documents allow up to 5 MB; the API proxy must allow at least 25 MB (nginx: client_max_body_size 25m).",
  DOCUMENT_UPLOAD_PROXY_TOO_LARGE:
    "Upload rejected by the reverse proxy (413 Request Entity Too Large). Raise the API proxy body limit to at least 25 MB (nginx: client_max_body_size 25m).",
  FAILED_TO_LOAD_ADDITIONAL_FIELDS: "Failed to load additional fields.",
  FAILED_TO_SAVE_ADDITIONAL_FIELDS: "Failed to save additional fields.",
  FAILED_TO_IMPORT_ADDITIONAL_FIELDS: "Failed to import additional fields.",
} as const;

export const AuctionAdditionalFieldsImportUiMessages = {
  TOAST_ID: "auction-additional-fields-import",
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
  CHECKLIST: [
    "Download the template for this auction; the first row has the Auction No. filled in",
    "Matching is by Lot No. and Additional Field Name: matching rows update the value; new rows are added",
    "Include every field you want to keep — saved fields missing from the file are removed",
    "Nothing is saved if any row has an error",
    "Auction No. must match this auction",
    "Leave Lot No. blank for auction-level fields; fill an active Lot No. for lot-level fields",
    "Pick Additional Field Name from the dropdown (active client fields only)",
    "Dates must be DD-MM-YYYY; numbers must be numeric; Yes/No fields must be Yes or No; text up to 2000 characters",
  ],
} as const;

export function buildAdditionalFieldsImportResultMessage(result: {
  imported: number;
  failed: number;
  created?: number;
  updated?: number;
  deleted?: number;
}): string {
  if (result.failed > 0) {
    return `${result.failed} row(s) failed — nothing was imported`;
  }
  const { created = 0, updated = 0, deleted = 0 } = result;
  const parts = [
    created > 0 ? `${created} added` : null,
    updated > 0 ? `${updated} updated` : null,
    deleted > 0 ? `${deleted} removed` : null,
  ].filter((p): p is string => p != null);
  if (parts.length > 0) return `Additional fields: ${parts.join(", ")}`;
  if (result.imported > 0) return "No changes — all values already up to date";
  return "No values imported";
}

export const AuctionLotImportUiMessages = {
  TOAST_ID: "auction-lots-bulk-import",
  STARTING: "Starting import…",
  COMPLETE: "Import complete",
  IN_PROGRESS: "Import In Progress",
  COMPLETED: "Import Completed",
  FAILED: "Import Failed",
  COULD_NOT_COMPLETE: "Import could not be completed",
  OUTCOME_SUCCESS: "Uploaded",
  OUTCOME_FAILED: "Failed",
  OUTCOME_SKIPPED: "Skipped",
  OUTCOME_TOTAL: "Total Records",
  OUTCOME_PARSED: "Parsed",
  CHECKLIST: [
    "Download the template for this auction first",
    "Fill all required lot columns (Remark and Material Description are optional)",
    "Item ID is optional — leave blank to fuzzy-match from Material Name (review before import)",
    "Matching is by Display Order: matching orders update active lots; new orders are inserted",
    "Omit a Display Order row to withdraw that lot (order is preserved); withdrawn orders are not updated on re-upload",
    "Use Delete All Lots, then re-import, to fully overwrite display order with no withdrawn history",
    "Use only values from the template dropdowns where provided",
    "Lot Start Time and Lot End Time must be 24-hour HH:mm (e.g. 13:00, 13:30)",
    "Bid Limit must be ≥ Start Bid Price (forward) or < Start Bid Price (reverse); Lot End Time must be ≥ Lot Start Time",
  ],
} as const;

export const AuctionLotBidderMapImportUiMessages = {
  TOAST_ID: "auction-lot-bidder-map-bulk-import",
  STARTING: "Starting import…",
  COMPLETE: "Import complete",
  IN_PROGRESS: "Import In Progress",
  COMPLETED: "Import Completed",
  FAILED: "Import Failed",
  COULD_NOT_COMPLETE: "Import could not be completed",
  OUTCOME_SUCCESS: "Attached",
  OUTCOME_FAILED: "Failed",
  OUTCOME_SKIPPED: "Skipped",
  OUTCOME_TOTAL: "Total Records",
  CHECKLIST: [
    "Download the template for this auction first",
    "Fill Bidder ID and Bidder Name (both required; name must match the bidder)",
    "Fill EMD Display Orders (required); Lot Display Orders is optional — blank maps all lots in those EMD ranges",
    "Use the template dropdown for Is EMD With Client (y/n); the EMD block is set automatically",
  ],
} as const;

export const AuctionLotBidderMapSubmitUiMessages = {
  TOAST_ID: "auction-lot-bidder-map-submit",
  STARTING: "Mapping bidders…",
  COMPLETE: "Mapping complete",
  IN_PROGRESS: "Mapping In Progress",
  COMPLETED: "Mapping Completed",
  FAILED: "Mapping Failed",
  COULD_NOT_COMPLETE: "Mapping could not be completed",
  OUTCOME_SUCCESS: "Attached",
  OUTCOME_FAILED: "Failed",
  OUTCOME_SKIPPED: "Skipped",
  OUTCOME_TOTAL: "Total Records",
} as const;

export function buildAuctionLotImportResultMessage(result: {
  imported: number;
  failed: number;
  skipped: number;
}): string {
  const { imported, failed, skipped } = result;
  if (imported > 0) {
    return (
      `Imported ${imported} lot(s)` +
      (failed > 0 ? `, ${failed} failed` : "") +
      (skipped > 0 ? `, ${skipped} skipped` : "")
    );
  }
  if (failed > 0) return `${failed} row(s) failed`;
  return "No lots imported";
}

/** Appended to the Attach Bidders toast when failed rows stay in the dialog. */
export const LOT_BIDDER_MAP_SEE_ERROR_COLUMN = "See the Validation Error column.";

export function buildLotBidderMapImportResultMessage(result: {
  imported: number;
  failed: number;
  skipped: number;
}): string {
  const { imported, failed, skipped } = result;
  if (imported > 0) {
    return (
      `Mapped ${imported} bidder row(s)` +
      (failed > 0 ? `, ${failed} failed` : "") +
      (skipped > 0 ? `, ${skipped} skipped` : "")
    );
  }
  if (failed > 0) {
    return (
      `${failed} row(s) failed` + (skipped > 0 ? `, ${skipped} skipped` : "")
    );
  }
  if (skipped > 0) return `${skipped} row(s) skipped`;
  return "No bidder rows mapped";
}

/** Admin Today's Auctions page. */
export const TodaysAuctionsMessages = {
  EMPTY_TITLE: "No auctions today",
  EMPTY_DESCRIPTION: "No auctions scheduled for today.",
  LOAD_ERROR_TITLE: "Could not load today's auctions",
  LOAD_ERROR_DESCRIPTION: "Failed to load today's auctions.",
};

/** Fallback labels when portal UI has no business reference (never show internal ids). */
export const PortalEntityDisplayMessages = {
  AUCTION_WITHOUT_NUMBER: "Auction",
  COMPANY_WITHOUT_NAME: "Company",
  CLIENT_WITHOUT_NAME: "Client",
  LOT_WITHOUT_NUMBER: "—",
  PLAN_WITHOUT_NAME: "—",
};

/** Client portal auction lists and lot details. */
export const ClientPortalAuctionMessages = {
  TODAY_EMPTY_TITLE: "No auctions today",
  TODAY_EMPTY_DESCRIPTION: "No auctions scheduled for today.",
  TODAY_LOAD_ERROR_TITLE: "Could not load today's auctions",
  TODAY_LOAD_ERROR_DESCRIPTION: "Failed to load today's auctions.",
  FUTURE_EMPTY_TITLE: "No future auctions",
  FUTURE_EMPTY_DESCRIPTION: "No auctions scheduled after today.",
  FUTURE_LOAD_ERROR_TITLE: "Could not load future auctions",
  FUTURE_LOAD_ERROR_DESCRIPTION: "Failed to load future auctions.",
  CLOSED_EMPTY_TITLE: "No closed auctions",
  CLOSED_EMPTY_DESCRIPTION: "No closed auctions for your companies.",
  CLOSED_LOAD_ERROR_TITLE: "Could not load closed auctions",
  CLOSED_LOAD_ERROR_DESCRIPTION: "Failed to load closed auctions.",
  UPCOMING_EMPTY_TITLE: "No lots",
  UPCOMING_EMPTY_DESCRIPTION: "This auction has no active lots.",
  UPCOMING_NO_ITEMS: "No items on this lot.",
  UPCOMING_LOAD_ERROR_TITLE: "Could not load auction lots",
  UPCOMING_LOAD_ERROR_DESCRIPTION: "Failed to load lot details.",
  UPCOMING_NOT_FOUND: "Auction not found",
  LIVE_LOAD_ERROR_TITLE: "Could not load live auctions",
  LIVE_LOAD_ERROR_DESCRIPTION: "Failed to load live auctions.",
  LIVE_EMPTY_SELECT_CLIENT_TITLE: "Select a company",
  LIVE_EMPTY_SELECT_CLIENT_DESCRIPTION: "Choose a company, then one or more auctions.",
  LIVE_EMPTY_SELECT_AUCTIONS_TITLE: "Select auctions",
  LIVE_EMPTY_SELECT_AUCTIONS_DESCRIPTION: "Choose one or more live auctions for this company.",
  LIVE_EMPTY_LOTS_TITLE: "No lots",
  LIVE_EMPTY_LOTS_DESCRIPTION: "No active lots in the selected auctions.",
  AUCTION_FORBIDDEN: "Not authorized for this auction",
  CLOSED_NOT_FOUND: "Closed auction not found",
  PARTICIPANTS_EMPTY_TITLE: "No bidders",
  PARTICIPANTS_EMPTY_DESCRIPTION: "No participants registered for this auction.",
  BIDS_EMPTY_TITLE: "No bids on this lot",
  BIDS_EMPTY_DESCRIPTION: "No bids have been placed on this lot yet.",
  BIDDERS_EMPTY_TITLE: "No bidders on this lot",
  BIDDERS_EMPTY_DESCRIPTION: "No bidders have bid on this lot yet.",
  ITEMS_EMPTY_TITLE: "No items on this lot",
  ITEMS_EMPTY_DESCRIPTION: "This lot has no catalogue items.",
  APPROVAL_LOTS_EMPTY_TITLE: "No lots to approve",
  APPROVAL_LOTS_EMPTY_DESCRIPTION:
    "This closed auction has no lots awaiting approval.",
  DETAIL_LOAD_ERROR_TITLE: "Could not load auction",
  DETAIL_LOAD_ERROR_DESCRIPTION: "Failed to load auction details.",
  DETAIL_NOT_FOUND: "Auction not found",
  DETAIL_EMPTY_TITLE: "No lots",
  DETAIL_EMPTY_DESCRIPTION: "This auction has no lots to show.",
};

/** Bidder portal auction lists (today / future / closed), grouped by client. */
export const BidderPortalAuctionMessages = {
  TODAY_EMPTY_TITLE: "No auctions today",
  TODAY_EMPTY_DESCRIPTION:
    "No live or upcoming auctions assigned to you today.",
  TODAY_LOAD_ERROR_TITLE: "Could not load today's auctions",
  TODAY_LOAD_ERROR_DESCRIPTION: "Failed to load today's auctions.",
  FUTURE_EMPTY_TITLE: "No future auctions",
  FUTURE_EMPTY_DESCRIPTION: "No future auctions with assigned lots.",
  FUTURE_LOAD_ERROR_TITLE: "Could not load future auctions",
  FUTURE_LOAD_ERROR_DESCRIPTION: "Failed to load future auctions.",
  CLOSED_EMPTY_TITLE: "No closed auctions",
  CLOSED_EMPTY_DESCRIPTION: "No closed auctions you bid on.",
  CLOSED_LOAD_ERROR_TITLE: "Could not load closed auctions",
  CLOSED_LOAD_ERROR_DESCRIPTION: "Failed to load closed auctions.",
  TNC_ACCEPTED: "Terms & Conditions accepted",
  TNC_ACCEPT_FAILED: "Could not accept Terms & Conditions",
  TNC_IP_RESTRICTED:
    "Terms & Conditions not accepted. This IP address/network is already in use by another bidder in this auction; please use a different network.",
  WATCHLIST_UPDATE_FAILED: "Could not update watch list",
};

/** Live bid standing, reject, and proxy copy (bidder UI + API). */
export const LiveBidMessages = {
  BID_ACCEPTED: "Bid Accepted",
  BID_REJECTED: "Bid Rejected",
  OUTBID: "Outbid",
  BID_PLACING: "Placing bid…",
  PLACE_BID_FAILED: "Could not place bid",
  SET_PROXY_FAILED: "Could not set auto-bid",
  NO_WATCHLIST_LOTS: "No lots in your watch list yet.",
  NO_WATCHLIST_LOTS_DESCRIPTION:
    "Lots you add to the watchlist will appear here.",
  PROXY_AMT: (amount: string) => `Proxy: ${amount}`,
  BID_GREATER_THAN_ZERO: "Bid Amount should be greater than Zero.",
  BID_INCREMENT: "Bid Amount should be in multiple of the Bid Increment.",
  BID_DECREMENT: "Bid Amount should be in multiple of the Bid Decrement.",
  /** Opening bid on a lot with no bids yet, when the first bid is SBP itself. */
  BID_AT_LEAST_START: "Bid Amount should be greater than or equal to SBP.",
  /** Opening bid when the auction has "First Bid = SBP + Increment" enabled. */
  BID_AT_LEAST_START_PLUS_INCREMENT:
    "Bid Amount should be greater than or equal to SBP + Bid Increment.",
  /** Reverse opening: bid ≤ SBP. */
  BID_AT_MOST_START: "Bid Amount should be less than or equal to SBP.",
  /** Reverse opening when SBP−increment is forced. */
  BID_AT_MOST_START_MINUS_INCREMENT:
    "Bid Amount should be less than or equal to SBP − Bid Decrement.",
  /** Every bid after the first (forward): floor moves with winning price. */
  BID_AT_LEAST:
    "Bid Amount should be greater than or equal to Winning + Bid Increment.",
  /** Every bid after the first (reverse): ceiling moves with winning price. */
  BID_AT_MOST:
    "Bid Amount should be less than or equal to Winning − Bid Decrement.",
  OUTBID_EQUAL_OR_HIGHER:
    "Bid Amount should be greater than current Winning price.",
  OUTBID_EQUAL_OR_LOWER:
    "Bid Amount should be less than current Winning price.",
  BID_LIMIT_CEILING:
    "Bid Amount should be lesser than or equal to the bid limit.",
  BID_LIMIT_FLOOR:
    "Bid Amount should be greater than or equal to the bid limit.",
  /** @deprecated Prefer BID_LIMIT_CEILING. */
  BID_MAX_LIMIT: "Bid Amount should be lesser than or equal to the bid limit.",
  BID_CAP:
    "Maximum of Current Winning price + 50 times of the bid increment is allowed.",
  BID_FLOOR_CAP:
    "Minimum of Current Winning price − 50 times of the bid decrement is allowed.",
  BELOW_OWN_PROXY: "Your bid must be higher than your proxy.",
  ABOVE_OWN_PROXY: "Your bid must be lower than your proxy.",
  PROXY_RAISE_ONLY: "Your proxy can only be raised.",
  PROXY_LOWER_ONLY: "Your proxy can only be lowered.",
  LOT_NOT_FOUND: "Lot not found",
  LOT_AUCTION_MISMATCH: "Lot/auction mismatch",
  AUCTION_TYPE_UNSUPPORTED_BID:
    "This auction type isn't supported for live bidding yet",
  AUCTION_TYPE_UNSUPPORTED_PROXY:
    "This auction type isn't supported for proxy bidding yet",
  BIDDING_NOT_STARTED: "Bidding hasn't started for this lot yet",
  BIDDING_TIME_OVER: "Bidding time is over for this lot",
  NOT_REGISTERED: "You are not registered for this auction",
  EMD_BLOCK_REQUIRED:
    "Your EMD for this auction was released. Contact the auctioneer to have it blocked again before bidding",
  TNC_REQUIRED: "Accept the auction's Terms & Conditions before bidding",
  IP_RESTRICTED:
    "Bid cannot be placed. This IP address/network is already in use by another bidder in this auction; please use a different network.",
  NO_INCREMENT: "This lot has no bid increment configured",
  REACHED_BID_LIMIT: "Bid is already reached the bid limit price.",
  /** Rank-based auctions: badge next to the bidder's own bid. */
  RANK_BADGE: (n: number) => `R${n}`,
  /** Rank-based: bounds are relative to the bidder's own best bid, never the winning price. */
  BID_AT_LEAST_OWN:
    "Bid Amount should be greater than or equal to your last bid + Bid Increment.",
  BID_AT_MOST_OWN:
    "Bid Amount should be less than or equal to your last bid − Bid Decrement.",
  BID_CAP_OWN:
    "Maximum of your last bid + 50 times the bid increment is allowed.",
  BID_FLOOR_CAP_OWN:
    "Minimum of your last bid − 50 times the bid decrement is allowed.",
  /** Sealed-bid window: bounds are relative to the bidder's own latest bid only. */
  SEALED_WINDOW_NOT_OPEN: "The sealed-bid window hasn't opened yet",
  SEALED_WINDOW_CLOSED: "The sealed-bid window is closed",
  SEALED_BID_NOT_ENABLED: "This auction has no sealed-bid window",
  SEALED_BID_MUST_EXCEED_OWN:
    "Bid Amount should be greater than your previous bid.",
  SEALED_BID_MUST_BE_BELOW_OWN:
    "Bid Amount should be less than your previous bid.",
  /** Sealed-bid bounds name the amount, since the bidder never sees SBP or the limit. */
  SEALED_BID_AT_LEAST: (amount: string) =>
    `Bid Amount should be greater than or equal to ${amount}.`,
  SEALED_BID_AT_MOST: (amount: string) =>
    `Bid Amount should be lesser than or equal to ${amount}.`,
  SEALED_BIDS_LOAD_FAILED: "Could not load sealed-bids",
};

/** Live push transport switch + fallback status copy (admin + live UIs). */
export const LiveTransportMessages = {
  MODE_UPDATED: "Live transport updated",
  MODE_UPDATE_FAILED: "Could not update live transport",
  MODE_LOAD_FAILED: "Could not load live transport settings",
  MODE_AUTO_LABEL: "Auto (with fallback)",
  MODE_SOCKET_LABEL: "WebSocket only",
  MODE_SSE_LABEL: "SSE only",
  MODE_POLL_LABEL: "Polling only",
  MODE_AUTO_HINT:
    "Clients prefer WebSocket and fail over to SSE, then polling, on their own.",
  MODE_SOCKET_HINT:
    "Clients stay on WebSocket with no fallback. Open SSE streams are closed.",
  MODE_SSE_HINT:
    "Clients skip WebSocket entirely. Use when a proxy blocks the upgrade.",
  MODE_POLL_HINT:
    "Clients stop streaming and re-fetch snapshots on an interval. Slowest option.",
  TRANSPORT_SOCKET: "WebSocket",
  TRANSPORT_SSE: "SSE fallback",
  TRANSPORT_POLL: "Polling",
  /** Shown to bidders/admins while the feed is not on the primary transport. */
  DEGRADED_HINT:
    "Live updates are running on a fallback channel. Bidding is unaffected.",
};
