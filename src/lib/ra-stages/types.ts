export type RaStageKey = "rfi" | "rfp" | "rfq";

export const RA_STAGE_LABELS: Record<RaStageKey, string> = {
  rfi: "RFI",
  rfp: "RFP",
  rfq: "RFQ",
};

export type RaStageResponseStatus = "invited" | "submitted";
export type RaStageStatus = "draft" | "published" | "closed";

export type MyRaStageInvitation = {
  stageKey: RaStageKey;
  status: RaStageResponseStatus;
  isShortlisted: boolean | null;
  rejectionReason: string | null;
};

export type RaStageAnswerType =
  | "short_text"
  | "long_text"
  | "number"
  | "date"
  | "single_choice"
  | "multiple_choice"
  | "file_upload";

export type RaStageQuestion = {
  id: string;
  question: string;
  answerType: RaStageAnswerType;
  weight: number;
  required: boolean;
  options: { value: string }[];
  fileUpload: { allowedFileTypes: string[]; maxFileSizeMb: number | null };
};

export type MyRaStageDetail = {
  stageKey: RaStageKey;
  stageStatus: RaStageStatus;
  startsAt: string | null;
  endsAt: string | null;
  responseStatus: RaStageResponseStatus;
  isShortlisted: boolean | null;
  rejectionReason: string | null;
  questions: RaStageQuestion[];
  answers: Record<string, string | string[] | null>;
};

/** Non-file answers only — file answers are sent as multipart file fields. */
export type RaStageAnswerDraft = Record<string, string | string[] | undefined>;
