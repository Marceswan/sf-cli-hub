"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useChartColors } from "@/lib/analytics/chart-theme";
import { ChartTooltip } from "@/components/admin/pulse/chart-tooltip";

interface EngagementRow {
  date: string;
  impressions: number;
  detailViews: number;
  outboundClicks: number;
}

interface EngagementChartProps {
  data: EngagementRow[];
}

export function EngagementChart({ data }: EngagementChartProps) {
  const colors = useChartColors();

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-text-muted text-sm">
        No engagement data yet
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="engImpressionsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="engViewsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.accent} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.accent} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="engClicksGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.accentPink} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.accentPink} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
          <XAxis
            dataKey="date"
            stroke={colors.textMuted}
            fontSize={12}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis stroke={colors.textMuted} fontSize={12} />
          <Tooltip content={<ChartTooltip />} />
          <Legend />
          <Area type="monotone" dataKey="impressions" name="Impressions" stroke={colors.primary} fill="url(#engImpressionsGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="detailViews" name="Detail Views" stroke={colors.accent} fill="url(#engViewsGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="outboundClicks" name="Outbound Clicks" stroke={colors.accentPink} fill="url(#engClicksGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
