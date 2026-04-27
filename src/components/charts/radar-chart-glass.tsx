'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface RadarData {
  subject: string;
  value: number;
  fullMark?: number;
}

interface GlassRadarChartProps {
  data: RadarData[];
  height?: number;
  title?: string;
  color?: string;
}

const glassTooltipStyle = {
  backgroundColor: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  fontSize: '12px',
};

export default function GlassRadarChart({
  data,
  height = 250,
  title,
  color = '#0A84FF',
}: GlassRadarChartProps) {
  return (
    <div>
      {title && (
        <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">{title}</h4>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(128,128,128,0.15)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip contentStyle={glassTooltipStyle} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
