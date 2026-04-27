'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useAnomaliasList, useAnomaliasDashboard } from '@/lib/hooks/use-analytics';
import { getZonas } from '@/lib/services/zone-service';
import { CardSkeleton as LoadingSkeleton } from '@/components/shared/loading-skeleton';
import Breadcrumb from '@/components/layout/breadcrumb';
import GlassCard from '@/components/ui/glass-card';
import GlassChip from '@/components/ui/glass-chip';
import GlassButton from '@/components/ui/glass-button';
import GlassPieChart from '@/components/charts/pie-chart-glass';
import KpiCard from '@/components/charts/kpi-card';
import {
  AlertTriangle,
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Brain,
} from 'lucide-react';
import type { Zona } from '@/lib/types';
import type { TipoAnomaliaIAType, SeveridadAnomaliaType, EstadoAnomaliaIAType } from '@/lib/types';
import Link from 'next/link';

const severidadColors: Record<string, 'danger' | 'warning' | 'primary' | 'default'> = {
  critica: 'danger',
  alta: 'warning',
  media: 'primary',
  baja: 'default',
};

const estadoLabels: Record<string, string> = {
  detectada: 'Detectada',
  en_revision: 'En revision',
  confirmada: 'Confirmada',
  descartada: 'Descartada',
  resuelta: 'Resuelta',
};

const tipoLabels: Record<string, string> = {
  consumo_alto: 'Consumo Alto',
  consumo_bajo: 'Consumo Bajo',
  consumo_cero: 'Consumo Cero',
  retroceso: 'Retroceso',
  patron_atipico: 'Patron Atipico',
  variacion_estacional: 'Variacion Estacional',
};

const tipoChartColors: Record<string, string> = {
  consumo_alto: '#FF453A',
  consumo_bajo: '#FF9F0A',
  consumo_cero: '#8E8E93',
  retroceso: '#BF5AF2',
  patron_atipico: '#0A84FF',
  variacion_estacional: '#5AC8FA',
};

export default function AnomaliasPage() {
  const { user } = useAuth();
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [zonaFilter, setZonaFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState<TipoAnomaliaIAType | ''>('');
  const [severidadFilter, setSeveridadFilter] = useState<SeveridadAnomaliaType | ''>('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoAnomaliaIAType | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: anomalias, loading, updateEstado, refresh } = useAnomaliasList({
    companiId: user?.companiId,
    zonaId: zonaFilter || undefined,
    tipoAnomalia: (tipoFilter || undefined) as TipoAnomaliaIAType | undefined,
    severidad: (severidadFilter || undefined) as SeveridadAnomaliaType | undefined,
    estado: (estadoFilter || undefined) as EstadoAnomaliaIAType | undefined,
  });

  const { resumen } = useAnomaliasDashboard(user?.companiId);

  useEffect(() => {
    getZonas({ activo: true }).then(setZonas).catch(console.error);
  }, []);

  const zonaMap = new Map(zonas.map((z) => [z.id, z.nombre]));

  const pieData = resumen
    ? Object.entries(resumen.porTipo).map(([tipo, count]) => ({
        name: tipoLabels[tipo] || tipo,
        value: count,
        color: tipoChartColors[tipo] || '#8E8E93',
      }))
    : [];

  if (loading && anomalias.length === 0) return <LoadingSkeleton />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Breadcrumb />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            Anomalias IA
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Deteccion inteligente de anomalias en lecturas de consumo
          </p>
        </div>
        <GlassButton
          variant="secondary"
          size="sm"
          icon={<Filter className="h-4 w-4" />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filtros
        </GlassButton>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          title="Total Anomalias"
          value={resumen?.total ?? 0}
          icon={Brain}
          color="from-[#BF5AF2] to-[#0A84FF]"
        />
        <KpiCard
          title="Criticas"
          value={resumen?.porSeveridad?.critica ?? 0}
          icon={AlertTriangle}
          color="from-[#FF453A] to-[#FF9F0A]"
        />
        <KpiCard
          title="Confirmadas"
          value={resumen?.porEstado?.confirmada ?? 0}
          icon={CheckCircle2}
          color="from-[#30D158] to-[#64D2FF]"
        />
        <KpiCard
          title="Pendientes"
          value={resumen?.porEstado?.detectada ?? 0}
          icon={Shield}
          color="from-[#FF9F0A] to-[#FFD60A]"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <GlassCard>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--text-tertiary)] mb-1 block">Zona</label>
              <select
                className="glass-input w-full text-sm"
                value={zonaFilter}
                onChange={(e) => setZonaFilter(e.target.value)}
              >
                <option value="">Todas</option>
                {zonas.map((z) => (
                  <option key={z.id} value={z.id}>{z.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-tertiary)] mb-1 block">Tipo</label>
              <select
                className="glass-input w-full text-sm"
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value as TipoAnomaliaIAType | '')}
              >
                <option value="">Todos</option>
                {Object.entries(tipoLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-tertiary)] mb-1 block">Severidad</label>
              <select
                className="glass-input w-full text-sm"
                value={severidadFilter}
                onChange={(e) => setSeveridadFilter(e.target.value as SeveridadAnomaliaType | '')}
              >
                <option value="">Todas</option>
                <option value="critica">Critica</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-tertiary)] mb-1 block">Estado</label>
              <select
                className="glass-input w-full text-sm"
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value as EstadoAnomaliaIAType | '')}
              >
                <option value="">Todos</option>
                {Object.entries(estadoLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Charts + Table row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie chart */}
        {pieData.length > 0 && (
          <GlassCard hover={false}>
            <GlassPieChart data={pieData} title="Anomalias por Tipo" height={220} innerRadius={40} />
          </GlassCard>
        )}

        {/* Table */}
        <div className={pieData.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <GlassCard hover={false} padding="none">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5">
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide p-3 sm:p-4">Fecha</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide p-3 sm:p-4">Medidor</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide p-3 sm:p-4">Zona</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide p-3 sm:p-4">Tipo</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide p-3 sm:p-4">Severidad</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide p-3 sm:p-4">Score</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide p-3 sm:p-4">Estado</th>
                    <th className="text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide p-3 sm:p-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalias.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-sm text-[var(--text-tertiary)]">
                        No se encontraron anomalias con los filtros seleccionados
                      </td>
                    </tr>
                  ) : (
                    anomalias.map((a) => (
                      <tr key={a.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 sm:p-4 text-sm text-[var(--text-primary)]">
                          {a.createdAt?.toDate?.().toLocaleDateString('es-PE') ?? '-'}
                        </td>
                        <td className="p-3 sm:p-4 text-sm font-mono text-[var(--text-primary)]">
                          {a.medidorId.slice(0, 8)}...
                        </td>
                        <td className="p-3 sm:p-4 text-sm text-[var(--text-secondary)]">
                          {zonaMap.get(a.zonaId) || a.zonaId.slice(0, 8)}
                        </td>
                        <td className="p-3 sm:p-4">
                          <GlassChip label={tipoLabels[a.tipoAnomalia] || a.tipoAnomalia} variant="primary" />
                        </td>
                        <td className="p-3 sm:p-4">
                          <GlassChip label={a.severidad} variant={severidadColors[a.severidad] || 'default'} />
                        </td>
                        <td className="p-3 sm:p-4 text-sm font-bold text-[var(--text-primary)]">
                          {a.scoreConfiabilidad}
                        </td>
                        <td className="p-3 sm:p-4">
                          <GlassChip
                            label={estadoLabels[a.estado] || a.estado}
                            variant={a.estado === 'confirmada' ? 'success' : a.estado === 'descartada' ? 'default' : 'warning'}
                          />
                        </td>
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-1">
                            <Link href={`/anomalias/${a.id}`}>
                              <GlassButton variant="ghost" size="sm" icon={<Eye className="h-3.5 w-3.5 text-[#0A84FF]" />} />
                            </Link>
                            {a.estado === 'detectada' && (
                              <>
                                <GlassButton
                                  variant="ghost"
                                  size="sm"
                                  icon={<CheckCircle2 className="h-3.5 w-3.5 text-[#30D158]" />}
                                  onClick={() => updateEstado(a.id, 'confirmada', user!.id)}
                                />
                                <GlassButton
                                  variant="ghost"
                                  size="sm"
                                  icon={<XCircle className="h-3.5 w-3.5 text-[#FF453A]" />}
                                  onClick={() => updateEstado(a.id, 'descartada', user!.id)}
                                />
                              </>
                            )}
                          </div>
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
