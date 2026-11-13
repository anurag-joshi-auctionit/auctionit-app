import { Skeleton } from "@auctionit/ui";

export function BidderDetailsSuspense() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 max-w-md" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
