'use client';

interface GaugeChartProps {
  value: number; // 0-100
  label?: string;
  sublabel?: string;
  size?: number;
  color?: string;
  trackColor?: string;
}

export default function GaugeChart({
  value,
  label,
  sublabel,
  size = 140,
  color = '#0A84FF',
  trackColor,
}: GaugeChartProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const progress = circumference * (1 - clampedValue / 100);

  // Dynamic color based on value
  const autoColor =
    clampedValue > 80 ? '#30D158' :
    clampedValue > 50 ? '#0A84FF' :
    clampedValue > 30 ? '#FF9F0A' : '#FF453A';

  const strokeColor = color === 'auto' ? autoColor : color;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r={r}
            fill="none"
            className={trackColor ? '' : 'stroke-black/10 dark:stroke-white/10'}
            stroke={trackColor}
            strokeWidth="10"
          />
          <circle
            cx="60" cy="60" r={r}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {clampedValue.toFixed(1)}%
          </span>
          {sublabel && (
            <span className="text-xs text-[var(--text-tertiary)]">{sublabel}</span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium text-[var(--text-secondary)] mt-2">{label}</span>
      )}
    </div>
  );
}
