import { Skeleton } from "./ui/skeleton";

/** Generic page skeleton for route-level loading states. */
export function PageSuspense({ withHeader = true }: { withHeader?: boolean }) {
  return (
    <div className="space-y-4 p-4">
      {withHeader ? (
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 py-2">
        <Skeleton className="h-9 w-full max-w-sm rounded-md" />
        <Skeleton className="h-9 w-[220px] rounded-md" />
        <Skeleton className="ml-auto hidden h-8 w-8 shrink-0 rounded-md lg:block" />
      </div>

      <div className="overflow-hidden rounded-md border">
        <div className="space-y-0 py-4">
          <div className="flex items-center gap-3 overflow-x-auto border-b px-2 pb-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-16 shrink-0" />
            ))}
          </div>
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="flex min-h-12 items-center gap-3 border-b px-2 py-3 last:border-b-0"
            >
              <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
              <Skeleton className="h-4 w-28 shrink-0" />
              <Skeleton className="h-4 w-20 shrink-0" />
              <Skeleton className="h-4 w-24 shrink-0" />
              <Skeleton className="h-4 w-full max-w-[200px]" />
              <Skeleton className="h-4 w-24 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-2 py-2 lg:gap-x-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        <Skeleton className="h-4 w-36" />
        <div className="flex items-center gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="size-8 shrink-0 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
