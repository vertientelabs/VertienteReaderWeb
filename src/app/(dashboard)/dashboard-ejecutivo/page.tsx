'use client';

import { useHasRole } from '@/lib/hooks/use-auth';
import GlassCard from '@/components/ui/glass-card';
import KpiCard from '@/components/charts/kpi-card';
import Semaforo from '@/components/charts/semaforo';
import GlassLineChart from '@/components/charts/line-chart-glass';
import StatComparison from '@/components/charts/stat-comparison';
import GlassBarChartNew from '@/components/charts/bar-chart-glass';
import {
  Crown,
  Droplets,
  Wifi,
  Gauge,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Shield,
} from 'lucide-react';

const indicadoresSUNASS = [
  { name: 'Ene', anf: 49.5, cobertura: 74.8, continuidad: 10.85, presion: 10.22 },
  { name: 'Feb', anf: 49.8, cobertura: 74.9, continuidad: 10.87, presion: 10.24 },
  { name: 'Mar', anf: 50.1, cobertura: 75.0, continuidad: 10.88, presion: 10.25 },
  { name: 'Abr', anf: 50.3, cobertura: 75.0, continuidad: 10.89, presion: 10.25 },
  { name: 'May', anf: 49.9, cobertura: 75.1, continuidad: 10.90, presion: 10.26 },
  { name: 'Jun', anf: 50.5, cobertura: 75.1, continuidad: 10.90, presion: 10.26 },
  { name: 'Jul', anf: 50.2, cobertura: 75.2, continuidad: 10.90, presion: 10.27 },
  { name: 'Ago', anf: 50.8, cobertura: 75.2, continuidad: 10.91, presion: 10.27 },
  { name: 'Sep', anf: 50.6, cobertura: 75.3, continuidad: 10.91, presion: 10.28 },
  { name: 'Oct', anf: 51.0, cobertura: 75.3, continuidad: 10.91, presion: 10.28 },
  { name: 'Nov', anf: 50.9, cobertura: 75.3, continuidad: 10.91, presion: 10.28 },
  { name: 'Dic', anf: 50.95, cobertura: 75.36, continuidad: 10.91, presion: 10.28 },
];

const benchmarkLocalidades = [
  { name: 'Victor Larco', value: 33.92, color: '#30D158' },
  { name: 'Huanchaco', value: 36.12, color: '#30D158' },
  { name: 'La Esperanza', value: 44.49, color: '#FF9F0A' },
  { name: 'Trujillo', value: 47.07, color: '#FF9F0A' },
  { name: 'Moche', value: 56.15, color: '#FF453A' },
  { name: 'Fl. de Mora', value: 61.20, color: '#FF453A' },
  { name: 'El Porvenir', value: 63.37, color: '#FF453A' },
  { name: 'Salaverry', value: 69.11, color: '#FF453A' },
  { name: 'Chepén', value: 75.16, color: '#FF453A' },
];

const alertasCriticas = [
  { titulo: 'ANF supera 51% en octubre', tipo: 'danger', detalle: 'Tendencia creciente en los ultimos 3 meses. Requiere accion inmediata.' },
  { titulo: 'Chepén alcanza 75.16% de ANF', tipo: 'danger', detalle: 'Localidad con mayor ANF. Se recomienda plan de intervencion urgente.' },
  { titulo: 'Facturacion por medicion baja a 83.38%', tipo: 'warning', detalle: '16.62% de conexiones facturadas por asignacion. Meta SUNASS: 90%.' },
  { titulo: '45,303 conexiones sin medidor', tipo: 'warning', detalle: '22.06% de conexiones sin micromedicion. Plan de instalacion requerido.' },
];

export default function DashboardEjecutivoPage() {
  const isAdmin = useHasRole('root', 'administrador');

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-tertiary)]">Acceso restringido a administradores</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Crown className="h-6 w-6 text-[#FFD60A]" />
          Panel de Alta Direccion
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Resumen ejecutivo de indicadores clave - SEDALIB S.A.
        </p>
      </div>

      {/* Semaforo de Indicadores */}
      <GlassCard hover={false}>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Semaforo de Indicadores Clave</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2">
              <Droplets className="h-5 w-5 text-[var(--text-tertiary)]" />
              <Semaforo value={50.95} thresholds={{ verde: 42, amarillo: 48 }} size="md" />
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">ANF</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">50.95%</p>
            <p className="text-xs text-[var(--text-tertiary)]">Meta: 45%</p>
          </div>
          <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-5 w-5 text-[var(--text-tertiary)]" />
              <Semaforo value={75.36} thresholds={{ verde: 70, amarillo: 80 }} inverted size="md" />
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">Cobertura</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">75.36%</p>
            <p className="text-xs text-[var(--text-tertiary)]">Meta: 80%</p>
          </div>
          <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2">
              <Wifi className="h-5 w-5 text-[var(--text-tertiary)]" />
              <Semaforo value={10.91} thresholds={{ verde: 16, amarillo: 12 }} inverted size="md" />
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">Continuidad</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">10.91 hrs</p>
            <p className="text-xs text-[var(--text-tertiary)]">Meta: 16 hrs/dia</p>
          </div>
          <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2">
              <Gauge className="h-5 w-5 text-[var(--text-tertiary)]" />
              <Semaforo value={10.28} thresholds={{ verde: 10, amarillo: 12 }} inverted size="md" />
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">Presion</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">10.28 m.c.a.</p>
            <p className="text-xs text-[var(--text-tertiary)]">Meta: 10+ m.c.a.</p>
          </div>
        </div>
      </GlassCard>

      {/* Tendencias SUNASS */}
      <GlassCard hover={false}>
        <h3 className="font-semibold text-[var(--text-primary)] mb-1">Tendencia Indicadores SUNASS</h3>
        <p className="text-xs text-[var(--text-tertiary)] mb-4">Ultimos 12 meses</p>
        <GlassLineChart
          data={indicadoresSUNASS}
          lines={[
            { dataKey: 'anf', color: '#FF453A', label: 'ANF %' },
            { dataKey: 'cobertura', color: '#0A84FF', label: 'Cobertura %' },
          ]}
          height={260}
          showLegend
        />
      </GlassCard>

      {/* Alertas + Financiero + Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alertas Criticas */}
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-[#FF453A]" />
            <h3 className="font-semibold text-[var(--text-primary)]">Alertas Criticas</h3>
          </div>
          <div className="space-y-3">
            {alertasCriticas.map((a, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border ${
                  a.tipo === 'danger'
                    ? 'bg-[#FF453A]/5 border-[#FF453A]/15'
                    : 'bg-[#FF9F0A]/5 border-[#FF9F0A]/15'
                }`}
              >
                <p className={`text-sm font-medium ${a.tipo === 'danger' ? 'text-[#FF453A]' : 'text-[#FF9F0A]'}`}>
                  {a.titulo}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">{a.detalle}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Proyeccion Financiera */}
        <GlassCard hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-[#30D158]" />
            <h3 className="font-semibold text-[var(--text-primary)]">Proyeccion Financiera</h3>
          </div>
          <div className="space-y-1 divide-y divide-black/5 dark:divide-white/5">
            <StatComparison
              label="Facturacion (con IGV)"
              current={225.24}
              previous={218.21}
              format={(v) => `S/ ${v.toFixed(1)} MM`}
            />
            <StatComparison
              label="Cobranza (con IGV)"
              current={223.13}
              previous={214.02}
              format={(v) => `S/ ${v.toFixed(1)} MM`}
            />
            <StatComparison
              label="Utilidad Operativa"
              current={47.69}
              previous={43.5}
              format={(v) => `S/ ${v.toFixed(1)} MM`}
            />
            <StatComparison
              label="Margen Operativo"
              current={25.24}
              previous={23.8}
              format={(v) => `${v.toFixed(1)}%`}
            />
            <StatComparison
              label="Cuentas por Cobrar"
              current={99.38}
              previous={95.2}
              format={(v) => `S/ ${v.toFixed(1)} MM`}
              inverted
            />
          </div>
        </GlassCard>

        {/* Benchmarking */}
        <GlassCard hover={false}>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Benchmarking - ANF por Localidad</h3>
          <GlassBarChartNew
            data={benchmarkLocalidades}
            layout="vertical"
            height={320}
            labels={['ANF %']}
            useItemColors
          />
        </GlassCard>
      </div>

      {/* IA Recommendations */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-[#BF5AF2]" />
          <h3 className="font-semibold text-[var(--text-primary)]">Recomendaciones IA</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-[#0A84FF]/5 border border-[#0A84FF]/15">
            <p className="text-sm font-medium text-[#0A84FF] mb-1">Prioridad 1: Micromedicion</p>
            <p className="text-xs text-[var(--text-secondary)]">
              Instalar medidores en las 45,303 conexiones sin micromedicion. Impacto estimado: reduccion de 3-5 pp de ANF.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#30D158]/5 border border-[#30D158]/15">
            <p className="text-sm font-medium text-[#30D158] mb-1">Prioridad 2: Chepén y Salaverry</p>
            <p className="text-xs text-[var(--text-secondary)]">
              Plan de intervencion urgente en localidades con ANF &gt;69%. Inspecciones masivas y deteccion de fraude.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#BF5AF2]/5 border border-[#BF5AF2]/15">
            <p className="text-sm font-medium text-[#BF5AF2] mb-1">Prioridad 3: Renovacion de medidores</p>
            <p className="text-xs text-[var(--text-secondary)]">
              Identificar y renovar medidores con mas de 10 anios. Score de deterioro disponible en panel de Riesgos.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
