"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useChartColors } from "@/lib/analytics/chart-theme";
import { ChartTooltip } from "@/components/admin/pulse/chart-tooltip";

interface ReferralRow {
  source: string;
  count: number;
}

interface ReferralChartProps {
  data: ReferralRow[];
}

export function ReferralChart({ data }: ReferralChartProps) {
  const colors = useChartColors();

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-text-muted text-sm">
        No referral data yet
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
          <XAxis type="number" stroke={colors.textMuted} fontSize={12} />
          <YAxis dataKey="source" type="category" stroke={colors.textMuted} fontSize={12} width={120} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" name="Visits" fill={colors.primary} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
