import { BidderSubscriptionMessages } from "@auctionit/messages/subscriptions";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PENDING_TXN_KEY } from "@/components/subscriptions-pay-card";
import { SubscriptionsReturnView } from "@/components/subscriptions-return-view";
import {
  fetchSubscriptionPaymentConfirm,
  type SubscriptionVerifyStatus,
} from "@/lib/confirm-subscription-payment";

const MAX_POLLS = 12;
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3500";

export function SubscriptionsReturnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [attempts, setAttempts] = useState(0);

  // Instamojo appends transaction_id; fall back to what we stashed pre-redirect.
  const txn =
    searchParams.get("transaction_id") ??
    (typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(PENDING_TXN_KEY)
      : null) ??
    "";

  const query = useQuery({
    queryKey: ["subscriptions-confirm", txn],
    queryFn: () => fetchSubscriptionPaymentConfirm(API_URL, txn),
    enabled: txn !== "",
    refetchInterval: (q) => {
      const s = q.state.data;
      if (s === "completed" || s === "failed") return false;
      if (attempts >= MAX_POLLS) return false;
      return 2500;
    },
  });

  useEffect(() => {
    if (query.dataUpdatedAt) setAttempts((a) => a + 1);
  }, [query.dataUpdatedAt]);

  const status: SubscriptionVerifyStatus | undefined = query.data;

  useEffect(() => {
    if (
      (status === "completed" || status === "failed") &&
      typeof sessionStorage !== "undefined"
    ) {
      sessionStorage.removeItem(PENDING_TXN_KEY);
    }
  }, [status]);

  const timedOut =
    attempts >= MAX_POLLS && (status === "pending" || status === undefined);

  let title: string = BidderSubscriptionMessages.RETURN_CONFIRMING_TITLE;
  let body: string = BidderSubscriptionMessages.RETURN_CONFIRMING_BODY;
  let showSpinner = true;
  let showCheckAgain = false;

  if (!txn) {
    title = BidderSubscriptionMessages.RETURN_NO_TXN_TITLE;
    body = BidderSubscriptionMessages.RETURN_NO_TXN_BODY;
    showSpinner = false;
  } else if (query.isError) {
    title = BidderSubscriptionMessages.RETURN_ERROR_TITLE;
    body = BidderSubscriptionMessages.RETURN_ERROR_BODY;
    showSpinner = false;
    showCheckAgain = true;
  } else if (status === "completed") {
    title = BidderSubscriptionMessages.RETURN_COMPLETED_TITLE;
    body = BidderSubscriptionMessages.RETURN_COMPLETED_BODY;
    showSpinner = false;
  } else if (status === "failed") {
    title = BidderSubscriptionMessages.RETURN_FAILED_TITLE;
    body = BidderSubscriptionMessages.RETURN_FAILED_BODY;
    showSpinner = false;
    showCheckAgain = true;
  } else if (timedOut) {
    title = BidderSubscriptionMessages.RETURN_TIMEOUT_TITLE;
    body = BidderSubscriptionMessages.RETURN_TIMEOUT_BODY;
    showSpinner = false;
    showCheckAgain = true;
  }

  return (
    <SubscriptionsReturnView
      title={title}
      body={body}
      showSpinner={showSpinner}
      showCheckAgain={showCheckAgain}
      onGoToSubscriptions={() => navigate("/subscriptions", { replace: true })}
      onCheckAgain={() => void query.refetch()}
    />
  );
}
