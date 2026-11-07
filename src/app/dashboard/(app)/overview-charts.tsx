"use client";

import { AllCommunityModule, type AgChartOptions, ModuleRegistry } from "ag-charts-community";
import { AgCharts } from "ag-charts-react";
import { Card } from "@/components/ui/primitives";

ModuleRegistry.registerModules([AllCommunityModule]);

export type WeekTakings = { week: string; paypal: number; salon: number };
export type StyleCount = { style: string; bookings: number };

const ink2 = "#68615a";
const line = "#e4e0dd";

const base = {
  background: { fill: "transparent" },
  padding: { top: 8, right: 8, bottom: 8, left: 8 },
  theme: {
    params: { fontFamily: "inherit", fontSize: 13, foregroundColor: "#251f19", textColor: ink2 },
  },
} satisfies Partial<AgChartOptions>;

const dollars = ({ value }: { value: unknown }) => `$${Number(value).toFixed(0)}`;

export function OverviewCharts({ weeks, styles }: { weeks: WeekTakings[]; styles: StyleCount[] }) {
  const takings: AgChartOptions = {
    ...base,
    data: weeks,
    series: [
      {
        type: "bar",
        xKey: "week",
        yKey: "paypal",
        yName: "Paid through PayPal",
        stacked: true,
        fill: "#f48d16",
        cornerRadius: 3,
        tooltip: { renderer: ({ datum }) => ({ data: [{ label: "PayPal", value: `$${datum.paypal.toFixed(2)}` }] }) },
      },
      {
        type: "bar",
        xKey: "week",
        yKey: "salon",
        yName: "Balance at the salon",
        stacked: true,
        fill: "#f6c58b",
        cornerRadius: 3,
        tooltip: { renderer: ({ datum }) => ({ data: [{ label: "At the salon", value: `$${datum.salon.toFixed(2)}` }] }) },
      },
    ],
    axes: {
      x: { type: "category", position: "bottom", line: { stroke: line } },
      y: { type: "number", position: "left", label: { formatter: dollars }, gridLine: { style: [{ stroke: line }] } },
    },
    legend: { position: "bottom" },
  };

  const byStyle: AgChartOptions = {
    ...base,
    data: styles,
    series: [
      {
        type: "bar",
        direction: "horizontal",
        xKey: "style",
        yKey: "bookings",
        yName: "Bookings",
        fill: "#f48d16",
        cornerRadius: 3,
      },
    ],
    axes: {
      x: { type: "category", position: "left", line: { stroke: line } },
      y: { type: "number", position: "bottom", interval: { step: 1 }, gridLine: { style: [{ stroke: line }] } },
    },
    legend: { enabled: false },
  };

  return (
    <div className="grid gap-3 lg:grid-cols-5">
      <Card className="min-w-0 lg:col-span-3">
        <h2 className="text-base">Takings by appointment week</h2>
        <p className="text-sm text-ink-2">Deposits and full payments taken through PayPal, and what is due in the chair.</p>
        <AgCharts options={takings} style={{ height: 300, width: "100%" }} />
      </Card>
      <Card className="min-w-0 lg:col-span-2">
        <h2 className="text-base">Most booked styles</h2>
        <p className="text-sm text-ink-2">Paid bookings per style.</p>
        <AgCharts options={byStyle} style={{ height: 300, width: "100%" }} />
      </Card>
    </div>
  );
}
