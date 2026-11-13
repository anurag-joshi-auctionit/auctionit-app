import { useMemo } from "react";
import { useAuth } from "@auctionit/lib";
import { BidderDashboardMessages } from "@auctionit/messages/bidder-dashboard";
import {
  Card,
  CardContent,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  HelpText,
  IllustratedEmpty,
  type ChartConfig,
} from "@auctionit/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { bidderDashboardKeys } from "@/components/bidder-dashboard/query-keys";
import type { BidderLiftingDetails } from "@/components/bidder-dashboard/types";

const qtyChartConfig = {
  approvedQty: { label: "Approved Quantity", color: "var(--chart-1)" },
  liftedQty: { label: "Lifted Quantity", color: "var(--chart-2)" },
} satisfies ChartConfig;

const amountChartConfig = {
  approvedAmount: {
    label: "Approved Value (₹ Cr)",
    color: "var(--chart-1)",
  },
  liftedAmount: { label: "Lifted Value (₹ Cr)", color: "var(--chart-2)" },
} satisfies ChartConfig;

function toCrore(value: number): number {
  return Math.round((Number(value) / 10_000_000 || 0) * 100) / 100;
}

function grainHint(grain: BidderLiftingDetails["series"]["grain"]): string | null {
  if (grain === "quarter") return "Grouped by quarter";
  if (grain === "year") return "Grouped by year";
  return null;
}

export function LiftingChartsPanel({
  from,
  to,
  clientId,
  plantLocationId,
  itemId,
}: {
  from: string;
  to: string;
  clientId: number | null;
  plantLocationId: number | null;
  itemId: number | null;
}) {
  const { api } = useAuth();
  const { data } = useSuspenseQuery({
    queryKey: bidderDashboardKeys.lifting(
      from,
      to,
      clientId,
      plantLocationId,
      itemId,
    ),
    queryFn: () => {
      const qs = new URLSearchParams({ from, to });
      if (clientId != null) qs.set("clientId", String(clientId));
      if (plantLocationId != null) {
        qs.set("plantLocationId", String(plantLocationId));
      }
      if (itemId != null) qs.set("itemId", String(itemId));
      return api.get<BidderLiftingDetails>(
        `/bidder/dashboard/lifting?${qs.toString()}`,
      );
    },
  });

  const series = useMemo(
    () =>
      data.series.points.map((point) => ({
        ...point,
        approvedAmount: toCrore(point.approvedAmount),
        liftedAmount: toCrore(point.liftedAmount),
      })),
    [data.series.points],
  );
  const isEmpty = series.length === 0;
  const hint = grainHint(data.series.grain);
  const stackCharts = series.length > 12;
  const xInterval = series.length > 12 ? "preserveStartEnd" : 0;

  return (
    <div className="space-y-2">
      {hint ? (
        <p className="text-muted-foreground text-xs">{hint}</p>
      ) : null}
      <div className={stackCharts ? "grid gap-4" : "grid gap-4 lg:grid-cols-2"}>
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="mb-2 inline-flex items-center gap-1 text-sm font-medium">
              Approved Quantity and Lifted Quantity
              <HelpText message={BidderDashboardMessages.QTY_PMT_HELP} />
            </p>
            {isEmpty ? (
              <IllustratedEmpty
                title={BidderDashboardMessages.LIFTING_EMPTY_TITLE}
                description={BidderDashboardMessages.LIFTING_EMPTY_DESCRIPTION}
                className="aspect-video min-h-0"
              />
            ) : (
              <ChartContainer config={qtyChartConfig} className="aspect-video">
                <BarChart data={series} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="periodLabel"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={xInterval}
                  />
                  <YAxis tickLine={false} axisLine={false} width={48} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="approvedQty"
                    fill="var(--color-approvedQty)"
                    radius={2}
                  />
                  <Bar
                    dataKey="liftedQty"
                    fill="var(--color-liftedQty)"
                    radius={2}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="mb-2 text-sm font-medium">
              Approved Value and Lifted Value
            </p>
            {isEmpty ? (
              <IllustratedEmpty
                title={BidderDashboardMessages.LIFTING_EMPTY_TITLE}
                description={BidderDashboardMessages.LIFTING_EMPTY_DESCRIPTION}
                className="aspect-video min-h-0"
              />
            ) : (
              <ChartContainer
                config={amountChartConfig}
                className="aspect-video"
              >
                <BarChart data={series} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="periodLabel"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={xInterval}
                  />
                  <YAxis tickLine={false} axisLine={false} width={48} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="approvedAmount"
                    fill="var(--color-approvedAmount)"
                    radius={2}
                  />
                  <Bar
                    dataKey="liftedAmount"
                    fill="var(--color-liftedAmount)"
                    radius={2}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
