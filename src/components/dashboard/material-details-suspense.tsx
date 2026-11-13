import { Skeleton } from "@auctionit/ui";

export function MaterialDetailsSuspense() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="aspect-video w-full rounded-md" />
        <Skeleton className="aspect-video w-full rounded-md" />
      </div>
    </div>
  );
}
