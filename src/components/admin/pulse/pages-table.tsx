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

interface PageRow {
  path: string;
  views: number;
  visitors: number;
  avgDuration: number;
}

interface PagesTableProps {
  pages: PageRow[];
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function PagesTable({ pages }: PagesTableProps) {
  const colors = useChartColors();
  const top10 = pages.slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted">
              <th className="text-left py-3 pr-4 font-medium">#</th>
              <th className="text-left py-3 pr-4 font-medium">Page</th>
              <th className="text-right py-3 pr-4 font-medium">Views</th>
              <th className="text-right py-3 pr-4 font-medium">Visitors</th>
              <th className="text-right py-3 font-medium">Avg Duration</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page, i) => (
              <tr key={page.path} className="border-b border-border/50 hover:bg-bg-surface transition-colors">
                <td className="py-2.5 pr-4 text-text-muted">{i + 1}</td>
                <td className="py-2.5 pr-4 font-mono text-xs truncate max-w-[300px]">{page.path}</td>
                <td className="py-2.5 pr-4 text-right font-medium">{page.views.toLocaleString()}</td>
                <td className="py-2.5 pr-4 text-right">{page.visitors.toLocaleString()}</td>
                <td className="py-2.5 text-right text-text-muted">{formatDuration(page.avgDuration)}</td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-muted">
                  No page view data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Top 10 horizontal bar chart */}
      {top10.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-4">Top 10 Pages</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis type="number" stroke={colors.textMuted} fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="path"
                  stroke={colors.textMuted}
                  fontSize={11}
                  width={150}
                  tickFormatter={(v) => (v.length > 25 ? v.slice(0, 25) + "..." : v)}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="views" name="Views" fill={colors.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
