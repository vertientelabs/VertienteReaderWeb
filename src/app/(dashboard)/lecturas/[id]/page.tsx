'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, MapPin, Camera, Eye } from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import { getLecturaById, validarLectura } from '@/lib/services/reading-service';
import { useAuth } from '@/lib/hooks/use-auth';
import type { LecturaExtendida } from '@/lib/types';
import { toast } from 'sonner';

const anomaliaVariant: Record<string, 'danger' | 'warning' | 'success'> = {
  consumo_alto: 'danger',
  consumo_bajo: 'warning',
  medidor_parado: 'danger',
  retroceso: 'danger',
  ninguna: 'success',
};

const anomaliaLabel: Record<string, string> = {
  consumo_alto: 'Consumo Alto',
  consumo_bajo: 'Consumo Bajo',
  medidor_parado: 'Medidor Parado',
  retroceso: 'Retroceso',
  ninguna: 'Sin Anomalia',
};

const anomaliaExplicacion: Record<string, string> = {
  consumo_alto: 'El consumo registrado supera significativamente el promedio historico del medidor.',
  consumo_bajo: 'El consumo registrado es inusualmente bajo comparado con el promedio historico.',
  medidor_parado: 'El medidor no registra variacion en la lectura, posible averia o manipulacion.',
  retroceso: 'La lectura actual es menor que la anterior, posible manipulacion o error de lectura.',
  ninguna: 'No se detectaron anomalias en esta lectura.',
};

const validacionVariant: Record<string, 'warning' | 'success' | 'danger' | 'purple'> = {
  pendiente: 'warning',
  validada: 'success',
  rechazada: 'danger',
  observada: 'purple',
};

const validacionLabel: Record<string, string> = {
  pendiente: 'Pendiente',
  validada: 'Validada',
  rechazada: 'Rechazada',
  observada: 'Observada',
};

export default function LecturaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();
  const [lectura, setLectura] = useState<LecturaExtendida | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getLecturaById(id);
        setLectura(data);
      } catch (err) {
        console.error('Error loading lectura:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const handleValidar = async (estado: 'validada' | 'rechazada' | 'observada') => {
    if (!user || !lectura) return;
    setValidating(true);
    try {
      await validarLectura(lectura.id, estado, user.id);
      toast.success(
        estado === 'validada'
          ? 'Lectura validada correctamente'
          : estado === 'rechazada'
          ? 'Lectura rechazada'
          : 'Lectura marcada como observada'
      );
      // Refresh data
      const updated = await getLecturaById(id);
      setLectura(updated);
    } catch (err) {
      console.error('Error validando lectura:', err);
      toast.error('Error al validar lectura');
    } finally {
      setValidating(false);
    }
  };

  const formatDate = (ts: any) => {
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

  if (!lectura) {
    return (
      <div className="space-y-6">
        <Link href="/lecturas">
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Volver
          </GlassButton>
        </Link>
        <GlassCard hover={false}>
          <div className="flex flex-col items-center py-16">
            <Eye className="h-12 w-12 text-[var(--text-tertiary)] mb-4" />
            <p className="text-[var(--text-secondary)]">Lectura no encontrada</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/lecturas">
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Detalle de Lectura</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">ID: {lectura.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Main Info */}
        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-4">
            Informacion de Lectura
          </h3>
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-[var(--text-primary)]">{lectura.valorLectura}</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">Valor de Lectura</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Consumo" value={`${lectura.consumo} m\u00B3`} />
              <InfoRow label="Fecha" value={formatDate(lectura.fechaHora)} />
              <InfoRow label="Medidor" value={lectura.medidorId} />
              <InfoRow label="Operario" value={lectura.operarioId} />
            </div>
          </div>
        </GlassCard>

        {/* Validacion */}
        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-4">
            Validacion
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-secondary)]">Estado actual:</span>
              <GlassChip
                label={validacionLabel[lectura.estadoValidacion] || lectura.estadoValidacion}
                variant={validacionVariant[lectura.estadoValidacion] || 'default'}
                size="md"
              />
            </div>
            {lectura.validadaPor && (
              <InfoRow label="Validado por" value={lectura.validadaPor} />
            )}
            {lectura.fechaValidacion && (
              <InfoRow label="Fecha de validacion" value={formatDate(lectura.fechaValidacion)} />
            )}
            {lectura.estadoValidacion === 'pendiente' && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                <GlassButton
                  variant="success"
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={() => handleValidar('validada')}
                  loading={validating}
                >
                  Validar
                </GlassButton>
                <GlassButton
                  variant="danger"
                  icon={<XCircle className="h-4 w-4" />}
                  onClick={() => handleValidar('rechazada')}
                  loading={validating}
                >
                  Rechazar
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  className="border-[#BF5AF2]/30 text-[#BF5AF2] hover:bg-[#BF5AF2]/10"
                  icon={<AlertTriangle className="h-4 w-4" />}
                  onClick={() => handleValidar('observada')}
                  loading={validating}
                >
                  Observar
                </GlassButton>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Ubicacion */}
        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-4">
            <MapPin className="h-4 w-4 inline-block mr-1 -mt-0.5" />
            Ubicacion de Captura
          </h3>
          <div className="space-y-3">
            <InfoRow label="Latitud" value={String(lectura.latitudCaptura)} />
            <InfoRow label="Longitud" value={String(lectura.longitudCaptura)} />
          </div>
        </GlassCard>

        {/* Anomalia */}
        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-4">
            <AlertTriangle className="h-4 w-4 inline-block mr-1 -mt-0.5" />
            Anomalia
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-secondary)]">Tipo:</span>
              {lectura.anomalia ? (
                <GlassChip
                  label={anomaliaLabel[lectura.anomalia] || lectura.anomalia}
                  variant={anomaliaVariant[lectura.anomalia] || 'default'}
                  size="md"
                />
              ) : (
                <span className="text-sm text-[var(--text-tertiary)]">No registrada</span>
              )}
            </div>
            {lectura.anomalia && (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {anomaliaExplicacion[lectura.anomalia] || ''}
              </p>
            )}
          </div>
        </GlassCard>

        {/* Foto */}
        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-4">
            <Camera className="h-4 w-4 inline-block mr-1 -mt-0.5" />
            Foto del Medidor
          </h3>
          {lectura.fotoUrl ? (
            <div className="relative w-full overflow-hidden rounded-xl">
              <Image
                src={lectura.fotoUrl}
                alt="Foto del medidor"
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

        {/* Observaciones */}
        {lectura.observaciones && (
          <GlassCard hover={false}>
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-4">
              Observaciones
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {lectura.observaciones}
            </p>
          </GlassCard>
        )}
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
