'use client';

import { useState } from 'react';
import {
  FileText,
  User,
  MapPin,
  Users,
  BarChart3,
  Download,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassInput from '@/components/ui/glass-input';
import GlassSelect from '@/components/ui/glass-select';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  generateReporteIndividual,
  generateReporteZona,
  generateReporteOperario,
  generateReporteEjecutivo,
} from '@/lib/services/report-service';

const reportTypes = [
  {
    id: 'individual',
    title: 'Reporte Individual de Cliente',
    description: 'Historial de consumo, gráfico de tendencia y estadísticas de un cliente específico.',
    icon: User,
    color: 'from-[#0A84FF] to-[#64D2FF]',
    fields: ['clienteId'],
  },
  {
    id: 'zona',
    title: 'Reporte por Zona',
    description: 'Resumen de consumo, top consumidores y anomalías de una zona completa.',
    icon: MapPin,
    color: 'from-[#30D158] to-[#64D2FF]',
    fields: ['zonaId'],
  },
  {
    id: 'operario',
    title: 'Reporte de Operario',
    description: 'Productividad, tiempos, rutas cubiertas e incidencias del operario.',
    icon: Users,
    color: 'from-[#BF5AF2] to-[#0A84FF]',
    fields: ['operarioId'],
  },
  {
    id: 'ejecutivo',
    title: 'Reporte Ejecutivo del Periodo',
    description: 'KPIs, comparativa, gráficos de distribución e indicadores de eficiencia.',
    icon: BarChart3,
    color: 'from-[#FF9F0A] to-[#FF453A]',
    fields: ['periodo'],
  },
];

export default function ReportesPage() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [entityId, setEntityId] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedType) return;
    if (selectedType !== 'ejecutivo' && !entityId) {
      toast.error('Ingresa el ID de la entidad');
      return;
    }
    setGenerating(true);
    try {
      let doc;
      switch (selectedType) {
        case 'individual':
          doc = await generateReporteIndividual(entityId, periodo);
          break;
        case 'zona':
          doc = await generateReporteZona(entityId, periodo);
          break;
        case 'operario':
          doc = await generateReporteOperario(entityId, periodo);
          break;
        case 'ejecutivo':
          doc = await generateReporteEjecutivo(periodo, user?.companiId || '');
          break;
      }
      if (doc) {
        doc.save(`reporte_${selectedType}_${periodo}.pdf`);
        toast.success('Reporte PDF generado y descargado');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setGenerating(false);
    }
  };

  const selected = reportTypes.find((r) => r.id === selectedType);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reportes de Consumo</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Generación de reportes PDF para análisis y distribución
        </p>
      </div>

      {/* Report type selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          return (
            <GlassCard
              key={type.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-[#0A84FF] ring-offset-2 ring-offset-transparent' : ''
              }`}
              onClick={() => setSelectedType(type.id)}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1">{type.title}</h3>
              <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">{type.description}</p>
            </GlassCard>
          );
        })}
      </div>

      {/* Configuration */}
      {selected && (
        <GlassCard hover={false} padding="lg">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">
            Configurar: {selected.title}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassInput
              label="Periodo"
              type="month"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
            />
            {selected.fields.includes('clienteId') && (
              <GlassInput
                label="ID del Cliente"
                placeholder="ID del cliente"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
              />
            )}
            {selected.fields.includes('zonaId') && (
              <GlassInput
                label="ID de Zona"
                placeholder="ID de la zona"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
              />
            )}
            {selected.fields.includes('operarioId') && (
              <GlassInput
                label="ID del Operario"
                placeholder="ID del operario"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
              />
            )}
            <GlassSelect
              label="Formato"
              options={[{ value: 'PDF', label: 'PDF' }]}
              value="PDF"
              onChange={() => {}}
            />
          </div>
          <div className="flex gap-3 mt-6">
            <GlassButton
              icon={generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              onClick={handleGenerate}
              loading={generating}
            >
              Generar Reporte PDF
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* IA Reports Section */}
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Reportes con IA</h2>
        <p className="text-sm text-[var(--text-tertiary)] mb-4">
          Reportes avanzados generados con analisis inteligente
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Reporte ANF por Sector', desc: 'Agua No Facturada con drill-down por zona y localidad.', icon: '💧', color: 'from-[#0A84FF] to-[#64D2FF]' },
            { title: 'Reporte de Anomalias', desc: 'Anomalias detectadas con clasificacion y recomendaciones IA.', icon: '🔍', color: 'from-[#FF453A] to-[#FF9F0A]' },
            { title: 'Prediccion vs Real', desc: 'Comparativa de consumo predicho vs real con precision del modelo.', icon: '📈', color: 'from-[#30D158] to-[#64D2FF]' },
            { title: 'Eficiencia Micromedicion', desc: 'Indicadores de micromedicion, cobertura y operatividad.', icon: '⚡', color: 'from-[#FF9F0A] to-[#FFD60A]' },
            { title: 'Medidores a Renovar', desc: 'Medidores candidatos a renovacion por antiguedad y deterioro.', icon: '🔧', color: 'from-[#BF5AF2] to-[#0A84FF]' },
            { title: 'Score de Riesgo', desc: 'Conexiones con mayor riesgo de fraude, fuga o deterioro.', icon: '🛡️', color: 'from-[#FF453A] to-[#BF5AF2]' },
          ].map((report) => (
            <GlassCard key={report.title} className="cursor-pointer group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center mb-3 text-lg`}>
                {report.icon}
              </div>
              <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1">{report.title}</h3>
              <p className="text-xs text-[var(--text-tertiary)] leading-relaxed mb-3">{report.desc}</p>
              <span className="text-xs font-medium text-[var(--accent)] group-hover:underline">
                Proximamente
              </span>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Info */}
      <GlassCard hover={false} variant="flat">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-[var(--text-tertiary)] mt-0.5" />
          <div className="text-xs text-[var(--text-tertiary)] space-y-1">
            <p>Los reportes incluyen logo y membrete de la empresa configurados en Configuracion.</p>
            <p>Se generan automaticamente al cierre de cada periodo de facturacion.</p>
            <p>Los reportes con IA se alimentan de los resultados del motor de deteccion de anomalias y prediccion.</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
