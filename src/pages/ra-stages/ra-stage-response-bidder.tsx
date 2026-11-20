import {
  BidderRaStagesStatusMessages,
  BidderRaStagesValidationMessages,
} from "@auctionit/messages/bidder-ra-stages";
import {
  Badge,
  Button,
  Card,
  CardContent,
  DataPanelError,
  PageHeader,
  Skeleton,
  toast,
} from "@auctionit/ui";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QuestionAnswerField } from "@/components/ra-stages/question-answer-field";
import { useMyRaStageQuery, useSubmitRaStageResponseMutation } from "@/lib/ra-stages/queries";
import { RA_STAGE_LABELS, type RaStageAnswerDraft, type RaStageKey } from "@/lib/ra-stages/types";

const STAGE_KEYS: RaStageKey[] = ["rfi", "rfp", "rfq"];

export function RaStageResponsePageBidder() {
  const { auctionId: auctionIdParam, stageKey: stageKeyParam } = useParams();
  const navigate = useNavigate();

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
        title={`${RA_STAGE_LABELS[stageKey]} — Due Diligence`}
        description="Answer the questions below and submit your response."
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
        <Card>
          <CardContent className="space-y-3 p-6">
            <Badge variant={detail.isShortlisted ? "success" : detail.isShortlisted === false ? "destructive" : "secondary"}>
              {detail.isShortlisted === true
                ? BidderRaStagesStatusMessages.SHORTLISTED
                : detail.isShortlisted === false
                  ? BidderRaStagesStatusMessages.NOT_SHORTLISTED
                  : BidderRaStagesStatusMessages.AWAITING_REVIEW}
            </Badge>
            {detail.isShortlisted === false && detail.rejectionReason ? (
              <p className="text-muted-foreground text-sm">{detail.rejectionReason}</p>
            ) : null}
            <div className="space-y-4 pt-4">
              {detail.questions.map((q) => (
                <div key={q.id} className="space-y-1">
                  <p className="text-sm font-medium">{q.question}</p>
                  <p className="text-muted-foreground text-sm">
                    {Array.isArray(detail.answers[q.id])
                      ? (detail.answers[q.id] as string[]).join(", ")
                      : (detail.answers[q.id] as string | null) ?? "—"}
                  </p>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
          </CardContent>
        </Card>
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
        <Card>
          <CardContent className="space-y-6 p-6">
            {detail.questions.map((q) => (
              <div key={q.id} className="space-y-2">
                <p className="text-sm font-medium">
                  {q.question}
                  {q.required ? <span className="text-destructive ml-1">*</span> : null}
                </p>
                <QuestionAnswerField
                  question={q}
                  value={answers[q.id]}
                  onChange={(value) => setAnswers((prev) => ({ ...prev, [q.id]: value }))}
                  file={files[q.id] ?? null}
                  onFileChange={(file) => setFiles((prev) => ({ ...prev, [q.id]: file }))}
                  disabled={mutation.isPending}
                />
              </div>
            ))}
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              Submit Response
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
