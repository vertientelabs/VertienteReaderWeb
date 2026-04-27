'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, Eye, Pencil, Upload, Download, FileUp, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import GlassModal from '@/components/ui/glass-modal';
import DataTable from '@/components/shared/data-table';
import { getClientes, createCliente } from '@/lib/services/client-service';
import { useAuth } from '@/lib/hooks/use-auth';
import { Cliente } from '@/lib/types';

const estadoVariant: Record<string, 'success' | 'default' | 'danger'> = {
  activo: 'success',
  inactivo: 'default',
  suspendido: 'danger',
};

type ClienteRow = Cliente & { zonaNombre: string };

const columns: ColumnDef<ClienteRow, unknown>[] = [
  {
    accessorKey: 'nombreCompleto',
    header: 'Nombre Completo',
  },
  {
    accessorKey: 'numeroDocumento',
    header: 'N° Documento',
  },
  {
    accessorKey: 'tipoDocumento',
    header: 'Tipo Doc.',
  },
  {
    accessorKey: 'direccion',
    header: 'Dirección',
  },
  {
    accessorKey: 'zonaNombre',
    header: 'Zona',
    cell: ({ getValue }) => (
      <span className="text-[var(--text-secondary)]">{getValue<string>() || '—'}</span>
    ),
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => {
      const estado = row.getValue('estado') as string;
      return (
        <GlassChip
          label={estado.charAt(0).toUpperCase() + estado.slice(1)}
          variant={estadoVariant[estado] ?? 'default'}
        />
      );
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const cliente = row.original;
      return (
        <div className="flex items-center gap-1">
          <Link href={`/clientes/${cliente.id}`}>
            <GlassButton variant="ghost" size="sm" icon={<Eye className="h-4 w-4 text-[#0A84FF]" />} />
          </Link>
          <Link href={`/clientes/${cliente.id}/editar`}>
            <GlassButton variant="ghost" size="sm" icon={<Pencil className="h-4 w-4 text-[#FF9F0A]" />} />
          </Link>
        </div>
      );
    },
    enableSorting: false,
  },
];

interface CSVRow {
  tipoDocumento?: string;
  numeroDocumento?: string;
  nombreCompleto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
  zonaId?: string;
  referencia?: string;
  latitud?: string;
  longitud?: string;
}

export default function ClientesPage() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<ClienteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [csvRows, setCsvRows] = useState<CSVRow[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    try {
      setLoading(true);
      const result = await getClientes({ pageSize: 100 });

      // Resolve zona names - collect unique zonaIds first
      const zonaIds = [...new Set(result.data.map((c) => c.zonaId).filter(Boolean))];
      const zonaNameMap: Record<string, string> = {};

      await Promise.all(
        zonaIds.map(async (zId) => {
          try {
            const snap = await getDoc(doc(db, 'zonas', zId));
            if (snap.exists()) {
              zonaNameMap[zId] = snap.data().nombre || zId;
            } else {
              zonaNameMap[zId] = zId;
            }
          } catch {
            zonaNameMap[zId] = zId;
          }
        })
      );

      const clientesWithZona = result.data.map((c) => ({
        ...c,
        zonaNombre: c.zonaId ? (zonaNameMap[c.zonaId] || c.zonaId) : '—',
      }));

      setClientes(clientesWithZona);
    } catch (error) {
      console.error('Error fetching clientes:', error);
    } finally {
      setLoading(false);
    }
  }

  // ---- EXPORT ----
  const handleExport = () => {
    if (clientes.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    const rows = clientes.map((c) => ({
      nombreCompleto: c.nombreCompleto,
      numeroDocumento: c.numeroDocumento,
      tipoDocumento: c.tipoDocumento,
      direccion: c.direccion,
      zonaId: c.zonaId,
      estado: c.estado,
      telefono: c.telefono || '',
      email: c.email || '',
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${rows.length} clientes exportados a CSV`);
  };

  // ---- IMPORT ----
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error('Error al leer CSV: ' + results.errors[0].message);
          return;
        }
        setCsvRows(results.data);
        setShowImport(true);
      },
    });
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImport = async () => {
    if (!user) return;
    setImporting(true);
    let success = 0;
    let errors = 0;

    for (const row of csvRows) {
      try {
        if (!row.nombreCompleto || !row.numeroDocumento) {
          errors++;
          continue;
        }
        await createCliente({
          tipoDocumento: (row.tipoDocumento as 'DNI' | 'RUC' | 'CE' | 'PASAPORTE') || 'DNI',
          numeroDocumento: row.numeroDocumento,
          nombreCompleto: row.nombreCompleto,
          telefono: row.telefono || undefined,
          email: row.email || undefined,
          direccion: row.direccion || '',
          departamentoId: row.departamentoId || '',
          provinciaId: row.provinciaId || '',
          distritoId: row.distritoId || '',
          zonaId: row.zonaId || '',
          referencia: row.referencia || undefined,
          latitud: parseFloat(row.latitud || '0') || 0,
          longitud: parseFloat(row.longitud || '0') || 0,
          estado: 'activo',
          companiId: user.companiCli || user.companiId || '',
          createdBy: user.id,
        }, user.id);
        success++;
      } catch {
        errors++;
      }
    }

    setImporting(false);
    setShowImport(false);
    setCsvRows([]);

    if (success > 0) toast.success(`${success} clientes importados correctamente`);
    if (errors > 0) toast.error(`${errors} registros con errores`);
    fetchClientes();
  };

  const previewRows = csvRows.slice(0, 5);
  const previewCols = ['nombreCompleto', 'numeroDocumento', 'tipoDocumento', 'direccion', 'zonaId'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Clientes</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Gestión de clientes del servicio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton
            variant="ghost"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExport}
          >
            Exportar
          </GlassButton>
          <label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileSelect}
            />
            <GlassButton
              variant="secondary"
              icon={<Upload className="h-4 w-4" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Importar CSV
            </GlassButton>
          </label>
          <Link href="/clientes/nuevo">
            <GlassButton icon={<Plus className="h-4 w-4" />}>Nuevo Cliente</GlassButton>
          </Link>
        </div>
      </div>

      <GlassCard hover={false} padding="none">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0A84FF] border-t-transparent" />
              <p className="text-sm text-[var(--text-tertiary)]">Cargando clientes...</p>
            </div>
          </div>
        ) : (
          <DataTable data={clientes} columns={columns} searchPlaceholder="Buscar cliente..." />
        )}
      </GlassCard>

      {/* Import Modal */}
      <GlassModal open={showImport} onClose={() => { setShowImport(false); setCsvRows([]); }} title="Importar Clientes desde CSV" size="lg">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <FileUp className="h-4 w-4 text-[#0A84FF]" />
            <span>{csvRows.length} registros encontrados en el archivo</span>
          </div>

          {/* Preview table */}
          {previewRows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/10 dark:bg-white/5">
                    {previewCols.map((col) => (
                      <th key={col} className="px-3 py-2 text-left font-medium text-[var(--text-secondary)]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="border-t border-white/5">
                      {previewCols.map((col) => (
                        <td key={col} className="px-3 py-2 text-[var(--text-primary)]">
                          {(row as Record<string, string>)[col] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {csvRows.length > 5 && (
                <p className="text-xs text-[var(--text-tertiary)] px-3 py-2">
                  ... y {csvRows.length - 5} registros más
                </p>
              )}
            </div>
          )}

          {/* Validation hints */}
          <div className="text-xs space-y-1 text-[var(--text-tertiary)]">
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>Columnas requeridas: nombreCompleto, numeroDocumento</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-[#30D158]" />
              <span>Columnas opcionales: tipoDocumento, telefono, email, direccion, zonaId, latitud, longitud</span>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <GlassButton variant="ghost" onClick={() => { setShowImport(false); setCsvRows([]); }}>
              Cancelar
            </GlassButton>
            <GlassButton
              icon={importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              onClick={handleImport}
              loading={importing}
            >
              Importar {csvRows.length} Clientes
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
