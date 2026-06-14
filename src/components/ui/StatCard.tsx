interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-emerald-500 to-emerald-600',
  orange: 'from-orange-500 to-orange-600',
  purple: 'from-violet-500 to-violet-600',
  red: 'from-rose-500 to-rose-600',
};

const iconBgClasses = {
  blue: 'bg-blue-500/20 text-blue-600',
  green: 'bg-emerald-500/20 text-emerald-600',
  orange: 'bg-orange-500/20 text-orange-600',
  purple: 'bg-violet-500/20 text-violet-600',
  red: 'bg-rose-500/20 text-rose-600',
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'blue',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-card p-5 hover:shadow-card-hover transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
        </div>
        {icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBgClasses[color]}`}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-slate-800 font-mono">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400">{subtitle}</p>
        )}
        {trend && trendValue && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={`text-xs font-medium ${
                trend === 'up'
                  ? 'text-emerald-500'
                  : trend === 'down'
                  ? 'text-rose-500'
                  : 'text-slate-500'
              }`}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
              {trendValue}
            </span>
            <span className="text-xs text-slate-400">较昨日</span>
          </div>
        )}
      </div>
    </div>
  );
}
