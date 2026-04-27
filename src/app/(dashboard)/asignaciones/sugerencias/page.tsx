'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { getAsignaciones } from '@/lib/services/assignment-service';
import { getRutas } from '@/lib/services/route-service';
import { getUsers } from '@/lib/services/user-service';
import Breadcrumb from '@/components/layout/breadcrumb';
import GlassCard from '@/components/ui/glass-card';
import GlassButton from '@/components/ui/glass-button';
import GlassChip from '@/components/ui/glass-chip';
import KpiCard from '@/components/charts/kpi-card';
import { Users, ArrowRight, CheckCircle2, XCircle, Zap, Brain } from 'lucide-react';
import type { Ruta, Usuario } from '@/lib/types';
import { toast } from 'sonner';

interface Sugerencia {
  id: string;
  operarioId: string;
  operarioNombre: string;
  rutaActualId: string;
  rutaActualNombre: string;
  rutaSugeridaId: string;
  rutaSugeridaNombre: string;
  razon: string;
  impactoEstimado: string;
}

export default function SugerenciasAsignacionPage() {
  const { user } = useAuth();
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    generateSugerencias();
  }, [user]);

  const generateSugerencias = async () => {
    try {
      setLoading(true);
      const [rutas, usersResult] = await Promise.all([
        getRutas(user!.companiId),
        getUsers({ companiId: user!.companiId, usertype: 'operario' as any }),
      ]);

      const operarios = usersResult.data.filter(u => u.usertype === 'operario' && u.activo);
      const rutaMap = new Map(rutas.map(r => [r.id, r]));

      // Generate intelligent suggestions based on routes and operarios
      const suggestions: Sugerencia[] = [];

      // Find routes with high medidores count and suggest redistribution
      const sortedRutas = [...rutas].filter(r => r.activo).sort((a, b) => b.totalMedidores - a.totalMedidores);
      const avgMedidores = sortedRutas.length > 0
        ? sortedRutas.reduce((s, r) => s + r.totalMedidores, 0) / sortedRutas.length
        : 0;

      for (let i = 0; i < Math.min(3, operarios.length); i++) {
        const heavyRoute = sortedRutas[i];
        const lightRoute = sortedRutas[sortedRutas.length - 1 - i];
        if (!heavyRoute || !lightRoute || heavyRoute.id === lightRoute.id) continue;

        if (heavyRoute.totalMedidores > avgMedidores * 1.3 && lightRoute.totalMedidores < avgMedidores * 0.7) {
          const operario = operarios[i % operarios.length];
          if (operario) {
            suggestions.push({
              id: `sug-${i}`,
              operarioId: operario.id,
              operarioNombre: `${operario.nombre} ${operario.apellidos}`,
              rutaActualId: lightRoute.id,
              rutaActualNombre: `${lightRoute.codigo} - ${lightRoute.nombre}`,
              rutaSugeridaId: heavyRoute.id,
              rutaSugeridaNombre: `${heavyRoute.codigo} - ${heavyRoute.nombre}`,
              razon: `Ruta ${heavyRoute.codigo} tiene ${heavyRoute.totalMedidores} medidores (${Math.round((heavyRoute.totalMedidores / avgMedidores - 1) * 100)}% sobre el promedio). Se sugiere reasignar operario para balancear carga.`,
              impactoEstimado: `Reduccion de ${Math.round((heavyRoute.totalMedidores - avgMedidores) * 0.3)} lecturas pendientes estimadas`,
            });
          }
        }
      }

      // If no data-based suggestions, add helpful defaults
      if (suggestions.length === 0 && operarios.length > 0 && rutas.length > 0) {
        suggestions.push({
          id: 'sug-default',
          operarioId: operarios[0].id,
          operarioNombre: `${operarios[0].nombre} ${operarios[0].apellidos}`,
          rutaActualId: rutas[0].id,
          rutaActualNombre: `${rutas[0].codigo} - ${rutas[0].nombre}`,
          rutaSugeridaId: rutas[rutas.length > 1 ? 1 : 0].id,
          rutaSugeridaNombre: `${rutas[rutas.length > 1 ? 1 : 0].codigo} - ${rutas[rutas.length > 1 ? 1 : 0].nombre}`,
          razon: 'Sugerencia de rotacion periodica para mejorar cobertura y conocimiento de zonas.',
          impactoEstimado: 'Mejora en versatilidad del equipo operativo',
        });
      }

      setSugerencias(suggestions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (id: string) => {
    setAccepted(prev => new Set(prev).add(id));
    toast.success('Sugerencia aceptada. Debe crear la asignacion manualmente.');
  };

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set(prev).add(id));
    toast.info('Sugerencia descartada');
  };

  const activeSugerencias = sugerencias.filter(s => !dismissed.has(s.id));

  return (
    <div className="space-y-4 sm:space-y-6">
      <Breadcrumb />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Brain className="h-6 w-6 text-[#BF5AF2]" />
            Sugerencias de Asignacion
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Recomendaciones inteligentes para reasignacion de operarios
          </p>
        </div>
        <GlassButton
          variant="secondary"
          size="sm"
          icon={<Zap className="h-4 w-4" />}
          onClick={generateSugerencias}
          loading={loading}
        >
          Regenerar
        </GlassButton>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <KpiCard
          title="Sugerencias"
          value={activeSugerencias.length}
          icon={Brain}
          color="from-[#BF5AF2] to-[#0A84FF]"
        />
        <KpiCard
          title="Aceptadas"
          value={accepted.size}
          icon={CheckCircle2}
          color="from-[#30D158] to-[#64D2FF]"
        />
        <KpiCard
          title="Descartadas"
          value={dismissed.size}
          icon={XCircle}
          color="from-[#8E8E93] to-[#8E8E93]"
        />
      </div>

      {/* Sugerencias list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-white/20 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : activeSugerencias.length === 0 ? (
        <GlassCard hover={false}>
          <p className="text-center py-12 text-sm text-[var(--text-tertiary)]">
            No hay sugerencias disponibles en este momento. Las sugerencias se generan basandose en la distribucion de carga de rutas.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {activeSugerencias.map((s) => (
            <GlassCard key={s.id} hover={false}>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-[var(--text-tertiary)]" />
                    <span className="font-semibold text-[var(--text-primary)]">{s.operarioNombre}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <GlassChip label={s.rutaActualNombre} variant="default" />
                    <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)]" />
                    <GlassChip label={s.rutaSugeridaNombre} variant="primary" />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{s.razon}</p>
                  <p className="text-xs text-[#30D158] mt-1 font-medium">{s.impactoEstimado}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {accepted.has(s.id) ? (
                    <GlassChip label="Aceptada" variant="success" size="md" />
                  ) : (
                    <>
                      <GlassButton
                        variant="success"
                        size="sm"
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        onClick={() => handleAccept(s.id)}
                      >
                        Aceptar
                      </GlassButton>
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        icon={<XCircle className="h-4 w-4" />}
                        onClick={() => handleDismiss(s.id)}
                      >
                        Descartar
                      </GlassButton>
                    </>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
