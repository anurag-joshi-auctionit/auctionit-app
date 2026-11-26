import { BidderRaStagesStatusMessages } from "@auctionit/messages/bidder-ra-stages";
import { ApiError } from "@auctionit/lib";
import {
  Badge,
  Button,
  DataPanelError,
  PageHeader,
  Skeleton,
  formatDateTime,
  toast,
} from "@auctionit/ui";
import { Edit05, Loading01, Save01 } from "@untitledui/icons";
import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { QuestionAnswerField } from "@/components/ra-stages/question-answer-field";
import {
  useMyRaStageQuery,
  useSaveDraftRaStageResponseMutation,
  useSubmitRaStageResponseMutation,
} from "@/lib/ra-stages/queries";
import {
  RA_STAGE_LABELS,
  type RaStageAnswerDraft,
  type RaStageAnswerType,
  type RaStageKey,
} from "@/lib/ra-stages/types";

const STAGE_KEYS: RaStageKey[] = ["rfi", "rfp", "rfq"];

const RESPONSE_STATUS_LABEL: Record<string, string> = {
  invited: "Invited",
  draft: "Draft",
  submitted: "Submitted",
};

const ANSWER_TYPE_LABEL: Record<RaStageAnswerType, string> = {
  short_text: "Single Line Text",
  long_text: "Multi Line Text",
  number: "Number",
  date: "Date",
  single_choice: "Single Choice",
  multiple_choice: "Multiple Choice",
  file_upload: "File Upload",
};

export function RaStageResponsePageBidder() {
  const { stageKey: stageKeyParam } = useParams();
  const location = useLocation();

  const auctionId = Number(
    (location.state as { auctionId?: unknown } | null)?.auctionId,
  );
  const validAuctionId = Number.isInteger(auctionId) && auctionId > 0;
  const stageKey = STAGE_KEYS.includes(stageKeyParam as RaStageKey)
    ? (stageKeyParam as RaStageKey)
    : undefined;

  const query = useMyRaStageQuery(
    validAuctionId ? auctionId : undefined,
    stageKey,
  );
  const submitMutation = useSubmitRaStageResponseMutation(
    auctionId,
    stageKey ?? "rfi",
  );
  const draftMutation = useSaveDraftRaStageResponseMutation(
    auctionId,
    stageKey ?? "rfi",
  );

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
        <DataPanelError
          title="Invalid link"
          message="This stage link is invalid."
        />
      </div>
    );
  }

  const stageLabel = RA_STAGE_LABELS[stageKey];

  const handleSaveDraft = () => {
    draftMutation.mutate({ answers, files });
  };

  const handleSubmit = () => {
    if (!detail) return;
    submitMutation.mutate(
      { answers, files },
      {
        onSuccess: () => {
          void query.refetch();
        },
        onError: (err) => {
          const body =
            err instanceof ApiError
              ? (err.body as { error?: string } | null)
              : null;
          toast.error(body?.error ?? "Failed to submit response.");
        },
      },
    );
  };

  const isBusy = submitMutation.isPending || draftMutation.isPending;

  return (
    <div className="space-y-6 p-4">
      <PageHeader
        title={stageLabel}
        description={undefined}
        actions={
          detail &&
          detail.responseStatus !== "submitted" &&
          detail.stageStatus === "published" ? (
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSaveDraft} disabled={isBusy}>
                {draftMutation.isPending ? (
                  <Loading01 className="size-4 animate-spin" />
                ) : (
                  <Edit05 className="size-4" />
                )}
                Save Draft
              </Button>
              <Button onClick={handleSubmit} disabled={isBusy}>
                {submitMutation.isPending ? (
                  <Loading01 className="size-4 animate-spin" />
                ) : (
                  <Save01 className="size-4" />
                )}
                Submit Response
              </Button>
            </div>
          ) : undefined
        }
      />

      {query.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : query.isError || !detail ? (
        <DataPanelError
          title="Could not load this stage"
          message={
            query.error instanceof Error
              ? query.error.message
              : "Please try again."
          }
          onRetry={() => void query.refetch()}
        />
      ) : (
        <div className="space-y-6">
          {/* Information card */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Stage Details</h3>
            <div className="border-border bg-muted/50 rounded-lg border p-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <p className="text-muted-foreground text-xs">Client</p>
                  <p className="font-medium">{detail.clientName ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    Auction Number
                  </p>
                  <p className="text-sm">{detail.auctionNumber ?? "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Starts At</p>
                  <p className="text-sm">
                    {formatDateTime(detail.startsAt) ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Ends At</p>
                  <p className="text-sm">
                    {formatDateTime(detail.endsAt) ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    Response Status
                  </p>
                  <div className="mt-0.5">
                    <Badge>
                      {RESPONSE_STATUS_LABEL[detail.responseStatus]}
                    </Badge>
                  </div>
                </div>
                {detail.responseStatus === "submitted" ? (
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Review Status
                    </p>
                    <div className="mt-0.5">
                      {detail.isShortlisted === true ? (
                        <Badge>
                          {BidderRaStagesStatusMessages.SHORTLISTED}
                        </Badge>
                      ) : detail.isShortlisted === false ? (
                        <Badge>{BidderRaStagesStatusMessages.REJECTED}</Badge>
                      ) : (
                        <Badge>
                          {BidderRaStagesStatusMessages.UNDER_REVIEW}
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-3">
            {detail.responseStatus === "submitted" ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Questions</h3>
                {detail.questions.map((q, i) => (
                  <div key={q.id} className="space-y-1 mb-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-muted-foreground text-sm font-medium">
                        {i + 1}.
                      </span>
                      <p className="text-sm font-medium">{q.question}</p>
                      <Badge color="blue">
                        {ANSWER_TYPE_LABEL[q.answerType]}
                      </Badge>
                      {q.required ? (
                        <Badge color="yellow">Required</Badge>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground pl-5 text-sm">
                      {Array.isArray(detail.answers[q.id])
                        ? (detail.answers[q.id] as string[]).join(", ")
                        : ((detail.answers[q.id] as string | null) ?? "—")}
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Questions</h3>
                {detail.questions.map((q, i) => (
                  <div key={q.id} className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-muted-foreground text-sm font-medium">
                        {i + 1}.
                      </span>
                      <p className="text-sm font-medium">{q.question}</p>
                      <Badge color="blue">
                        {ANSWER_TYPE_LABEL[q.answerType]}
                      </Badge>
                      {q.required ? (
                        <Badge color="yellow">Required</Badge>
                      ) : null}
                    </div>
                    <div className="pl-5">
                      <QuestionAnswerField
                        question={q}
                        value={answers[q.id]}
                        onChange={(value) =>
                          setAnswers((prev) => ({ ...prev, [q.id]: value }))
                        }
                        file={files[q.id] ?? null}
                        onFileChange={(file) =>
                          setFiles((prev) => ({ ...prev, [q.id]: file }))
                        }
                        disabled={isBusy}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
