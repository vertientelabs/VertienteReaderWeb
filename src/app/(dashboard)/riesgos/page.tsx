'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useScoresRiesgo } from '@/lib/hooks/use-analytics';
import { getZonas } from '@/lib/services/zone-service';
import { CardSkeleton as LoadingSkeleton } from '@/components/shared/loading-skeleton';
import Breadcrumb from '@/components/layout/breadcrumb';
import GlassCard from '@/components/ui/glass-card';
import GlassChip from '@/components/ui/glass-chip';
import GlassButton from '@/components/ui/glass-button';
import KpiCard from '@/components/charts/kpi-card';
import GlassPieChart from '@/components/charts/pie-chart-glass';
import { ShieldAlert, Shield, AlertTriangle, Eye, CheckCircle2 } from 'lucide-react';
import type { Zona } from '@/lib/types';
import Link from 'next/link';

const recomendacionLabels: Record<string, string> = {
  ninguna: 'Sin accion',
  monitorear: 'Monitorear',
  inspeccion: 'Inspeccion',
  cambio_medidor: 'Cambio medidor',
  corte: 'Corte',
};

const recomendacionVariants: Record<string, 'default' | 'primary' | 'warning' | 'danger' | 'success'> = {
  ninguna: 'default',
  monitorear: 'primary',
  inspeccion: 'warning',
  cambio_medidor: 'warning',
  corte: 'danger',
};

export default function RiesgosPage() {
  const { user } = useAuth();
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [zonaFilter, setZonaFilter] = useState('');

  const { data: scores, loading } = useScoresRiesgo({
    companiId: user?.companiId,
    zonaId: zonaFilter || undefined,
  });

  useEffect(() => {
    getZonas({ activo: true }).then(setZonas).catch(console.error);
  }, []);

  const zonaMap = new Map(zonas.map((z) => [z.id, z.nombre]));

  const criticos = scores.filter((s) => s.scoreGeneral >= 85);
  const altos = scores.filter((s) => s.scoreGeneral >= 70 && s.scoreGeneral < 85);
  const medios = scores.filter((s) => s.scoreGeneral >= 40 && s.scoreGeneral < 70);
  const bajos = scores.filter((s) => s.scoreGeneral < 40);

  const pieData = [
    { name: 'Critico (85+)', value: criticos.length, color: '#FF453A' },
    { name: 'Alto (70-84)', value: altos.length, color: '#FF9F0A' },
    { name: 'Medio (40-69)', value: medios.length, color: '#0A84FF' },
    { name: 'Bajo (<40)', value: bajos.length, color: '#30D158' },
  ].filter((d) => d.value > 0);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#FF453A]';
    if (score >= 70) return 'text-[#FF9F0A]';
    if (score >= 40) return 'text-[#0A84FF]';
    return 'text-[#30D158]';
  };

  const getBarColor = (score: number) => {
    if (score >= 85) return '#FF453A';
    if (score >= 70) return '#FF9F0A';
    if (score >= 40) return '#0A84FF';
    return '#30D158';
  };

  if (loading && scores.length === 0) return <LoadingSkeleton />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Breadcrumb />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-[#FF9F0A]" />
            Scores de Riesgo
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Analisis de riesgo por conexion: fraude, fuga, medidor deteriorado
          </p>
        </div>
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

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Criticos"
          value={criticos.length}
          subtitle="Score >= 85"
          icon={AlertTriangle}
          color="from-[#FF453A] to-[#FF9F0A]"
        />
        <KpiCard
          title="Altos"
          value={altos.length}
          subtitle="Score 70-84"
          icon={ShieldAlert}
          color="from-[#FF9F0A] to-[#FFD60A]"
        />
        <KpiCard
          title="Medios"
          value={medios.length}
          subtitle="Score 40-69"
          icon={Shield}
          color="from-[#0A84FF] to-[#64D2FF]"
        />
        <KpiCard
          title="Bajos"
          value={bajos.length}
          subtitle="Score < 40"
          icon={CheckCircle2}
          color="from-[#30D158] to-[#64D2FF]"
        />
      </div>

      {/* Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {pieData.length > 0 && (
          <GlassCard hover={false}>
            <GlassPieChart data={pieData} title="Distribucion de Riesgo" height={240} innerRadius={45} />
          </GlassCard>
        )}
        <div className={pieData.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <GlassCard hover={false} padding="none">
            <div className="p-4 border-b border-black/5 dark:border-white/5">
              <h3 className="font-semibold text-[var(--text-primary)]">Top Conexiones de Mayor Riesgo</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5">
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Medidor</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Zona</th>
                    <th className="text-center text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">General</th>
                    <th className="text-center text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Fraude</th>
                    <th className="text-center text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Fuga</th>
                    <th className="text-center text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Medidor</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3">Accion</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {scores.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-sm text-[var(--text-tertiary)]">
                        No hay scores de riesgo calculados. Ejecute el analisis batch desde Configuracion IA.
                      </td>
                    </tr>
                  ) : (
                    scores.slice(0, 20).map((s) => (
                      <tr key={s.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                        <td className="p-3 text-sm font-mono text-[var(--text-primary)]">{s.medidorId.slice(0, 10)}</td>
                        <td className="p-3 text-sm text-[var(--text-secondary)]">{zonaMap.get(s.zonaId) || s.zonaId.slice(0, 8)}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-12 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${s.scoreGeneral}%`, backgroundColor: getBarColor(s.scoreGeneral) }} />
                            </div>
                            <span className={`text-sm font-bold ${getScoreColor(s.scoreGeneral)}`}>{s.scoreGeneral}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-sm text-[var(--text-secondary)]">{s.scoreFraude}</td>
                        <td className="p-3 text-center text-sm text-[var(--text-secondary)]">{s.scoreFuga}</td>
                        <td className="p-3 text-center text-sm text-[var(--text-secondary)]">{s.scoreMedidorDeteriorado}</td>
                        <td className="p-3">
                          <GlassChip
                            label={recomendacionLabels[s.recomendacion] || s.recomendacion}
                            variant={recomendacionVariants[s.recomendacion] || 'default'}
                          />
                        </td>
                        <td className="p-3">
                          <Link href={`/riesgos/${s.medidorId}`}>
                            <GlassButton variant="ghost" size="sm" icon={<Eye className="h-3.5 w-3.5 text-[#0A84FF]" />} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
