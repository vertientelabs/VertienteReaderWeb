'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AreaData {
  name: string;
  [key: string]: string | number;
}

interface AreaConfig {
  dataKey: string;
  color: string;
  label?: string;
}

interface GlassAreaChartNewProps {
  data: AreaData[];
  areas: AreaConfig[];
  height?: number;
  title?: string;
  showLegend?: boolean;
  stacked?: boolean;
}

const glassTooltipStyle = {
  backgroundColor: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  fontSize: '12px',
};

export default function GlassAreaChartNew({
  data,
  areas,
  height = 280,
  title,
  showLegend = false,
  stacked = false,
}: GlassAreaChartNewProps) {
  return (
    <div>
      {title && (
        <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">{title}</h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <defs>
            {areas.map((area) => (
              <linearGradient key={area.dataKey} id={`grad-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={area.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={area.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
            axisLine={{ stroke: 'rgba(128,128,128,0.15)' }}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={glassTooltipStyle} />
          {showLegend && <Legend wrapperStyle={{ fontSize: '11px' }} />}
          {areas.map((area) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.label || area.dataKey}
              stroke={area.color}
              strokeWidth={2}
              fill={`url(#grad-${area.dataKey})`}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
