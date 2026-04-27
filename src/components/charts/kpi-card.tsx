'use client';

import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: string;
  className?: string;
}

export default function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'from-[#0A84FF] to-[#64D2FF]',
  className = '',
}: KpiCardProps) {
  const isPositive = trend !== undefined && trend >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <GlassCard className={`relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide truncate">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1.5">
            {value}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {subtitle && (
              <span className="text-xs text-[var(--text-tertiary)]">{subtitle}</span>
            )}
            {trend !== undefined && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                  isPositive
                    ? 'text-[#30D158] bg-[#30D158]/10'
                    : 'text-[#FF453A] bg-[#FF453A]/10'
                }`}
              >
                <TrendIcon className="h-3 w-3" />
                {Math.abs(trend).toFixed(1)}%
                {trendLabel && <span className="ml-0.5">{trendLabel}</span>}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
    </GlassCard>
  );
}
