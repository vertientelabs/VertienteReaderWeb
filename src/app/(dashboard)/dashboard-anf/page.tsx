'use client';

import { useState } from 'react';
import GlassCard from '@/components/ui/glass-card';
import KpiCard from '@/components/charts/kpi-card';
import GlassLineChart from '@/components/charts/line-chart-glass';
import HeatmapTable from '@/components/charts/heatmap-table';
import GlassBarChartNew from '@/components/charts/bar-chart-glass';
import { Droplets, TrendingDown, DollarSign, Target } from 'lucide-react';

// SEDALIB reference data
const anfTrend = [
  { name: 'Ene', anf: 49.5, meta: 45, anterior: 48.8 },
  { name: 'Feb', anf: 49.8, meta: 45, anterior: 49.0 },
  { name: 'Mar', anf: 50.1, meta: 45, anterior: 49.2 },
  { name: 'Abr', anf: 50.3, meta: 45, anterior: 49.4 },
  { name: 'May', anf: 49.9, meta: 45, anterior: 49.1 },
  { name: 'Jun', anf: 50.5, meta: 45, anterior: 49.5 },
  { name: 'Jul', anf: 50.2, meta: 45, anterior: 49.3 },
  { name: 'Ago', anf: 50.8, meta: 45, anterior: 49.6 },
  { name: 'Sep', anf: 50.6, meta: 45, anterior: 49.4 },
  { name: 'Oct', anf: 51.0, meta: 45, anterior: 49.7 },
  { name: 'Nov', anf: 50.9, meta: 45, anterior: 49.5 },
  { name: 'Dic', anf: 50.95, meta: 45, anterior: 49.52 },
];

const zonaAnf = [
  { label: 'Chepén', value: 75.16, extra: '3,262,373 m3' },
  { label: 'Salaverry', value: 69.11, extra: '2,078,005 m3' },
  { label: 'Paijan', value: 69.11, extra: '1,055,798 m3' },
  { label: 'El Porvenir', value: 63.37, extra: '7,434,902 m3' },
  { label: 'Florencia de Mora', value: 61.20, extra: '1,733,247 m3' },
  { label: 'Moche', value: 56.15, extra: '2,263,479 m3' },
  { label: 'R. Puerto Malabrigo', value: 53.02, extra: '470,834 m3' },
  { label: 'Trujillo', value: 47.07, extra: '25,825,376 m3' },
  { label: 'Chocope', value: 46.02, extra: '448,723 m3' },
  { label: 'La Esperanza', value: 44.49, extra: '7,121,119 m3' },
  { label: 'Pacanguilla', value: 58.52, extra: '409,649 m3' },
  { label: 'Huanchaco', value: 36.12, extra: '1,701,801 m3' },
  { label: 'Victor Larco', value: 33.92, extra: '5,171,922 m3' },
];

const mejoraDeterioroData = [
  { name: 'V. Larco', value: -2.1, color: '#30D158' },
  { name: 'Huanchaco', value: -1.5, color: '#30D158' },
  { name: 'La Esperanza', value: -0.8, color: '#30D158' },
  { name: 'Chepén', value: 3.2, color: '#FF453A' },
  { name: 'Salaverry', value: 2.1, color: '#FF453A' },
  { name: 'El Porvenir', value: 1.8, color: '#FF9F0A' },
];

export default function DashboardANFPage() {
  const [anfTarget, setAnfTarget] = useState(45);
  const aguaProducida = 58977000; // m3
  const anfActual = 50.95;
  const tarifaPromedio = 3.8; // S/ per m3

  const volumenRecuperable = (aguaProducida * (anfActual - anfTarget)) / 100;
  const ingresoAdicional = volumenRecuperable * tarifaPromedio;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Droplets className="h-6 w-6 text-[#0A84FF]" />
          Panel de Control de Perdidas (ANF)
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Agua No Facturada - Basado en datos SEDALIB S.A. 2024
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="ANF Actual"
          value={`${anfActual}%`}
          subtitle="Meta: 45%"
          icon={Droplets}
          trend={1.43}
          color="from-[#FF453A] to-[#FF9F0A]"
        />
        <KpiCard
          title="Agua Producida"
          value="58.97 MM m3"
          subtitle="+2.5% vs 2023"
          icon={Droplets}
          trend={2.5}
          color="from-[#0A84FF] to-[#64D2FF]"
        />
        <KpiCard
          title="Agua Facturada"
          value="28.93 MM m3"
          subtitle="-0.4% vs 2023"
          icon={TrendingDown}
          trend={-0.4}
          color="from-[#FF9F0A] to-[#FFD60A]"
        />
        <KpiCard
          title="Perdida Estimada"
          value="S/ 114.2 MM"
          subtitle="Anual"
          icon={DollarSign}
          color="from-[#BF5AF2] to-[#FF453A]"
        />
      </div>

      {/* Trend Chart */}
      <GlassCard hover={false}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">Tendencia ANF - Ultimos 12 Meses</h3>
            <p className="text-xs text-[var(--text-tertiary)]">Comparativa con periodo anterior y meta</p>
          </div>
        </div>
        <GlassLineChart
          data={anfTrend}
          lines={[
            { dataKey: 'anf', color: '#FF453A', label: 'ANF 2024' },
            { dataKey: 'anterior', color: '#8E8E93', label: 'ANF 2023', dashed: true },
            { dataKey: 'meta', color: '#30D158', label: 'Meta', dashed: true },
          ]}
          height={280}
          showLegend
        />
      </GlassCard>

      {/* Heatmap + Mejora/Deterioro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard hover={false}>
          <HeatmapTable
            title="ANF por Localidad"
            rows={zonaAnf}
            valueLabel="ANF %"
            maxValue={80}
            colorScheme="red"
          />
        </GlassCard>

        <GlassCard hover={false}>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Mayor Mejora / Deterioro</h3>
          <GlassBarChartNew
            data={mejoraDeterioroData}
            height={300}
            labels={['Variacion pp']}
            useItemColors
          />
        </GlassCard>
      </div>

      {/* Simulator */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-[#0A84FF]" />
          <h3 className="font-semibold text-[var(--text-primary)]">Simulador de Escenarios</h3>
        </div>
        <p className="text-sm text-[var(--text-tertiary)] mb-4">
          Ajuste el ANF objetivo para ver el impacto economico estimado
        </p>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              ANF Objetivo: <strong className="text-[var(--text-primary)]">{anfTarget}%</strong>
            </label>
            <span className="text-sm text-[var(--text-tertiary)]">
              Actual: {anfActual}%
            </span>
          </div>
          <input
            type="range"
            min={30}
            max={50}
            step={0.5}
            value={anfTarget}
            onChange={(e) => setAnfTarget(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#0A84FF]"
            style={{ background: `linear-gradient(to right, #30D158 0%, #0A84FF ${((50 - anfTarget) / 20) * 100}%, rgba(128,128,128,0.2) ${((50 - anfTarget) / 20) * 100}%)` }}
          />
          <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1">
            <span>30%</span>
            <span>40%</span>
            <span>50%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#30D158]/8 border border-[#30D158]/20 text-center">
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Reduccion ANF</p>
            <p className="text-2xl font-bold text-[#30D158]">{(anfActual - anfTarget).toFixed(1)} pp</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0A84FF]/8 border border-[#0A84FF]/20 text-center">
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Volumen Recuperable</p>
            <p className="text-2xl font-bold text-[#0A84FF]">{(volumenRecuperable / 1000000).toFixed(2)} MM m3</p>
          </div>
          <div className="p-4 rounded-xl bg-[#BF5AF2]/8 border border-[#BF5AF2]/20 text-center">
            <p className="text-xs text-[var(--text-tertiary)] mb-1">Ingreso Adicional</p>
            <p className="text-2xl font-bold text-[#BF5AF2]">S/ {(ingresoAdicional / 1000000).toFixed(1)} MM</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
