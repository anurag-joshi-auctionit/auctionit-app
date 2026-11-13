import { useEffect } from "react";
import { useAuth } from "@auctionit/lib";
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
  SelectSearch,
  SelectSearchCommand,
  SelectSearchContent,
  SelectSearchEmpty,
  SelectSearchGroup,
  SelectSearchInput,
  SelectSearchItem,
  SelectSearchList,
  SelectSearchTrigger,
  SelectSearchValue,
  Skeleton,
  type ChartConfig,
  isSelectSearchClear,
} from "@auctionit/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ClientDashboardMessages } from "@auctionit/messages/client-dashboard";
import { MaterialDetailsError } from "@/components/dashboard/material-details-error";
import { dashboardKeys } from "@/components/dashboard/query-keys";
import { DashboardSectionBoundary } from "@/components/dashboard/section-boundary";
import { DashboardSectionHeader } from "@/components/dashboard/section-header";
import type {
  MaterialFilters,
  MaterialSeriesGrain,
  MaterialSeriesResponse,
} from "@/components/dashboard/types";

const qtyChartConfig = {
  offeredQty: { label: "Offered Quantity", color: "var(--chart-1)" },
  bidQty: { label: "Bid Quantity", color: "var(--chart-2)" },
  approvedQty: { label: "Approved Quantity", color: "var(--chart-3)" },
} satisfies ChartConfig;

const amountChartConfig = {
  offeredAmountLakh: { label: "Offered Amount", color: "var(--chart-1)" },
  bidAmountLakh: { label: "Bid Amount", color: "var(--chart-2)" },
  approvedAmountLakh: { label: "Approved Amount", color: "var(--chart-3)" },
} satisfies ChartConfig;

function grainHint(grain: MaterialSeriesGrain): string | null {
  if (grain === "quarter") return "Grouped by quarter";
  if (grain === "year") return "Grouped by year";
  return null;
}

function MaterialFiltersPanel({
  clientId,
  from,
  to,
  plantLocationId,
  itemId,
  onPlantChange,
  onItemChange,
}: {
  clientId: number;
  from: string;
  to: string;
  plantLocationId: number | null;
  itemId: number | null;
  onPlantChange: (value: string) => void;
  onItemChange: (value: string) => void;
}) {
  const { api } = useAuth();
  const { data: filters } = useSuspenseQuery({
    queryKey: dashboardKeys.materialFilters(clientId, from, to),
    queryFn: () =>
      api.get<MaterialFilters>(
        `/client/dashboard/material/filters?clientId=${clientId}&from=${from}&to=${to}`,
      ),
  });

  useEffect(() => {
    if (
      plantLocationId != null &&
      !filters.plants.some((p) => p.id === plantLocationId)
    ) {
      onPlantChange("");
    }
    if (itemId != null && !filters.items.some((i) => i.id === itemId)) {
      onItemChange("");
    }
  }, [
    filters.plants,
    filters.items,
    plantLocationId,
    itemId,
    onPlantChange,
    onItemChange,
  ]);

  const selectedPlant = filters.plants.find((p) => p.id === plantLocationId);
  const selectedItem = filters.items.find((i) => i.id === itemId);

  return (
    <>
      <SelectSearch
        value={plantLocationId != null ? String(plantLocationId) : ""}
        onValueChange={(v) => {
          onPlantChange(isSelectSearchClear(v) ? "" : v);
        }}
        placeholder="Plant location"
        clearable
      >
        <SelectSearchTrigger
          id="dashboard-plant"
          className="w-[min(100vw-2rem,200px)]"
          aria-label="Plant location"
        >
          <SelectSearchValue placeholder="Plant location">
            {selectedPlant?.name}
          </SelectSearchValue>
        </SelectSearchTrigger>
        <SelectSearchContent>
          <SelectSearchCommand>
            <SelectSearchInput placeholder="Search plant…" />
            <SelectSearchList>
              <SelectSearchEmpty emptyText="No plants found." />
              <SelectSearchGroup>
                {filters.plants.map((p) => (
                  <SelectSearchItem
                    key={p.id}
                    value={String(p.id)}
                    keywords={[p.name]}
                  >
                    {p.name || `Plant #${p.id}`}
                  </SelectSearchItem>
                ))}
              </SelectSearchGroup>
            </SelectSearchList>
          </SelectSearchCommand>
        </SelectSearchContent>
      </SelectSearch>

      <SelectSearch
        value={itemId != null ? String(itemId) : ""}
        onValueChange={(v) => {
          onItemChange(isSelectSearchClear(v) ? "" : v);
        }}
        placeholder="Material"
        clearable
      >
        <SelectSearchTrigger
          id="dashboard-material"
          className="w-[min(100vw-2rem,200px)]"
          aria-label="Material"
        >
          <SelectSearchValue placeholder="Material">
            {selectedItem?.name}
          </SelectSearchValue>
        </SelectSearchTrigger>
        <SelectSearchContent>
          <SelectSearchCommand>
            <SelectSearchInput placeholder="Search material…" />
            <SelectSearchList>
              <SelectSearchEmpty emptyText="No materials found." />
              <SelectSearchGroup>
                {filters.items.map((i) => (
                  <SelectSearchItem
                    key={i.id}
                    value={String(i.id)}
                    keywords={[i.name]}
                  >
                    {i.name || `Item #${i.id}`}
                  </SelectSearchItem>
                ))}
              </SelectSearchGroup>
            </SelectSearchList>
          </SelectSearchCommand>
        </SelectSearchContent>
      </SelectSearch>
    </>
  );
}

function MaterialChartsPanel({
  clientId,
  from,
  to,
  plantLocationId,
  itemId,
}: {
  clientId: number;
  from: string;
  to: string;
  plantLocationId: number | null;
  itemId: number | null;
}) {
  const { api } = useAuth();
  const { data } = useSuspenseQuery({
    queryKey: dashboardKeys.material(
      clientId,
      from,
      to,
      plantLocationId,
      itemId,
    ),
    queryFn: () => {
      const qs = new URLSearchParams({
        clientId: String(clientId),
        from,
        to,
      });
      if (plantLocationId != null) {
        qs.set("plantLocationId", String(plantLocationId));
      }
      if (itemId != null) qs.set("itemId", String(itemId));
      return api.get<MaterialSeriesResponse>(
        `/client/dashboard/material?${qs.toString()}`,
      );
    },
  });

  const series = data.points;
  const isEmpty = series.length === 0;
  const hint = grainHint(data.grain);
  // Side-by-side is fine for ≤ ~12 buckets; stack when denser (e.g. 18 months).
  const stackCharts = series.length > 12;
  const xInterval = series.length > 12 ? "preserveStartEnd" : 0;

  return (
    <div className="space-y-2">
      {hint ? (
        <p className="text-muted-foreground text-xs">{hint}</p>
      ) : null}
      <div
        className={
          stackCharts ? "grid gap-4" : "grid gap-4 lg:grid-cols-2"
        }
      >
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="mb-2 inline-flex items-center gap-1 text-sm font-medium">
              Lot Qty.
              <HelpText message={ClientDashboardMessages.QTY_PMT_HELP} />
            </p>
            {isEmpty ? (
              <IllustratedEmpty
                title={ClientDashboardMessages.MATERIAL_EMPTY_TITLE}
                description={
                  ClientDashboardMessages.MATERIAL_EMPTY_DESCRIPTION
                }
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
                    dataKey="offeredQty"
                    fill="var(--color-offeredQty)"
                    radius={2}
                  />
                  <Bar dataKey="bidQty" fill="var(--color-bidQty)" radius={2} />
                  <Bar
                    dataKey="approvedQty"
                    fill="var(--color-approvedQty)"
                    radius={2}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="mb-2 text-sm font-medium">Amount (in Lakh)</p>
            {isEmpty ? (
              <IllustratedEmpty
                title={ClientDashboardMessages.MATERIAL_EMPTY_TITLE}
                description={
                  ClientDashboardMessages.MATERIAL_EMPTY_DESCRIPTION
                }
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
                    dataKey="offeredAmountLakh"
                    fill="var(--color-offeredAmountLakh)"
                    radius={2}
                  />
                  <Bar
                    dataKey="bidAmountLakh"
                    fill="var(--color-bidAmountLakh)"
                    radius={2}
                  />
                  <Bar
                    dataKey="approvedAmountLakh"
                    fill="var(--color-approvedAmountLakh)"
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

function MaterialFiltersSuspense() {
  return (
    <>
      <Skeleton className="h-9 w-[200px]" />
      <Skeleton className="h-9 w-[200px]" />
    </>
  );
}

function MaterialChartsSuspense() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Skeleton className="aspect-video w-full rounded-md" />
      <Skeleton className="aspect-video w-full rounded-md" />
    </div>
  );
}

export function MaterialDetailsSection({
  clientId,
  from,
  to,
  plantLocationId,
  itemId,
  onPlantChange,
  onItemChange,
}: {
  clientId: number;
  from: string;
  to: string;
  plantLocationId: number | null;
  itemId: number | null;
  onPlantChange: (value: string) => void;
  onItemChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <DashboardSectionHeader
        id="material-details"
        title="Material Details"
        actions={
          <DashboardSectionBoundary
            fallback={<MaterialFiltersSuspense />}
            FallbackComponent={MaterialDetailsError}
          >
            <MaterialFiltersPanel
              clientId={clientId}
              from={from}
              to={to}
              plantLocationId={plantLocationId}
              itemId={itemId}
              onPlantChange={onPlantChange}
              onItemChange={onItemChange}
            />
          </DashboardSectionBoundary>
        }
      />

      <DashboardSectionBoundary
        fallback={<MaterialChartsSuspense />}
        FallbackComponent={MaterialDetailsError}
      >
        <MaterialChartsPanel
          clientId={clientId}
          from={from}
          to={to}
          plantLocationId={plantLocationId}
          itemId={itemId}
        />
      </DashboardSectionBoundary>
    </div>
  );
}
