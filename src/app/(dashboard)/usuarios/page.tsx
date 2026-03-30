'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Plus, Eye, Pencil } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import DataTable from '@/components/shared/data-table';
import { getUsers } from '@/lib/services/user-service';
import { getInitials } from '@/lib/utils/formatters';
import type { Usuario } from '@/lib/types';

const roleChipVariant: Record<string, 'danger' | 'primary' | 'purple' | 'success' | 'warning'> = {
  root: 'danger',
  administrador: 'primary',
  supervisor: 'purple',
  operario: 'success',
  lector: 'warning',
};

const columns: ColumnDef<Usuario, unknown>[] = [
  {
    id: 'avatar',
    header: '',
    cell: ({ row }) => (
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A84FF] to-[#BF5AF2] flex items-center justify-center text-white text-xs font-bold">
        {getInitials(row.original.nombre, row.original.apellidos)}
      </div>
    ),
  },
  {
    accessorKey: 'nombre',
    header: 'Nombre',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.nombre} {row.original.apellidos}</p>
        <p className="text-xs text-[var(--text-tertiary)]">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: 'usertype',
    header: 'Rol',
    cell: ({ getValue }) => {
      const role = getValue<string>();
      return (
        <GlassChip
          label={role.charAt(0).toUpperCase() + role.slice(1)}
          variant={roleChipVariant[role] || 'default'}
        />
      );
    },
  },
  {
    accessorKey: 'telefono',
    header: 'Teléfono',
    cell: ({ getValue }) => (
      <span className="text-[var(--text-tertiary)]">{getValue<string>() || '—'}</span>
    ),
  },
  {
    accessorKey: 'activo',
    header: 'Estado',
    cell: ({ getValue }) => (
      <GlassChip
        label={getValue<boolean>() ? 'Activo' : 'Inactivo'}
        variant={getValue<boolean>() ? 'success' : 'default'}
      />
    ),
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Link href={`/usuarios/${row.original.id}`}>
          <GlassButton variant="ghost" size="sm" icon={<Eye className="h-4 w-4" />} />
        </Link>
        <Link href={`/usuarios/${row.original.id}/editar`}>
          <GlassButton variant="ghost" size="sm" icon={<Pencil className="h-4 w-4" />} />
        </Link>
      </div>
    ),
  },
];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getUsers();
        setUsuarios(result.data);
      } catch (err) {
        console.error('Error loading usuarios:', err);
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Usuarios</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Gestión de usuarios del sistema</p>
        </div>
        <Link href="/usuarios/nuevo">
          <GlassButton icon={<Plus className="h-4 w-4" />}>Nuevo Usuario</GlassButton>
        </Link>
      </div>

      {loading ? (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center py-16">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <Users className="h-10 w-10 text-[var(--text-tertiary)]" />
              <p className="text-sm text-[var(--text-tertiary)]">Cargando usuarios...</p>
            </div>
          </div>
        </GlassCard>
      ) : (
        <DataTable
          data={usuarios}
          columns={columns}
          searchPlaceholder="Buscar usuarios..."
        />
      )}
    </div>
  );
}
