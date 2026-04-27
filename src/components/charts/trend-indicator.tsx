'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  value: number;
  label?: string;
  inverted?: boolean; // true = lower is better (e.g. ANF)
  size?: 'sm' | 'md';
}

export default function TrendIndicator({ value, label, inverted = false, size = 'sm' }: TrendIndicatorProps) {
  const isGood = inverted ? value < 0 : value > 0;
  const isNeutral = value === 0;

  const Icon = isNeutral ? Minus : value > 0 ? TrendingUp : TrendingDown;
  const colorClass = isNeutral
    ? 'text-[var(--text-tertiary)] bg-black/5 dark:bg-white/5'
    : isGood
    ? 'text-[#30D158] bg-[#30D158]/10'
    : 'text-[#FF453A] bg-[#FF453A]/10';

  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <span className={`inline-flex items-center gap-0.5 font-medium rounded-full ${colorClass} ${sizeClass}`}>
      <Icon className={iconSize} />
      {Math.abs(value).toFixed(1)}%
      {label && <span className="ml-0.5">{label}</span>}
    </span>
  );
}
