export const EMD_TYPES = [
  "emd_deposit",
  "opening_balance",
  "correction_credit",
  "correction_debit",
  "blocked_bidder_attached",
  "blocked_winning",
  "release_auction_closed",
  "release_bidder_detached",
  "release_lot_withdrawn",
  "release_bidder_unverified",
  "release_by_admin",
  "release_lot_rejected",
  "refund_requested",
  "refund_processed",
  "refund_rejected",
  "refund_cancelled",
  "release_block_revised",
  "transfer_out",
  "transfer_in",
  "release_winning_by_admin",
  "blocked_winning_correction",
  "release_winning_correction",
] as const;
export type EmdType = (typeof EMD_TYPES)[number];

export const EMD_TXN_TYPES = ["credit", "debit"] as const;
export type EmdTxnType = (typeof EMD_TXN_TYPES)[number];

export const EMD_TYPE_LABELS: Record<EmdType, string> = {
  emd_deposit: "Deposit",
  opening_balance: "Opening Balance",
  correction_credit: "Correction: Credit",
  correction_debit: "Correction: Debit",
  blocked_bidder_attached: "Blocked: Lots Attached",
  blocked_winning: "Blocked: Winning Lots",
  release_auction_closed: "Released: Auction Closed",
  release_bidder_detached: "Released: Lots Detached",
  release_lot_withdrawn: "Released: Lot Withdrawn",
  release_bidder_unverified: "Released: Account Unverified",
  release_by_admin: "Released: By Admin",
  release_lot_rejected: "Released: Winning Lot Rejected",
  refund_requested: "Refund: Requested",
  refund_processed: "Refund: Processed",
  refund_rejected: "Refund: Rejected",
  refund_cancelled: "Refund: Cancelled",
  release_block_revised: "Released: Block Revised",
  transfer_out: "Transfer: Sent",
  transfer_in: "Transfer: Received",
  release_winning_by_admin: "Released: Pending Lifting (By Admin)",
  blocked_winning_correction: "Blocked: Winner Correction",
  release_winning_correction: "Released: Winner Correction",
};

/** Type label for a `blocked_winning` entry whose forfeiture was approved. */
export const EMD_FORFEITED_TYPE_LABEL = "Forfeiture: Winning Lots";

export const EMD_TXN_TYPE_LABELS: Record<EmdTxnType, string> = {
  credit: "Credit",
  debit: "Debit",
};

export const EMD_BLOCK_STATUSES = ["exception", "full", "partial"] as const;
export type EmdBlockStatus = (typeof EMD_BLOCK_STATUSES)[number];

export const EMD_BLOCK_STATUS_LABELS: Record<EmdBlockStatus, string> = {
  exception: "Exception",
  full: "Full",
  partial: "Partial",
};

/** `requested` → admin review → `reviewed` → accounts verify → `verified` → `paid`. */
export const EMD_REFUND_STATUSES = [
  "requested",
  "reviewed",
  "verified",
  "paid",
  "rejected",
  "cancelled",
] as const;
export type EmdRefundStatus = (typeof EMD_REFUND_STATUSES)[number];

export const EMD_REFUND_STATUS_LABELS: Record<EmdRefundStatus, string> = {
  requested: "Requested",
  reviewed: "Reviewed",
  verified: "Verified",
  paid: "Paid",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

/** List/summary buckets of the admin refunds page, one per status. */
export const EMD_REFUND_VIEWS = [
  "to_review",
  "to_verify",
  "to_pay",
  "paid",
  "cancelled",
  "rejected",
] as const;
export type EmdRefundView = (typeof EMD_REFUND_VIEWS)[number];

/** Open queues: shown in full whatever the date filter. */
export const EMD_REFUND_OPEN_VIEWS = [
  "to_review",
  "to_verify",
  "to_pay",
] as const satisfies readonly EmdRefundView[];

export const EMD_REFUND_REJECTION_STAGES = ["admin", "accounts"] as const;
export type EmdRefundRejectionStage =
  (typeof EMD_REFUND_REJECTION_STAGES)[number];

export const EMD_REFUND_REJECTION_STAGE_LABELS: Record<
  EmdRefundRejectionStage,
  string
> = {
  admin: "Admin",
  accounts: "Accounts",
};

export const EMD_FORFEITURE_STATUSES = [
  "requested",
  "forfeited",
  "rejected",
] as const;
export type EmdForfeitureStatus = (typeof EMD_FORFEITURE_STATUSES)[number];

export const EMD_FORFEITURE_STATUS_LABELS: Record<EmdForfeitureStatus, string> =
  {
    requested: "Pending Review",
    forfeited: "Forfeited",
    rejected: "Rejected",
  };

/** Payment of a forfeited amount to the client; null until forfeited. */
export const EMD_FORFEITURE_CLIENT_PAYMENTS = ["payable", "paid"] as const;
export type EmdForfeitureClientPayment =
  (typeof EMD_FORFEITURE_CLIENT_PAYMENTS)[number];

export const EMD_FORFEITURE_CLIENT_PAYMENT_LABELS: Record<
  EmdForfeitureClientPayment,
  string
> = {
  payable: "Payable to client",
  paid: "Paid to client",
};

/** List/summary buckets: the three statuses plus the two payment states of `forfeited`. */
export const EMD_FORFEITURE_VIEWS = [
  "requested",
  "forfeited",
  "payable",
  "paid",
  "rejected",
] as const;
export type EmdForfeitureView = (typeof EMD_FORFEITURE_VIEWS)[number];

export const EMD_TRANSFER_STATUSES = [
  "requested",
  "approved",
  "rejected",
] as const;
export type EmdTransferStatus = (typeof EMD_TRANSFER_STATUSES)[number];

export const EMD_TRANSFER_STATUS_LABELS: Record<EmdTransferStatus, string> = {
  requested: "Pending Review",
  approved: "Transferred",
  rejected: "Rejected",
};

/** List/summary buckets: one per status. */
export const EMD_TRANSFER_VIEWS = EMD_TRANSFER_STATUSES;
export type EmdTransferView = (typeof EMD_TRANSFER_VIEWS)[number];

export const EMD_SETTLEMENT_JOB_KINDS = [
  "auction_closed",
  "lot_withdrawn",
  "legacy_cutover",
] as const;
export type EmdSettlementJobKind = (typeof EMD_SETTLEMENT_JOB_KINDS)[number];

export const EMD_SETTLEMENT_JOB_KIND_LABELS: Record<
  EmdSettlementJobKind,
  string
> = {
  auction_closed: "Auction closed",
  lot_withdrawn: "Lot withdrawn",
  legacy_cutover: "Legacy cutover",
};

export const EMD_SETTLEMENT_JOB_STATUSES = [
  "paused",
  "queued",
  "running",
  "done",
  "failed",
] as const;
export type EmdSettlementJobStatus =
  (typeof EMD_SETTLEMENT_JOB_STATUSES)[number];

export const EMD_SETTLEMENT_JOB_STATUS_LABELS: Record<
  EmdSettlementJobStatus,
  string
> = {
  paused: "Paused",
  queued: "Settlement pending",
  running: "Settling",
  done: "Settled",
  failed: "Settlement failed",
};

/**
 * Passbook narration per EMD type. `{placeholder}`s are filled when the entry is
 * written; a bracketed part or ` | ` segment whose placeholders are all empty is dropped.
 */
export const EMD_NARRATION_TEMPLATES: Record<EmdType, string> = {
  emd_deposit: "EMD Deposit by {utr}",
  opening_balance: "Opening Balance as on {date}",
  correction_credit: "EMD Correction for {remarks}",
  correction_debit: "EMD Correction for {remarks}",
  blocked_bidder_attached: "EMD Blocked for {auctionNo} for Lots Attached",
  blocked_winning: "EMD Blocked for {auctionNo} for Winning Lots",
  release_auction_closed: "EMD Release for {auctionNo} for Auction Closed",
  release_bidder_detached: "EMD Release for {auctionNo} for Lots Detached",
  release_lot_withdrawn: "EMD Release for {auctionNo} for Lot Withdrawn",
  release_bidder_unverified:
    "EMD Release for {auctionNo} for Bidder Unverified",
  release_by_admin: "EMD Release for {auctionNo} for {remarks}",
  release_lot_rejected: "EMD Release for {auctionNo} for Lot Rejected",
  refund_requested: "EMD Refund Requested #{refundId}",
  refund_processed: "EMD Refund Processed #{refundId} by {txnRefNo} on {date}",
  refund_rejected: "EMD Refund Rejected #{refundId} for {remarks}",
  refund_cancelled: "EMD Refund Cancelled #{refundId}",
  release_block_revised: "EMD Block Revised for {auctionNo}",
  transfer_out: "EMD Transfer to {counterparty} ({remarks})",
  transfer_in: "EMD Transfer from {counterparty} ({remarks})",
  release_winning_by_admin: "EMD Release for {auctionNo} for Lots Released by Admin",
  blocked_winning_correction: "EMD Blocked for {auctionNo} for Winner Correction",
  release_winning_correction: "EMD Release for {auctionNo} for Winner Correction",
};

/** Replaces the `refund_requested` narration once accounts pays the refund. */
export const EMD_REFUND_PROCESSED_NARRATION =
  "EMD Refund Processed #{refundId} by {txnRefNo} on {date}";

/** Replaces the `blocked_winning` narration once the forfeiture is approved. */
export const EMD_FORFEITED_NARRATION =
  "EMD Forfeited for {auctionNo} for {reason}";

/** `emd_winning_lot_releases.remarks` for a legacy lot-wise EMD unblock recovered
 * from the old system (seed-emd.ts backfill) — no admin actioned this release
 * in the new app. */
export const EMD_LEGACY_LOT_RELEASE_REMARKS =
  "Migrated from legacy system (lot-wise EMD unblock)";

export const EmdValidationMessages = {
  VALIDATION_FAILED: "Please check the form and try again.",
  BIDDER_REQUIRED: "Bidder is required.",
  BIDDER_ID_INVALID: "Invalid bidder id.",
  AUCTION_ID_INVALID: "Invalid auction id.",
  REQUEST_ID_INVALID: "Invalid request id.",
  TRANSACTION_ID_INVALID: "Invalid transaction id.",
  SETTLEMENT_JOB_ID_INVALID: "Invalid settlement job id.",
  FORFEITURE_ID_INVALID: "Invalid forfeiture id.",
  TRANSFER_ID_INVALID: "Invalid transfer id.",
  TRANSFER_SAME_BIDDER: "Choose two different bidders.",
  CLIENT_ID_INVALID: "Invalid client id.",
  RANGE_ID_INVALID: "Invalid EMD range id.",
  LOT_ID_INVALID: "Invalid lot id.",
  DATE_INVALID: "Enter a valid date.",
  FORFEITURE_DISPOSITION_REQUIRED: "Choose a disposition.",
  FORFEITURE_ROWS_REQUIRED:
    "Add a disposition and reason for at least one bidder.",
  AMOUNT_REQUIRED: "Enter a valid amount greater than 0.",
  AMOUNT_POSITIVE: "Amount must be greater than 0.",
  PAYMENT_MODE_REQUIRED: "Payment mode is required.",
  TRANSACTION_DATE_REQUIRED: "Transaction date is required.",
  TRANSACTION_DATE_IN_FUTURE: "Transaction date cannot be in the future.",
  UTR_REQUIRED: "Transaction reference no. is required.",
  UTR_MAX: "Transaction reference no. must be at most 100 characters.",
  REMARKS_REQUIRED: "Please enter a remark and try again.",
  REMARKS_MAX: "Remarks must be at most 500 characters.",
  REASON_REQUIRED: "A reason is required.",
  REASON_MAX: "Reason must be at most 500 characters.",
  TXN_REF_NO_REQUIRED: "Transaction reference no. is required.",
  TXN_REF_NO_MAX: "Transaction reference no. must be at most 100 characters.",
  PAYMENT_DATE_REQUIRED: "Payment date is required.",
  PAYMENT_DATE_IN_FUTURE: "Payment date cannot be in the future.",
  PAYMENT_DATE_BEFORE_VERIFIED:
    "Payment date cannot be before the verification date.",
  REFERENCE_REQUIRED: "Client confirmation reference is required.",
  REFUND_AMOUNT_EXCEEDS_BALANCE: (availableLabel: string) =>
    `Refund amount exceeds your available EMD balance (${availableLabel}).`,
  TRANSFER_AMOUNT_EXCEEDS_BALANCE: (availableLabel: string) =>
    `Transfer amount exceeds the bidder's withdrawable EMD (${availableLabel}).`,
  BLOCK_INSUFFICIENT: (available: number, amount: number) =>
    `Insufficient EMD: available ${available}, required to block ${amount}`,
};

export const EmdErrorMessages = {
  NOT_A_BIDDER: "Your account is not linked to a bidder company.",
  BIDDER_NOT_FOUND: "Bidder not found.",
  AUCTION_NOT_FOUND: "Auction not found.",
  PAYMENT_MODE_NOT_FOUND: "Payment mode not found.",
  TRANSACTION_NOT_FOUND: "EMD transaction not found.",
  INSUFFICIENT_BALANCE: "Amount exceeds the available EMD balance.",
  DUPLICATE_UTR:
    "A deposit with this transaction reference no. already exists for this payment mode.",
  DEPOSIT_ALREADY_EDITED:
    "This payment was already edited or corrected. Refresh and try again.",
  DEPOSIT_FUNDS_IN_USE:
    "Part of this payment is already blocked or refunded. Release the EMD before reducing or moving it.",
  BLOCK_CHANGED: "Blocked EMD changed. Please reopen and try again.",
  RELEASE_LOTS_REQUIRED: "Select at least one lot to release.",
  RELEASE_LOT_NOT_PENDING:
    "This lot has no EMD pending lifting for this bidder. Refresh and try again.",
  RELEASE_LOT_ALREADY_RELEASED: "This lot is already released.",
  RELEASE_LOT_DUPLICATE: "This lot is selected more than once.",
  RELEASE_LOT_FORFEITURE_OPEN:
    "A forfeiture request is open for this lot's EMD range, so it cannot be released.",
  REFUND_NOT_FOUND: "Refund request not found.",
  REFUND_INVALID_STATUS:
    "This action is not allowed for the refund's current status.",
  REFUND_BIDDER_NOT_VERIFIED:
    "Your account is not verified. Contact support to get verified before requesting a refund.",
  SETTLEMENT_JOB_NOT_FOUND: "Settlement job not found.",
  SETTLEMENT_JOB_NOT_RETRYABLE: "Only failed settlement jobs can be retried.",
  FORFEITURE_NOT_FOUND: "Forfeiture not found.",
  FORFEITURE_INVALID_STATUS:
    "This action is not allowed for the forfeiture's current status.",
  FORFEITURE_NO_WINNING:
    "There is no blocked EMD left to forfeit for this range.",
  FORFEITURE_ALREADY_OPEN:
    "This range already has a pending or forfeited request.",
  FORFEITURE_DUPLICATE_ROWS: "The same bidder range appears more than once.",
  FORFEITURE_WINNING_CHANGED:
    "Blocked EMD for this range changed since the request. Reject it and raise a new request.",
  FORFEITURE_ALREADY_PAID: "This forfeiture is already paid to the client.",
  FORFEITURE_PAY_MIXED_CLIENTS:
    "Select forfeitures of a single client to record one transfer.",
  FORFEITURE_DISPOSITION_NOT_FOUND: "Disposition not found.",
  FORFEITURE_DISPOSITION_INACTIVE:
    "This disposition is inactive. Choose another one.",
  FORFEITURE_DISPOSITION_EXISTS: "A disposition with this name already exists.",
  TRANSFER_NOT_FOUND: "Transfer not found.",
  TRANSFER_INVALID_STATUS:
    "This action is not allowed for the transfer's current status.",
  TRANSFER_BIDDER_NOT_ELIGIBLE:
    "Both bidders must be active and verified to transfer EMD.",
  TRANSFER_BALANCE_CHANGED:
    "Withdrawable EMD of the sending bidder changed since the request. Reject it and raise a new request.",
  LOAD_FAILED: "Failed to load EMD data.",
};

export const EmdSuccessMessages = {
  CREDIT_POSTED: "EMD credit posted",
  DEPOSIT_UPDATED: "Payment updated",
  LOTS_RELEASED: (
    released: number,
    failed: number,
    amountLabel: string | null,
  ) =>
    [
      `${released} lot${released === 1 ? "" : "s"} released`,
      failed > 0 ? `${failed} failed` : null,
      amountLabel ? `${amountLabel} returned to withdrawable` : null,
    ]
      .filter(Boolean)
      .join(", "),
  REFUND_REQUESTED: "Refund request submitted",
  REFUND_CANCELLED: "Refund request cancelled",
  REFUND_REVIEWED: "Refund request approved",
  REFUND_VERIFIED: "Refund request verified",
  REFUND_REJECTED: "Refund request rejected",
  REFUND_PAID: "Refund marked as paid",
  SETTLEMENT_JOB_RETRIED: "Settlement queued again",
  FORFEITURE_REQUESTED: (count: number) =>
    count === 1
      ? "Forfeiture request sent for HOD review"
      : `${count} forfeiture requests sent for HOD review`,
  FORFEITURE_APPROVED: (count: number) =>
    count === 1 ? "EMD forfeited" : `${count} forfeitures approved`,
  FORFEITURE_REJECTED: (count: number) =>
    count === 1
      ? "Forfeiture request rejected"
      : `${count} forfeiture requests rejected`,
  FORFEITURE_PAID_TO_CLIENT: (count: number) =>
    count === 1
      ? "Forfeiture marked as paid to client"
      : `${count} forfeitures marked as paid to client`,
  SETTLEMENT_JOBS_RESUMED: (count: number) =>
    `${count} paused settlement job${count === 1 ? "" : "s"} resumed`,
  TRANSFER_REQUESTED: "Transfer request sent for HOD review",
  TRANSFER_APPROVED: (count: number) =>
    count === 1 ? "EMD transferred" : `${count} transfers approved`,
  TRANSFER_REJECTED: (count: number) =>
    count === 1
      ? "Transfer request rejected"
      : `${count} transfer requests rejected`,
};

export const EmdFailureMessages = {
  CREDIT_FAILED: "Failed to post EMD credit",
  DEPOSIT_UPDATE_FAILED: "Failed to update payment",
  RELEASE_FAILED: "Failed to release EMD",
  REFUND_REQUEST_FAILED: "Failed to submit request",
  REFUND_CANCEL_FAILED: "Failed to cancel request",
  REFUND_ACTION_FAILED: "Failed to update refund request",
  SETTLEMENT_ACTION_FAILED: "Failed to update settlement job",
  EXPORT_FAILED: "Failed to export report",
  PASSBOOK_EXPORT_FAILED: "Failed to export passbook",
  FORFEITURE_ACTION_FAILED: "Failed to update forfeiture",
  FORFEITURE_DISPOSITION_SAVE_FAILED: "Failed to save disposition",
  TRANSFER_REQUEST_FAILED: "Failed to submit transfer request",
  TRANSFER_ACTION_FAILED: "Failed to update transfer request",
};

export const EmdEmptyMessages = {
  PASSBOOK_EMPTY_TITLE: "No transactions",
  PASSBOOK_EMPTY_DESCRIPTION: "No EMD transactions for this bidder yet.",
  PASSBOOK_SELECT_BIDDER_TITLE: "Select a bidder",
  PASSBOOK_SELECT_BIDDER_DESCRIPTION: "Choose a bidder to view their passbook.",
  BLOCKED_EMPTY_TITLE: "No blocked EMD",
  BLOCKED_EMPTY_DESCRIPTION: "No blocked EMD found for this bidder.",
  REFUNDS_EMPTY_TITLE: "No refund requests",
  REFUNDS_EMPTY_DESCRIPTION: "No EMD refund requests found.",
  REPORT_EMPTY_TITLE: "No EMD activity",
  REPORT_EMPTY_DESCRIPTION: "No bidders with EMD activity match these filters.",
  RELEASE_BIDDERS_EMPTY_TITLE: "No EMD pending lifting",
  RELEASE_BIDDERS_EMPTY_DESCRIPTION:
    "No bidders have EMD pending lifting that match these filters.",
  PENDING_LOTS_EMPTY_TITLE: "No lots pending",
  PENDING_LOTS_EMPTY_DESCRIPTION:
    "This bidder has no won lots left to release.",
  RELEASE_HISTORY_EMPTY_TITLE: "No releases yet",
  RELEASE_HISTORY_EMPTY_DESCRIPTION:
    "Release requests made from this page will appear here.",
  LOTS_EMPTY_TITLE: "No lots found",
  LOTS_EMPTY_DESCRIPTION: "No lots found for this bidder on this auction.",
  SETTLEMENT_JOBS_EMPTY_TITLE: "No settlement jobs",
  SETTLEMENT_JOBS_EMPTY_DESCRIPTION:
    "No auctions are waiting for EMD settlement.",
  DEPOSITS_EMPTY_TITLE: "No payments",
  DEPOSITS_EMPTY_DESCRIPTION: "No EMD payments match these filters.",
  REFUNDS_FILTERED_EMPTY_DESCRIPTION: "No refund requests match these filters.",
  FORFEITURES_EMPTY_TITLE: "No forfeitures",
  FORFEITURES_EMPTY_DESCRIPTION: "No forfeitures match these filters.",
  TRANSFERS_EMPTY_TITLE: "No transfers",
  TRANSFERS_EMPTY_DESCRIPTION: "No EMD transfers match these filters.",
  FORFEITURE_AUCTIONS_EMPTY: "No auctions with forfeitures in this period.",
  FORFEITURE_CANDIDATE_AUCTIONS_EMPTY:
    "No closed auctions with blocked EMD in this period.",
  FORFEITURE_CANDIDATES_SELECT_TITLE: "Select an auction",
  FORFEITURE_CANDIDATES_SELECT_DESCRIPTION:
    "Pick the date range, client and auction to list bidders with blocked EMD.",
  FORFEITURE_CANDIDATES_EMPTY_TITLE: "Nothing to forfeit",
  FORFEITURE_CANDIDATES_EMPTY_DESCRIPTION:
    "No blocked EMD left to forfeit on this auction.",
  MY_PASSBOOK_EMPTY_DESCRIPTION: "Your EMD transactions will appear here.",
  MY_BLOCKED_EMPTY_DESCRIPTION:
    "You have no EMD blocked in auctions.",
  MY_REFUNDS_EMPTY_DESCRIPTION: "You haven't raised any refund requests yet.",
  LOAD_ERROR_TITLE: "Could not load EMD data",
};

export const EmdUiMessages = {
  VAN_HINT:
    "Deposit EMD to this virtual account number. Credits are matched to your account automatically.",
  SHORTFALL_HINT: (shortfallLabel: string, van: string) =>
    `Available EMD is short by ${shortfallLabel}. Deposit to virtual account ${van}.`,
  VAN_NOT_ASSIGNED:
    "Your virtual account number is not assigned yet. Please contact support.",
  REFUND_REQUEST_HINT:
    "The amount is set aside from your withdrawable amount until the request is paid or closed.",
  SETTLEMENT_PENDING: "EMD settlement pending",
  RELEASE_FORFEITURE_REQUESTED: "Forfeiture requested",
  RELEASE_NOTE_RELEASED: (amountLabel: string) => `Released ${amountLabel}`,
  RELEASE_NOTE_RELEASED_WITH: (requestIds: string) =>
    `Released with ${requestIds}`,
  RELEASE_PENDING_RANGE: "Pending – awaiting other lots in this EMD range",
  RELEASE_PENDING_CONSOLIDATED:
    "Pending – awaiting other EMD ranges of this bidder to be released",
  RELEASE_ROW_RELEASED: (amountLabel: string) =>
    `EMD released. ${amountLabel} returned to withdrawable.`,
  RELEASE_ROW_CLEARED:
    "Lot cleared. EMD release pending for other lots of this EMD range.",
  RELEASE_ROW_CLEARED_CONSOLIDATED:
    "Lot cleared. EMD release pending until other EMD ranges of this bidder free up the consolidated cap.",
  RELEASE_RANGE_ALL_LOTS: "All won lots",
  RELEASE_RANGE_SHARED: (lots: number) => `Shared by ${lots} lots`,
  RELEASE_SELECT_ROW_HINT: "Select this lot to add a release remark.",
  DEPOSIT_REPLACES_REFERENCE: (transactionId: number) =>
    `Replaces #${transactionId}`,
  SETTLEMENT_PENDING_ALERT: (count: number) =>
    `${count} EMD settlement job${count === 1 ? " is" : "s are"} paused or failed, so blocked EMD of non-winning bidders is not released yet.`,
};

export const LotBidderMapMessages = {
  NO_BIDDERS_SEARCH_TITLE: "No matching bidders",
  NO_BIDDERS_SEARCH_DESCRIPTION: "No bidders match your search.",
  NO_BIDDERS_POOL_TITLE: "No bidders in pool",
  NO_BIDDERS_POOL_DESCRIPTION:
    "Try searching for bidders not already in the pool.",
  NO_BIDDERS_FOUND_TITLE: "No bidders found",
  NO_BIDDERS_FOUND_DESCRIPTION: "No bidders found.",
  NO_LOTS_FOR_UNBLOCK_TITLE: "No lots found",
  NO_LOTS_FOR_UNBLOCK_DESCRIPTION:
    "No lots found for this bidder on this auction.",
  EMPTY_POOL_TITLE: "Pool is empty",
  EMPTY_POOL_DESCRIPTION: "Add bidders to the auction pool first.",
};

export const BidderAccountMessages = {
  UNLINKED_TITLE: "Account not linked",
  UNLINKED_PASSBOOK_DESCRIPTION:
    "Your account is not linked to a bidder company, so the passbook is unavailable. Please contact support.",
  UNLINKED_EMD_OVERVIEW_DESCRIPTION:
    "Your account is not linked to a bidder company, so the EMD overview is unavailable. Please contact support.",
  UNLINKED_SUBSCRIPTION_DESCRIPTION:
    "Your account is not linked to a bidder company. Please contact support.",
  UNLINKED_REFUND_DESCRIPTION:
    "Your account is not linked to a bidder company, so refund requests are unavailable. Please contact support.",
  UNLINKED_BANK_ACCOUNT_DESCRIPTION:
    "Your account is not linked to a bidder company, so bank account updates are unavailable. Please contact support.",
  BANK_UPDATE_STATUS_PENDING: "Pending Verification",
  BANK_UPDATE_STATUS_VERIFIED: "Verified",
  BANK_UPDATE_STATUS_UNVERIFIED: "Unverified",
  BANK_UPDATE_STATUS_ACCEPTED: "Accepted",
  BANK_UPDATE_STATUS_REJECTED: "Rejected",
  BANK_UPDATE_PENDING_HINT:
    "Your update is awaiting admin verification. You cannot submit another request until it is accepted or rejected.",
  BANK_UPDATE_SECTION_DESCRIPTION:
    "Request an update when your bank details change. Changes apply only after admin verification.",
  CURRENT_BANK_EMPTY_TITLE: "No verified bank account",
  CURRENT_BANK_EMPTY_DESCRIPTION:
    "You don't have a verified bank account yet. Submit an update request to add your details.",
  BANK_UPDATE_FORM_HINT:
    "These bank details and cancelled cheque will be shared for admin verification. Changes apply only after they are approved.",
  UNLINKED_TNC_DESCRIPTION:
    "Your account isn't linked to a bidder company yet, so there are no auctions to show. Please contact support.",
  UNLINKED_LIVE_BIDDING_DESCRIPTION:
    "Your account isn't linked to a bidder profile, so bidding is unavailable.",
  SELECT_AUCTION_TITLE: "Select an auction",
  SELECT_AUCTION_DESCRIPTION: "Select an auction to start bidding.",
  WAITING_FOR_LOTS_TITLE: "Waiting for lots",
  WAITING_FOR_LOTS_DESCRIPTION:
    "Lots will appear here once the auction starts.",
  NO_LOTS_ASSIGNED_TITLE: "No lots assigned",
  NO_LOTS_ASSIGNED_DESCRIPTION: "No lots assigned to you in this auction.",
  AUCTION_LOAD_ERROR_TITLE: "Could not load this auction",
  AUCTION_LOAD_ERROR_DESCRIPTION: "Failed to load this auction.",
  TNC_EMPTY_TITLE: "All caught up",
  TNC_EMPTY_DESCRIPTION: "No pending Terms & Conditions. You're all set.",
};
