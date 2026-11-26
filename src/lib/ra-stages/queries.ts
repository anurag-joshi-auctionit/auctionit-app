import { ApiError, useAuth } from "@auctionit/lib";
import {
  BidderRaStagesErrorMessages,
  BidderRaStagesSuccessMessages,
} from "@auctionit/messages/bidder-ra-stages";

import { toast } from "@auctionit/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MyRaStageDetail, MyRaStageInvitation, RaStageAnswerDraft, RaStageKey } from "./types";

export const myRaStagesKeys = {
  all: ["my-ra-stages"] as const,
  invitations: (auctionId: number) => [...myRaStagesKeys.all, auctionId] as const,
  stage: (auctionId: number, stageKey: RaStageKey) =>
    [...myRaStagesKeys.all, auctionId, stageKey] as const,
};

export function useMyRaStageInvitationsQuery(auctionId: number | undefined) {
  const { api } = useAuth();
  return useQuery({
    queryKey: myRaStagesKeys.invitations(auctionId ?? 0),
    queryFn: () =>
      api.get<MyRaStageInvitation[]>(`/bidder-ra-stages/auctions/${auctionId}`),
    enabled: auctionId != null,
  });
}

export function useMyRaStageQuery(
  auctionId: number | undefined,
  stageKey: RaStageKey | undefined,
) {
  const { api } = useAuth();
  return useQuery({
    queryKey: myRaStagesKeys.stage(auctionId ?? 0, stageKey ?? "rfi"),
    queryFn: () =>
      api.get<MyRaStageDetail>(`/bidder-ra-stages/auctions/${auctionId}/${stageKey}`),
    enabled: auctionId != null && stageKey != null,
  });
}

type SubmitInput = {
  answers: RaStageAnswerDraft;
  files: Record<string, File | null>;
  lotQuotes?: Record<number, string>;
};

function buildStageFormData(answers: RaStageAnswerDraft, files: Record<string, File | null>, lotQuotes?: Record<number, string>): FormData {
  const formData = new FormData();
  formData.append("answers", JSON.stringify(answers));
  if (lotQuotes && Object.keys(lotQuotes).length > 0) {
    formData.append("lotQuotes", JSON.stringify(lotQuotes));
  }
  for (const [questionId, file] of Object.entries(files)) {
    if (file) formData.append(`file_${questionId}`, file);
  }
  return formData;
}

export function useSaveDraftRaStageResponseMutation(
  auctionId: number,
  stageKey: RaStageKey,
) {
  const { api } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ answers, files, lotQuotes }: SubmitInput) => {
      let res: Response;
      try {
        res = await fetch(
          `${api.baseUrl}/bidder-ra-stages/auctions/${auctionId}/${stageKey}/save-draft`,
          {
            method: "POST",
            credentials: "include",
            headers: api.appHeaders(),
            body: buildStageFormData(answers, files, lotQuotes),
          },
        );
      } catch {
        throw new ApiError(0, null, BidderRaStagesErrorMessages.STAGE_NOT_FOUND);
      }

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
            ? (body as { error: string }).error
            : BidderRaStagesErrorMessages.STAGE_NOT_FOUND;
        throw new ApiError(res.status, body, message);
      }
      return body as { ok: true };
    },
    onSuccess: () => {
      toast.success(BidderRaStagesSuccessMessages.DRAFT_SAVED);
      void queryClient.invalidateQueries({ queryKey: myRaStagesKeys.all });
    },
  });
}

export function useSubmitRaStageResponseMutation(
  auctionId: number,
  stageKey: RaStageKey,
) {
  const { api } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ answers, files, lotQuotes }: SubmitInput) => {
      let res: Response;
      try {
        res = await fetch(
          `${api.baseUrl}/bidder-ra-stages/auctions/${auctionId}/${stageKey}/submit`,
          {
            method: "POST",
            credentials: "include",
            headers: api.appHeaders(),
            body: buildStageFormData(answers, files, lotQuotes),
          },
        );
      } catch {
        throw new ApiError(0, null, BidderRaStagesErrorMessages.STAGE_NOT_FOUND);
      }

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
            ? (body as { error: string }).error
            : BidderRaStagesErrorMessages.STAGE_NOT_FOUND;
        throw new ApiError(res.status, body, message);
      }
      return body as { ok: true };
    },
    onSuccess: () => {
      toast.success(BidderRaStagesSuccessMessages.RESPONSE_SUBMITTED);
      void queryClient.invalidateQueries({ queryKey: myRaStagesKeys.all });
    },
  });
}
