'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { getRutas } from '@/lib/services/route-service';
import { optimizeRoute, prioritizeZones, estimateRouteTime } from '@/lib/services/route-optimization-service';
import { CardSkeleton as LoadingSkeleton } from '@/components/shared/loading-skeleton';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import KpiCard from '@/components/charts/kpi-card';
import HeatmapTable from '@/components/charts/heatmap-table';
import { Navigation, Play, Route, Clock, MapPin, Zap } from 'lucide-react';
import type { Ruta } from '@/lib/types';
import { toast } from 'sonner';

export default function OptimizarRutasPage() {
  const { user } = useAuth();
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [selectedRuta, setSelectedRuta] = useState('');
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<{
    ordenOriginal: string[];
    ordenOptimizado: string[];
    distanciaOriginal: number;
    distanciaOptimizada: number;
    ahorroPorcentaje: number;
    medidoresCount: number;
  } | null>(null);
  const [timeEstimate, setTimeEstimate] = useState<{ tiempoEstimado: number; lecturasEstimadas: number } | null>(null);
  const [zonasPriorizadas, setZonasPriorizadas] = useState<Array<{
    zonaId: string;
    zonaNombre: string;
    prioridad: number;
    factores: string[];
    medidoresCount: number;
  }>>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getRutas(user.companiId),
      prioritizeZones(user.companiId),
    ]).then(([rutasData, zonas]) => {
      setRutas(rutasData);
      setZonasPriorizadas(zonas);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleOptimize = async () => {
    if (!selectedRuta) {
      toast.error('Seleccione una ruta');
      return;
    }
    setOptimizing(true);
    try {
      const [optResult, timeResult] = await Promise.all([
        optimizeRoute(selectedRuta),
        estimateRouteTime(selectedRuta),
      ]);
      setResult(optResult);
      setTimeEstimate(timeResult);
      toast.success(`Ruta optimizada: ${optResult.ahorroPorcentaje}% de ahorro en distancia`);
    } catch (err) {
      console.error(err);
      toast.error('Error al optimizar la ruta');
    } finally {
      setOptimizing(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Navigation className="h-6 w-6 text-[#0A84FF]" />
          Optimizacion de Rutas
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Algoritmo TSP para minimizar distancias de recorrido
        </p>
      </div>

      {/* Route selector */}
      <GlassCard hover={false}>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Seleccionar Ruta</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className="glass-input flex-1 text-sm"
            value={selectedRuta}
            onChange={(e) => { setSelectedRuta(e.target.value); setResult(null); }}
          >
            <option value="">-- Seleccione una ruta --</option>
            {rutas.map((r) => (
              <option key={r.id} value={r.id}>{r.codigo} - {r.nombre} ({r.totalMedidores} medidores)</option>
            ))}
          </select>
          <GlassButton
            variant="primary"
            icon={<Play className="h-4 w-4" />}
            loading={optimizing}
            onClick={handleOptimize}
          >
            Optimizar
          </GlassButton>
        </div>
      </GlassCard>

      {/* Results */}
      {result && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KpiCard
              title="Medidores"
              value={result.medidoresCount}
              icon={Route}
              color="from-[#0A84FF] to-[#64D2FF]"
            />
            <KpiCard
              title="Distancia Original"
              value={`${result.distanciaOriginal.toFixed(1)} km`}
              icon={MapPin}
              color="from-[#FF9F0A] to-[#FFD60A]"
            />
            <KpiCard
              title="Distancia Optimizada"
              value={`${result.distanciaOptimizada.toFixed(1)} km`}
              icon={Navigation}
              color="from-[#30D158] to-[#64D2FF]"
            />
            <KpiCard
              title="Ahorro"
              value={`${result.ahorroPorcentaje.toFixed(1)}%`}
              subtitle={`${(result.distanciaOriginal - result.distanciaOptimizada).toFixed(1)} km menos`}
              icon={Zap}
              color="from-[#BF5AF2] to-[#0A84FF]"
            />
          </div>

          {timeEstimate && (
            <GlassCard hover={false}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-[var(--text-tertiary)]" />
                <h3 className="font-semibold text-[var(--text-primary)]">Estimacion de Tiempo</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] text-center">
                  <p className="text-xs text-[var(--text-tertiary)]">Tiempo Estimado</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {Math.floor(timeEstimate.tiempoEstimado / 60)}h {timeEstimate.tiempoEstimado % 60}m
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] text-center">
                  <p className="text-xs text-[var(--text-tertiary)]">Lecturas</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{timeEstimate.lecturasEstimadas}</p>
                </div>
                <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] text-center">
                  <p className="text-xs text-[var(--text-tertiary)]">Promedio por Lectura</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {timeEstimate.lecturasEstimadas > 0 ? (timeEstimate.tiempoEstimado / timeEstimate.lecturasEstimadas).toFixed(1) : 0} min
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Order comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard hover={false} padding="none">
              <div className="p-4 border-b border-black/5 dark:border-white/5">
                <h3 className="font-semibold text-[var(--text-primary)]">Orden Original</h3>
                <p className="text-xs text-[var(--text-tertiary)]">{result.distanciaOriginal.toFixed(1)} km total</p>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {result.ordenOriginal.slice(0, 20).map((id, i) => (
                  <div key={`orig-${i}`} className="flex items-center gap-3 px-4 py-2 border-b border-black/[0.03] dark:border-white/[0.03]">
                    <span className="w-6 text-xs font-bold text-[var(--text-tertiary)] text-right">{i + 1}</span>
                    <span className="text-sm font-mono text-[var(--text-primary)]">{id.slice(0, 12)}...</span>
                  </div>
                ))}
                {result.ordenOriginal.length > 20 && (
                  <div className="px-4 py-2 text-xs text-[var(--text-tertiary)] text-center">
                    ... y {result.ordenOriginal.length - 20} mas
                  </div>
                )}
              </div>
            </GlassCard>

            <GlassCard hover={false} padding="none">
              <div className="p-4 border-b border-black/5 dark:border-white/5">
                <h3 className="font-semibold text-[#30D158]">Orden Optimizado</h3>
                <p className="text-xs text-[var(--text-tertiary)]">{result.distanciaOptimizada.toFixed(1)} km total</p>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {result.ordenOptimizado.slice(0, 20).map((id, i) => (
                  <div key={`opt-${i}`} className="flex items-center gap-3 px-4 py-2 border-b border-black/[0.03] dark:border-white/[0.03]">
                    <span className="w-6 text-xs font-bold text-[#30D158] text-right">{i + 1}</span>
                    <span className="text-sm font-mono text-[var(--text-primary)]">{id.slice(0, 12)}...</span>
                  </div>
                ))}
                {result.ordenOptimizado.length > 20 && (
                  <div className="px-4 py-2 text-xs text-[var(--text-tertiary)] text-center">
                    ... y {result.ordenOptimizado.length - 20} mas
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </>
      )}

      {/* Zone prioritization */}
      {zonasPriorizadas.length > 0 && (
        <GlassCard hover={false}>
          <h3 className="font-semibold text-[var(--text-primary)] mb-1">Priorizacion de Zonas</h3>
          <p className="text-xs text-[var(--text-tertiary)] mb-4">Zonas ordenadas por criticidad para priorizar lecturas</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5">
                  <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">#</th>
                  <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Zona</th>
                  <th className="text-center text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Prioridad</th>
                  <th className="text-right text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Medidores</th>
                  <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Factores</th>
                </tr>
              </thead>
              <tbody>
                {zonasPriorizadas.slice(0, 10).map((z, i) => (
                  <tr key={z.zonaId} className="border-b border-black/5 dark:border-white/5">
                    <td className="p-3 text-sm font-bold text-[var(--text-tertiary)]">{i + 1}</td>
                    <td className="p-3 text-sm font-medium text-[var(--text-primary)]">{z.zonaNombre}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-10 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${z.prioridad * 10}%`,
                              backgroundColor: z.prioridad >= 8 ? '#FF453A' : z.prioridad >= 6 ? '#FF9F0A' : '#0A84FF',
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-[var(--text-primary)]">{z.prioridad}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-[var(--text-secondary)] text-right">{z.medidoresCount}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {z.factores.map((f, fi) => (
                          <GlassChip key={fi} label={f} variant="default" />
                        ))}
                        {z.factores.length === 0 && (
                          <span className="text-xs text-[var(--text-tertiary)]">Base</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
