'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ClipboardList,
  Plus,
  Users,
  Route,
  Calendar,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassInput from '@/components/ui/glass-input';
import GlassSelect from '@/components/ui/glass-select';
import GlassChip from '@/components/ui/glass-chip';
import GlassModal from '@/components/ui/glass-modal';
import DataTable from '@/components/shared/data-table';
import { useAuth } from '@/lib/hooks/use-auth';
import { getAsignaciones, createAsignacion, updateAsignacion } from '@/lib/services/assignment-service';
import { getRutas } from '@/lib/services/route-service';
import { getUsers } from '@/lib/services/user-service';
import { populateClienteMedidor } from '@/lib/services/clientemedidor-service';
import { asignacionSchema, type AsignacionFormData } from '@/lib/validators/route.schema';
import type { Asignacion, Ruta, Usuario } from '@/lib/types';

const estadoChipVariant: Record<string, 'success' | 'primary' | 'danger' | 'warning'> = {
  activa: 'primary',
  completada: 'success',
  cancelada: 'danger',
};

export default function AsignacionesPage() {
  const { user } = useAuth();
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [operarios, setOperarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [periodoFilter, setPeriodoFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AsignacionFormData>({
    resolver: zodResolver(asignacionSchema),
    defaultValues: { periodo: periodoFilter },
  });

  useEffect(() => {
    loadData();
  }, [user, periodoFilter]);

  async function loadData() {
    if (!user) return;
    setLoading(true);
    try {
      const [asignData, rutasData, usersData] = await Promise.all([
        getAsignaciones({ periodo: periodoFilter }),
        getRutas(user.companiId),
        getUsers({ usertype: 'operario' }),
      ]);
      setAsignaciones(asignData);
      setRutas(rutasData);
      setOperarios(usersData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getOperarioName = (id: string) => {
    const op = operarios.find((o) => o.id === id);
    return op ? `${op.nombre} ${op.apellidos}` : id;
  };

  const getRutaName = (id: string) => {
    const ruta = rutas.find((r) => r.id === id);
    return ruta ? `${ruta.codigo} - ${ruta.nombre}` : id;
  };

  const onSubmit = async (data: AsignacionFormData) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const ruta = rutas.find((r) => r.id === data.rutaId);
      const asignacionId = await createAsignacion(
        {
          operarioId: data.operarioId,
          rutaId: data.rutaId,
          periodo: data.periodo,
          fechaAsignacion: Timestamp.now(),
          fechaInicio: Timestamp.fromDate(new Date(data.fechaInicio)),
          fechaFin: Timestamp.fromDate(new Date(data.fechaFin)),
          estado: 'activa',
          totalMedidores: ruta?.totalMedidores || 0,
          medidoresLeidos: 0,
          porcentajeAvance: 0,
          asignadoPor: user.id,
          companiId: user.companiCli || user.companiId,
        },
        user.id
      );

      // Populate clientemedidor collection with medidores from the ruta's zonas
      try {
        await populateClienteMedidor(data.rutaId, asignacionId, data.operarioId);
      } catch (err) {
        console.error('Error populating clientemedidor:', err);
        toast.warning('Asignación creada, pero hubo un error al generar registros de medidores');
      }

      toast.success('Asignación creada exitosamente');
      setShowModal(false);
      reset();
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Error al crear la asignación');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (asignacionId: string) => {
    if (!user) return;
    try {
      await updateAsignacion(asignacionId, { estado: 'cancelada' }, user.id);
      toast.success('Asignación cancelada');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Error al cancelar');
    }
  };

  const columns: ColumnDef<Asignacion, unknown>[] = [
    {
      accessorKey: 'operarioId',
      header: 'Operario',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#BF5AF2] to-[#0A84FF] flex items-center justify-center text-white text-[10px] font-bold">
            {getOperarioName(getValue<string>()).split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <span className="font-medium text-sm">{getOperarioName(getValue<string>())}</span>
        </div>
      ),
    },
    {
      accessorKey: 'rutaId',
      header: 'Ruta',
      cell: ({ getValue }) => (
        <span className="text-sm">{getRutaName(getValue<string>())}</span>
      ),
    },
    {
      accessorKey: 'periodo',
      header: 'Periodo',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">{getValue<string>()}</span>
      ),
    },
    {
      id: 'avance',
      header: 'Avance',
      cell: ({ row }) => {
        const pct = row.original.porcentajeAvance || 0;
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="flex-1 h-1.5 bg-white/20 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0A84FF] to-[#30D158] rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-medium w-10 text-right">{pct.toFixed(0)}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ getValue }) => {
        const estado = getValue<string>();
        return (
          <GlassChip
            label={estado.charAt(0).toUpperCase() + estado.slice(1)}
            variant={estadoChipVariant[estado] || 'default'}
          />
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        if (row.original.estado !== 'activa') return null;
        return (
          <div className="flex items-center gap-1">
            <GlassButton
              variant="ghost"
              size="sm"
              icon={<CheckCircle2 className="h-4 w-4 text-[#30D158]" />}
              onClick={() => {
                if (user) {
                  updateAsignacion(row.original.id, { estado: 'completada' }, user.id).then(() => {
                    toast.success('Marcada como completada');
                    loadData();
                  });
                }
              }}
            />
            <GlassButton
              variant="ghost"
              size="sm"
              icon={<XCircle className="h-4 w-4 text-[#FF453A]" />}
              onClick={() => handleCancel(row.original.id)}
            />
          </div>
        );
      },
    },
  ];

  // Stats
  const totalAsignaciones = asignaciones.length;
  const activas = asignaciones.filter((a) => a.estado === 'activa').length;
  const completadas = asignaciones.filter((a) => a.estado === 'completada').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Asignaciones</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Asignación de rutas a operarios por periodo</p>
        </div>
        <div className="flex items-center gap-3">
          <GlassInput
            type="month"
            value={periodoFilter}
            onChange={(e) => setPeriodoFilter(e.target.value)}
            className="w-40"
          />
          <GlassButton icon={<Plus className="h-4 w-4" />} onClick={() => setShowModal(true)}>
            Nueva Asignación
          </GlassButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A84FF]/12 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-[#0A84FF]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{totalAsignaciones}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total asignaciones</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF9F0A]/12 flex items-center justify-center">
              <Route className="h-5 w-5 text-[#FF9F0A]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{activas}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Activas</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#30D158]/12 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-[#30D158]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{completadas}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Completadas</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Table */}
      {loading ? (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-[var(--text-tertiary)] animate-spin" />
          </div>
        </GlassCard>
      ) : (
        <DataTable
          data={asignaciones}
          columns={columns}
          searchPlaceholder="Buscar asignaciones..."
        />
      )}

      {/* Create Modal */}
      <GlassModal open={showModal} onClose={() => setShowModal(false)} title="Nueva Asignación" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <GlassSelect
            label="Operario"
            placeholder="Seleccione operario"
            options={operarios.map((o) => ({
              value: o.id,
              label: `${o.nombre} ${o.apellidos}`,
            }))}
            error={errors.operarioId?.message}
            {...register('operarioId')}
          />
          <GlassSelect
            label="Ruta"
            placeholder="Seleccione ruta"
            options={rutas.map((r) => ({
              value: r.id,
              label: `${r.codigo} - ${r.nombre}`,
            }))}
            error={errors.rutaId?.message}
            {...register('rutaId')}
          />
          <GlassInput
            label="Periodo"
            type="month"
            error={errors.periodo?.message}
            {...register('periodo')}
          />
          <div className="grid grid-cols-2 gap-4">
            <GlassInput
              label="Fecha inicio"
              type="date"
              error={errors.fechaInicio?.message}
              {...register('fechaInicio')}
            />
            <GlassInput
              label="Fecha fin"
              type="date"
              error={errors.fechaFin?.message}
              {...register('fechaFin')}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <GlassButton variant="secondary" type="button" onClick={() => setShowModal(false)}>
              Cancelar
            </GlassButton>
            <GlassButton type="submit" loading={submitting} icon={<Plus className="h-4 w-4" />}>
              Crear Asignación
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
