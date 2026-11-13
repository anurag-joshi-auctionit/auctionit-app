import { Skeleton, STATS_CARD_CLASS, STATS_STRIP_CLASS } from "@auctionit/ui";

export function AccountSummarySuspense() {
  return (
    <div className="space-y-4">
      <div className={STATS_STRIP_CLASS}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className={`h-28 rounded-xl ${STATS_CARD_CLASS}`} />
        ))}
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-md" />
      </div>
    </div>
  );
}
