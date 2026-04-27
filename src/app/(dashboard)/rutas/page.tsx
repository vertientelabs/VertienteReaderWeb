'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Route, Plus, Eye, Pencil, MapPin } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import DataTable from '@/components/shared/data-table';
import { getRutas } from '@/lib/services/route-service';
import { useAuth } from '@/lib/hooks/use-auth';
import type { Ruta } from '@/lib/types';

const columns: ColumnDef<Ruta, unknown>[] = [
  {
    accessorKey: 'codigo',
    header: 'Código',
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
    accessorKey: 'zonasIds',
    header: 'Zonas',
    cell: ({ getValue }) => {
      const zonas = getValue<string[]>();
      return (
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
          <span>{zonas?.length || 0} zonas</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'totalMedidores',
    header: 'Medidores',
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue<number>() || 0}</span>
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
        <Link href={`/rutas/${row.original.id}`}>
          <GlassButton variant="ghost" size="sm" icon={<Eye className="h-4 w-4 text-[#0A84FF]" />} />
        </Link>
        <Link href={`/rutas/${row.original.id}/editar`}>
          <GlassButton variant="ghost" size="sm" icon={<Pencil className="h-4 w-4 text-[#FF9F0A]" />} />
        </Link>
      </div>
    ),
  },
];

export default function RutasPage() {
  const { user } = useAuth();
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getRutas(user?.companiId);
        setRutas(data);
      } catch (err) {
        console.error('Error loading rutas:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Rutas</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Gestión de rutas de lectura</p>
        </div>
        <Link href="/rutas/nueva">
          <GlassButton icon={<Plus className="h-4 w-4" />}>Nueva Ruta</GlassButton>
        </Link>
      </div>

      {loading ? (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center py-16">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <Route className="h-10 w-10 text-[var(--text-tertiary)]" />
              <p className="text-sm text-[var(--text-tertiary)]">Cargando rutas...</p>
            </div>
          </div>
        </GlassCard>
      ) : (
        <DataTable data={rutas} columns={columns} searchPlaceholder="Buscar rutas..." />
      )}
    </div>
  );
}
