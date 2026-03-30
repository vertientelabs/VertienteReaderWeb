'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const ReadingLiveMap = dynamic(() => import('@/components/maps/reading-live-map'), { ssr: false });
import { BookOpen, Clock, CheckCircle2, AlertTriangle, Eye, XCircle, Search, Filter } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassInput from '@/components/ui/glass-input';
import GlassSelect from '@/components/ui/glass-select';
import GlassChip from '@/components/ui/glass-chip';
import DataTable from '@/components/shared/data-table';
import { useAuth } from '@/lib/hooks/use-auth';
import { getLecturas, validarLectura } from '@/lib/services/reading-service';
import { getMedidorById } from '@/lib/services/meter-service';
import { getUserById } from '@/lib/services/user-service';
import type { LecturaExtendida } from '@/lib/types';
import { toast } from 'sonner';

type LecturaRow = LecturaExtendida & {
  numeroMedidor?: string;
  operarioNombre?: string;
};

const anomaliaVariant: Record<string, 'danger' | 'warning' | 'success'> = {
  consumo_alto: 'danger',
  consumo_bajo: 'warning',
  medidor_parado: 'danger',
  retroceso: 'danger',
  ninguna: 'success',
};

const anomaliaLabel: Record<string, string> = {
  consumo_alto: 'Consumo Alto',
  consumo_bajo: 'Consumo Bajo',
  medidor_parado: 'Medidor Parado',
  retroceso: 'Retroceso',
  ninguna: 'Sin Anomalia',
};

const validacionVariant: Record<string, 'warning' | 'success' | 'danger' | 'purple'> = {
  pendiente: 'warning',
  validada: 'success',
  rechazada: 'danger',
  observada: 'purple',
};

const validacionLabel: Record<string, string> = {
  pendiente: 'Pendiente',
  validada: 'Validada',
  rechazada: 'Rechazada',
  observada: 'Observada',
};

const estadoValidacionOptions = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'validada', label: 'Validada' },
  { value: 'rechazada', label: 'Rechazada' },
  { value: 'observada', label: 'Observada' },
];

const anomaliaOptions = [
  { value: '', label: 'Todas' },
  { value: 'consumo_alto', label: 'Consumo Alto' },
  { value: 'consumo_bajo', label: 'Consumo Bajo' },
  { value: 'medidor_parado', label: 'Medidor Parado' },
  { value: 'retroceso', label: 'Retroceso' },
  { value: 'ninguna', label: 'Sin Anomalia' },
];

export default function LecturasPage() {
  const { user } = useAuth();
  const [lecturas, setLecturas] = useState<LecturaRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [estadoValidacion, setEstadoValidacion] = useState('');
  const [anomalia, setAnomalia] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const fetchLecturas = async () => {
    setLoading(true);
    try {
      const result = await getLecturas({
        estadoValidacion: estadoValidacion || undefined,
        anomalia: anomalia || undefined,
        fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
        fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
        pageSize: 50,
      });

      const rows = result.data as LecturaRow[];

      // Resolve medidor numbers and operario names in parallel
      const uniqueMedidorIds = [...new Set(rows.map((l) => l.medidorId).filter(Boolean))];
      const uniqueOperarioIds = [...new Set(rows.map((l) => l.operarioId).filter(Boolean))];

      const [medidorMap, operarioMap] = await Promise.all([
        resolveMap(uniqueMedidorIds, async (id) => {
          const m = await getMedidorById(id);
          return m?.numeroMedidor || id;
        }),
        resolveMap(uniqueOperarioIds, async (id) => {
          const u = await getUserById(id);
          return u ? `${u.nombre} ${u.apellidos}` : id;
        }),
      ]);

      for (const row of rows) {
        row.numeroMedidor = medidorMap.get(row.medidorId) || row.medidorId;
        row.operarioNombre = operarioMap.get(row.operarioId) || row.operarioId;
      }

      setLecturas(rows);
    } catch (err) {
      console.error('Error loading lecturas:', err);
      toast.error('Error al cargar lecturas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLecturas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleValidar = async (id: string, estado: 'validada' | 'rechazada') => {
    if (!user) return;
    try {
      await validarLectura(id, estado, user.id);
      toast.success(`Lectura ${estado === 'validada' ? 'validada' : 'rechazada'} correctamente`);
      fetchLecturas();
    } catch (err) {
      console.error('Error validando lectura:', err);
      toast.error('Error al validar lectura');
    }
  };

  const columns: ColumnDef<LecturaRow, unknown>[] = [
    {
      accessorKey: 'fechaHora',
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
      accessorKey: 'numeroMedidor',
      header: 'Medidor',
      cell: ({ row }) => (
        <span className="font-medium text-sm">{row.original.numeroMedidor || row.original.medidorId}</span>
      ),
    },
    {
      accessorKey: 'operarioNombre',
      header: 'Operario',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.operarioNombre || row.original.operarioId}</span>
      ),
    },
    {
      accessorKey: 'valorLectura',
      header: 'Lectura',
      cell: ({ getValue }) => (
        <span className="font-semibold text-sm">{getValue<number>()}</span>
      ),
    },
    {
      accessorKey: 'consumo',
      header: 'Consumo',
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue<number>()} m&sup3;</span>
      ),
    },
    {
      accessorKey: 'anomalia',
      header: 'Anomalia',
      cell: ({ getValue }) => {
        const val = getValue<string>();
        if (!val) return <span className="text-xs text-[var(--text-tertiary)]">—</span>;
        return (
          <GlassChip
            label={anomaliaLabel[val] || val}
            variant={anomaliaVariant[val] || 'default'}
          />
        );
      },
    },
    {
      accessorKey: 'estadoValidacion',
      header: 'Validacion',
      cell: ({ getValue }) => {
        const val = getValue<string>();
        return (
          <GlassChip
            label={validacionLabel[val] || val}
            variant={validacionVariant[val] || 'default'}
          />
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link href={`/lecturas/${row.original.id}`}>
            <GlassButton variant="ghost" size="sm" icon={<Eye className="h-4 w-4" />} />
          </Link>
          {row.original.estadoValidacion === 'pendiente' && (
            <>
              <GlassButton
                variant="ghost"
                size="sm"
                icon={<CheckCircle2 className="h-4 w-4 text-[#30D158]" />}
                onClick={() => handleValidar(row.original.id, 'validada')}
              />
              <GlassButton
                variant="ghost"
                size="sm"
                icon={<XCircle className="h-4 w-4 text-[#FF453A]" />}
                onClick={() => handleValidar(row.original.id, 'rechazada')}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  const stats = [
    {
      label: 'Total Lecturas',
      value: 2847,
      icon: BookOpen,
      gradient: 'from-[#0A84FF] to-[#5AC8FA]',
    },
    {
      label: 'Pendientes de Validacion',
      value: 456,
      icon: Clock,
      gradient: 'from-[#FF9F0A] to-[#FFD60A]',
    },
    {
      label: 'Validadas',
      value: 2168,
      icon: CheckCircle2,
      gradient: 'from-[#30D158] to-[#34C759]',
    },
    {
      label: 'Con Anomalia',
      value: 23,
      icon: AlertTriangle,
      gradient: 'from-[#FF453A] to-[#FF6961]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Control de Lecturas</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Monitoreo en tiempo real de lecturas de medidores
        </p>
      </div>

      {/* Filters */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-[var(--text-tertiary)]" />
          <span className="text-sm font-medium text-[var(--text-secondary)]">Filtros</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <GlassSelect
            label="Estado de Validacion"
            options={estadoValidacionOptions}
            value={estadoValidacion}
            onChange={(e) => setEstadoValidacion(e.target.value)}
          />
          <GlassSelect
            label="Anomalia"
            options={anomaliaOptions}
            value={anomalia}
            onChange={(e) => setAnomalia(e.target.value)}
          />
          <GlassInput
            label="Fecha Desde"
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
          <GlassInput
            label="Fecha Hasta"
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
          <div className="flex items-end">
            <GlassButton
              icon={<Search className="h-4 w-4" />}
              onClick={fetchLecturas}
            >
              Buscar
            </GlassButton>
          </div>
        </div>
      </GlassCard>

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

      {/* Table */}
      {loading ? (
        <GlassCard hover={false}>
          <div className="flex items-center justify-center py-16">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <BookOpen className="h-10 w-10 text-[var(--text-tertiary)]" />
              <p className="text-sm text-[var(--text-tertiary)]">Cargando lecturas...</p>
            </div>
          </div>
        </GlassCard>
      ) : (
        <DataTable
          data={lecturas}
          columns={columns}
          searchPlaceholder="Buscar lecturas..."
        />
      )}

      {/* Live Map */}
      {!loading && lecturas.length > 0 && (
        <GlassCard hover={false}>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
            Mapa de Lecturas en Tiempo Real
          </h3>
          <ReadingLiveMap lecturas={lecturas} />
        </GlassCard>
      )}
    </div>
  );
}

async function resolveMap(
  ids: string[],
  fetcher: (id: string) => Promise<string>
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const results = await Promise.all(ids.map((id) => fetcher(id).catch(() => id)));
  ids.forEach((id, i) => {
    map.set(id, results[i]);
  });
  return map;
}
