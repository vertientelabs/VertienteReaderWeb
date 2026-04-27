import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  setDoc,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  analyticsAnomaliasCol,
  analyticsKpisCol,
  analyticsScoresRiesgoCol,
  configuracionIaCol,
  medidoresCol,
  lecturasCol,
  zonasCol,
} from '@/lib/firebase/collections';
import type {
  AnalyticsAnomalia,
  AnalyticsKpi,
  ScoreRiesgo,
  ConfiguracionIA,
  LecturaExtendida,
  Medidor,
  Zona,
  ZonaKpi,
  OperarioKpi,
} from '@/lib/types';
import type {
  TipoAnomaliaIAType,
  SeveridadAnomaliaType,
  EstadoAnomaliaIAType,
} from '@/lib/types';

// ============================================
// DEFAULT IA CONFIG
// ============================================

export const DEFAULT_IA_CONFIG: Omit<ConfiguracionIA, 'id' | 'companiId' | 'updatedAt' | 'updatedBy'> = {
  umbrales: {
    consumoAlto: 200,
    consumoBajo: 20,
    consumoCero: 2,
    variacionEstacional: 30,
    scoreRiesgoAlto: 70,
    scoreRiesgoCritico: 85,
  },
  pesos: {
    fraude: 0.4,
    fuga: 0.3,
    medidorDeteriorado: 0.3,
  },
  alertas: {
    emailHabilitado: false,
    pushHabilitado: false,
    destinatarios: [],
    frecuencia: 'diaria',
  },
};

// ============================================
// ANOMALY DETECTION ENGINE
// ============================================

interface AnalysisResult {
  tipoAnomalia: TipoAnomaliaIAType;
  severidad: SeveridadAnomaliaType;
  scoreConfiabilidad: number;
  consumoEsperado: number;
  desviacionPorcentual: number;
  descripcion: string;
  recomendacion: string;
}

function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function calculateStdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

export function analyzeReading(
  consumoActual: number,
  historico: number[],
  config: ConfiguracionIA['umbrales'] = DEFAULT_IA_CONFIG.umbrales
): AnalysisResult | null {
  if (historico.length < 2) return null;

  const mean = calculateMean(historico);
  const stdDev = calculateStdDev(historico, mean);
  const zScore = calculateZScore(consumoActual, mean, stdDev);
  const desviacion = mean > 0 ? ((consumoActual - mean) / mean) * 100 : 0;

  // Retroceso (consumo negativo)
  if (consumoActual < 0) {
    return {
      tipoAnomalia: 'retroceso',
      severidad: 'critica',
      scoreConfiabilidad: 95,
      consumoEsperado: mean,
      desviacionPorcentual: desviacion,
      descripcion: `Retroceso de lectura detectado. Consumo negativo: ${consumoActual} m3.`,
      recomendacion: 'Inspeccion inmediata del medidor. Posible manipulacion o falla mecanica.',
    };
  }

  // Consumo cero recurrente
  const zerosRecientes = historico.slice(-config.consumoCero).filter((v) => v === 0).length;
  if (consumoActual === 0 && zerosRecientes >= config.consumoCero - 1) {
    return {
      tipoAnomalia: 'consumo_cero',
      severidad: zerosRecientes >= 3 ? 'alta' : 'media',
      scoreConfiabilidad: 85,
      consumoEsperado: mean,
      desviacionPorcentual: -100,
      descripcion: `Consumo cero recurrente. ${zerosRecientes + 1} periodos consecutivos sin consumo.`,
      recomendacion: 'Verificar estado del medidor y si la conexion esta activa.',
    };
  }

  // Consumo alto (> umbral % del promedio)
  const porcentajeDelPromedio = mean > 0 ? (consumoActual / mean) * 100 : 0;
  if (porcentajeDelPromedio > config.consumoAlto) {
    const severidad: SeveridadAnomaliaType =
      porcentajeDelPromedio > 400 ? 'critica' :
      porcentajeDelPromedio > 300 ? 'alta' : 'media';
    return {
      tipoAnomalia: 'consumo_alto',
      severidad,
      scoreConfiabilidad: Math.min(95, 60 + Math.abs(zScore) * 10),
      consumoEsperado: mean,
      desviacionPorcentual: desviacion,
      descripcion: `Consumo anormalmente alto: ${consumoActual.toFixed(1)} m3 (${porcentajeDelPromedio.toFixed(0)}% del promedio ${mean.toFixed(1)} m3).`,
      recomendacion: severidad === 'critica'
        ? 'Inspeccion urgente. Posible fuga interna o uso no autorizado.'
        : 'Verificar lectura y posible fuga interna del predio.',
    };
  }

  // Consumo bajo (< umbral % del promedio)
  if (mean > 0 && porcentajeDelPromedio < config.consumoBajo && consumoActual > 0) {
    return {
      tipoAnomalia: 'consumo_bajo',
      severidad: porcentajeDelPromedio < 10 ? 'alta' : 'media',
      scoreConfiabilidad: Math.min(90, 55 + Math.abs(zScore) * 10),
      consumoEsperado: mean,
      desviacionPorcentual: desviacion,
      descripcion: `Consumo anormalmente bajo: ${consumoActual.toFixed(1)} m3 (${porcentajeDelPromedio.toFixed(0)}% del promedio ${mean.toFixed(1)} m3).`,
      recomendacion: 'Posible submedicion o bypass. Verificar estado del medidor.',
    };
  }

  // Patron atipico (z-score > 2)
  if (Math.abs(zScore) > 2 && stdDev > 0) {
    return {
      tipoAnomalia: 'patron_atipico',
      severidad: Math.abs(zScore) > 3 ? 'alta' : 'baja',
      scoreConfiabilidad: Math.min(85, 50 + Math.abs(zScore) * 10),
      consumoEsperado: mean,
      desviacionPorcentual: desviacion,
      descripcion: `Patron de consumo atipico: ${consumoActual.toFixed(1)} m3 (z-score: ${zScore.toFixed(2)}).`,
      recomendacion: 'Monitorear en proximos periodos para confirmar tendencia.',
    };
  }

  return null;
}

// ============================================
// RISK SCORE CALCULATION
// ============================================

export function calculateRiskScore(
  historico: number[],
  medidor: Medidor,
  anomaliasCount: number,
  config: ConfiguracionIA['pesos'] = DEFAULT_IA_CONFIG.pesos
): Omit<ScoreRiesgo, 'id' | 'medidorId' | 'clienteId' | 'zonaId' | 'ultimaActualizacion' | 'companiId'> {
  const factores: string[] = [];

  // Score Fraude (0-100)
  let scoreFraude = 0;
  const mean = calculateMean(historico);
  const zerosCount = historico.filter((v) => v === 0).length;
  const retrocesos = historico.filter((v) => v < 0).length;

  if (retrocesos > 0) {
    scoreFraude += 40;
    factores.push(`${retrocesos} retroceso(s) de lectura detectado(s)`);
  }
  if (zerosCount > 2 && mean > 5) {
    scoreFraude += 30;
    factores.push(`${zerosCount} periodos con consumo cero`);
  }
  if (anomaliasCount > 3) {
    scoreFraude += Math.min(30, anomaliasCount * 5);
    factores.push(`${anomaliasCount} anomalias historicas`);
  }
  scoreFraude = Math.min(100, scoreFraude);

  // Score Fuga (0-100)
  let scoreFuga = 0;
  if (historico.length >= 3) {
    const recent = historico.slice(-3);
    const recentMean = calculateMean(recent);
    if (mean > 0 && recentMean > mean * 1.5) {
      scoreFuga += 50;
      factores.push('Consumo reciente 50%+ superior al historico');
    }
    const increasing = recent.every((v, i) => i === 0 || v > recent[i - 1]);
    if (increasing && recentMean > mean * 1.2) {
      scoreFuga += 30;
      factores.push('Tendencia creciente sostenida');
    }
  }
  scoreFuga = Math.min(100, scoreFuga);

  // Score Medidor Deteriorado (0-100)
  let scoreMedidorDeteriorado = 0;
  if (medidor.fechaInstalacion) {
    const fechaInst = medidor.fechaInstalacion.toDate();
    const anios = (Date.now() - fechaInst.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (anios > 10) {
      scoreMedidorDeteriorado += 50;
      factores.push(`Medidor con ${Math.floor(anios)} anios de antiguedad`);
    } else if (anios > 5) {
      scoreMedidorDeteriorado += 25;
      factores.push(`Medidor con ${Math.floor(anios)} anios de antiguedad`);
    }
  }
  if (medidor.estado === 'dañado') {
    scoreMedidorDeteriorado += 40;
    factores.push('Medidor reportado como danado');
  }
  if (medidor.tipo === 'mecanico') {
    scoreMedidorDeteriorado += 10;
    factores.push('Medidor de tipo mecanico');
  }
  scoreMedidorDeteriorado = Math.min(100, scoreMedidorDeteriorado);

  // Score General ponderado
  const scoreGeneral = Math.round(
    scoreFraude * config.fraude +
    scoreFuga * config.fuga +
    scoreMedidorDeteriorado * config.medidorDeteriorado
  );

  // Recomendacion
  let recomendacion: ScoreRiesgo['recomendacion'] = 'ninguna';
  if (scoreGeneral >= 85) recomendacion = 'corte';
  else if (scoreGeneral >= 70) recomendacion = 'inspeccion';
  else if (scoreGeneral >= 50) recomendacion = 'cambio_medidor';
  else if (scoreGeneral >= 30) recomendacion = 'monitorear';

  return {
    scoreFraude,
    scoreFuga,
    scoreMedidorDeteriorado,
    scoreGeneral,
    factores,
    recomendacion,
  };
}

// ============================================
// FIRESTORE OPERATIONS
// ============================================

export async function getAnomalias(filters: {
  companiId: string;
  zonaId?: string;
  tipoAnomalia?: TipoAnomaliaIAType;
  severidad?: SeveridadAnomaliaType;
  estado?: EstadoAnomaliaIAType;
  periodo?: string;
  limitCount?: number;
}): Promise<{ data: AnalyticsAnomalia[]; total: number }> {
  const constraints: QueryConstraint[] = [where('companiId', '==', filters.companiId)];
  if (filters.zonaId) constraints.push(where('zonaId', '==', filters.zonaId));
  if (filters.tipoAnomalia) constraints.push(where('tipoAnomalia', '==', filters.tipoAnomalia));
  if (filters.severidad) constraints.push(where('severidad', '==', filters.severidad));
  if (filters.estado) constraints.push(where('estado', '==', filters.estado));
  if (filters.periodo) constraints.push(where('periodo', '==', filters.periodo));
  constraints.push(orderBy('createdAt', 'desc'));
  if (filters.limitCount) constraints.push(firestoreLimit(filters.limitCount));

  const q = query(analyticsAnomaliasCol, ...constraints);
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AnalyticsAnomalia));
  return { data, total: data.length };
}

export async function updateAnomaliaEstado(
  id: string,
  estado: EstadoAnomaliaIAType,
  userId: string,
  resolucion?: string
): Promise<void> {
  const ref = doc(db, 'analytics_anomalias', id);
  const updateData: Record<string, unknown> = {
    estado,
    revisadoPor: userId,
    fechaRevision: Timestamp.now(),
  };
  if (resolucion) updateData.resolucion = resolucion;
  await updateDoc(ref, updateData);
}

export async function saveAnomalia(
  anomalia: Omit<AnalyticsAnomalia, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(analyticsAnomaliasCol, {
    ...anomalia,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getKpis(companiId: string, periodo: string): Promise<AnalyticsKpi[]> {
  const q = query(
    analyticsKpisCol,
    where('companiId', '==', companiId),
    where('periodo', '==', periodo),
    orderBy('fecha', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AnalyticsKpi));
}

export async function getLatestKpi(companiId: string): Promise<AnalyticsKpi | null> {
  const q = query(
    analyticsKpisCol,
    where('companiId', '==', companiId),
    orderBy('fecha', 'desc'),
    firestoreLimit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AnalyticsKpi;
}

export async function saveKpi(kpi: Omit<AnalyticsKpi, 'createdAt' | 'updatedAt'>): Promise<void> {
  const ref = doc(db, 'analytics_kpis', kpi.id);
  await setDoc(ref, {
    ...kpi,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }, { merge: true });
}

export async function getScoresRiesgo(filters: {
  companiId: string;
  zonaId?: string;
  minScore?: number;
  limitCount?: number;
}): Promise<ScoreRiesgo[]> {
  const constraints: QueryConstraint[] = [where('companiId', '==', filters.companiId)];
  if (filters.zonaId) constraints.push(where('zonaId', '==', filters.zonaId));
  constraints.push(orderBy('scoreGeneral', 'desc'));
  if (filters.limitCount) constraints.push(firestoreLimit(filters.limitCount));

  const q = query(analyticsScoresRiesgoCol, ...constraints);
  const snapshot = await getDocs(q);
  let data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ScoreRiesgo));
  if (filters.minScore) {
    data = data.filter((s) => s.scoreGeneral >= filters.minScore!);
  }
  return data;
}

export async function saveScoreRiesgo(score: ScoreRiesgo): Promise<void> {
  const ref = doc(db, 'analytics_scores_riesgo', score.id);
  await setDoc(ref, score, { merge: true });
}

// ============================================
// CONFIGURACION IA
// ============================================

export async function getConfiguracionIA(companiId: string): Promise<ConfiguracionIA> {
  const q = query(configuracionIaCol, where('companiId', '==', companiId), firestoreLimit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ConfiguracionIA;
  }
  // Return defaults if no config exists
  return {
    id: '',
    companiId,
    ...DEFAULT_IA_CONFIG,
    updatedAt: Timestamp.now(),
    updatedBy: '',
  };
}

export async function saveConfiguracionIA(
  companiId: string,
  config: Partial<ConfiguracionIA>,
  userId: string
): Promise<void> {
  const existing = await getConfiguracionIA(companiId);
  if (existing.id) {
    await updateDoc(doc(db, 'configuracion_ia', existing.id), {
      ...config,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    });
  } else {
    await addDoc(configuracionIaCol, {
      companiId,
      ...DEFAULT_IA_CONFIG,
      ...config,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    });
  }
}

// ============================================
// BATCH ANALYSIS
// ============================================

export async function batchAnalyzeReadings(
  companiId: string,
  periodo: string
): Promise<{ totalAnalizadas: number; anomaliasDetectadas: number; scoresActualizados: number }> {
  // Get all readings for the period
  const lecturasQuery = query(
    lecturasCol,
    where('companiId', '==', companiId),
    where('periodo', '==', periodo)
  );
  const lecturasSnap = await getDocs(lecturasQuery);
  const lecturas = lecturasSnap.docs.map((d) => ({ id: d.id, ...d.data() } as LecturaExtendida));

  const config = await getConfiguracionIA(companiId);
  let anomaliasDetectadas = 0;
  let scoresActualizados = 0;

  // Group readings by medidor
  const byMedidor = new Map<string, LecturaExtendida[]>();
  for (const l of lecturas) {
    const arr = byMedidor.get(l.medidorId) || [];
    arr.push(l);
    byMedidor.set(l.medidorId, arr);
  }

  for (const [medidorId, medidorLecturas] of byMedidor) {
    // Get historical readings for the medidor
    const histQuery = query(
      lecturasCol,
      where('medidorId', '==', medidorId),
      orderBy('fechaHora', 'desc'),
      firestoreLimit(24)
    );
    const histSnap = await getDocs(histQuery);
    const historico = histSnap.docs.map((d) => {
      const data = d.data() as LecturaExtendida;
      return data.consumo ?? 0;
    });

    for (const lectura of medidorLecturas) {
      const result = analyzeReading(lectura.consumo ?? 0, historico, config.umbrales);
      if (result) {
        await saveAnomalia({
          lecturaId: lectura.id,
          medidorId: lectura.medidorId,
          clienteId: lectura.clienteId || '',
          zonaId: lectura.zonaId || '',
          rutaId: lectura.rutaId,
          tipoAnomalia: result.tipoAnomalia,
          severidad: result.severidad,
          scoreConfiabilidad: result.scoreConfiabilidad,
          consumoActual: lectura.consumo ?? 0,
          consumoEsperado: result.consumoEsperado,
          desviacionPorcentual: result.desviacionPorcentual,
          descripcion: result.descripcion,
          recomendacion: result.recomendacion,
          estado: 'detectada',
          companiId,
          periodo,
        });
        anomaliasDetectadas++;
      }
    }

    // Update risk score for this medidor
    const medidorDoc = await getDoc(doc(medidoresCol, medidorId));
    if (medidorDoc.exists()) {
      const medidor = { id: medidorDoc.id, ...medidorDoc.data() } as Medidor;
      const anomaliasCountQuery = query(
        analyticsAnomaliasCol,
        where('medidorId', '==', medidorId),
        where('estado', 'in', ['detectada', 'confirmada'])
      );
      const anomaliasSnap = await getDocs(anomaliasCountQuery);

      const riskScore = calculateRiskScore(historico, medidor, anomaliasSnap.size, config.pesos);
      await saveScoreRiesgo({
        id: medidorId,
        medidorId,
        clienteId: medidor.clienteId,
        zonaId: medidor.zonaId,
        ...riskScore,
        ultimaActualizacion: Timestamp.now(),
        companiId,
      });
      scoresActualizados++;
    }
  }

  // Calculate and save daily KPI
  const zonasSnap = await getDocs(query(zonasCol, where('activo', '==', true)));
  const zonaMap = new Map<string, Zona>();
  zonasSnap.docs.forEach((d) => zonaMap.set(d.id, { id: d.id, ...d.data() } as Zona));

  const today = new Date().toISOString().split('T')[0];
  const zonaKpis: Record<string, ZonaKpi> = {};
  const operarioKpis: Record<string, OperarioKpi> = {};

  for (const l of lecturas) {
    const zonaId = l.zonaId || 'sin_zona';
    if (!zonaKpis[zonaId]) {
      zonaKpis[zonaId] = {
        zonaNombre: zonaMap.get(zonaId)?.nombre || zonaId,
        totalMedidores: 0,
        medidoresLeidos: 0,
        consumoTotal: 0,
        anomalias: 0,
      };
    }
    zonaKpis[zonaId].medidoresLeidos++;
    zonaKpis[zonaId].consumoTotal += l.consumo ?? 0;

    const opId = l.operarioId || 'sin_operario';
    if (!operarioKpis[opId]) {
      operarioKpis[opId] = { nombre: opId, lecturasRealizadas: 0, anomaliasDetectadas: 0 };
    }
    operarioKpis[opId].lecturasRealizadas++;
  }

  const totalFacturado = lecturas.reduce((s, l) => s + (l.consumo ?? 0), 0);
  const kpi: Omit<AnalyticsKpi, 'createdAt' | 'updatedAt'> = {
    id: `${companiId}_${today}`,
    companiId,
    fecha: today,
    periodo,
    aguaFacturada: totalFacturado,
    anf: 0,
    totalMedidores: lecturas.length,
    medidoresLeidos: lecturas.length,
    porcentajeLectura: 100,
    lecturasConAnomalia: anomaliasDetectadas,
    lecturasValidadas: lecturas.filter((l) => l.estadoValidacion === 'validada').length,
    zonaKpis,
    operarioKpis,
  };
  await saveKpi(kpi);

  return { totalAnalizadas: lecturas.length, anomaliasDetectadas, scoresActualizados };
}

// ============================================
// ANOMALIAS SUMMARY (for dashboards)
// ============================================

export async function getAnomaliasSummary(companiId: string, periodo?: string) {
  const constraints = [where('companiId', '==', companiId)];
  if (periodo) constraints.push(where('periodo', '==', periodo));

  const q = query(analyticsAnomaliasCol, ...constraints);
  const snapshot = await getDocs(q);
  const anomalias = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AnalyticsAnomalia));

  const porTipo: Record<string, number> = {};
  const porSeveridad: Record<string, number> = {};
  const porEstado: Record<string, number> = {};
  const porZona: Record<string, number> = {};

  for (const a of anomalias) {
    porTipo[a.tipoAnomalia] = (porTipo[a.tipoAnomalia] || 0) + 1;
    porSeveridad[a.severidad] = (porSeveridad[a.severidad] || 0) + 1;
    porEstado[a.estado] = (porEstado[a.estado] || 0) + 1;
    porZona[a.zonaId] = (porZona[a.zonaId] || 0) + 1;
  }

  return {
    total: anomalias.length,
    porTipo,
    porSeveridad,
    porEstado,
    porZona,
    anomalias,
  };
}
