import { Card } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <Card hover={false} className="flex-row items-center gap-3 sm:gap-4 p-3 sm:p-5">
      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-bg-surface border border-border rounded-lg flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl sm:text-2xl font-bold">{value.toLocaleString()}</p>
        <p className="text-xs sm:text-sm text-text-muted truncate">{label}</p>
      </div>
    </Card>
  );
}
