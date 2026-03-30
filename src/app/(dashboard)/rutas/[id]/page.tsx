'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Route, MapPin, Gauge } from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import { getRutaById } from '@/lib/services/route-service';
import { getZonaById } from '@/lib/services/zone-service';
import type { Ruta, Zona } from '@/lib/types';

export default function RutaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [zonasDetails, setZonasDetails] = useState<Zona[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getRutaById(id);
        setRuta(data);
        if (data?.zonasIds?.length) {
          const zonaPromises = data.zonasIds.map((zId) => getZonaById(zId));
          const results = await Promise.all(zonaPromises);
          setZonasDetails(results.filter(Boolean) as Zona[]);
        }
      } catch (err) {
        console.error('Error loading ruta:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

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

  if (!ruta) {
    return (
      <div className="space-y-6">
        <Link href="/rutas">
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Volver
          </GlassButton>
        </Link>
        <GlassCard hover={false}>
          <div className="flex flex-col items-center py-16">
            <Route className="h-12 w-12 text-[var(--text-tertiary)] mb-4" />
            <p className="text-[var(--text-secondary)]">Ruta no encontrada</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/rutas">
            <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{ruta.nombre}</h1>
              <GlassChip
                label={ruta.activo ? 'Activa' : 'Inactiva'}
                variant={ruta.activo ? 'success' : 'default'}
              />
            </div>
            <p className="text-sm text-[var(--text-tertiary)] mt-0.5">Código: {ruta.codigo}</p>
          </div>
        </div>
        <Link href={`/rutas/${id}/editar`}>
          <GlassButton variant="secondary" icon={<Pencil className="h-4 w-4" />}>Editar</GlassButton>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A84FF]/12 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-[#0A84FF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{ruta.zonasIds?.length || 0}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Zonas</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#30D158]/12 flex items-center justify-center">
              <Gauge className="h-5 w-5 text-[#30D158]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{ruta.totalMedidores || 0}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Medidores</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#BF5AF2]/12 flex items-center justify-center">
              <Route className="h-5 w-5 text-[#BF5AF2]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">—</p>
              <p className="text-xs text-[var(--text-tertiary)]">Operario asignado</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Info & Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3">
            Información
          </h3>
          <div className="space-y-3">
            <InfoRow label="Código" value={ruta.codigo} />
            <InfoRow label="Nombre" value={ruta.nombre} />
            <InfoRow label="Descripción" value={ruta.descripcion || '—'} />
            <InfoRow label="Empresa" value={ruta.companiId || '—'} />
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3">
            Zonas Incluidas ({zonasDetails.length})
          </h3>
          {zonasDetails.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-6">Sin zonas asignadas</p>
          ) : (
            <div className="space-y-2">
              {zonasDetails.map((zona) => (
                <Link
                  key={zona.id}
                  href={`/zonas/${zona.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0A84FF]/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-[#0A84FF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{zona.nombre}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{zona.codigo}</p>
                  </div>
                  <GlassChip
                    label={zona.activo ? 'Activa' : 'Inactiva'}
                    variant={zona.activo ? 'success' : 'default'}
                  />
                </Link>
              ))}
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
