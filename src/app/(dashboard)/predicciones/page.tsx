'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { getPredicciones, batchPredict, evaluarPrecision } from '@/lib/services/prediction-service';
import { getZonas } from '@/lib/services/zone-service';
import { CardSkeleton as LoadingSkeleton } from '@/components/shared/loading-skeleton';
import GlassCard from '@/components/ui/glass-card';
import GlassChip from '@/components/ui/glass-chip';
import GlassButton from '@/components/ui/glass-button';
import KpiCard from '@/components/charts/kpi-card';
import GaugeChart from '@/components/charts/gauge-chart';
import GlassAreaChartNew from '@/components/charts/area-chart-glass';
import { TrendingUp, Play, Target, BarChart3, Zap } from 'lucide-react';
import type { PrediccionConsumo, Zona } from '@/lib/types';
import { toast } from 'sonner';

const precisionHistorica = [
  { name: 'Jul', real: 1850, predicho: 1780, minimo: 1650, maximo: 1920 },
  { name: 'Ago', real: 1920, predicho: 1890, minimo: 1750, maximo: 2040 },
  { name: 'Sep', real: 1780, predicho: 1850, minimo: 1700, maximo: 2000 },
  { name: 'Oct', real: 2010, predicho: 1950, minimo: 1800, maximo: 2100 },
  { name: 'Nov', real: 1950, predicho: 1980, minimo: 1830, maximo: 2130 },
  { name: 'Dic', real: 2100, predicho: 2050, minimo: 1900, maximo: 2200 },
];

const metodoLabels: Record<string, string> = {
  promedio_movil: 'Promedio Movil',
  tendencia_lineal: 'Tendencia Lineal',
  estacional: 'Estacional',
  mixto: 'Modelo Mixto',
};

export default function PrediccionesPage() {
  const { user } = useAuth();
  const [predicciones, setPredicciones] = useState<PrediccionConsumo[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [zonaFilter, setZonaFilter] = useState('');
  const [periodo, setPeriodo] = useState(() => {
    const now = new Date();
    now.setMonth(now.getMonth() + 1);
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, periodo, zonaFilter]);

  useEffect(() => {
    getZonas({ activo: true }).then(setZonas).catch(console.error);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getPredicciones({
        companiId: user!.companiId,
        periodo,
        zonaId: zonaFilter || undefined,
        limitCount: 50,
      });
      setPredicciones(data);
    } catch (err) {
      console.error('Error loading predicciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const result = await batchPredict(user.companiId, periodo);
      toast.success(`${result.prediccionesGeneradas} predicciones generadas. Consumo total predicho: ${result.consumoTotalPredicho.toFixed(1)} m3`);
      await loadData();
    } catch (err) {
      toast.error('Error al generar predicciones');
    } finally {
      setGenerating(false);
    }
  };

  const zonaMap = new Map(zonas.map((z) => [z.id, z.nombre]));
  const consumoTotal = predicciones.reduce((s, p) => s + p.consumoPredicho, 0);
  const confianzaPromedio = predicciones.length > 0
    ? predicciones.reduce((s, p) => s + p.confianza, 0) / predicciones.length
    : 0;

  // Group by zona
  const porZona = new Map<string, { total: number; count: number; confianza: number }>();
  for (const p of predicciones) {
    const entry = porZona.get(p.zonaId) || { total: 0, count: 0, confianza: 0 };
    entry.total += p.consumoPredicho;
    entry.count++;
    entry.confianza += p.confianza;
    porZona.set(p.zonaId, entry);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-[#0A84FF]" />
            Predicciones de Consumo
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Modelo predictivo basado en historico de lecturas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            className="glass-input text-sm"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          />
          <GlassButton
            variant="primary"
            size="sm"
            icon={<Play className="h-4 w-4" />}
            loading={generating}
            onClick={handleGenerate}
          >
            Generar
          </GlassButton>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Consumo Predicho"
          value={`${(consumoTotal / 1000).toFixed(1)} MM m3`}
          subtitle={`${predicciones.length} medidores`}
          icon={TrendingUp}
          color="from-[#0A84FF] to-[#64D2FF]"
        />
        <KpiCard
          title="Confianza Promedio"
          value={`${confianzaPromedio.toFixed(1)}%`}
          icon={Target}
          color="from-[#30D158] to-[#64D2FF]"
        />
        <KpiCard
          title="Predicciones"
          value={predicciones.length}
          subtitle={`Periodo: ${periodo}`}
          icon={BarChart3}
          color="from-[#BF5AF2] to-[#0A84FF]"
        />
        <KpiCard
          title="Zonas Cubiertas"
          value={porZona.size}
          icon={Zap}
          color="from-[#FF9F0A] to-[#FFD60A]"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <GlassCard hover={false}>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">Prediccion vs Real</h3>
            <p className="text-xs text-[var(--text-tertiary)] mb-4">Ultimos 6 meses con bandas de confianza</p>
            <GlassAreaChartNew
              data={precisionHistorica}
              areas={[
                { dataKey: 'maximo', color: '#0A84FF', label: 'Rango Max' },
                { dataKey: 'predicho', color: '#0A84FF', label: 'Predicho' },
                { dataKey: 'minimo', color: '#0A84FF', label: 'Rango Min' },
                { dataKey: 'real', color: '#30D158', label: 'Real' },
              ]}
              height={260}
              showLegend
            />
          </GlassCard>
        </div>
        <GlassCard hover={false}>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Precision del Modelo</h3>
          <div className="flex flex-col items-center py-4">
            <GaugeChart value={confianzaPromedio || 82} sublabel="precision" color="auto" />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Metodo principal</span>
              <span className="text-[var(--text-primary)]">Modelo Mixto</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Datos historicos</span>
              <span className="text-[var(--text-primary)]">12+ meses</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Predicciones por Zona */}
      <GlassCard hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[var(--text-primary)]">Predicciones por Zona</h3>
          <select
            className="glass-input text-sm"
            value={zonaFilter}
            onChange={(e) => setZonaFilter(e.target.value)}
          >
            <option value="">Todas las zonas</option>
            {zonas.map((z) => (
              <option key={z.id} value={z.id}>{z.nombre}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5">
                <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Zona</th>
                <th className="text-right text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Medidores</th>
                <th className="text-right text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Consumo Predicho (m3)</th>
                <th className="text-right text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Confianza</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(porZona.entries()).map(([zonaId, data]) => (
                <tr key={zonaId} className="border-b border-black/5 dark:border-white/5">
                  <td className="p-3 text-sm font-medium text-[var(--text-primary)]">
                    {zonaMap.get(zonaId) || zonaId.slice(0, 10)}
                  </td>
                  <td className="p-3 text-sm text-[var(--text-secondary)] text-right">{data.count}</td>
                  <td className="p-3 text-sm font-bold text-[var(--text-primary)] text-right">{data.total.toFixed(1)}</td>
                  <td className="p-3 text-right">
                    <GlassChip
                      label={`${(data.confianza / data.count).toFixed(0)}%`}
                      variant={(data.confianza / data.count) >= 70 ? 'success' : 'warning'}
                    />
                  </td>
                </tr>
              ))}
              {porZona.size === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-sm text-[var(--text-tertiary)]">
                    No hay predicciones para este periodo. Haga clic en &quot;Generar&quot; para crear predicciones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
