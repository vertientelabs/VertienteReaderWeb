'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Camera,
  Eye,
  PlayCircle,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Gauge,
} from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import { getIncidenciaById, updateIncidenciaEstado } from '@/lib/services/incidencia-service';
import { useAuth } from '@/lib/hooks/use-auth';
import type { Incidencia } from '@/lib/types';
import { toast } from 'sonner';

const tipoLabel: Record<string, string> = {
  acceso_denegado: 'Acceso Denegado',
  medidor_danado: 'Medidor Dañado',
  fuga_agua: 'Fuga de Agua',
  medidor_no_encontrado: 'Medidor No Encontrado',
  zona_peligrosa: 'Zona Peligrosa',
  otro: 'Otro',
};

const tipoVariant: Record<string, 'danger' | 'warning' | 'primary' | 'purple' | 'default'> = {
  acceso_denegado: 'warning',
  medidor_danado: 'danger',
  fuga_agua: 'primary',
  medidor_no_encontrado: 'purple',
  zona_peligrosa: 'danger',
  otro: 'default',
};

const prioridadVariant: Record<string, 'default' | 'warning' | 'danger'> = {
  baja: 'default',
  media: 'warning',
  alta: 'danger',
  critica: 'danger',
};

const prioridadLabel: Record<string, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Critica',
};

const estadoVariant: Record<string, 'warning' | 'primary' | 'success' | 'default'> = {
  abierta: 'warning',
  en_proceso: 'primary',
  resuelta: 'success',
  cerrada: 'default',
};

const estadoLabel: Record<string, string> = {
  abierta: 'Abierta',
  en_proceso: 'En Proceso',
  resuelta: 'Resuelta',
  cerrada: 'Cerrada',
};

export default function IncidenciaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [incidencia, setIncidencia] = useState<Incidencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [resolucionText, setResolucionText] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getIncidenciaById(id);
        setIncidencia(data);
      } catch (err) {
        console.error('Error loading incidencia:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const handleChangeEstado = async (nuevoEstado: Incidencia['estado']) => {
    if (!incidencia) return;
    setUpdating(true);
    try {
      await updateIncidenciaEstado(
        incidencia.id,
        nuevoEstado,
        nuevoEstado === 'resuelta' ? resolucionText || undefined : undefined,
        user?.id
      );
      toast.success(`Incidencia actualizada a "${estadoLabel[nuevoEstado]}"`);
      const updated = await getIncidenciaById(id);
      setIncidencia(updated);
      setResolucionText('');
    } catch (err) {
      console.error('Error updating incidencia:', err);
      toast.error('Error al actualizar incidencia');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (ts: any) => {
    if (!ts) return '—';
    const date = ts?.toDate ? ts.toDate() : new Date(ts);
    return `${date.toLocaleDateString('es-PE')} ${date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/30 rounded animate-pulse" />
        <GlassCard hover={false}>
          <div className="animate-pulse space-y-4 py-8">
            <div className="h-6 w-64 bg-white/20 rounded mx-auto" />
            <div className="h-4 w-48 bg-white/20 rounded mx-auto" />
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!incidencia) {
    return (
      <div className="space-y-6">
        <Link href="/incidencias">
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Volver
          </GlassButton>
        </Link>
        <GlassCard hover={false}>
          <div className="flex flex-col items-center py-16">
            <Eye className="h-12 w-12 text-[var(--text-tertiary)] mb-4" />
            <p className="text-[var(--text-secondary)]">Incidencia no encontrada</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/incidencias">
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Detalle de Incidencia</h1>
            <GlassChip
              label={tipoLabel[incidencia.tipo] || incidencia.tipo}
              variant={tipoVariant[incidencia.tipo] || 'default'}
              size="md"
            />
            <GlassChip
              label={prioridadLabel[incidencia.prioridad] || incidencia.prioridad}
              variant={prioridadVariant[incidencia.prioridad] || 'default'}
              size="md"
            />
          </div>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">ID: {incidencia.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Detalles */}
        <GlassCard hover={false} padding="lg">
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-4">
            <FileText className="h-4 w-4 inline-block mr-1 -mt-0.5" />
            Detalles
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[var(--text-tertiary)]">Descripcion</p>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed mt-1">{incidencia.descripcion}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Tipo" value={tipoLabel[incidencia.tipo] || incidencia.tipo} />
              <InfoRow label="Prioridad" value={prioridadLabel[incidencia.prioridad] || incidencia.prioridad} />
              <InfoRow label="Fecha" value={formatDate(incidencia.createdAt)} />
              <InfoRow label="Operario" value={incidencia.operarioId} />
              <InfoRow label="Medidor" value={incidencia.medidorId} />
              {incidencia.lecturaId && <InfoRow label="Lectura" value={incidencia.lecturaId} />}
            </div>
          </div>
        </GlassCard>

        {/* Estado y Resolucion */}
        <GlassCard hover={false} padding="lg">
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-4">
            Estado y Resolucion
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-secondary)]">Estado actual:</span>
              <GlassChip
                label={estadoLabel[incidencia.estado] || incidencia.estado}
                variant={estadoVariant[incidencia.estado] || 'default'}
                size="md"
              />
            </div>
            {incidencia.resolucion && (
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Resolucion</p>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed mt-1">{incidencia.resolucion}</p>
              </div>
            )}
            {incidencia.resueltaPor && (
              <InfoRow label="Resuelta por" value={incidencia.resueltaPor} />
            )}
            {incidencia.fechaResolucion && (
              <InfoRow label="Fecha de resolucion" value={formatDate(incidencia.fechaResolucion)} />
            )}

            {/* Action Buttons */}
            {incidencia.estado !== 'cerrada' && (
              <div className="pt-4 border-t border-white/10 space-y-3">
                {incidencia.estado === 'abierta' && (
                  <GlassButton
                    variant="primary"
                    icon={<PlayCircle className="h-4 w-4" />}
                    onClick={() => handleChangeEstado('en_proceso')}
                    loading={updating}
                  >
                    Tomar Incidencia
                  </GlassButton>
                )}
                {(incidencia.estado === 'abierta' || incidencia.estado === 'en_proceso') && (
                  <div className="space-y-2">
                    <textarea
                      value={resolucionText}
                      onChange={(e) => setResolucionText(e.target.value)}
                      placeholder="Descripcion de la resolucion (opcional)..."
                      className="
                        w-full rounded-xl border border-white/30 dark:border-white/10
                        bg-white/50 dark:bg-white/5
                        backdrop-blur-sm
                        px-4 py-2.5 text-sm
                        text-[var(--text-primary)]
                        placeholder:text-[var(--text-tertiary)]
                        outline-none
                        transition-all duration-200
                        focus:border-[#0A84FF]/50 focus:bg-white/70 dark:focus:bg-white/10
                        focus:ring-2 focus:ring-[#0A84FF]/20
                        resize-none h-20
                      "
                    />
                    <GlassButton
                      variant="success"
                      icon={<CheckCircle2 className="h-4 w-4" />}
                      onClick={() => handleChangeEstado('resuelta')}
                      loading={updating}
                    >
                      Resolver Incidencia
                    </GlassButton>
                  </div>
                )}
                {incidencia.estado === 'resuelta' && (
                  <GlassButton
                    variant="secondary"
                    icon={<XCircle className="h-4 w-4" />}
                    onClick={() => handleChangeEstado('cerrada')}
                    loading={updating}
                  >
                    Cerrar Incidencia
                  </GlassButton>
                )}
              </div>
            )}
          </div>
        </GlassCard>

        {/* Ubicacion */}
        <GlassCard hover={false} padding="lg">
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-4">
            <MapPin className="h-4 w-4 inline-block mr-1 -mt-0.5" />
            Ubicacion
          </h3>
          <div className="space-y-3">
            {incidencia.latitud != null && incidencia.longitud != null ? (
              <>
                <InfoRow label="Latitud" value={String(incidencia.latitud)} />
                <InfoRow label="Longitud" value={String(incidencia.longitud)} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-[var(--text-tertiary)]">
                <MapPin className="h-10 w-10 mb-2 opacity-40" />
                <p className="text-sm">Sin ubicacion registrada</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Foto */}
        <GlassCard hover={false} padding="lg">
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-4">
            <Camera className="h-4 w-4 inline-block mr-1 -mt-0.5" />
            Foto de Evidencia
          </h3>
          {incidencia.fotoUrl ? (
            <div className="relative w-full overflow-hidden rounded-xl">
              <Image
                src={incidencia.fotoUrl}
                alt="Foto de incidencia"
                width={400}
                height={300}
                className="w-full h-auto object-cover rounded-xl"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-[var(--text-tertiary)]">
              <Camera className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">Sin foto disponible</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
      <p className="text-sm font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
