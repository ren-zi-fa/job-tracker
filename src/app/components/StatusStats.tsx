"use client";

import { useMemo } from "react";
import { Pie, PieChart } from "recharts";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { statusChartColor, statusChartFallbackColors } from "@/lib/status";
import { fetcher, statsKey } from "@/lib/swr";

interface StatusCount {
  status: string;
  count: number;
}

interface StatsResponse {
  byStatus: StatusCount[];
  total: number;
}

function slugify(status: string) {
  return status.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function StatusStats() {
  const { data, isLoading, error } = useSWR<StatsResponse>(statsKey, fetcher);

  const { chartData, chartConfig, total } = useMemo(() => {
    const rows = data?.byStatus ?? [];
    const config: ChartConfig = {};
    const chartData = rows.map((row, i) => {
      const key = slugify(row.status);
      config[key] = {
        label: row.status,
        color:
          statusChartColor[row.status] ??
          statusChartFallbackColors[i % statusChartFallbackColors.length],
      };
      return {
        status: row.status,
        count: row.count,
        fill: `var(--color-${key})`,
      };
    });
    return { chartData, chartConfig: config, total: data?.total ?? 0 };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistik Lamaran</CardTitle>
        <CardDescription>
          Sebaran seluruh lamaran berdasarkan status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="mx-auto size-48 rounded-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : error ? (
          <p className="border-2 border-destructive bg-destructive/10 py-6 text-center text-sm font-bold text-destructive">
            Gagal memuat statistik lamaran.
          </p>
        ) : total === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada lamaran untuk ditampilkan.
          </p>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[280px]"
            >
              <PieChart accessibilityLayer>
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel nameKey="status" />}
                />
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  strokeWidth={2}
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="status" />}
                />
              </PieChart>
            </ChartContainer>
            <p className="mt-3 border-t-2 border-border pt-3 text-center font-mono text-xs tracking-wide text-muted-foreground uppercase">
              Total {total} lamaran
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
