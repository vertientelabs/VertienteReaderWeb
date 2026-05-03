'use client';

import GlassCard from '@/components/ui/glass-card';
import KpiCard from '@/components/charts/kpi-card';
import GaugeChart from '@/components/charts/gauge-chart';
import GlassBarChartNew from '@/components/charts/bar-chart-glass';
import GlassLineChart from '@/components/charts/line-chart-glass';
import HeatmapTable from '@/components/charts/heatmap-table';
import { Activity, Users, Clock, CheckCircle2, Target, Route } from 'lucide-react';

const operarioRanking = [
  { name: 'J. Perez', value: 342 },
  { name: 'M. Garcia', value: 298 },
  { name: 'C. Rojas', value: 276 },
  { name: 'A. Torres', value: 251 },
  { name: 'P. Sanchez', value: 223 },
  { name: 'L. Diaz', value: 198 },
  { name: 'R. Flores', value: 187 },
];

const tiempoRuta = [
  { name: 'R-01', value: 4.2, value2: 3.8 },
  { name: 'R-02', value: 5.1, value2: 4.5 },
  { name: 'R-03', value: 3.8, value2: 3.5 },
  { name: 'R-04', value: 6.2, value2: 5.8 },
  { name: 'R-05', value: 4.5, value2: 4.1 },
  { name: 'R-06', value: 5.8, value2: 5.2 },
];

const lecturasTrend = [
  { name: 'Sem 1', realizadas: 850, programadas: 1000 },
  { name: 'Sem 2', realizadas: 920, programadas: 1000 },
  { name: 'Sem 3', realizadas: 780, programadas: 1000 },
  { name: 'Sem 4', realizadas: 950, programadas: 1000 },
];

const zonasPendientes = [
  { label: 'Zona Norte B', value: 45, extra: '180 pendientes' },
  { label: 'Zona Centro A', value: 38, extra: '152 pendientes' },
  { label: 'Zona Sur C', value: 32, extra: '128 pendientes' },
  { label: 'Zona Este D', value: 25, extra: '100 pendientes' },
  { label: 'Zona Oeste A', value: 18, extra: '72 pendientes' },
];

export default function DashboardOperativoPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Activity className="h-6 w-6 text-[#30D158]" />
          Panel de Eficiencia Operativa
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Productividad de operarios, rutas y lecturas
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard title="Efectividad" value="87.5%" subtitle="Lecturas ok / total" icon={Target} trend={3.2} color="from-[#30D158] to-[#64D2FF]" />
        <KpiCard title="Operarios Activos" value="12" subtitle="En campo" icon={Users} color="from-[#BF5AF2] to-[#0A84FF]" />
        <KpiCard title="Tiempo Promedio" value="4.8 min" subtitle="Por lectura" icon={Clock} trend={-5.1} color="from-[#0A84FF] to-[#64D2FF]" />
        <KpiCard title="Lecturas Hoy" value="347" subtitle="+45 vs ayer" icon={CheckCircle2} trend={14.9} color="from-[#FF9F0A] to-[#FFD60A]" />
      </div>

      {/* Row 1: Gauge + Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard hover={false}>
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">Lecturas vs Programadas</h3>
          <p className="text-xs text-[var(--text-tertiary)] mb-4">Avance semanal</p>
          <GlassLineChart
            data={lecturasTrend}
            lines={[
              { dataKey: 'realizadas', color: '#30D158', label: 'Realizadas' },
              { dataKey: 'programadas', color: '#8E8E93', label: 'Programadas', dashed: true },
            ]}
            height={200}
            showLegend
          />
        </GlassCard>

        <GlassCard hover={false}>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Ranking de Operarios</h3>
          <GlassBarChartNew
            data={operarioRanking}
            layout="vertical"
            height={250}
            color="#0A84FF"
            labels={['Lecturas']}
          />
        </GlassCard>

        <GlassCard hover={false}>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Avance Global</h3>
          <div className="flex flex-col items-center py-2">
            <GaugeChart value={87.5} sublabel="efectividad" color="auto" />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Realizadas</span>
              <span className="font-bold text-[var(--text-primary)]">3,500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Programadas</span>
              <span className="text-[var(--text-primary)]">4,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Fallidas</span>
              <span className="text-[#FF453A]">125</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Pendientes</span>
              <span className="text-[#FF9F0A]">375</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Row 2: Tiempo por ruta + Zonas pendientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard hover={false}>
          <h3 className="font-semibold text-[var(--text-primary)] mb-1">Tiempo por Ruta (min/lectura)</h3>
          <p className="text-xs text-[var(--text-tertiary)] mb-4">Actual vs periodo anterior</p>
          <GlassBarChartNew
            data={tiempoRuta}
            height={240}
            color="#0A84FF"
            secondaryColor="#8E8E93"
            labels={['Actual', 'Anterior']}
            showLegend
          />
        </GlassCard>

        <GlassCard hover={false}>
          <HeatmapTable
            title="Zonas con mas Lecturas Pendientes"
            rows={zonasPendientes}
            valueLabel="Pend %"
            maxValue={50}
            colorScheme="red"
          />
          <div className="mt-4 p-3 rounded-xl bg-[#FF9F0A]/8 border border-[#FF9F0A]/20">
            <p className="text-xs font-medium text-[#FF9F0A]">Recomendacion IA</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Reasignar 2 operarios de Zona Oeste A (bajo pendiente) a Zona Norte B para completar antes del cierre de periodo.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
