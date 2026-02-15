"use client";

interface TagRow {
  tag: string;
  tagClicks: number;
}

interface TagPerformanceTableProps {
  data: TagRow[];
}

export function TagPerformanceTable({ data }: TagPerformanceTableProps) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-text-muted text-sm">
        No tag performance data yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-text-muted">Tag</th>
            <th className="text-right py-3 px-4 font-medium text-text-muted">Clicks</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.tag} className="border-b border-border/50 hover:bg-bg-surface transition-colors">
              <td className="py-3 px-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {row.tag}
                </span>
              </td>
              <td className="py-3 px-4 text-right text-text-main font-medium">{row.tagClicks.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
