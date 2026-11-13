import { ApiError, useAuth } from "@auctionit/lib";
import { EmdSuccessMessages } from "@auctionit/messages/emd";
import { toast } from "@auctionit/ui";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type {
  EmdPage,
  MyEmdForfeiture,
  MyEmdBlocked,
  MyEmdPassbook,
  MyEmdRefund,
  MyEmdSummary,
} from "./types";

export const myEmdKeys = {
  all: ["my-emd"] as const,
  summary: () => [...myEmdKeys.all, "summary"] as const,
  passbook: (page: number, pageSize: number) =>
    [...myEmdKeys.all, "passbook", page, pageSize] as const,
  blocked: (page: number, pageSize: number) =>
    [...myEmdKeys.all, "blocked", page, pageSize] as const,
  refunds: (page: number, pageSize: number) =>
    [...myEmdKeys.all, "refunds", page, pageSize] as const,
  forfeitures: (page: number, pageSize: number) =>
    [...myEmdKeys.all, "forfeitures", page, pageSize] as const,
};

const pageQs = (page: number, pageSize: number) =>
  new URLSearchParams({ page: String(page), pageSize: String(pageSize) }).toString();

export function toastMyEmdError(err: unknown, fallback: string) {
  toast.error(err instanceof ApiError && err.message ? err.message : fallback);
}

export function useMyEmdSummaryQuery(enabled = true) {
  const { api } = useAuth();
  return useQuery({
    queryKey: myEmdKeys.summary(),
    queryFn: () => api.get<MyEmdSummary>("/bidder-emd/summary"),
    enabled,
  });
}

export function useMyEmdSummarySuspenseQuery() {
  const { api } = useAuth();
  return useSuspenseQuery({
    queryKey: myEmdKeys.summary(),
    queryFn: () => api.get<MyEmdSummary>("/bidder-emd/summary"),
  });
}

export function useMyEmdPassbookQuery(page: number, pageSize: number, enabled = true) {
  const { api } = useAuth();
  return useQuery({
    queryKey: myEmdKeys.passbook(page, pageSize),
    queryFn: () => api.get<MyEmdPassbook>(`/bidder-emd/transactions?${pageQs(page, pageSize)}`),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useMyEmdBlockedQuery(page: number, pageSize: number, enabled = true) {
  const { api } = useAuth();
  return useQuery({
    queryKey: myEmdKeys.blocked(page, pageSize),
    queryFn: () =>
      api.get<EmdPage<MyEmdBlocked>>(`/bidder-emd/blocked?${pageQs(page, pageSize)}`),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useMyEmdRefundsQuery(page: number, pageSize: number, enabled = true) {
  const { api } = useAuth();
  return useQuery({
    queryKey: myEmdKeys.refunds(page, pageSize),
    queryFn: () =>
      api.get<EmdPage<MyEmdRefund>>(`/bidder-emd/refunds?${pageQs(page, pageSize)}`),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useMyEmdForfeituresQuery(page: number, pageSize: number, enabled = true) {
  const { api } = useAuth();
  return useQuery({
    queryKey: myEmdKeys.forfeitures(page, pageSize),
    queryFn: () =>
      api.get<EmdPage<MyEmdForfeiture>>(`/bidder-emd/forfeitures?${pageQs(page, pageSize)}`),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useRaiseMyEmdRefundMutation() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { amount: number; remarks: string }) =>
      api.post("/bidder-emd/refunds", body),
    onSuccess: () => {
      toast.success(EmdSuccessMessages.REFUND_REQUESTED);
      void queryClient.invalidateQueries({ queryKey: myEmdKeys.all });
    },
  });
}

export function useCancelMyEmdRefundMutation() {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (refundId: number) => api.post(`/bidder-emd/refunds/${refundId}/cancel`, {}),
    onSuccess: () => {
      toast.success(EmdSuccessMessages.REFUND_CANCELLED);
      void queryClient.invalidateQueries({ queryKey: myEmdKeys.all });
    },
  });
}
