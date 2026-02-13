"use client";

import {
  PieChart,
  Pie,
  Cell,
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

interface CategoryRow {
  category: string;
  views: number;
  visitors: number;
  avgDuration: number;
}

interface CategoryChartsProps {
  categories: CategoryRow[];
}

const CATEGORY_LABELS: Record<string, string> = {
  "cli-plugins": "CLI Plugins",
  "lwc-library": "LWC Library",
  "apex-utilities": "Apex Utilities",
  agentforce: "Agentforce",
  flow: "Flow",
  "experience-cloud": "Experience Cloud",
};

export function CategoryCharts({ categories }: CategoryChartsProps) {
  const colors = useChartColors();

  const PIE_COLORS = [
    colors.primary,
    colors.accent,
    colors.accentPink,
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
  ];

  const labeled = categories.map((c) => ({
    ...c,
    label: CATEGORY_LABELS[c.category] || c.category,
  }));

  if (labeled.length === 0) {
    return (
      <p className="text-center text-text-muted py-12">
        No category data yet. Category tracking requires resource page visits.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Pie chart — views distribution */}
      <div>
        <h3 className="text-sm font-medium text-text-muted mb-4">Views by Category</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={labeled}
                dataKey="views"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(props) =>
                  `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
                fontSize={12}
              >
                {labeled.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar chart — avg duration by category */}
      <div>
        <h3 className="text-sm font-medium text-text-muted mb-4">Avg Duration by Category (sec)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={labeled}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                dataKey="label"
                stroke={colors.textMuted}
                fontSize={11}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke={colors.textMuted} fontSize={12} />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="avgDuration"
                name="Avg Duration (s)"
                fill={colors.accent}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
