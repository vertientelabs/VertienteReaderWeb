'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  AnalyticsAnomalia,
  AnalyticsKpi,
  ScoreRiesgo,
  ConfiguracionIA,
} from '@/lib/types';
import type {
  TipoAnomaliaIAType,
  SeveridadAnomaliaType,
  EstadoAnomaliaIAType,
} from '@/lib/types';
import {
  getAnomalias,
  getLatestKpi,
  getKpis,
  getScoresRiesgo,
  getAnomaliasSummary,
  updateAnomaliaEstado,
  getConfiguracionIA,
  saveConfiguracionIA,
  batchAnalyzeReadings,
} from '@/lib/services/analytics-service';

export function useAnalytics(companiId: string | undefined) {
  const [kpi, setKpi] = useState<AnalyticsKpi | null>(null);
  const [anomalias, setAnomalias] = useState<AnalyticsAnomalia[]>([]);
  const [scores, setScores] = useState<ScoreRiesgo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!companiId) return;
    try {
      setLoading(true);
      const [latestKpi, anomaliasRes, scoresRes] = await Promise.all([
        getLatestKpi(companiId),
        getAnomalias({ companiId, limitCount: 20 }),
        getScoresRiesgo({ companiId, limitCount: 20 }),
      ]);
      setKpi(latestKpi);
      setAnomalias(anomaliasRes.data);
      setScores(scoresRes);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [companiId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { kpi, anomalias, scores, loading, error, refresh };
}

export function useAnomaliasList(filters: {
  companiId?: string;
  zonaId?: string;
  tipoAnomalia?: TipoAnomaliaIAType;
  severidad?: SeveridadAnomaliaType;
  estado?: EstadoAnomaliaIAType;
  periodo?: string;
}) {
  const [data, setData] = useState<AnalyticsAnomalia[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!filters.companiId) return;
    try {
      setLoading(true);
      const result = await getAnomalias({
        companiId: filters.companiId,
        zonaId: filters.zonaId,
        tipoAnomalia: filters.tipoAnomalia,
        severidad: filters.severidad,
        estado: filters.estado,
        periodo: filters.periodo,
      });
      setData(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error('Error loading anomalias:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.companiId, filters.zonaId, filters.tipoAnomalia, filters.severidad, filters.estado, filters.periodo]);

  useEffect(() => {
    load();
  }, [load]);

  const updateEstado = async (id: string, estado: EstadoAnomaliaIAType, userId: string, resolucion?: string) => {
    await updateAnomaliaEstado(id, estado, userId, resolucion);
    await load();
  };

  return { data, total, loading, refresh: load, updateEstado };
}

export function useAnomaliasDashboard(companiId: string | undefined, periodo?: string) {
  const [resumen, setResumen] = useState<{
    total: number;
    porTipo: Record<string, number>;
    porSeveridad: Record<string, number>;
    porEstado: Record<string, number>;
    porZona: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companiId) return;
    setLoading(true);
    getAnomaliasSummary(companiId, periodo)
      .then((r) => setResumen({ total: r.total, porTipo: r.porTipo, porSeveridad: r.porSeveridad, porEstado: r.porEstado, porZona: r.porZona }))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [companiId, periodo]);

  return { resumen, loading };
}

export function useScoresRiesgo(filters: {
  companiId?: string;
  zonaId?: string;
  minScore?: number;
}) {
  const [data, setData] = useState<ScoreRiesgo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!filters.companiId) return;
    setLoading(true);
    getScoresRiesgo({
      companiId: filters.companiId,
      zonaId: filters.zonaId,
      minScore: filters.minScore,
      limitCount: 50,
    })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.companiId, filters.zonaId, filters.minScore]);

  return { data, loading };
}

export function useConfiguracionIA(companiId: string | undefined) {
  const [config, setConfig] = useState<ConfiguracionIA | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companiId) return;
    setLoading(true);
    getConfiguracionIA(companiId)
      .then(setConfig)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [companiId]);

  const save = async (data: Partial<ConfiguracionIA>, userId: string) => {
    if (!companiId) return;
    await saveConfiguracionIA(companiId, data, userId);
    const updated = await getConfiguracionIA(companiId);
    setConfig(updated);
  };

  return { config, loading, save };
}

export function useBatchAnalysis() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    totalAnalizadas: number;
    anomaliasDetectadas: number;
    scoresActualizados: number;
  } | null>(null);

  const run = async (companiId: string, periodo: string) => {
    setRunning(true);
    try {
      const res = await batchAnalyzeReadings(companiId, periodo);
      setResult(res);
      return res;
    } finally {
      setRunning(false);
    }
  };

  return { running, result, run };
}
