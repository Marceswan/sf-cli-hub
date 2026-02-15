"use client";

interface SearchRow {
  query: string;
  count: number;
}

interface SearchTableProps {
  data: SearchRow[];
}

export function SearchTable({ data }: SearchTableProps) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-text-muted text-sm">
        No search query data yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-text-muted">Search Query</th>
            <th className="text-right py-3 px-4 font-medium text-text-muted">Count</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.query} className="border-b border-border/50 hover:bg-bg-surface transition-colors">
              <td className="py-3 px-4 text-text-main">{row.query}</td>
              <td className="py-3 px-4 text-right text-text-main font-medium">{row.count.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
