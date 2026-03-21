'use client';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
}

export function StatsCard({ title, value, subtitle, icon }: StatsCardProps) {
  return (
    <div className="card p-4 w-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">{title}</p>
          <p className="kpi">{value}</p>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
        {icon && (
          <div className="text-xl opacity-60">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
