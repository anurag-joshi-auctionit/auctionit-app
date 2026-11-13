import type { ApiClient } from "@auctionit/lib";

export type SubscriptionVerifyStatus = "completed" | "pending" | "failed";

const MAX_POLLS = 12;
const POLL_MS = 2500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Single confirm call against the public txn-only endpoint. */
export async function fetchSubscriptionPaymentConfirm(
  apiBaseUrl: string,
  merchantTxnId: string,
): Promise<SubscriptionVerifyStatus> {
  const base = apiBaseUrl.replace(/\/$/, "");
  const res = await fetch(`${base}/subscriptions/confirm`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ merchantTxnId }),
  });
  if (!res.ok) {
    if (res.status === 404) return "failed";
    throw new Error(`Confirm failed (${res.status})`);
  }
  const body = (await res.json()) as { status?: SubscriptionVerifyStatus };
  return body.status ?? "pending";
}

export type ConfirmSubscriptionPaymentOptions = {
  /** Defaults to 12 (~30s at 2.5s interval). */
  maxPolls?: number;
  /** Defaults to 2500. */
  pollMs?: number;
};

/**
 * Poll POST /subscriptions/confirm until completed/failed or attempts exhausted.
 * Use a higher maxPolls when payment is open in another tab.
 */
export async function confirmSubscriptionPayment(
  api: ApiClient,
  merchantTxnId: string,
  options?: ConfirmSubscriptionPaymentOptions,
): Promise<SubscriptionVerifyStatus> {
  const maxPolls = options?.maxPolls ?? MAX_POLLS;
  const pollMs = options?.pollMs ?? POLL_MS;
  let last: SubscriptionVerifyStatus = "pending";
  for (let i = 0; i < maxPolls; i++) {
    const res = await api.post<{ status: SubscriptionVerifyStatus }>(
      "/subscriptions/confirm",
      { merchantTxnId },
    );
    last = res.status;
    if (last === "completed" || last === "failed") return last;
    if (i < maxPolls - 1) await sleep(pollMs);
  }
  return last;
}
