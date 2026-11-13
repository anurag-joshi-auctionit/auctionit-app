import { Button, Spinner } from "@auctionit/ui";

export type SubscriptionsReturnViewProps = {
  title: string;
  body: string;
  showSpinner?: boolean;
  showCheckAgain?: boolean;
  onGoToSubscriptions?: () => void;
  onCheckAgain?: () => void;
};

/** Shared confirm-payment interstitial UI (real return page + layout preview). */
export function SubscriptionsReturnView({
  title,
  body,
  showSpinner = false,
  showCheckAgain = false,
  onGoToSubscriptions,
  onCheckAgain,
}: SubscriptionsReturnViewProps) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      {showSpinner ? <Spinner className="size-8" /> : null}
      <h1 className="text-xl font-medium">{title}</h1>
      <p className="text-muted-foreground text-sm">{body}</p>
      <div className="flex gap-2">
        <Button onClick={onGoToSubscriptions}>Go to subscriptions</Button>
        {showCheckAgain ? (
          <Button variant="outline" onClick={onCheckAgain}>
            Check again
          </Button>
        ) : null}
      </div>
    </main>
  );
}
