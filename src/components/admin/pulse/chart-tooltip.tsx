"use client";

interface Payload {
  name?: string;
  value?: number;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Payload[];
  label?: string | number;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-text-main mb-1">{String(label)}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-text-muted">
          <span
            className="inline-block w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: <span className="font-medium text-text-main">{entry.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}
