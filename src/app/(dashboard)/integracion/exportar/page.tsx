'use client';

import { useState } from 'react';
import {
  Download,
  FileText,
  FileJson,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassInput from '@/components/ui/glass-input';
import GlassSelect from '@/components/ui/glass-select';
import GlassChip from '@/components/ui/glass-chip';
import { useAuth } from '@/lib/hooks/use-auth';
import { getLecturas } from '@/lib/services/reading-service';
import { exportToCSV, exportToJSON, exportToXML, downloadFile } from '@/lib/services/export-service';
import type { LecturaExtendida } from '@/lib/types';

const formatOptions = [
  { value: 'CSV', label: 'CSV - Valores separados por coma' },
  { value: 'JSON', label: 'JSON - Estructura anidada con metadata' },
  { value: 'XML', label: 'XML - Formato estándar de facturación' },
];

export default function ExportarPage() {
  const { user } = useAuth();
  const [format, setFormat] = useState('CSV');
  const [periodo, setPeriodo] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [estadoFilter, setEstadoFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<LecturaExtendida[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const loadPreview = async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (estadoFilter) filters.estadoValidacion = estadoFilter;
      const result = await getLecturas({ ...filters, pageSize: 50 });
      setPreview(result.data);
      setShowPreview(true);
      toast.success(`${result.data.length} registros encontrados`);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (preview.length === 0) {
      toast.error('No hay datos para exportar. Use "Previsualizar" primero.');
      return;
    }

    const exportData = {
      periodo,
      empresa: user?.companiId || 'N/A',
      generadoPor: user ? `${user.nombre} ${user.apellidos}` : 'Sistema',
      lecturas: preview,
    };

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'JSON':
        content = exportToJSON(exportData);
        filename = `lecturas_${periodo}.json`;
        mimeType = 'application/json';
        break;
      case 'XML':
        content = exportToXML(exportData);
        filename = `lecturas_${periodo}.xml`;
        mimeType = 'application/xml';
        break;
      default:
        content = exportToCSV(exportData);
        filename = `lecturas_${periodo}.csv`;
        mimeType = 'text/csv';
    }

    downloadFile(content, filename, mimeType);
    toast.success(`Archivo ${filename} descargado`);
  };

  const FormatIcon = format === 'JSON' ? FileJson : format === 'XML' ? FileCode : FileText;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Exportar Datos</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Generar paquetes de datos de lecturas para integración con sistemas de facturación
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Config */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard hover={false} padding="lg">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
              Configuración de Exportación
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassInput
                label="Periodo"
                type="month"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              />
              <GlassSelect
                label="Formato"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                options={formatOptions}
              />
              <GlassSelect
                label="Estado de validación"
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                options={[
                  { value: '', label: 'Todos' },
                  { value: 'validada', label: 'Solo validadas' },
                  { value: 'pendiente', label: 'Solo pendientes' },
                ]}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <GlassButton
                variant="secondary"
                icon={<Eye className="h-4 w-4" />}
                onClick={loadPreview}
                loading={loading}
              >
                Previsualizar
              </GlassButton>
              <GlassButton
                icon={<Download className="h-4 w-4" />}
                onClick={handleExport}
                disabled={preview.length === 0}
              >
                Exportar {format}
              </GlassButton>
            </div>
          </GlassCard>

          {/* Preview */}
          {showPreview && (
            <GlassCard hover={false} padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)]">
                  Vista Previa ({preview.length} registros)
                </h3>
                {preview.length > 0 && (
                  <GlassChip label={`${format} listo`} variant="success" />
                )}
              </div>

              {preview.length === 0 ? (
                <div className="flex flex-col items-center py-8">
                  <AlertTriangle className="h-8 w-8 text-[#FF9F0A] mb-2" />
                  <p className="text-sm text-[var(--text-tertiary)]">No se encontraron lecturas con los filtros seleccionados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-tertiary)]">Medidor</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-tertiary)]">Lectura</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-tertiary)]">Consumo</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-tertiary)]">Estado</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--text-tertiary)]">Anomalía</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 10).map((l) => (
                        <tr key={l.id} className="border-b border-white/5">
                          <td className="px-3 py-2 font-mono text-xs">{l.medidorId}</td>
                          <td className="px-3 py-2">{l.valorLectura}</td>
                          <td className="px-3 py-2">{l.consumo} m³</td>
                          <td className="px-3 py-2">
                            <GlassChip label={l.estadoValidacion} variant={l.estadoValidacion === 'validada' ? 'success' : 'warning'} />
                          </td>
                          <td className="px-3 py-2">
                            <GlassChip
                              label={l.anomalia || 'ninguna'}
                              variant={l.anomalia && l.anomalia !== 'ninguna' ? 'danger' : 'default'}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length > 10 && (
                    <p className="text-xs text-[var(--text-tertiary)] text-center mt-3">
                      ... y {preview.length - 10} registros más
                    </p>
                  )}
                </div>
              )}
            </GlassCard>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <GlassCard hover={false}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#30D158] flex items-center justify-center">
                <FormatIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{format}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Formato seleccionado</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-[var(--text-tertiary)]">
              {format === 'CSV' && (
                <>
                  <p>Estructura tabular plana.</p>
                  <p>Compatible con Excel, sistemas de facturación y bases de datos.</p>
                  <p className="font-mono text-[10px] bg-white/10 p-2 rounded-lg mt-2">
                    PERIODO,COD_CLIENTE,LECTURA,...
                  </p>
                </>
              )}
              {format === 'JSON' && (
                <>
                  <p>Estructura anidada con metadata.</p>
                  <p>Ideal para APIs y sistemas modernos.</p>
                  <p className="font-mono text-[10px] bg-white/10 p-2 rounded-lg mt-2">
                    {'{"metadata":{...},"lecturas":[...]}'}
                  </p>
                </>
              )}
              {format === 'XML' && (
                <>
                  <p>Formato estándar de facturación.</p>
                  <p>Compatible con SUNAT y sistemas legados.</p>
                  <p className="font-mono text-[10px] bg-white/10 p-2 rounded-lg mt-2">
                    {'<PaqueteLecturas>...</PaqueteLecturas>'}
                  </p>
                </>
              )}
            </div>
          </GlassCard>

          <GlassCard hover={false}>
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Integridad</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                <span className="text-xs text-[var(--text-tertiary)]">
                  Hash SHA-256 incluido en metadata
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#30D158]" />
                <span className="text-xs text-[var(--text-tertiary)]">
                  Verificación de completitud
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
