import { Button } from "@auctionit/ui";
import type { FallbackProps } from "react-error-boundary";
import { BidderDashboardMessages } from "@auctionit/messages/bidder-dashboard";

export function BidderDashboardSectionError({
  title,
  description,
  error,
  resetErrorBoundary,
}: FallbackProps & {
  title: string;
  description: string;
}) {
  const message =
    error instanceof Error && error.message ? error.message : description;
  return (
    <div className="border-border bg-muted/30 flex flex-col items-start gap-3 rounded-lg border p-4">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
      <Button type="button" size="sm" variant="outline" onClick={resetErrorBoundary}>
        Retry
      </Button>
    </div>
  );
}

export function SubscriptionSectionError(props: FallbackProps) {
  return (
    <BidderDashboardSectionError
      {...props}
      title={BidderDashboardMessages.SUBSCRIPTION_LOAD_ERROR_TITLE}
      description={BidderDashboardMessages.SUBSCRIPTION_LOAD_ERROR_DESCRIPTION}
    />
  );
}

export function EmdSectionError(props: FallbackProps) {
  return (
    <BidderDashboardSectionError
      {...props}
      title={BidderDashboardMessages.EMD_LOAD_ERROR_TITLE}
      description={BidderDashboardMessages.EMD_LOAD_ERROR_DESCRIPTION}
    />
  );
}

export function LiftingSectionError(props: FallbackProps) {
  return (
    <BidderDashboardSectionError
      {...props}
      title={BidderDashboardMessages.LIFTING_LOAD_ERROR_TITLE}
      description={BidderDashboardMessages.LIFTING_LOAD_ERROR_DESCRIPTION}
    />
  );
}

export function ClientsFiltersError(props: FallbackProps) {
  return (
    <BidderDashboardSectionError
      {...props}
      title={BidderDashboardMessages.CLIENTS_LOAD_ERROR_TITLE}
      description={BidderDashboardMessages.CLIENTS_LOAD_ERROR_DESCRIPTION}
    />
  );
}
