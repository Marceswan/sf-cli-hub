"use client";

import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useChartColors } from "@/lib/analytics/chart-theme";
import { ChartTooltip } from "./chart-tooltip";

interface DailyRow {
  date: string;
  authenticated: number;
  anonymous: number;
}

interface Totals {
  authenticated: number;
  anonymous: number;
}

interface AudienceChartsProps {
  daily: DailyRow[];
  totals: Totals;
}

export function AudienceCharts({ daily, totals }: AudienceChartsProps) {
  const colors = useChartColors();

  const pieData = [
    { name: "Authenticated", value: totals.authenticated },
    { name: "Anonymous", value: totals.anonymous },
  ];

  const PIE_COLORS = [colors.primary, colors.textMuted];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Stacked area chart */}
      <div>
        <h3 className="text-sm font-medium text-text-muted mb-4">Auth vs Anonymous Over Time</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily}>
              <defs>
                <linearGradient id="authGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="anonGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.textMuted} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.textMuted} stopOpacity={0} />
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
                dataKey="authenticated"
                name="Authenticated"
                stackId="1"
                stroke={colors.primary}
                fill="url(#authGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="anonymous"
                name="Anonymous"
                stackId="1"
                stroke={colors.textMuted}
                fill="url(#anonGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie chart */}
      <div>
        <h3 className="text-sm font-medium text-text-muted mb-4">Audience Breakdown</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                label={(props) =>
                  `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
                fontSize={12}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
