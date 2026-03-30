'use client';

interface ProgressGaugeProps {
  value: number;
  label?: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
}

export default function ProgressGauge({
  value,
  label,
  sublabel,
  size = 160,
  strokeWidth = 12,
}: ProgressGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(value, 100) / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0A84FF" />
              <stop offset="100%" stopColor="#30D158" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[var(--text-primary)]">
            {value.toFixed(1)}%
          </span>
          {label && <span className="text-xs text-[var(--text-tertiary)]">{label}</span>}
        </div>
      </div>
      {sublabel && (
        <p className="text-xs text-[var(--text-tertiary)] mt-2">{sublabel}</p>
      )}
    </div>
  );
}
