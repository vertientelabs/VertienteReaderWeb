'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface LineData {
  name: string;
  [key: string]: string | number;
}

interface LineConfig {
  dataKey: string;
  color: string;
  label?: string;
  dashed?: boolean;
}

interface GlassLineChartProps {
  data: LineData[];
  lines: LineConfig[];
  height?: number;
  title?: string;
  yAxisLabel?: string;
  showGrid?: boolean;
  showLegend?: boolean;
}

const glassTooltipStyle = {
  backgroundColor: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  fontSize: '12px',
};

export default function GlassLineChart({
  data,
  lines,
  height = 280,
  title,
  showGrid = true,
  showLegend = false,
}: GlassLineChartProps) {
  return (
    <div>
      {title && (
        <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">{title}</h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
          )}
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            axisLine={{ stroke: 'rgba(128,128,128,0.15)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={glassTooltipStyle} />
          {showLegend && (
            <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-tertiary)' }} />
          )}
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.label || line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              strokeDasharray={line.dashed ? '5 5' : undefined}
              dot={{ r: 3, fill: line.color }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
