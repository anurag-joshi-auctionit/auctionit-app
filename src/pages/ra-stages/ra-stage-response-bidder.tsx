import {
  BidderRaStagesStatusMessages,
  BidderRaStagesValidationMessages,
} from "@auctionit/messages/bidder-ra-stages";
import type React from "react";
import {
  Badge,
  Button,
  DataPanelError,
  PageHeader,
  Skeleton,
  formatDateTime,
  toast,
} from "@auctionit/ui";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { QuestionAnswerField } from "@/components/ra-stages/question-answer-field";
import { useMyRaStageQuery, useSubmitRaStageResponseMutation } from "@/lib/ra-stages/queries";
import {
  RA_STAGE_LABELS,
  type MyRaStageDetail,
  type RaStageAnswerDraft,
  type RaStageAnswerType,
  type RaStageKey,
} from "@/lib/ra-stages/types";

const STAGE_KEYS: RaStageKey[] = ["rfi", "rfp", "rfq"];

const ANSWER_TYPE_LABEL: Record<RaStageAnswerType, string> = {
  short_text: "Single Line Text",
  long_text: "Multi Line Text",
  number: "Number",
  date: "Date",
  single_choice: "Single Choice",
  multiple_choice: "Multiple Choice",
  file_upload: "File Upload",
};

function StageDescription({ detail }: { detail: MyRaStageDetail }) {
  const { stageStatus, startsAt, endsAt, responseStatus, isShortlisted } = detail;

  const windowParts: string[] = [];
  if (stageStatus === "closed") {
    if (endsAt) windowParts.push(`Ended ${formatDateTime(endsAt) ?? ""}`);
  } else {
    if (startsAt) windowParts.push(`Starts At: ${formatDateTime(startsAt) ?? startsAt}`);
    if (endsAt) windowParts.push(`Ends At: ${formatDateTime(endsAt) ?? endsAt}`);
  }

  let statusBadge: React.ReactNode = null;
  if (responseStatus === "submitted") {
    if (isShortlisted === true) {
      statusBadge = <Badge>{BidderRaStagesStatusMessages.SHORTLISTED}</Badge>;
    } else if (isShortlisted === false) {
      statusBadge = <Badge>{BidderRaStagesStatusMessages.REJECTED}</Badge>;
    } else {
      statusBadge = <Badge>{BidderRaStagesStatusMessages.UNDER_REVIEW}</Badge>;
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {windowParts.length > 0 ? (
        <span>{windowParts.join(" | ")}</span>
      ) : null}
      {statusBadge}
    </div>
  );
}

export function RaStageResponsePageBidder() {
  const { auctionId: auctionIdParam, stageKey: stageKeyParam } = useParams();

  const auctionId = Number(auctionIdParam);
  const validAuctionId = Number.isInteger(auctionId) && auctionId > 0;
  const stageKey = STAGE_KEYS.includes(stageKeyParam as RaStageKey)
    ? (stageKeyParam as RaStageKey)
    : undefined;

  const query = useMyRaStageQuery(validAuctionId ? auctionId : undefined, stageKey);
  const mutation = useSubmitRaStageResponseMutation(auctionId, stageKey ?? "rfi");

  const [answers, setAnswers] = useState<RaStageAnswerDraft>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [hydrated, setHydrated] = useState(false);

  const detail = query.data;

  if (detail && !hydrated) {
    const initial: RaStageAnswerDraft = {};
    for (const [questionId, value] of Object.entries(detail.answers)) {
      if (value != null) initial[questionId] = value;
    }
    setAnswers(initial);
    setHydrated(true);
  }

  if (!validAuctionId || !stageKey) {
    return (
      <div className="p-4">
        <DataPanelError title="Invalid link" message="This stage link is invalid." />
      </div>
    );
  }

  const stageLabel = RA_STAGE_LABELS[stageKey];

  const handleSubmit = () => {
    if (!detail) return;
    for (const q of detail.questions) {
      if (!q.required) continue;
      if (q.answerType === "file_upload") {
        if (!files[q.id]) {
          toast.error(BidderRaStagesValidationMessages.ALL_REQUIRED_QUESTIONS_MUST_BE_ANSWERED);
          return;
        }
        continue;
      }
      const value = answers[q.id];
      const hasValue = Array.isArray(value) ? value.length > 0 : !!value;
      if (!hasValue) {
        toast.error(BidderRaStagesValidationMessages.ALL_REQUIRED_QUESTIONS_MUST_BE_ANSWERED);
        return;
      }
    }

    mutation.mutate(
      { answers, files },
      {
        onSuccess: () => {
          void query.refetch();
        },
      },
    );
  };

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title={stageLabel}
        description={detail ? <StageDescription detail={detail} /> : "Loading stage details…"}
      />

      {query.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : query.isError || !detail ? (
        <DataPanelError
          title="Could not load this stage"
          message={query.error instanceof Error ? query.error.message : "Please try again."}
          onRetry={() => void query.refetch()}
        />
      ) : detail.responseStatus === "submitted" ? (
        <div className="space-y-4">
          {detail.isShortlisted === false && detail.rejectionReason ? (
            <p className="text-muted-foreground text-sm">{detail.rejectionReason}</p>
          ) : null}
          {detail.questions.map((q, i) => (
            <div key={q.id} className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-sm font-medium">{i + 1}.</span>
                <p className="text-sm font-medium">{q.question}</p>
                <Badge color="blue">{ANSWER_TYPE_LABEL[q.answerType]}</Badge>
                {q.required ? <Badge color="yellow">Required</Badge> : null}
              </div>
              <p className="text-muted-foreground pl-5 text-sm">
                {Array.isArray(detail.answers[q.id])
                  ? (detail.answers[q.id] as string[]).join(", ")
                  : (detail.answers[q.id] as string | null) ?? "—"}
              </p>
            </div>
          ))}
        </div>
      ) : detail.stageStatus !== "published" ? (
        <DataPanelError
          title="Stage not open"
          message={
            detail.stageStatus === "draft"
              ? BidderRaStagesStatusMessages.STAGE_NOT_YET_OPEN
              : BidderRaStagesStatusMessages.STAGE_CLOSED
          }
        />
      ) : (
        <div className="space-y-6">
          {detail.questions.map((q, i) => (
            <div key={q.id} className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-sm font-medium">{i + 1}.</span>
                <p className="text-sm font-medium">{q.question}</p>
                <Badge color="blue">{ANSWER_TYPE_LABEL[q.answerType]}</Badge>
                {q.required ? <Badge color="yellow">Required</Badge> : null}
              </div>
              <div className="pl-5">
                <QuestionAnswerField
                  question={q}
                  value={answers[q.id]}
                  onChange={(value) => setAnswers((prev) => ({ ...prev, [q.id]: value }))}
                  file={files[q.id] ?? null}
                  onFileChange={(file) => setFiles((prev) => ({ ...prev, [q.id]: file }))}
                  disabled={mutation.isPending}
                />
              </div>
            </div>
          ))}
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            Submit Response
          </Button>
        </div>
      )}
    </div>
  );
}
