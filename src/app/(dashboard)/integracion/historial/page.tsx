'use client';

import { useState } from 'react';
import { History, Download, FileText, Database, Filter, RefreshCw } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassInput from '@/components/ui/glass-input';
import GlassSelect from '@/components/ui/glass-select';
import GlassChip from '@/components/ui/glass-chip';
import DataTable from '@/components/shared/data-table';
import EmptyState from '@/components/shared/empty-state';

/* ── Types ─────────────────────────────────────────────── */

interface ExportRecord {
  id: string;
  fecha: Date;
  usuario: string;
  formato: 'CSV' | 'JSON' | 'XML';
  registros: number;
  periodo: string;
  estado: 'completado' | 'error';
}

/* ── Demo data ─────────────────────────────────────────── */

const DEMO_DATA: ExportRecord[] = [
  { id: '1', fecha: new Date('2026-03-25T14:32:00'), usuario: 'Carlos Méndez', formato: 'CSV', registros: 1240, periodo: '2026-03', estado: 'completado' },
  { id: '2', fecha: new Date('2026-03-22T09:15:00'), usuario: 'Ana Torres', formato: 'JSON', registros: 860, periodo: '2026-03', estado: 'completado' },
  { id: '3', fecha: new Date('2026-03-18T16:45:00'), usuario: 'Luis Paredes', formato: 'CSV', registros: 2100, periodo: '2026-02', estado: 'completado' },
  { id: '4', fecha: new Date('2026-03-15T11:20:00'), usuario: 'María García', formato: 'XML', registros: 530, periodo: '2026-02', estado: 'error' },
  { id: '5', fecha: new Date('2026-03-10T08:50:00'), usuario: 'Carlos Méndez', formato: 'JSON', registros: 1750, periodo: '2026-03', estado: 'completado' },
  { id: '6', fecha: new Date('2026-02-28T13:10:00'), usuario: 'Ana Torres', formato: 'CSV', registros: 980, periodo: '2026-02', estado: 'completado' },
  { id: '7', fecha: new Date('2026-02-20T17:30:00'), usuario: 'Luis Paredes', formato: 'XML', registros: 420, periodo: '2026-01', estado: 'completado' },
  { id: '8', fecha: new Date('2026-02-14T10:05:00'), usuario: 'María García', formato: 'CSV', registros: 1500, periodo: '2026-01', estado: 'error' },
];

/* ── Format chip colors ────────────────────────────────── */

const formatColor: Record<string, 'primary' | 'success' | 'warning'> = {
  CSV: 'primary',
  JSON: 'success',
  XML: 'warning',
};

const estadoColor: Record<string, 'success' | 'danger'> = {
  completado: 'success',
  error: 'danger',
};

/* ── Columns ───────────────────────────────────────────── */

const columns: ColumnDef<ExportRecord, unknown>[] = [
  {
    accessorKey: 'fecha',
    header: 'Fecha',
    cell: ({ getValue }) => {
      const date = getValue<Date>();
      return (
        <span className="text-xs font-mono">
          {date.toLocaleDateString('es-PE')} {date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
        </span>
      );
    },
  },
  {
    accessorKey: 'usuario',
    header: 'Usuario',
    cell: ({ getValue }) => (
      <span className="text-sm">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'formato',
    header: 'Formato',
    cell: ({ getValue }) => {
      const fmt = getValue<string>();
      return <GlassChip label={fmt} variant={formatColor[fmt] ?? 'primary'} />;
    },
  },
  {
    accessorKey: 'registros',
    header: 'Registros',
    cell: ({ getValue }) => (
      <span className="text-sm font-mono">{getValue<number>().toLocaleString('es-PE')}</span>
    ),
  },
  {
    accessorKey: 'periodo',
    header: 'Periodo',
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ getValue }) => {
      const estado = getValue<string>();
      return <GlassChip label={estado} variant={estadoColor[estado] ?? ('default' as const)} />;
    },
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <button
        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
        title="Descargar exportación"
      >
        <Download className="h-4 w-4" />
      </button>
    ),
  },
];

/* ── Page ──────────────────────────────────────────────── */

export default function HistorialExportacionesPage() {
  const [formatFilter, setFormatFilter] = useState('');
  const [periodoFilter, setPeriodoFilter] = useState('');
  const [data, setData] = useState<ExportRecord[]>(DEMO_DATA);

  function handleBuscar() {
    let filtered = DEMO_DATA;
    if (formatFilter) {
      filtered = filtered.filter((r) => r.formato === formatFilter);
    }
    if (periodoFilter) {
      filtered = filtered.filter((r) => r.periodo === periodoFilter);
    }
    setData(filtered);
  }

  /* Stats (static demo values) */
  const totalThisMonth = DEMO_DATA.filter((r) => r.periodo === '2026-03').length;
  const lastFormat = DEMO_DATA[0]?.formato ?? '-';
  const totalRegistros = DEMO_DATA.reduce((sum, r) => sum + r.registros, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Historial de Exportaciones</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Registro de todas las exportaciones de datos realizadas
          </p>
        </div>
        <GlassButton variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={handleBuscar}>
          Actualizar
        </GlassButton>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total exportaciones (this month) */}
        <GlassCard hover={false} padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#5AC8FA] flex items-center justify-center shrink-0">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Exportaciones este mes</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{totalThisMonth}</p>
            </div>
          </div>
        </GlassCard>

        {/* Último formato */}
        <GlassCard hover={false} padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#30D158] to-[#63E6BE] flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Último formato usado</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{lastFormat}</p>
            </div>
          </div>
        </GlassCard>

        {/* Registros totales */}
        <GlassCard hover={false} padding="md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#BF5AF2] to-[#DA70D6] flex items-center justify-center shrink-0">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Datos exportados</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{totalRegistros.toLocaleString('es-PE')}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard hover={false} padding="md">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="h-4 w-4 text-[var(--text-tertiary)]" />
          <GlassSelect
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            options={[
              { value: '', label: 'Todos los formatos' },
              { value: 'CSV', label: 'CSV' },
              { value: 'JSON', label: 'JSON' },
              { value: 'XML', label: 'XML' },
            ]}
          />
          <GlassInput
            type="month"
            value={periodoFilter}
            onChange={(e) => setPeriodoFilter(e.target.value)}
            placeholder="Periodo"
          />
          <GlassButton variant="primary" icon={<History className="h-4 w-4" />} onClick={handleBuscar}>
            Buscar
          </GlassButton>
        </div>
      </GlassCard>

      {/* Table or empty state */}
      {data.length === 0 ? (
        <GlassCard hover={false}>
          <EmptyState
            icon={<History className="h-8 w-8 text-[var(--text-tertiary)]" />}
            title="Sin exportaciones"
            description="No se encontraron exportaciones con los filtros seleccionados."
            action={
              <GlassButton
                variant="secondary"
                onClick={() => {
                  setFormatFilter('');
                  setPeriodoFilter('');
                  setData(DEMO_DATA);
                }}
              >
                Limpiar filtros
              </GlassButton>
            }
          />
        </GlassCard>
      ) : (
        <DataTable data={data} columns={columns} searchPlaceholder="Buscar en historial de exportaciones..." />
      )}
    </div>
  );
}
