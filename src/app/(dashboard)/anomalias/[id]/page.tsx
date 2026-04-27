'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { updateAnomaliaEstado } from '@/lib/services/analytics-service';
import { getMedidorById } from '@/lib/services/meter-service';
import { getClienteById } from '@/lib/services/client-service';
import { getZonaById } from '@/lib/services/zone-service';
import { CardSkeleton as LoadingSkeleton } from '@/components/shared/loading-skeleton';
import Breadcrumb from '@/components/layout/breadcrumb';
import GlassCard from '@/components/ui/glass-card';
import GlassChip from '@/components/ui/glass-chip';
import GlassButton from '@/components/ui/glass-button';
import GlassRadarChart from '@/components/charts/radar-chart-glass';
import type { AnalyticsAnomalia, Medidor, Cliente, Zona } from '@/lib/types';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Gauge,
  User,
  MapPin,
} from 'lucide-react';

const severidadColors: Record<string, 'danger' | 'warning' | 'primary' | 'default'> = {
  critica: 'danger',
  alta: 'warning',
  media: 'primary',
  baja: 'default',
};

const tipoLabels: Record<string, string> = {
  consumo_alto: 'Consumo Alto',
  consumo_bajo: 'Consumo Bajo',
  consumo_cero: 'Consumo Cero',
  retroceso: 'Retroceso',
  patron_atipico: 'Patron Atipico',
  variacion_estacional: 'Variacion Estacional',
};

export default function AnomaliaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [anomalia, setAnomalia] = useState<AnalyticsAnomalia | null>(null);
  const [medidor, setMedidor] = useState<Medidor | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [zona, setZona] = useState<Zona | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolucion, setResolucion] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const anomaliaDoc = await getDoc(doc(db, 'analytics_anomalias', id));
      if (!anomaliaDoc.exists()) return;

      const a = { id: anomaliaDoc.id, ...anomaliaDoc.data() } as AnalyticsAnomalia;
      setAnomalia(a);

      const [med, cli, zon] = await Promise.all([
        a.medidorId ? getMedidorById(a.medidorId) : null,
        a.clienteId ? getClienteById(a.clienteId) : null,
        a.zonaId ? getZonaById(a.zonaId) : null,
      ]);
      setMedidor(med);
      setCliente(cli);
      setZona(zon);
    } catch (err) {
      console.error('Error loading anomalia:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEstado = async (estado: 'confirmada' | 'descartada' | 'resuelta') => {
    if (!anomalia || !user) return;
    await updateAnomaliaEstado(anomalia.id, estado, user.id, resolucion || undefined);
    await loadData();
  };

  if (loading) return <LoadingSkeleton />;
  if (!anomalia) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-tertiary)]">Anomalia no encontrada</p>
        <GlassButton variant="ghost" className="mt-4" onClick={() => router.push('/anomalias')}>
          Volver a Anomalias
        </GlassButton>
      </div>
    );
  }

  const radarData = [
    { subject: 'Score', value: anomalia.scoreConfiabilidad, fullMark: 100 },
    { subject: 'Desviacion', value: Math.min(Math.abs(anomalia.desviacionPorcentual), 100), fullMark: 100 },
    { subject: 'Consumo', value: anomalia.consumoEsperado > 0 ? Math.min((anomalia.consumoActual / anomalia.consumoEsperado) * 50, 100) : 0, fullMark: 100 },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <Breadcrumb />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <GlassButton variant="ghost" size="sm" onClick={() => router.push('/anomalias')}>
            <ArrowLeft className="h-4 w-4" />
          </GlassButton>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Anomalia - {tipoLabels[anomalia.tipoAnomalia]}
              </h1>
              <GlassChip label={anomalia.severidad} variant={severidadColors[anomalia.severidad]} />
            </div>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">
              {anomalia.createdAt?.toDate?.().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })} | Periodo: {anomalia.periodo}
            </p>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <GlassCard hover={false}>
            <h3 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-3">
              Descripcion
            </h3>
            <p className="text-[var(--text-primary)] leading-relaxed">{anomalia.descripcion}</p>
            <div className="mt-4 p-3 rounded-xl bg-[#FF9F0A]/8 border border-[#FF9F0A]/20">
              <p className="text-sm font-medium text-[#FF9F0A] mb-1">Recomendacion</p>
              <p className="text-sm text-[var(--text-secondary)]">{anomalia.recomendacion}</p>
            </div>
          </GlassCard>

          {/* Consumo comparison */}
          <GlassCard hover={false}>
            <h3 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-4">
              Comparacion de Consumo
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Consumo Actual</p>
                <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                  {anomalia.consumoActual.toFixed(1)}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">m3</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Consumo Esperado</p>
                <p className="text-2xl font-bold text-[#0A84FF] mt-1">
                  {anomalia.consumoEsperado.toFixed(1)}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">m3</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Desviacion</p>
                <p className={`text-2xl font-bold mt-1 ${anomalia.desviacionPorcentual > 0 ? 'text-[#FF453A]' : 'text-[#30D158]'}`}>
                  {anomalia.desviacionPorcentual > 0 ? '+' : ''}{anomalia.desviacionPorcentual.toFixed(1)}%
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Medidor / Cliente info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {medidor && (
              <GlassCard hover={false}>
                <div className="flex items-center gap-2 mb-3">
                  <Gauge className="h-4 w-4 text-[var(--text-tertiary)]" />
                  <h3 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                    Medidor
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-tertiary)]">Numero</span>
                    <span className="font-mono text-[var(--text-primary)]">{medidor.numeroMedidor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-tertiary)]">Tipo</span>
                    <span className="text-[var(--text-primary)]">{medidor.tipo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-tertiary)]">Estado</span>
                    <GlassChip label={medidor.estado} variant={medidor.estado === 'activo' ? 'success' : 'warning'} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-tertiary)]">Marca</span>
                    <span className="text-[var(--text-primary)]">{medidor.marca || '-'}</span>
                  </div>
                </div>
              </GlassCard>
            )}

            {cliente && (
              <GlassCard hover={false}>
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-[var(--text-tertiary)]" />
                  <h3 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                    Cliente
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-tertiary)]">Nombre</span>
                    <span className="text-[var(--text-primary)] text-right">{cliente.nombreCompleto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-tertiary)]">Documento</span>
                    <span className="text-[var(--text-primary)]">{cliente.tipoDocumento} {cliente.numeroDocumento}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-tertiary)]">Direccion</span>
                    <span className="text-[var(--text-primary)] text-right truncate max-w-[180px]">{cliente.direccion}</span>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>

          {/* Actions */}
          {anomalia.estado === 'detectada' || anomalia.estado === 'en_revision' ? (
            <GlassCard hover={false}>
              <h3 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-3">
                Resolucion
              </h3>
              <textarea
                className="glass-input w-full text-sm min-h-[80px] mb-3"
                placeholder="Descripcion de la resolucion (opcional)..."
                value={resolucion}
                onChange={(e) => setResolucion(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <GlassButton
                  variant="success"
                  size="sm"
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={() => handleUpdateEstado('confirmada')}
                >
                  Confirmar Anomalia
                </GlassButton>
                <GlassButton
                  variant="danger"
                  size="sm"
                  icon={<XCircle className="h-4 w-4" />}
                  onClick={() => handleUpdateEstado('descartada')}
                >
                  Descartar
                </GlassButton>
                <GlassButton
                  variant="primary"
                  size="sm"
                  icon={<RotateCcw className="h-4 w-4" />}
                  onClick={() => handleUpdateEstado('resuelta')}
                >
                  Marcar Resuelta
                </GlassButton>
              </div>
            </GlassCard>
          ) : (
            <GlassCard hover={false}>
              <div className="flex items-center gap-2">
                <GlassChip
                  label={anomalia.estado === 'confirmada' ? 'Confirmada' : anomalia.estado === 'resuelta' ? 'Resuelta' : 'Descartada'}
                  variant={anomalia.estado === 'confirmada' ? 'success' : anomalia.estado === 'resuelta' ? 'primary' : 'default'}
                  size="md"
                />
                {anomalia.resolucion && (
                  <span className="text-sm text-[var(--text-secondary)]">{anomalia.resolucion}</span>
                )}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right: Radar + Zona */}
        <div className="space-y-4">
          <GlassCard hover={false}>
            <GlassRadarChart
              data={radarData}
              title="Analisis de Confiabilidad"
              height={220}
              color={anomalia.severidad === 'critica' ? '#FF453A' : anomalia.severidad === 'alta' ? '#FF9F0A' : '#0A84FF'}
            />
            <div className="text-center mt-2">
              <span className="text-3xl font-bold text-[var(--text-primary)]">
                {anomalia.scoreConfiabilidad}
              </span>
              <span className="text-sm text-[var(--text-tertiary)] ml-1">/ 100</span>
            </div>
          </GlassCard>

          {zona && (
            <GlassCard hover={false}>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-[var(--text-tertiary)]" />
                <h3 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                  Zona
                </h3>
              </div>
              <p className="text-lg font-semibold text-[var(--text-primary)]">{zona.nombre}</p>
              <p className="text-sm text-[var(--text-tertiary)]">{zona.codigo}</p>
              {zona.descripcion && (
                <p className="text-sm text-[var(--text-secondary)] mt-2">{zona.descripcion}</p>
              )}
            </GlassCard>
          )}

          <GlassCard hover={false}>
            <h3 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-3">
              Informacion
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-tertiary)]">ID Lectura</span>
                <span className="font-mono text-[var(--text-primary)] text-xs">{anomalia.lecturaId?.slice(0, 12) || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-tertiary)]">Periodo</span>
                <span className="text-[var(--text-primary)]">{anomalia.periodo}</span>
              </div>
              {anomalia.revisadoPor && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Revisado por</span>
                  <span className="text-[var(--text-primary)] text-xs">{anomalia.revisadoPor.slice(0, 12)}</span>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
