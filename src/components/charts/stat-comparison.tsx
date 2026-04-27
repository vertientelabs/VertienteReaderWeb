'use client';

import TrendIndicator from './trend-indicator';

interface StatComparisonProps {
  label: string;
  current: number;
  previous: number;
  format?: (v: number) => string;
  inverted?: boolean;
}

export default function StatComparison({
  label,
  current,
  previous,
  format = (v) => v.toLocaleString(),
  inverted = false,
}: StatComparisonProps) {
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-xs text-[var(--text-tertiary)]">Anterior: {format(previous)}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-[var(--text-primary)]">{format(current)}</p>
        <TrendIndicator value={change} inverted={inverted} />
      </div>
    </div>
  );
}
