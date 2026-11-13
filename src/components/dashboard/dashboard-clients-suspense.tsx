import { Skeleton } from "@auctionit/ui";

export function DashboardClientsSuspense() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <Skeleton className="h-9 w-[240px]" />
      <Skeleton className="h-9 w-[260px]" />
    </div>
  );
}
