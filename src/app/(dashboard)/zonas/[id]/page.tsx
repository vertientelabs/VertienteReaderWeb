'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, MapPin } from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import { getZonaById } from '@/lib/services/zone-service';
import { resolveUbigeoNames } from '@/lib/hooks/use-ubigeo';
import type { Zona } from '@/lib/types';

export default function ZonaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [zona, setZona] = useState<Zona | null>(null);
  const [loading, setLoading] = useState(true);
  const [ubigeoNames, setUbigeoNames] = useState({ departamento: '—', provincia: '—', distrito: '—' });

  useEffect(() => {
    async function load() {
      try {
        const data = await getZonaById(id);
        setZona(data);
        if (data) {
          const names = await resolveUbigeoNames(data.departamentoId, data.provinciaId, data.distritoId);
          setUbigeoNames(names);
        }
      } catch (err) {
        console.error('Error loading zona:', err);
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

  if (!zona) {
    return (
      <div className="space-y-6">
        <Link href="/zonas">
          <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Volver
          </GlassButton>
        </Link>
        <GlassCard hover={false}>
          <div className="flex flex-col items-center py-16">
            <MapPin className="h-12 w-12 text-[var(--text-tertiary)] mb-4" />
            <p className="text-[var(--text-secondary)]">Zona no encontrada</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/zonas">
            <GlassButton variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">{zona.nombre}</h1>
              <GlassChip
                label={zona.activo ? 'Activa' : 'Inactiva'}
                variant={zona.activo ? 'success' : 'default'}
              />
            </div>
            <p className="text-sm text-[var(--text-tertiary)] mt-0.5">Codigo: {zona.codigo}</p>
          </div>
        </div>
        <Link href={`/zonas/${id}/editar`}>
          <GlassButton variant="secondary" icon={<Pencil className="h-4 w-4" />}>Editar</GlassButton>
        </Link>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3">
            Informacion General
          </h3>
          <div className="space-y-3">
            <InfoRow label="Codigo" value={zona.codigo} />
            <InfoRow label="Nombre" value={zona.nombre} />
            <InfoRow label="Descripcion" value={zona.descripcion || '—'} />
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3">
            Ubicacion
          </h3>
          <div className="space-y-3">
            <InfoRow label="Departamento" value={ubigeoNames.departamento} />
            <InfoRow label="Provincia" value={ubigeoNames.provincia} />
            <InfoRow label="Distrito" value={ubigeoNames.distrito} />
          </div>
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
