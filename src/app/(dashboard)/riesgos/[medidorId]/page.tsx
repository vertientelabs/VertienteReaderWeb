'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getMedidorById } from '@/lib/services/meter-service';
import { getClienteById } from '@/lib/services/client-service';
import { getZonaById } from '@/lib/services/zone-service';
import { CardSkeleton as LoadingSkeleton } from '@/components/shared/loading-skeleton';
import Breadcrumb from '@/components/layout/breadcrumb';
import GlassCard from '@/components/ui/glass-card';
import GlassChip from '@/components/ui/glass-chip';
import GlassButton from '@/components/ui/glass-button';
import GlassRadarChart from '@/components/charts/radar-chart-glass';
import KpiCard from '@/components/charts/kpi-card';
import type { ScoreRiesgo, Medidor, Cliente, Zona } from '@/lib/types';
import {
  ArrowLeft,
  ShieldAlert,
  Shield,
  Gauge,
  User,
  MapPin,
  Droplets,
  Wrench,
  AlertTriangle,
} from 'lucide-react';

const recomendacionLabels: Record<string, string> = {
  ninguna: 'Sin accion requerida',
  monitorear: 'Monitorear en proximos periodos',
  inspeccion: 'Programar inspeccion en campo',
  cambio_medidor: 'Programar cambio de medidor',
  corte: 'Evaluar corte de servicio',
};

export default function RiesgoDetallePage({ params }: { params: Promise<{ medidorId: string }> }) {
  const { medidorId } = use(params);
  const router = useRouter();
  const [score, setScore] = useState<ScoreRiesgo | null>(null);
  const [medidor, setMedidor] = useState<Medidor | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [zona, setZona] = useState<Zona | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [medidorId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const scoreDoc = await getDoc(doc(db, 'analytics_scores_riesgo', medidorId));
      if (scoreDoc.exists()) {
        setScore({ id: scoreDoc.id, ...scoreDoc.data() } as ScoreRiesgo);
      }

      const med = await getMedidorById(medidorId);
      setMedidor(med);
      if (med) {
        const [cli, zon] = await Promise.all([
          med.clienteId ? getClienteById(med.clienteId) : null,
          med.zonaId ? getZonaById(med.zonaId) : null,
        ]);
        setCliente(cli);
        setZona(zon);
      }
    } catch (err) {
      console.error('Error loading risk detail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  const radarData = score ? [
    { subject: 'Fraude', value: score.scoreFraude, fullMark: 100 },
    { subject: 'Fuga', value: score.scoreFuga, fullMark: 100 },
    { subject: 'Medidor', value: score.scoreMedidorDeteriorado, fullMark: 100 },
  ] : [];

  const getScoreColor = (s: number) => s >= 85 ? '#FF453A' : s >= 70 ? '#FF9F0A' : s >= 40 ? '#0A84FF' : '#30D158';

  return (
    <div className="space-y-4 sm:space-y-6">
      <Breadcrumb />

      <div className="flex items-center gap-3">
        <GlassButton variant="ghost" size="sm" onClick={() => router.push('/riesgos')}>
          <ArrowLeft className="h-4 w-4" />
        </GlassButton>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            Detalle de Riesgo
          </h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            Medidor: {medidor?.numeroMedidor || medidorId.slice(0, 12)}
          </p>
        </div>
      </div>

      {score && (
        <>
          {/* Score KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KpiCard
              title="Score General"
              value={score.scoreGeneral}
              icon={ShieldAlert}
              color={`from-[${getScoreColor(score.scoreGeneral)}] to-[#FFD60A]`}
            />
            <KpiCard title="Fraude" value={score.scoreFraude} icon={AlertTriangle} color="from-[#FF453A] to-[#FF9F0A]" />
            <KpiCard title="Fuga" value={score.scoreFuga} icon={Droplets} color="from-[#0A84FF] to-[#64D2FF]" />
            <KpiCard title="Medidor" value={score.scoreMedidorDeteriorado} icon={Wrench} color="from-[#BF5AF2] to-[#0A84FF]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Radar Chart */}
            <GlassCard hover={false}>
              <GlassRadarChart
                data={radarData}
                title="Desglose de Riesgo"
                height={250}
                color={getScoreColor(score.scoreGeneral)}
              />
            </GlassCard>

            {/* Factores */}
            <GlassCard hover={false}>
              <h3 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-3">
                Factores de Riesgo
              </h3>
              <div className="space-y-2">
                {score.factores.length > 0 ? (
                  score.factores.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
                      <AlertTriangle className="h-4 w-4 text-[#FF9F0A] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[var(--text-primary)]">{f}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--text-tertiary)]">Sin factores de riesgo identificados</p>
                )}
              </div>
            </GlassCard>

            {/* Recomendacion */}
            <GlassCard hover={false}>
              <h3 className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-3">
                Accion Recomendada
              </h3>
              <div className="p-4 rounded-xl bg-[var(--accent)]/8 border border-[var(--accent)]/20 mb-4">
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  {recomendacionLabels[score.recomendacion] || score.recomendacion}
                </p>
              </div>
              {medidor && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="h-4 w-4 text-[var(--text-tertiary)]" />
                    <span className="font-medium text-[var(--text-secondary)]">Medidor</span>
                  </div>
                  <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Numero</span><span className="text-[var(--text-primary)]">{medidor.numeroMedidor}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Tipo</span><span className="text-[var(--text-primary)]">{medidor.tipo}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Estado</span><GlassChip label={medidor.estado} variant={medidor.estado === 'activo' ? 'success' : 'warning'} /></div>
                </div>
              )}
              {cliente && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-[var(--text-tertiary)]" />
                    <span className="font-medium text-[var(--text-secondary)]">Cliente</span>
                  </div>
                  <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Nombre</span><span className="text-[var(--text-primary)] text-right">{cliente.nombreCompleto}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-tertiary)]">Direccion</span><span className="text-[var(--text-primary)] text-right truncate max-w-[160px]">{cliente.direccion}</span></div>
                </div>
              )}
              {zona && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-[var(--text-tertiary)]" />
                    <span className="font-medium text-[var(--text-secondary)]">Zona</span>
                  </div>
                  <p className="text-[var(--text-primary)]">{zona.nombre}</p>
                </div>
              )}
            </GlassCard>
          </div>
        </>
      )}

      {!score && (
        <GlassCard hover={false}>
          <p className="text-center py-8 text-[var(--text-tertiary)]">
            No se encontro score de riesgo para este medidor. Ejecute el analisis batch primero.
          </p>
        </GlassCard>
      )}
    </div>
  );
}
