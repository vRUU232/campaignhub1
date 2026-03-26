import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  subtitle,
  className = '',
}) {
  const isPositive = trend === 'up';
  const IconComponent = icon;

  return (
    <div className={`rounded-[1.35rem] border border-[#ded5c9] bg-[rgba(255,255,255,0.84)] p-5 shadow-[0_1px_0_rgba(31,23,47,0.04)] ${className}`}>
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-[0.9rem] bg-[#f6efe6] p-2.5">
            <IconComponent className="h-5 w-5 text-[#1f172f]" />
          </div>
          <h3 className="text-sm font-medium text-[#6f677b]">{title}</h3>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-[#6d9a8a]' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="font-['Outfit'] text-[2rem] font-semibold tracking-[-0.04em] text-[#1f172f]">{value}</p>
        {subtitle && (
          <p className="mt-1 text-sm text-[#6f677b]">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function MiniStatsCard({ title, value, icon, color = 'accent' }) {
  const colors = {
    accent: 'bg-[#f3a76a]/10 text-[#f3a76a]',
    seafoam: 'bg-[#7aa998]/10 text-[#7aa998]',
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
  };
  const IconComponent = icon;

  return (
    <div className="flex items-center gap-3 rounded-[1rem] border border-[#ded5c9] bg-[rgba(255,255,255,0.84)] p-4">
      <div className={`p-2 rounded-lg ${colors[color]}`}>
        <IconComponent className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-[#6f677b]">{title}</p>
        <p className="font-semibold text-[#1f172f]">{value}</p>
      </div>
    </div>
  );
}
