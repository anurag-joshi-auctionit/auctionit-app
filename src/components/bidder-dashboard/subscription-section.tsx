import { useAuth } from "@auctionit/lib";
import { Badge, Button, formatDate, Skeleton } from "@auctionit/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DashboardSectionHeader } from "@/components/dashboard/section-header";
import { SubscriptionsPayActions } from "@/components/subscriptions-pay-card";

type SubscriptionStatus = {
  active: boolean;
  activeFrom: string | null;
  activeUntil: string | null;
  currentTypeName: string | null;
};

type StatusResponse = {
  status: SubscriptionStatus;
  paymentsEnabled?: boolean;
};

export function SubscriptionSection() {
  const { api } = useAuth();
  const { data } = useSuspenseQuery({
    queryKey: ["subscriptions-status"],
    queryFn: () => api.get<StatusResponse>("/subscriptions/status"),
  });

  const status = data.status;
  const paymentsEnabled = data.paymentsEnabled ?? false;

  return (
    <div className="space-y-3">
      <DashboardSectionHeader
        id="subscription"
        title="Subscription Details"
        actions={
          <Button variant="outline" href="/subscriptions">
            View History
          </Button>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {status.active ? (
            <Badge color="green">Subscribed</Badge>
          ) : (
            <Badge color="red">Not Subscribed</Badge>
          )}
          {status.currentTypeName ? (
            <span className="text-sm font-medium">
              {status.currentTypeName}
            </span>
          ) : null}
          {status.active && status.activeUntil ? (
            <span className="text-muted-foreground text-sm">
              Active until {formatDate(status.activeUntil) || "—"}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">
              Renew to keep participating in auctions.
            </span>
          )}
        </div>
        <SubscriptionsPayActions paymentsEnabled={paymentsEnabled} />
      </div>
    </div>
  );
}

export function SubscriptionSuspense() {
  return (
    <div className="space-y-3">
      <DashboardSectionHeader
        id="subscription"
        title="Subscription Details"
        actions={<Skeleton className="h-9 w-28" />}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}
