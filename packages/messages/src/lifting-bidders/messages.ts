export const LiftingBidderValidationMessages = {
  VALIDATION_FAILED: "Please check the form and try again.",
  DISPOSITION_REQUIRED: "Select a disposition.",
  DISPOSITION_INVALID: "Invalid disposition status.",
  NOTES_REQUIRED: "Comments / notes are required.",
  NOTES_MAX: "Notes must be at most 4000 characters.",
  NEXT_FOLLOWUP_REQUIRED: "Next follow-up is required.",
  NEXT_FOLLOWUP_INVALID: "Enter a valid date and time.",
  NEXT_FOLLOWUP_BEFORE_NOW: "Next follow-up cannot be in the past.",
  LIFTED_QTY_BIDDER_REQUIRED:
    "Lifted qty (bidder) is required for this disposition.",
  LIFTED_QTY_NONNEGATIVE: "Quantity cannot be negative.",
  INVALID_LOT_ID: "Invalid lot ID.",
} as const;

export const LiftingBidderSuccessMessages = {
  ENGAGEMENT_LOGGED: "Engagement logged.",
} as const;

export const LiftingBidderErrorMessages = {
  LOT_NOT_FOUND: "This lifting lot could not be found.",
  LOAD_OVERVIEW_GENERIC: "We couldn't load the lot overview. Try again.",
  LOAD_ENGAGEMENTS_GENERIC: "We couldn't load engagement history. Try again.",
  LOAD_STATS_GENERIC: "We couldn't load lifting statistics. Try again.",
  LOAD_TABLE_GENERIC: "We couldn't load lifting lots. Try again.",
  LOAD_TABLE_TITLE: "Could not load lifting lots",
  LOAD_STATS_TITLE: "Could not load statistics",
  LOAD_OVERVIEW_TITLE: "Could not load lifting overview",
  LOAD_ENGAGEMENTS_TITLE: "Could not load engagement history",
  STATS_UNAVAILABLE: "Statistics unavailable.",
  FAILED_TO_LOG_ENGAGEMENT: "Failed to log engagement. Try again.",
  REQUEST_FAILED: "Request failed.",
  INSERT_FAILED: "Failed to insert lifting engagement.",
} as const;
