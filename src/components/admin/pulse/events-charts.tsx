"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useChartColors } from "@/lib/analytics/chart-theme";
import { ChartTooltip } from "./chart-tooltip";

interface EventRow {
  eventName: string;
  count: number;
}

interface EventsChartsProps {
  data: EventRow[];
}

const EVENT_LABELS: Record<string, string> = {
  "listing.impression": "Impression",
  "listing.detail_view": "Detail View",
  "listing.outbound_click": "Outbound Click",
  "listing.tag_click": "Tag Click",
  "listing.share": "Share",
  "listing.bookmark": "Bookmark",
};

export function EventsCharts({ data }: EventsChartsProps) {
  const colors = useChartColors();

  const labeled = data.map((event) => ({
    ...event,
    label: EVENT_LABELS[event.eventName] || event.eventName,
  }));

  if (labeled.length === 0) {
    return (
      <p className="text-center text-text-muted py-12">
        No event data yet. Events are tracked when users interact with listings.
      </p>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-text-muted mb-4">Events Breakdown</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={labeled} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis type="number" stroke={colors.textMuted} fontSize={12} />
            <YAxis
              type="category"
              dataKey="label"
              stroke={colors.textMuted}
              fontSize={12}
              width={120}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="count"
              name="Count"
              fill={colors.primary}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
