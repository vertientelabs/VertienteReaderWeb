'use client';

interface HeatmapRow {
  label: string;
  value: number;
  extra?: string;
}

interface HeatmapTableProps {
  title?: string;
  rows: HeatmapRow[];
  valueLabel?: string;
  maxValue?: number;
  colorScheme?: 'red' | 'green' | 'blue';
  inverted?: boolean; // true = lower value = more intense color
}

export default function HeatmapTable({
  title,
  rows,
  valueLabel = 'Valor',
  maxValue,
  colorScheme = 'red',
  inverted = false,
}: HeatmapTableProps) {
  const max = maxValue ?? Math.max(...rows.map((r) => r.value), 1);

  const getColor = (value: number) => {
    const intensity = Math.min(value / max, 1);
    const t = inverted ? 1 - intensity : intensity;
    const schemes = {
      red: `rgba(255, 69, 58, ${0.08 + t * 0.35})`,
      green: `rgba(48, 209, 88, ${0.08 + t * 0.35})`,
      blue: `rgba(10, 132, 255, ${0.08 + t * 0.35})`,
    };
    return schemes[colorScheme];
  };

  const getTextColor = (value: number) => {
    const intensity = Math.min(value / max, 1);
    const t = inverted ? 1 - intensity : intensity;
    if (t > 0.6) {
      const schemes = { red: '#FF453A', green: '#30D158', blue: '#0A84FF' };
      return schemes[colorScheme];
    }
    return 'var(--text-primary)';
  };

  return (
    <div>
      {title && (
        <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">{title}</h4>
      )}
      <div className="space-y-1.5">
        <div className="flex items-center text-xs text-[var(--text-tertiary)] px-3 pb-1">
          <span className="flex-1">Nombre</span>
          <span className="w-20 text-right">{valueLabel}</span>
          {rows[0]?.extra !== undefined && <span className="w-24 text-right">Detalle</span>}
        </div>
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-center px-3 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: getColor(row.value) }}
          >
            <span className="flex-1 text-sm font-medium text-[var(--text-primary)] truncate">
              {row.label}
            </span>
            <span
              className="w-20 text-right text-sm font-bold"
              style={{ color: getTextColor(row.value) }}
            >
              {row.value.toFixed(1)}%
            </span>
            {row.extra !== undefined && (
              <span className="w-24 text-right text-xs text-[var(--text-tertiary)]">
                {row.extra}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
