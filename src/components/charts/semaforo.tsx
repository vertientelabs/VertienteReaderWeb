'use client';

interface SemaforoProps {
  value: number;
  thresholds?: { verde: number; amarillo: number }; // below verde = green, below amarillo = yellow, else red
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean; // true = higher is better
}

export default function Semaforo({
  value,
  thresholds = { verde: 40, amarillo: 60 },
  label,
  size = 'md',
  inverted = false,
}: SemaforoProps) {
  let color: 'green' | 'yellow' | 'red';
  if (inverted) {
    color = value >= thresholds.amarillo ? 'green' : value >= thresholds.verde ? 'yellow' : 'red';
  } else {
    color = value <= thresholds.verde ? 'green' : value <= thresholds.amarillo ? 'yellow' : 'red';
  }

  const colorMap = {
    green: 'bg-[#30D158] shadow-[0_0_8px_rgba(48,209,88,0.5)]',
    yellow: 'bg-[#FF9F0A] shadow-[0_0_8px_rgba(255,159,10,0.5)]',
    red: 'bg-[#FF453A] shadow-[0_0_8px_rgba(255,69,58,0.5)]',
  };

  const textColorMap = {
    green: 'text-[#30D158]',
    yellow: 'text-[#FF9F0A]',
    red: 'text-[#FF453A]',
  };

  const sizeMap = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <div className={`${sizeMap[size]} rounded-full ${colorMap[color]}`} />
      {label && (
        <span className={`text-sm font-medium ${textColorMap[color]}`}>{label}</span>
      )}
    </div>
  );
}
