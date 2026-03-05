"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, type PieLabelRenderProps } from "recharts";
import { useChartColors } from "@/lib/analytics/chart-theme";
import { ChartTooltip } from "@/components/admin/pulse/chart-tooltip";

interface OutboundRow {
  destination: string;
  count: number;
}

interface OutboundChartProps {
  data: OutboundRow[];
}

const COLORS_KEYS = ["primary", "accent", "accentPink", "textMuted"] as const;

export function OutboundChart({ data }: OutboundChartProps) {
  const colors = useChartColors();
  const palette = COLORS_KEYS.map((k) => colors[k]);

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-text-muted text-sm">
        No outbound click data yet
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="destination"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={(props: PieLabelRenderProps) => `${props.name ?? ""} (${((props.percent ?? 0) * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={palette[i % palette.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
