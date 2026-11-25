export const BidderRaStagesErrorMessages = {
  STAGE_NOT_FOUND: "Stage not found.",
  NOT_INVITED: "You are not invited to this stage.",
  ALREADY_SUBMITTED: "You have already submitted this stage.",
  STAGE_NOT_OPEN: "This stage is not currently open for submissions.",
} as const;

export const BidderRaStagesValidationMessages = {
  ALL_REQUIRED_QUESTIONS_MUST_BE_ANSWERED: "Please answer all required questions.",
  FILE_TOO_LARGE: "File exceeds the maximum allowed size.",
  FILE_TYPE_NOT_ALLOWED: "This file type is not allowed for this question.",
} as const;

export const BidderRaStagesSuccessMessages = {
  RESPONSE_SUBMITTED: "Response submitted",
  DRAFT_SAVED: "Draft saved",
} as const;

export const BidderRaStagesStatusMessages = {
  UNDER_REVIEW: "Under Review",
  SHORTLISTED: "Shortlisted",
  REJECTED: "Rejected",
  STAGE_NOT_YET_OPEN: "This stage has not opened yet.",
  STAGE_CLOSED: "This stage is closed.",
} as const;
