import { ApiError, useAuth } from "@auctionit/lib";
import { BidderSubscriptionMessages } from "@auctionit/messages/subscriptions";
import {
  Button,
  formatCurrency,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  toast,
} from "@auctionit/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loading02, Send01 } from "@untitledui/icons";
import { useEffect, useRef, useState } from "react";
import { confirmSubscriptionPayment } from "@/lib/confirm-subscription-payment";
import { openSubscriptionPayment } from "@/lib/instamojo-checkout";

/** Stashed before checkout so /subscriptions/return can confirm if redirected. */
export const PENDING_TXN_KEY = "subscription:pendingTxn";

/** ~5 minutes while the bidder completes payment in the other tab. */
const NEW_TAB_CONFIRM_POLLS = 120;
const NEW_TAB_CONFIRM_POLL_MS = 2500;

type SubscriptionType = {
  id: number;
  name: string;
  amount: number;
  gstPercent: number;
  months: number | null;
  isActive: boolean;
};

type SubscriptionsPayActionsProps = {
  paymentsEnabled: boolean;
};

export function SubscriptionsPayActions({
  paymentsEnabled,
}: SubscriptionsPayActionsProps) {
  const { api } = useAuth();
  const queryClient = useQueryClient();
  const [planId, setPlanId] = useState("");
  /** True while a confirm poll loop is in flight for pendingTxnRef. */
  const confirmingRef = useRef(false);
  const pendingTxnRef = useRef<string | null>(null);

  const plansQuery = useQuery({
    queryKey: ["subscriptions-plans"],
    queryFn: () => api.get<SubscriptionType[]>("/subscriptions/plans"),
  });

  const plans = plansQuery.data ?? [];
  const selectedPlanId = planId || (plans[0] ? String(plans[0].id) : "");

  useEffect(() => {
    if (!planId && plans[0]) setPlanId(String(plans[0].id));
  }, [planId, plans]);

  const invalidateAfterPayment = () => {
    void queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
    void queryClient.invalidateQueries({ queryKey: ["subscriptions-status"] });
  };

  const finishConfirmRef = useRef<(merchantTxnId: string) => Promise<void>>(
    async () => {},
  );

  finishConfirmRef.current = async (merchantTxnId: string) => {
    if (confirmingRef.current) return;
    if (pendingTxnRef.current !== merchantTxnId) return;
    confirmingRef.current = true;
    try {
      const status = await confirmSubscriptionPayment(api, merchantTxnId, {
        maxPolls: NEW_TAB_CONFIRM_POLLS,
        pollMs: NEW_TAB_CONFIRM_POLL_MS,
      });
      if (pendingTxnRef.current !== merchantTxnId) return;
      if (status === "completed") {
        pendingTxnRef.current = null;
        sessionStorage.removeItem(PENDING_TXN_KEY);
        toast.success(BidderSubscriptionMessages.PAY_SUCCESS);
        invalidateAfterPayment();
      } else if (status === "failed") {
        pendingTxnRef.current = null;
        sessionStorage.removeItem(PENDING_TXN_KEY);
        toast.error(BidderSubscriptionMessages.PAY_FAILED);
        invalidateAfterPayment();
      } else {
        // Keep txn so focus/visibility can retry after a slow payment.
        toast.message(BidderSubscriptionMessages.PAY_STILL_PROCESSING);
        invalidateAfterPayment();
      }
    } catch {
      if (pendingTxnRef.current !== merchantTxnId) return;
      toast.error(BidderSubscriptionMessages.PAY_STILL_PROCESSING);
      invalidateAfterPayment();
    } finally {
      confirmingRef.current = false;
    }
  };

  // Re-check when the bidder comes back to this tab after paying.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const txn = pendingTxnRef.current;
      if (!txn || confirmingRef.current) return;
      void finishConfirmRef.current(txn);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  const payMutation = useMutation({
    mutationFn: (subscriptionTypeId: number) =>
      api.post<{ paymentUrl: string; merchantTxnId: string }>(
        "/subscriptions/pay",
        { subscriptionTypeId },
      ),
    onSuccess: (data) => {
      sessionStorage.setItem(PENDING_TXN_KEY, data.merchantTxnId);
      pendingTxnRef.current = data.merchantTxnId;
      confirmingRef.current = false;

      const mode = openSubscriptionPayment(data.paymentUrl);
      if (mode === "same-tab") {
        // Navigating away; return page will confirm via redirect_url.
        return;
      }

      toast.message(BidderSubscriptionMessages.PAY_OPENED_NEW_TAB);
      void finishConfirmRef.current(data.merchantTxnId);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        const body = err.body as { error?: string } | null;
        toast.error(body?.error ?? `Failed (${err.status})`);
      } else {
        toast.error(BidderSubscriptionMessages.PAY_START_FAILED);
      }
    },
  });

  const onPay = () => {
    if (!selectedPlanId) {
      toast.error(BidderSubscriptionMessages.PLAN_REQUIRED);
      return;
    }
    payMutation.mutate(Number(selectedPlanId));
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {plansQuery.isLoading ? (
        <Skeleton className="h-9 w-64" />
      ) : (
        <Select
          value={selectedPlanId || undefined}
          onValueChange={setPlanId}
          disabled={plans.length === 0 || payMutation.isPending}
        >
          <SelectTrigger
            id="subscription-plan"
            aria-label="Select plan"
            className="w-64"
          >
            <SelectValue placeholder="Select plan" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.name} — {formatCurrency(p.amount)}{" "}
                <span className="text-xs text-muted-foreground">
                  (incl. GST)
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Button
        onClick={onPay}
        disabled={
          !paymentsEnabled ||
          payMutation.isPending ||
          plans.length === 0 ||
          !selectedPlanId
        }
      >
        {payMutation.isPending ? (
          <Loading02 className="size-4 animate-spin" />
        ) : (
          <Send01 className="size-4" />
        )}
        Proceed to Pay
      </Button>
    </div>
  );
}
