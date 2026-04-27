'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Clock, AlertOctagon, CheckCircle2, Eye, Filter, Search } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassSelect from '@/components/ui/glass-select';
import GlassChip from '@/components/ui/glass-chip';
import DataTable from '@/components/shared/data-table';
import { getIncidencias } from '@/lib/services/incidencia-service';
import type { Incidencia } from '@/lib/types';
import { toast } from 'sonner';

const tipoLabel: Record<string, string> = {
  acceso_denegado: 'Acceso Denegado',
  medidor_danado: 'Medidor Dañado',
  fuga_agua: 'Fuga de Agua',
  medidor_no_encontrado: 'Medidor No Encontrado',
  zona_peligrosa: 'Zona Peligrosa',
  otro: 'Otro',
};

const tipoVariant: Record<string, 'danger' | 'warning' | 'primary' | 'purple' | 'default'> = {
  acceso_denegado: 'warning',
  medidor_danado: 'danger',
  fuga_agua: 'primary',
  medidor_no_encontrado: 'purple',
  zona_peligrosa: 'danger',
  otro: 'default',
};

const prioridadVariant: Record<string, 'default' | 'warning' | 'danger'> = {
  baja: 'default',
  media: 'warning',
  alta: 'danger',
  critica: 'danger',
};

const prioridadLabel: Record<string, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Critica',
};

const estadoVariant: Record<string, 'warning' | 'primary' | 'success' | 'default'> = {
  abierta: 'warning',
  en_proceso: 'primary',
  resuelta: 'success',
  cerrada: 'default',
};

const estadoLabel: Record<string, string> = {
  abierta: 'Abierta',
  en_proceso: 'En Proceso',
  resuelta: 'Resuelta',
  cerrada: 'Cerrada',
};

const estadoOptions = [
  { value: '', label: 'Todos' },
  { value: 'abierta', label: 'Abierta' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'resuelta', label: 'Resuelta' },
  { value: 'cerrada', label: 'Cerrada' },
];

const tipoOptions = [
  { value: '', label: 'Todos' },
  { value: 'acceso_denegado', label: 'Acceso Denegado' },
  { value: 'medidor_danado', label: 'Medidor Dañado' },
  { value: 'fuga_agua', label: 'Fuga de Agua' },
  { value: 'medidor_no_encontrado', label: 'Medidor No Encontrado' },
  { value: 'zona_peligrosa', label: 'Zona Peligrosa' },
  { value: 'otro', label: 'Otro' },
];

const prioridadOptions = [
  { value: '', label: 'Todas' },
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Critica' },
];

export default function IncidenciasPage() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [estado, setEstado] = useState('');
  const [tipo, setTipo] = useState('');
  const [prioridad, setPrioridad] = useState('');

  const fetchIncidencias = async () => {
    setLoading(true);
    try {
      const data = await getIncidencias({
        estado: estado || undefined,
        tipo: tipo || undefined,
        prioridad: prioridad || undefined,
      });
      setIncidencias(data);
    } catch (err) {
      console.error('Error loading incidencias:', err);
      toast.error('Error al cargar incidencias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidencias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Computed stats
  const totalAbiertas = incidencias.filter((i) => i.estado === 'abierta').length;
  const enProceso = incidencias.filter((i) => i.estado === 'en_proceso').length;
  const criticas = incidencias.filter((i) => i.prioridad === 'critica').length;
  const resueltasEsteMes = incidencias.filter((i) => {
    if (i.estado !== 'resuelta') return false;
    const now = new Date();
    const fecha = i.fechaResolucion?.toDate ? i.fechaResolucion.toDate() : null;
    if (!fecha) return false;
    return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    {
      label: 'Total Abiertas',
      value: totalAbiertas,
      icon: AlertTriangle,
      gradient: 'from-[#FF9F0A] to-[#FFD60A]',
    },
    {
      label: 'En Proceso',
      value: enProceso,
      icon: Clock,
      gradient: 'from-[#0A84FF] to-[#5AC8FA]',
    },
    {
      label: 'Criticas',
      value: criticas,
      icon: AlertOctagon,
      gradient: 'from-[#FF453A] to-[#FF6961]',
    },
    {
      label: 'Resueltas este mes',
      value: resueltasEsteMes,
      icon: CheckCircle2,
      gradient: 'from-[#30D158] to-[#34C759]',
    },
  ];

  const columns: ColumnDef<Incidencia, unknown>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Fecha',
      cell: ({ getValue }) => {
        const ts = getValue<any>();
        const date = ts?.toDate ? ts.toDate() : new Date(ts);
        return (
          <span className="text-xs">
            {date.toLocaleDateString('es-PE')} {date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
          </span>
        );
      },
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ getValue }) => {
        const val = getValue<string>();
        return (
          <GlassChip
            label={tipoLabel[val] || val}
            variant={tipoVariant[val] || 'default'}
          />
        );
      },
    },
    {
      accessorKey: 'prioridad',
      header: 'Prioridad',
      cell: ({ getValue }) => {
        const val = getValue<string>();
        return (
          <GlassChip
            label={prioridadLabel[val] || val}
            variant={prioridadVariant[val] || 'default'}
          />
        );
      },
    },
    {
      accessorKey: 'descripcion',
      header: 'Descripcion',
      cell: ({ getValue }) => {
        const val = getValue<string>();
        return (
          <span className="text-xs text-[var(--text-secondary)]">
            {val && val.length > 50 ? `${val.substring(0, 50)}...` : val}
          </span>
        );
      },
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ getValue }) => {
        const val = getValue<string>();
        return (
          <GlassChip
            label={estadoLabel[val] || val}
            variant={estadoVariant[val] || 'default'}
          />
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link href={`/incidencias/${row.original.id}`}>
            <GlassButton variant="ghost" size="sm" icon={<Eye className="h-4 w-4 text-[#0A84FF]" />} />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Incidencias</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Gestion de incidencias reportadas en campo
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <GlassCard key={stat.label} hover={false}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">{stat.label}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-[var(--text-tertiary)]" />
          <span className="text-sm font-medium text-[var(--text-secondary)]">Filtros</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassSelect
            label="Estado"
            options={estadoOptions}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          />
          <GlassSelect
            label="Tipo"
            options={tipoOptions}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          />
          <GlassSelect
            label="Prioridad"
            options={prioridadOptions}
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value)}
          />
          <div className="flex items-end">
            <GlassButton
              icon={<Search className="h-4 w-4" />}
              onClick={fetchIncidencias}
            >
              Buscar
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Table */}
      {loading ? (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center py-16">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <AlertTriangle className="h-10 w-10 text-[var(--text-tertiary)]" />
              <p className="text-sm text-[var(--text-tertiary)]">Cargando incidencias...</p>
            </div>
          </div>
        </GlassCard>
      ) : (
        <DataTable
          data={incidencias}
          columns={columns}
          searchPlaceholder="Buscar incidencias..."
        />
      )}
    </div>
  );
}
