import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Minus } from "@untitledui/icons";
import { Card, CardContent, HelpText, cn, formatCurrencyIndian } from "@auctionit/ui";
import type { MetricWithDelta } from "@/components/dashboard/types";

export type DashboardStatTone =
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "grey"
  | "lime"
  | "emerald"
  | "rose"
  | "purple";

const TONE_CLASS: Record<DashboardStatTone, string> = {
  blue: "border-2 border-transparent bg-blue-background text-blue-foreground",
  green: "border-2 border-transparent bg-green-background text-green-foreground",
  red: "border-2 border-transparent bg-red-background text-red-foreground",
  yellow:
    "border-2 border-transparent bg-yellow-background text-yellow-foreground",
  grey: "border-2 border-transparent bg-grey-background text-grey-foreground",
  lime: "border-2 border-transparent bg-lime-background text-lime-foreground",
  emerald:
    "border-2 border-transparent bg-emerald-background text-emerald-foreground",
  rose: "border-2 border-transparent bg-rose-background text-rose-foreground",
  purple:
    "border-2 border-transparent bg-purple-background text-purple-foreground",
};

function formatMetricValue(
  value: number,
  format: "int" | "qty" | "cr" | "lakh" = "int",
): string {
  if (format === "int") {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (format === "cr") {
    return formatCurrencyIndian(value) || "—";
  }
  if (format === "lakh") {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
  const qty = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${qty} MT`;
}

function formatDeltaPercent(percentChange: number): {
  label: string;
  Icon: typeof ArrowUp;
} {
  const pct = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    signDisplay: "never",
  }).format(Math.abs(percentChange));
  if (percentChange > 0) {
    return { label: `${pct}%`, Icon: ArrowUp };
  }
  if (percentChange < 0) {
    return { label: `${pct}%`, Icon: ArrowDown };
  }
  return { label: `${pct}%`, Icon: Minus };
}

function StatLabel({
  label,
  helpMessage,
}: {
  label: string;
  helpMessage?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-xs tracking-wide">
      {label}
      {helpMessage ? <HelpText message={helpMessage} /> : null}
    </span>
  );
}

export function DashboardStatCard({
  label,
  metric,
  format = "int",
  tone = "grey",
  helpMessage,
  className,
  footer,
}: {
  label: string;
  metric: MetricWithDelta;
  format?: "int" | "qty" | "cr" | "lakh";
  tone?: DashboardStatTone;
  helpMessage?: string;
  className?: string;
  footer?: ReactNode;
}) {
  const { label: deltaLabel, Icon } = formatDeltaPercent(metric.percentChange);

  return (
    <Card className={cn(TONE_CLASS[tone], "py-0", className)}>
      <CardContent className="flex flex-col gap-1 p-5">
        <StatLabel label={label} helpMessage={helpMessage} />
        <span className="inline-flex items-baseline gap-2 text-2xl font-semibold tabular-nums">
          {formatMetricValue(metric.value, format)}
          <span className="inline-flex items-center gap-0.5 text-xs font-normal tabular-nums">
            <Icon className="size-3.5 shrink-0" />
            {deltaLabel}
          </span>
        </span>
        {footer}
      </CardContent>
    </Card>
  );
}

export function DashboardSimpleStatCard({
  label,
  value,
  format = "int",
  tone = "blue",
  helpMessage,
  className,
}: {
  label: string;
  value: number;
  format?: "int" | "qty" | "cr" | "lakh";
  tone?: DashboardStatTone;
  helpMessage?: string;
  className?: string;
}) {
  return (
    <Card className={cn(TONE_CLASS[tone], "py-0", className)}>
      <CardContent className="flex flex-col gap-1 p-5">
        <StatLabel label={label} helpMessage={helpMessage} />
        <span className="text-2xl font-semibold tabular-nums">
          {formatMetricValue(value, format)}
        </span>
      </CardContent>
    </Card>
  );
}

export { formatMetricValue };
