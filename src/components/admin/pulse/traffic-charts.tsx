"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useChartColors } from "@/lib/analytics/chart-theme";
import { ChartTooltip } from "./chart-tooltip";

interface TrafficRow {
  date?: string;
  hour?: number;
  views: number;
  visitors: number;
}

interface TrafficChartsProps {
  daily: TrafficRow[];
  hourly: TrafficRow[];
}

export function TrafficCharts({ daily, hourly }: TrafficChartsProps) {
  const colors = useChartColors();

  return (
    <div className="space-y-8">
      {/* Daily traffic area chart */}
      <div>
        <h3 className="text-sm font-medium text-text-muted mb-4">Daily Traffic</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.accent} stopOpacity={0} />
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
              <Area
                type="monotone"
                dataKey="views"
                name="Views"
                stroke={colors.primary}
                fill="url(#viewsGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="visitors"
                name="Unique Visitors"
                stroke={colors.accent}
                fill="url(#visitorsGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly traffic bar chart */}
      <div>
        <h3 className="text-sm font-medium text-text-muted mb-4">Traffic by Hour</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourly}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                dataKey="hour"
                stroke={colors.textMuted}
                fontSize={12}
                tickFormatter={(v) => `${v}:00`}
              />
              <YAxis stroke={colors.textMuted} fontSize={12} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="views" name="Views" fill={colors.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="visitors" name="Visitors" fill={colors.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
