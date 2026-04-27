'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

interface BarData {
  name: string;
  value: number;
  value2?: number;
  color?: string;
}

interface GlassBarChartNewProps {
  data: BarData[];
  height?: number;
  title?: string;
  color?: string;
  secondaryColor?: string;
  labels?: string[];
  layout?: 'vertical' | 'horizontal';
  showLegend?: boolean;
  useItemColors?: boolean;
}

const glassTooltipStyle = {
  backgroundColor: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  fontSize: '12px',
};

export default function GlassBarChartNew({
  data,
  height = 280,
  title,
  color = '#0A84FF',
  secondaryColor = '#30D158',
  labels = ['Valor'],
  layout = 'horizontal',
  showLegend = false,
  useItemColors = false,
}: GlassBarChartNewProps) {
  const isVertical = layout === 'vertical';

  return (
    <div>
      {title && (
        <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">{title}</h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={isVertical ? 'vertical' : 'horizontal'}
          margin={{ top: 5, right: 10, left: isVertical ? 80 : -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
          {isVertical ? (
            <>
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} width={75} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={{ stroke: 'rgba(128,128,128,0.15)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
            </>
          )}
          <Tooltip contentStyle={glassTooltipStyle} />
          {showLegend && <Legend wrapperStyle={{ fontSize: '11px' }} />}
          <Bar dataKey="value" name={labels[0]} fill={color} radius={[4, 4, 0, 0]}>
            {useItemColors && data.map((entry, i) => (
              <Cell key={i} fill={entry.color || color} />
            ))}
          </Bar>
          {data.some((d) => d.value2 !== undefined) && (
            <Bar dataKey="value2" name={labels[1] || 'Valor 2'} fill={secondaryColor} radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
