'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Plus, Eye, Pencil } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import DataTable from '@/components/shared/data-table';
import { getCompanies } from '@/lib/services/company-service';
import type { Company } from '@/lib/types';

type CompanyRow = Company & { empresaClienteNombre?: string };

const tipoVariant: Record<string, 'primary' | 'purple'> = {
  CLI: 'primary',
  PRO: 'purple',
};

const tipoLabel: Record<string, string> = {
  CLI: 'Cliente',
  PRO: 'Proveedora',
};

const columns: ColumnDef<CompanyRow, unknown>[] = [
  {
    accessorKey: 'razonsocial',
    header: 'Razón Social',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.razonsocial}</p>
        <p className="text-xs text-[var(--text-tertiary)]">RUC: {row.original.ruc || '—'}</p>
      </div>
    ),
  },
  {
    accessorKey: 'tipoEmpresa',
    header: 'Tipo',
    cell: ({ getValue }) => {
      const tipo = getValue<string>();
      return (
        <GlassChip
          label={tipoLabel[tipo] || tipo}
          variant={tipoVariant[tipo] || 'default'}
        />
      );
    },
  },
  {
    accessorKey: 'direccion',
    header: 'Dirección',
    cell: ({ getValue }) => (
      <span className="text-[var(--text-secondary)]">{getValue<string>() || '—'}</span>
    ),
  },
  {
    accessorKey: 'empresaClienteNombre',
    header: 'Empresa Cliente',
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
        <Link href={`/empresas/${row.original.id}`}>
          <GlassButton variant="ghost" size="sm" icon={<Eye className="h-4 w-4" />} />
        </Link>
        <Link href={`/empresas/${row.original.id}/editar`}>
          <GlassButton variant="ghost" size="sm" icon={<Pencil className="h-4 w-4" />} />
        </Link>
      </div>
    ),
    enableSorting: false,
  },
];

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getCompanies({ pageSize: 100 });

        // Resolve empresa cliente names for PRO companies
        const clienteIds = [
          ...new Set(
            result.data
              .filter((c) => c.tipoEmpresa === 'PRO' && c.empresaClienteId)
              .map((c) => c.empresaClienteId!)
          ),
        ];

        const clienteNameMap: Record<string, string> = {};
        await Promise.all(
          clienteIds.map(async (id) => {
            try {
              const snap = await getDoc(doc(db, 'companies', id));
              if (snap.exists()) {
                clienteNameMap[id] = snap.data().razonsocial || id;
              }
            } catch {
              clienteNameMap[id] = id;
            }
          })
        );

        const rows: CompanyRow[] = result.data.map((c) => ({
          ...c,
          empresaClienteNombre:
            c.tipoEmpresa === 'PRO' && c.empresaClienteId
              ? clienteNameMap[c.empresaClienteId] || '—'
              : undefined,
        }));

        setEmpresas(rows);
      } catch (err) {
        console.error('Error loading empresas:', err);
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Empresas</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Gestión de empresas del sistema</p>
        </div>
        <Link href="/empresas/nueva">
          <GlassButton icon={<Plus className="h-4 w-4" />}>Nueva Empresa</GlassButton>
        </Link>
      </div>

      {loading ? (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center py-16">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <Building2 className="h-10 w-10 text-[var(--text-tertiary)]" />
              <p className="text-sm text-[var(--text-tertiary)]">Cargando empresas...</p>
            </div>
          </div>
        </GlassCard>
      ) : (
        <DataTable data={empresas} columns={columns} searchPlaceholder="Buscar empresa..." />
      )}
    </div>
  );
}
