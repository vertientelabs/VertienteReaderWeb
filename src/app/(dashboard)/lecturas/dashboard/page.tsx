'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  BarChart3,
  TrendingUp,
  Users,
  AlertTriangle,
  Target,
  Calendar,
  Zap,
  MapPin,
} from 'lucide-react';

const AnomalyHeatMap = dynamic(() => import('@/components/maps/anomaly-heat-map'), { ssr: false });
import GlassCard from '@/components/ui/glass-card';
import GlassChip from '@/components/ui/glass-chip';
import GlassSelect from '@/components/ui/glass-select';
import ProgressGauge from '@/components/charts/progress-gauge';
import { GlassAreaChart, GlassBarChart } from '@/components/charts/consumption-chart';
import ActivityTimeline from '@/components/charts/activity-timeline';

// Demo data - will be replaced with Firestore real-time data
const dailyReadings = [
  { name: '01', value: 85 },
  { name: '02', value: 120 },
  { name: '03', value: 95 },
  { name: '04', value: 145 },
  { name: '05', value: 160 },
  { name: '06', value: 110 },
  { name: '07', value: 90 },
  { name: '08', value: 175 },
  { name: '09', value: 200 },
  { name: '10', value: 155 },
  { name: '11', value: 180 },
  { name: '12', value: 210 },
  { name: '13', value: 190 },
  { name: '14', value: 165 },
  { name: '15', value: 220 },
];

const operarioProgress = [
  { name: 'J. Pérez', value: 342, value2: 320 },
  { name: 'M. García', value: 298, value2: 310 },
  { name: 'C. Rojas', value: 276, value2: 250 },
  { name: 'A. Torres', value: 251, value2: 280 },
  { name: 'P. Sánchez', value: 223, value2: 200 },
];

const consumptionDistribution = [
  { name: '0-5', value: 120 },
  { name: '5-10', value: 350 },
  { name: '10-15', value: 680 },
  { name: '15-20', value: 890 },
  { name: '20-30', value: 520 },
  { name: '30-50', value: 180 },
  { name: '50+', value: 45 },
];

const zonalProgress = [
  { name: 'Norte A', value: 92 },
  { name: 'Norte B', value: 78 },
  { name: 'Centro', value: 85 },
  { name: 'Sur A', value: 65 },
  { name: 'Sur B', value: 71 },
  { name: 'Este', value: 88 },
];

const anomalies = [
  { id: '1', action: 'Consumo alto detectado', detail: 'Cliente #1082 - 89.5 m³ (prom: 18.2 m³)', time: 'Hace 15 min', type: 'danger' as const },
  { id: '2', action: 'Medidor parado', detail: 'Med. 00456 - 0 m³ por 3 periodos', time: 'Hace 1h', type: 'warning' as const },
  { id: '3', action: 'Retroceso de lectura', detail: 'Med. 00789 - Lectura actual < anterior', time: 'Hace 2h', type: 'danger' as const },
  { id: '4', action: 'Consumo bajo', detail: 'Cliente #2041 - 0.5 m³ (prom: 15.8 m³)', time: 'Hace 3h', type: 'warning' as const },
  { id: '5', action: 'Consumo alto detectado', detail: 'Cliente #3567 - 65.2 m³ (prom: 22.1 m³)', time: 'Hace 5h', type: 'danger' as const },
];

const predictions = {
  estimatedCompletionDate: '28 Mar 2026',
  currentPace: 187,
  requiredPace: 165,
  projectedConsumption: 74520,
  laggingOperarios: 2,
};

export default function DashboardAnaliticoPage() {
  const [periodo, setPeriodo] = useState('2026-03');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard Analítico</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Análisis de lecturas, predicciones y anomalías</p>
        </div>
        <div className="flex items-center gap-3">
          <GlassSelect
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            options={[
              { value: '2026-03', label: 'Marzo 2026' },
              { value: '2026-02', label: 'Febrero 2026' },
              { value: '2026-01', label: 'Enero 2026' },
            ]}
          />
        </div>
      </div>

      {/* Row 1: Gauge + Daily trend */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Gauge */}
        <GlassCard hover={false} className="flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">Avance Global</h3>
          <ProgressGauge
            value={71.2}
            label="completado"
            sublabel="2,847 de 4,000 medidores"
          />
        </GlassCard>

        {/* Daily trend */}
        <GlassCard hover={false} className="lg:col-span-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Lecturas por Día</h3>
              <p className="text-xs text-[var(--text-tertiary)]">Tendencia de avance diario</p>
            </div>
            <GlassChip label="Meta: 165/día" variant="primary" />
          </div>
          <GlassAreaChart data={dailyReadings} color="#0A84FF" height={240} />
        </GlassCard>
      </div>

      {/* Row 2: Operario comparison + Consumption distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard hover={false}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Avance por Operario</h3>
            <GlassChip label="vs periodo anterior" variant="default" />
          </div>
          <GlassBarChart
            data={operarioProgress}
            height={260}
            colors={['#0A84FF', '#BF5AF2']}
            labels={['Este periodo', 'Anterior']}
          />
        </GlassCard>

        <GlassCard hover={false}>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">Distribución de Consumo</h3>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">Rangos de consumo en m³</p>
          <GlassBarChart
            data={consumptionDistribution}
            height={260}
            colors={['#30D158', '#64D2FF']}
            labels={['Medidores', '']}
          />
        </GlassCard>
      </div>

      {/* Row 3: Zonal progress + Predictions + Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Zonal progress */}
        <GlassCard hover={false}>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">Avance por Zona</h3>
          <div className="space-y-3">
            {zonalProgress.map((zone) => (
              <div key={zone.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[var(--text-primary)]">{zone.name}</span>
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">{zone.value}%</span>
                </div>
                <div className="h-2 bg-white/15 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      zone.value >= 80
                        ? 'bg-gradient-to-r from-[#30D158] to-[#64D2FF]'
                        : zone.value >= 60
                          ? 'bg-gradient-to-r from-[#FF9F0A] to-[#FFD60A]'
                          : 'bg-gradient-to-r from-[#FF453A] to-[#FF9F0A]'
                    }`}
                    style={{ width: `${zone.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Predictions */}
        <GlassCard hover={false}>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#FF9F0A]" />
            Predicciones
          </h3>
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-white/20 dark:bg-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3.5 w-3.5 text-[#0A84FF]" />
                <span className="text-xs text-[var(--text-tertiary)]">Fecha estimada 100%</span>
              </div>
              <p className="text-lg font-bold text-[var(--text-primary)]">{predictions.estimatedCompletionDate}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/20 dark:bg-white/5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-[#30D158]" />
                <span className="text-xs text-[var(--text-tertiary)]">Ritmo actual</span>
              </div>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {predictions.currentPace} <span className="text-xs font-normal text-[var(--text-tertiary)]">lecturas/día</span>
              </p>
              <p className="text-xs text-[#30D158]">
                +{predictions.currentPace - predictions.requiredPace} sobre meta
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/20 dark:bg-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-3.5 w-3.5 text-[#BF5AF2]" />
                <span className="text-xs text-[var(--text-tertiary)]">Consumo proyectado</span>
              </div>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {predictions.projectedConsumption.toLocaleString()} <span className="text-xs font-normal text-[var(--text-tertiary)]">m³</span>
              </p>
            </div>
            {predictions.laggingOperarios > 0 && (
              <div className="p-3 rounded-xl bg-[#FF453A]/10 border border-[#FF453A]/20">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-[#FF453A]" />
                  <span className="text-xs text-[#FF453A] font-medium">
                    {predictions.laggingOperarios} operario(s) con avance &lt; 50%
                  </span>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Anomalies timeline */}
        <GlassCard hover={false}>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#FF453A]" />
            Anomalías Recientes
          </h3>
          <ActivityTimeline items={anomalies} />
        </GlassCard>
      </div>

      {/* Row 4: Anomaly Heat Map */}
      <GlassCard hover={false}>
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#FF453A]" />
          Mapa de Anomalías
        </h3>
        <p className="text-xs text-[var(--text-tertiary)] mb-3">Ubicación geográfica de anomalías detectadas en el periodo</p>
        <AnomalyHeatMap
          anomalias={[
            { latitud: -12.046, longitud: -77.043, tipo: 'consumo_alto', descripcion: 'Cliente #1082 - Consumo 89.5 m³' },
            { latitud: -12.052, longitud: -77.035, tipo: 'medidor_parado', descripcion: 'Medidor 00456 - 0 m³ por 3 periodos' },
            { latitud: -12.058, longitud: -77.048, tipo: 'retroceso', descripcion: 'Medidor 00789 - Lectura retrocedió' },
            { latitud: -12.041, longitud: -77.055, tipo: 'consumo_bajo', descripcion: 'Cliente #2041 - Consumo 0.5 m³' },
            { latitud: -12.065, longitud: -77.030, tipo: 'consumo_alto', descripcion: 'Cliente #3567 - Consumo 65.2 m³' },
            { latitud: -12.053, longitud: -77.036, tipo: 'consumo_alto', descripcion: 'Cliente #1205 - Consumo 72.1 m³' },
            { latitud: -12.070, longitud: -77.042, tipo: 'medidor_parado', descripcion: 'Medidor 01122 - Sin registro' },
            { latitud: -12.048, longitud: -77.058, tipo: 'consumo_bajo', descripcion: 'Cliente #4890 - Consumo 0.2 m³' },
          ]}
        />
      </GlassCard>
    </div>
  );
}
