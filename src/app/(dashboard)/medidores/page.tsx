'use client';

import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Plus, Eye, Edit, Gauge } from 'lucide-react';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import DataTable from '@/components/shared/data-table';
import { getMedidores } from '@/lib/services/meter-service';
import { getClienteById } from '@/lib/services/client-service';
import { getZonaById } from '@/lib/services/zone-service';
import type { Medidor } from '@/lib/types';

const estadoVariant: Record<string, 'success' | 'default' | 'danger' | 'warning' | 'purple'> = {
  activo: 'success',
  inactivo: 'default',
  dañado: 'danger',
  retirado: 'warning',
  por_instalar: 'purple',
};

const tipoVariant: Record<string, 'default' | 'primary' | 'purple'> = {
  mecanico: 'default',
  digital: 'primary',
  inteligente: 'purple',
};

const estadoLecturaVariant: Record<string, 'warning' | 'success'> = {
  pendiente: 'warning',
  leido: 'success',
};

type MedidorRow = Medidor & {
  clienteNombre?: string;
  zonaNombre?: string;
};

export default function MedidoresPage() {
  const [medidores, setMedidores] = useState<MedidorRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getMedidores({ pageSize: 100 });
        const rows = result.data as MedidorRow[];

        // Resolve client and zone names in parallel
        const uniqueClienteIds = [...new Set(rows.map((m) => m.clienteId).filter(Boolean))];
        const uniqueZonaIds = [...new Set(rows.map((m) => m.zonaId).filter(Boolean))];

        const [clienteMap, zonaMap] = await Promise.all([
          resolveNames(uniqueClienteIds, getClienteById, (c) => c?.nombreCompleto || ''),
          resolveNames(uniqueZonaIds, getZonaById, (z) => z?.nombre || ''),
        ]);

        for (const row of rows) {
          row.clienteNombre = clienteMap.get(row.clienteId) || row.clienteId;
          row.zonaNombre = zonaMap.get(row.zonaId) || row.zonaId;
        }

        setMedidores(rows);
      } catch (error) {
        console.error('Error fetching medidores:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const columns: ColumnDef<MedidorRow, unknown>[] = [
    {
      accessorKey: 'numeroMedidor',
      header: 'N. Medidor',
      cell: ({ row }) => (
        <span className="font-medium text-[var(--text-primary)]">
          {row.original.numeroMedidor}
        </span>
      ),
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => (
        <GlassChip
          label={row.original.tipo}
          variant={tipoVariant[row.original.tipo] || 'default'}
        />
      ),
    },
    {
      accessorKey: 'marca',
      header: 'Marca',
      cell: ({ row }) => (
        <span className="text-[var(--text-secondary)]">
          {row.original.marca || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'clienteNombre',
      header: 'Cliente',
      cell: ({ row }) => (
        <span className="text-[var(--text-secondary)] text-sm">
          {row.original.clienteNombre || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'zonaNombre',
      header: 'Zona',
      cell: ({ row }) => (
        <span className="text-[var(--text-secondary)] text-sm">
          {row.original.zonaNombre || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => (
        <GlassChip
          label={row.original.estado}
          variant={estadoVariant[row.original.estado] || 'default'}
        />
      ),
    },
    {
      accessorKey: 'estadoLectura',
      header: 'Lectura',
      cell: ({ row }) => (
        <GlassChip
          label={row.original.estadoLectura}
          variant={estadoLecturaVariant[row.original.estadoLectura] || 'default'}
        />
      ),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link href={`/medidores/${row.original.id}`}>
            <GlassButton variant="ghost" size="sm" icon={<Eye className="h-4 w-4 text-[#0A84FF]" />}>
              Ver
            </GlassButton>
          </Link>
          <Link href={`/medidores/${row.original.id}/editar`}>
            <GlassButton variant="ghost" size="sm" icon={<Edit className="h-4 w-4 text-[#FF9F0A]" />}>
              Editar
            </GlassButton>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Medidores</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Gestión de medidores de agua
          </p>
        </div>
        <Link href="/medidores/nuevo">
          <GlassButton icon={<Plus className="h-4 w-4" />}>
            Nuevo Medidor
          </GlassButton>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Gauge className="h-8 w-8 text-[var(--text-tertiary)] animate-pulse" />
            <p className="text-sm text-[var(--text-tertiary)]">Cargando medidores...</p>
          </div>
        </div>
      ) : (
        <DataTable data={medidores} columns={columns} searchPlaceholder="Buscar medidor..." />
      )}
    </div>
  );
}

async function resolveNames<T>(
  ids: string[],
  fetcher: (id: string) => Promise<T | null>,
  extractor: (item: T | null) => string
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const results = await Promise.all(ids.map((id) => fetcher(id).catch(() => null)));
  ids.forEach((id, i) => {
    map.set(id, extractor(results[i]));
  });
  return map;
}
