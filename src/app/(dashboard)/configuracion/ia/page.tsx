'use client';

import { useState } from 'react';
import { useAuth, useHasRole } from '@/lib/hooks/use-auth';
import { useConfiguracionIA, useBatchAnalysis } from '@/lib/hooks/use-analytics';
import { CardSkeleton as LoadingSkeleton } from '@/components/shared/loading-skeleton';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import { toast } from 'sonner';
import { Settings, Play, Save, Brain } from 'lucide-react';

export default function ConfiguracionIAPage() {
  const { user } = useAuth();
  const isAdmin = useHasRole('root', 'administrador');
  const { config, loading, save } = useConfiguracionIA(user?.companiId);
  const { running, result, run } = useBatchAnalysis();
  const [saving, setSaving] = useState(false);
  const [periodo, setPeriodo] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Local form state
  const [form, setForm] = useState<{
    consumoAlto: number;
    consumoBajo: number;
    consumoCero: number;
    variacionEstacional: number;
    scoreRiesgoAlto: number;
    scoreRiesgoCritico: number;
    pesoFraude: number;
    pesoFuga: number;
    pesoMedidor: number;
    frecuencia: string;
  } | null>(null);

  const getForm = () => {
    if (form) return form;
    if (!config) return null;
    return {
      consumoAlto: config.umbrales.consumoAlto,
      consumoBajo: config.umbrales.consumoBajo,
      consumoCero: config.umbrales.consumoCero,
      variacionEstacional: config.umbrales.variacionEstacional,
      scoreRiesgoAlto: config.umbrales.scoreRiesgoAlto,
      scoreRiesgoCritico: config.umbrales.scoreRiesgoCritico,
      pesoFraude: config.pesos.fraude * 100,
      pesoFuga: config.pesos.fuga * 100,
      pesoMedidor: config.pesos.medidorDeteriorado * 100,
      frecuencia: config.alertas.frecuencia,
    };
  };

  const currentForm = getForm();

  const handleSave = async () => {
    if (!user || !currentForm) return;
    setSaving(true);
    try {
      await save({
        umbrales: {
          consumoAlto: currentForm.consumoAlto,
          consumoBajo: currentForm.consumoBajo,
          consumoCero: currentForm.consumoCero,
          variacionEstacional: currentForm.variacionEstacional,
          scoreRiesgoAlto: currentForm.scoreRiesgoAlto,
          scoreRiesgoCritico: currentForm.scoreRiesgoCritico,
        },
        pesos: {
          fraude: currentForm.pesoFraude / 100,
          fuga: currentForm.pesoFuga / 100,
          medidorDeteriorado: currentForm.pesoMedidor / 100,
        },
        alertas: {
          emailHabilitado: false,
          pushHabilitado: false,
          destinatarios: [],
          frecuencia: currentForm.frecuencia as 'inmediata' | 'diaria' | 'semanal',
        },
      }, user.id);
      toast.success('Configuracion guardada correctamente');
    } catch (err) {
      toast.error('Error al guardar configuracion');
    } finally {
      setSaving(false);
    }
  };

  const handleBatchRun = async () => {
    if (!user) return;
    try {
      const res = await run(user.companiId, periodo);
      if (res) {
        toast.success(
          `Analisis completado: ${res.totalAnalizadas} lecturas, ${res.anomaliasDetectadas} anomalias, ${res.scoresActualizados} scores`
        );
      }
    } catch (err) {
      toast.error('Error al ejecutar analisis');
    }
  };

  const updateForm = (field: string, value: number | string) => {
    setForm((prev) => ({ ...(prev || getForm()!), [field]: value }));
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-tertiary)]">No tienes permisos para acceder a esta seccion</p>
      </div>
    );
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Brain className="h-6 w-6 text-[#BF5AF2]" />
            Configuracion IA
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Parametros del motor de deteccion de anomalias y scoring
          </p>
        </div>
        <GlassButton
          variant="primary"
          size="sm"
          icon={<Save className="h-4 w-4" />}
          loading={saving}
          onClick={handleSave}
        >
          Guardar
        </GlassButton>
      </div>

      {currentForm && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Umbrales de Deteccion */}
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4 text-[var(--text-tertiary)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Umbrales de Deteccion</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--text-tertiary)] block mb-1">
                  Consumo Alto (% del promedio)
                </label>
                <input
                  type="number"
                  className="glass-input w-full text-sm"
                  value={currentForm.consumoAlto}
                  onChange={(e) => updateForm('consumoAlto', Number(e.target.value))}
                />
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Si el consumo supera este % del promedio historico, se marca como anomalia alta</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-tertiary)] block mb-1">
                  Consumo Bajo (% del promedio)
                </label>
                <input
                  type="number"
                  className="glass-input w-full text-sm"
                  value={currentForm.consumoBajo}
                  onChange={(e) => updateForm('consumoBajo', Number(e.target.value))}
                />
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Si el consumo es menor a este % del promedio, se marca como submedicion</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-tertiary)] block mb-1">
                  Periodos Consumo Cero
                </label>
                <input
                  type="number"
                  className="glass-input w-full text-sm"
                  value={currentForm.consumoCero}
                  onChange={(e) => updateForm('consumoCero', Number(e.target.value))}
                />
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Periodos consecutivos con consumo 0 para generar alerta</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-tertiary)] block mb-1">
                  Variacion Estacional (%)
                </label>
                <input
                  type="number"
                  className="glass-input w-full text-sm"
                  value={currentForm.variacionEstacional}
                  onChange={(e) => updateForm('variacionEstacional', Number(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--text-tertiary)] block mb-1">
                    Score Riesgo Alto
                  </label>
                  <input
                    type="number"
                    className="glass-input w-full text-sm"
                    value={currentForm.scoreRiesgoAlto}
                    onChange={(e) => updateForm('scoreRiesgoAlto', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-tertiary)] block mb-1">
                    Score Riesgo Critico
                  </label>
                  <input
                    type="number"
                    className="glass-input w-full text-sm"
                    value={currentForm.scoreRiesgoCritico}
                    onChange={(e) => updateForm('scoreRiesgoCritico', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Pesos Score de Riesgo */}
          <div className="space-y-4">
            <GlassCard hover={false}>
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Pesos del Score de Riesgo</h3>
              <p className="text-xs text-[var(--text-tertiary)] mb-4">La suma debe ser 100%</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[var(--text-tertiary)] block mb-1">
                    Peso Fraude (%)
                  </label>
                  <input
                    type="number"
                    className="glass-input w-full text-sm"
                    value={currentForm.pesoFraude}
                    onChange={(e) => updateForm('pesoFraude', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-tertiary)] block mb-1">
                    Peso Fuga (%)
                  </label>
                  <input
                    type="number"
                    className="glass-input w-full text-sm"
                    value={currentForm.pesoFuga}
                    onChange={(e) => updateForm('pesoFuga', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-tertiary)] block mb-1">
                    Peso Medidor Deteriorado (%)
                  </label>
                  <input
                    type="number"
                    className="glass-input w-full text-sm"
                    value={currentForm.pesoMedidor}
                    onChange={(e) => updateForm('pesoMedidor', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="mt-3 text-xs text-[var(--text-tertiary)]">
                Total: {(currentForm.pesoFraude + currentForm.pesoFuga + currentForm.pesoMedidor).toFixed(0)}%
                {currentForm.pesoFraude + currentForm.pesoFuga + currentForm.pesoMedidor !== 100 && (
                  <span className="text-[#FF453A] ml-2">(debe ser 100%)</span>
                )}
              </div>
            </GlassCard>

            {/* Batch Analysis */}
            <GlassCard hover={false}>
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Ejecutar Analisis Batch</h3>
              <p className="text-xs text-[var(--text-tertiary)] mb-4">
                Procesa todas las lecturas de un periodo para detectar anomalias y calcular scores de riesgo.
              </p>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium text-[var(--text-tertiary)] block mb-1">Periodo</label>
                  <input
                    type="month"
                    className="glass-input w-full text-sm"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                  />
                </div>
                <GlassButton
                  variant="primary"
                  size="sm"
                  icon={<Play className="h-4 w-4" />}
                  loading={running}
                  onClick={handleBatchRun}
                >
                  Ejecutar
                </GlassButton>
              </div>
              {result && (
                <div className="mt-4 p-3 rounded-xl bg-[#30D158]/8 border border-[#30D158]/20">
                  <p className="text-sm font-medium text-[#30D158] mb-1">Resultado</p>
                  <div className="text-sm text-[var(--text-secondary)] space-y-1">
                    <p>Lecturas analizadas: <strong>{result.totalAnalizadas}</strong></p>
                    <p>Anomalias detectadas: <strong>{result.anomaliasDetectadas}</strong></p>
                    <p>Scores actualizados: <strong>{result.scoresActualizados}</strong></p>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
