'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface GlassPieChartProps {
  data: PieData[];
  height?: number;
  title?: string;
  innerRadius?: number;
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

export default function GlassPieChart({
  data,
  height = 250,
  title,
  innerRadius = 50,
  showLegend = true,
}: GlassPieChartProps) {
  return (
    <div>
      {title && (
        <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">{title}</h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={innerRadius + 30}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={glassTooltipStyle} />
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: '11px' }}
              formatter={(value: string) => (
                <span style={{ color: 'var(--text-secondary)' }}>{value}</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
