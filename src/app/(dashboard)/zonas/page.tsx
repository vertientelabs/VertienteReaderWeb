'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Plus, Eye, Pencil } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import DataTable from '@/components/shared/data-table';
import { getZonas } from '@/lib/services/zone-service';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Zona } from '@/lib/types';

// Extended type with resolved distrito name
type ZonaRow = Zona & { distritoNombre: string };

const columns: ColumnDef<ZonaRow, unknown>[] = [
  {
    accessorKey: 'codigo',
    header: 'Codigo',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs font-semibold">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'nombre',
    header: 'Nombre',
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'descripcion',
    header: 'Descripcion',
    cell: ({ getValue }) => (
      <span className="text-[var(--text-tertiary)] truncate max-w-[200px] block">
        {getValue<string>() || '—'}
      </span>
    ),
  },
  {
    accessorKey: 'distritoNombre',
    header: 'Distrito',
    cell: ({ getValue }) => (
      <span className="text-[var(--text-secondary)]">{getValue<string>() || '—'}</span>
    ),
  },
  {
    accessorKey: 'activo',
    header: 'Estado',
    cell: ({ getValue }) => (
      <GlassChip
        label={getValue<boolean>() ? 'Activa' : 'Inactiva'}
        variant={getValue<boolean>() ? 'success' : 'default'}
      />
    ),
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Link href={`/zonas/${row.original.id}`}>
          <GlassButton variant="ghost" size="sm" icon={<Eye className="h-4 w-4 text-[#0A84FF]" />} />
        </Link>
        <Link href={`/zonas/${row.original.id}/editar`}>
          <GlassButton variant="ghost" size="sm" icon={<Pencil className="h-4 w-4 text-[#FF9F0A]" />} />
        </Link>
      </div>
    ),
  },
];

export default function ZonasPage() {
  const [zonas, setZonas] = useState<ZonaRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getZonas({ activo: true });
        // Resolve distrito names in parallel
        const zonasWithNames = await Promise.all(
          data.map(async (z) => {
            let distritoNombre = '—';
            if (z.distritoId) {
              try {
                const snap = await getDoc(doc(db, 'distritos', z.distritoId));
                if (snap.exists()) {
                  distritoNombre = snap.data().nombre || z.distritoId;
                }
              } catch {
                distritoNombre = z.distritoId;
              }
            }
            return { ...z, distritoNombre } as ZonaRow;
          })
        );
        setZonas(zonasWithNames);
      } catch (err) {
        console.error('Error loading zonas:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Zonas</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Gestion de zonas geograficas</p>
        </div>
        <Link href="/zonas/nueva">
          <GlassButton icon={<Plus className="h-4 w-4" />}>Nueva Zona</GlassButton>
        </Link>
      </div>

      {loading ? (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center py-16">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <MapPin className="h-10 w-10 text-[var(--text-tertiary)]" />
              <p className="text-sm text-[var(--text-tertiary)]">Cargando zonas...</p>
            </div>
          </div>
        </GlassCard>
      ) : (
        <DataTable
          data={zonas}
          columns={columns}
          searchPlaceholder="Buscar zonas..."
        />
      )}
    </div>
  );
}
