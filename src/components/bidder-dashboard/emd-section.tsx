import {
  Button,
  Card,
  CardContent,
  formatCurrency,
  Skeleton,
  STATS_CARD_CLASS,
  STATS_STRIP_CLASS,
  cn,
} from "@auctionit/ui";
import { DashboardSectionHeader } from "@/components/dashboard/section-header";
import { useMyEmdSummarySuspenseQuery } from "@/lib/emd/queries";
import type { MyEmdSummary } from "@/lib/emd/types";

const CARDS: {
  key: keyof Pick<MyEmdSummary, "available" | "blocked" | "refundPending">;
  label: string;
  className: string;
}[] = [
  {
    key: "available",
    label: "Available",
    className: "bg-green-background text-green-foreground",
  },
  {
    key: "blocked",
    label: "Blocked",
    className: "bg-red-background text-red-foreground",
  },
  {
    key: "refundPending",
    label: "Refund In Process",
    className: "bg-yellow-background text-yellow-foreground",
  },
];

export function EmdSection() {
  const { data } = useMyEmdSummarySuspenseQuery();

  return (
    <div className="space-y-3">
      <DashboardSectionHeader
        id="emd"
        title="EMD Details"
        actions={
          <Button variant="outline" href="/emd">
            View Details
          </Button>
        }
      />
      <div className={STATS_STRIP_CLASS}>
        {CARDS.map((card) => (
          <Card
            key={card.key}
            className={cn(STATS_CARD_CLASS, card.className, "py-0")}
          >
            <CardContent className="flex flex-col gap-1 p-5">
              <span className="text-xs tracking-wide">{card.label}</span>
              <span className="text-2xl font-semibold tabular-nums">
                {formatCurrency(data[card.key])}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function EmdSuspense() {
  return (
    <div className="space-y-3">
      <DashboardSectionHeader
        id="emd"
        title="EMD Details"
        actions={<Skeleton className="h-9 w-32" />}
      />
      <div className={STATS_STRIP_CLASS}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
