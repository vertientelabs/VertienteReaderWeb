'use client';

import { useState, useEffect } from 'react';
import { Shield, Download, Filter } from 'lucide-react';
import { getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { ColumnDef } from '@tanstack/react-table';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassInput from '@/components/ui/glass-input';
import GlassSelect from '@/components/ui/glass-select';
import GlassChip from '@/components/ui/glass-chip';
import DataTable from '@/components/shared/data-table';
import { auditoriaCol } from '@/lib/firebase/collections';
import type { AuditoriaLog } from '@/lib/types';

const actionColors: Record<string, 'primary' | 'success' | 'warning' | 'danger'> = {
  CREATE: 'success',
  UPDATE: 'primary',
  DELETE: 'danger',
  VALIDAR: 'warning',
};

const getActionColor = (accion: string) => {
  for (const [key, color] of Object.entries(actionColors)) {
    if (accion.includes(key)) return color;
  }
  return 'default' as const;
};

const columns: ColumnDef<AuditoriaLog, unknown>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Fecha',
    cell: ({ getValue }) => {
      const ts = getValue<{ toDate?: () => Date }>();
      const date = ts?.toDate ? ts.toDate() : new Date();
      return (
        <span className="text-xs font-mono">
          {date.toLocaleDateString('es-PE')} {date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
        </span>
      );
    },
  },
  {
    accessorKey: 'userId',
    header: 'Usuario',
    cell: ({ getValue }) => (
      <span className="text-xs font-mono">{getValue<string>()?.slice(0, 12)}...</span>
    ),
  },
  {
    accessorKey: 'accion',
    header: 'Acción',
    cell: ({ getValue }) => {
      const accion = getValue<string>();
      return <GlassChip label={accion} variant={getActionColor(accion)} />;
    },
  },
  {
    accessorKey: 'entidad',
    header: 'Entidad',
    cell: ({ getValue }) => (
      <span className="text-sm capitalize">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'entidadId',
    header: 'ID Entidad',
    cell: ({ getValue }) => (
      <span className="text-xs font-mono text-[var(--text-tertiary)]">{getValue<string>()?.slice(0, 12)}...</span>
    ),
  },
];

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, [entityFilter]);

  async function loadLogs() {
    setLoading(true);
    try {
      const constraints = [];
      if (entityFilter) constraints.push(where('entidad', '==', entityFilter));
      constraints.push(orderBy('timestamp', 'desc'));
      constraints.push(limit(100));

      const q = query(auditoriaCol, ...constraints);
      const snapshot = await getDocs(q);
      setLogs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AuditoriaLog)));
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Auditoría</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Log de actividades del sistema</p>
        </div>
        <GlassButton variant="secondary" icon={<Download className="h-4 w-4" />}>
          Exportar CSV
        </GlassButton>
      </div>

      {/* Filters */}
      <GlassCard hover={false} padding="md">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="h-4 w-4 text-[var(--text-tertiary)]" />
          <GlassSelect
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            options={[
              { value: '', label: 'Todas las entidades' },
              { value: 'users', label: 'Usuarios' },
              { value: 'clientes', label: 'Clientes' },
              { value: 'medidores', label: 'Medidores' },
              { value: 'lecturas', label: 'Lecturas' },
              { value: 'rutas', label: 'Rutas' },
              { value: 'zonas', label: 'Zonas' },
              { value: 'asignaciones', label: 'Asignaciones' },
            ]}
          />
        </div>
      </GlassCard>

      {/* Table */}
      {loading ? (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center py-16">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <Shield className="h-10 w-10 text-[var(--text-tertiary)]" />
              <p className="text-sm text-[var(--text-tertiary)]">Cargando registros...</p>
            </div>
          </div>
        </GlassCard>
      ) : (
        <DataTable data={logs} columns={columns} searchPlaceholder="Buscar en auditoría..." />
      )}
    </div>
  );
}
