/**
 * Open an Instamojo payment URL in a new tab so the bidder can leave checkout
 * without being trapped in Seamless Checkout. Falls back to same-tab navigation
 * when the browser blocks the popup.
 *
 * Returns how the URL was opened so the caller can poll on the original tab
 * only for the new-tab path.
 */
export function openSubscriptionPayment(
  paymentUrl: string,
): "new-tab" | "same-tab" {
  const win = window.open(paymentUrl, "_blank");
  if (win && !win.closed) {
    // Avoid tabnabbing without `noopener` in windowFeatures (which makes
    // window.open return null and hides popup-blocker detection).
    win.opener = null;
    return "new-tab";
  }
  window.location.assign(paymentUrl);
  return "same-tab";
}
