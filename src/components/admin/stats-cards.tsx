import { Card } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <Card hover={false} className="flex-row items-center gap-4 p-5">
      <div className="w-10 h-10 bg-bg-surface border border-border rounded-lg flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        <p className="text-sm text-text-muted">{label}</p>
      </div>
    </Card>
  );
}
