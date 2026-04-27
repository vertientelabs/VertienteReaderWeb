import {
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
  setDoc,
  doc,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  analyticsPrediccionesCol,
  lecturasCol,
  medidoresCol,
  zonasCol,
} from '@/lib/firebase/collections';
import type {
  PrediccionConsumo,
  LecturaExtendida,
  Medidor,
} from '@/lib/types';

// ============================================
// PREDICTION ALGORITHMS (pure TypeScript)
// ============================================

function weightedMovingAverage(values: number[], weights?: number[]): number {
  if (values.length === 0) return 0;
  if (!weights) {
    // More recent values get higher weights
    weights = values.map((_, i) => i + 1);
  }
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  return values.reduce((sum, val, i) => sum + val * weights![i], 0) / totalWeight;
}

function linearTrend(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] || 0 };

  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += (i - xMean) ** 2;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  return { slope, intercept };
}

function seasonalFactor(values: number[], monthIndex: number): number {
  // If we have at least 12 months, compare same month from previous year
  if (values.length >= 12 && monthIndex < values.length) {
    const sameMonthValue = values[monthIndex];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return mean > 0 ? sameMonthValue / mean : 1;
  }
  return 1;
}

export function predictConsumo(
  historico: number[],
  targetMonth: number = 0 // 0-11 for seasonality
): {
  consumoPredicho: number;
  rangoMinimo: number;
  rangoMaximo: number;
  confianza: number;
  metodo: PrediccionConsumo['metodo'];
  factores: PrediccionConsumo['factores'];
} {
  if (historico.length === 0) {
    return {
      consumoPredicho: 0,
      rangoMinimo: 0,
      rangoMaximo: 0,
      confianza: 0,
      metodo: 'promedio_movil',
      factores: { promedioHistorico: 0, tendencia: 0, factorEstacional: 1, factorZona: 1 },
    };
  }

  const mean = historico.reduce((a, b) => a + b, 0) / historico.length;
  const { slope } = linearTrend(historico);
  const seasonal = seasonalFactor(historico, targetMonth);
  const wma = weightedMovingAverage(historico.slice(-6));

  // Determine best method based on data availability
  let metodo: PrediccionConsumo['metodo'] = 'promedio_movil';
  let consumoPredicho: number;

  if (historico.length >= 12) {
    // Full seasonal + trend model
    metodo = 'mixto';
    const trendValue = mean + slope * historico.length;
    consumoPredicho = trendValue * seasonal * 0.5 + wma * 0.5;
  } else if (historico.length >= 6) {
    // Trend + weighted average
    metodo = 'tendencia_lineal';
    const trendValue = mean + slope * historico.length;
    consumoPredicho = trendValue * 0.4 + wma * 0.6;
  } else if (historico.length >= 3) {
    // Seasonal if available, else WMA
    metodo = historico.length >= 12 ? 'estacional' : 'promedio_movil';
    consumoPredicho = wma;
  } else {
    consumoPredicho = mean;
  }

  // Ensure non-negative
  consumoPredicho = Math.max(0, consumoPredicho);

  // Calculate confidence interval
  const stdDev = Math.sqrt(
    historico.reduce((sum, v) => sum + (v - mean) ** 2, 0) / Math.max(1, historico.length - 1)
  );
  const marginOfError = stdDev * 1.96; // 95% confidence

  // Confidence score (0-100)
  const confianza = Math.min(100, Math.round(
    40 + // base
    Math.min(30, historico.length * 2.5) + // more data = more confidence
    (stdDev < mean * 0.3 ? 20 : stdDev < mean * 0.5 ? 10 : 0) + // low variance = more confidence
    (historico.length >= 12 ? 10 : 0) // seasonal data bonus
  ));

  return {
    consumoPredicho: Math.round(consumoPredicho * 100) / 100,
    rangoMinimo: Math.max(0, Math.round((consumoPredicho - marginOfError) * 100) / 100),
    rangoMaximo: Math.round((consumoPredicho + marginOfError) * 100) / 100,
    confianza,
    metodo,
    factores: {
      promedioHistorico: Math.round(mean * 100) / 100,
      tendencia: Math.round(slope * 100) / 100,
      factorEstacional: Math.round(seasonal * 100) / 100,
      factorZona: 1,
    },
  };
}

// ============================================
// FIRESTORE OPERATIONS
// ============================================

export async function getPredicciones(filters: {
  companiId: string;
  periodo?: string;
  zonaId?: string;
  medidorId?: string;
  limitCount?: number;
}): Promise<PrediccionConsumo[]> {
  const constraints: QueryConstraint[] = [where('companiId', '==', filters.companiId)];
  if (filters.periodo) constraints.push(where('periodo', '==', filters.periodo));
  if (filters.zonaId) constraints.push(where('zonaId', '==', filters.zonaId));
  if (filters.medidorId) constraints.push(where('medidorId', '==', filters.medidorId));
  constraints.push(orderBy('confianza', 'desc'));
  if (filters.limitCount) constraints.push(firestoreLimit(filters.limitCount));

  const q = query(analyticsPrediccionesCol, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PrediccionConsumo));
}

export async function savePrediccion(pred: Omit<PrediccionConsumo, 'createdAt'>): Promise<void> {
  const ref = doc(db, 'analytics_predicciones', pred.id);
  await setDoc(ref, { ...pred, createdAt: Timestamp.now() }, { merge: true });
}

export async function batchPredict(
  companiId: string,
  periodoTarget: string
): Promise<{ prediccionesGeneradas: number; consumoTotalPredicho: number }> {
  // Get all active medidores
  const medidoresQuery = query(
    medidoresCol,
    where('companiId', '==', companiId),
    where('estado', '==', 'activo')
  );
  const medidoresSnap = await getDocs(medidoresQuery);

  let prediccionesGeneradas = 0;
  let consumoTotalPredicho = 0;

  const targetMonth = parseInt(periodoTarget.split('-')[1]) - 1; // 0-indexed

  for (const medidorDoc of medidoresSnap.docs) {
    const medidor = { id: medidorDoc.id, ...medidorDoc.data() } as Medidor;

    // Get historical readings
    const histQuery = query(
      lecturasCol,
      where('medidorId', '==', medidor.id),
      orderBy('fechaHora', 'asc'),
      firestoreLimit(24)
    );
    const histSnap = await getDocs(histQuery);
    const historico = histSnap.docs.map((d) => {
      const data = d.data() as LecturaExtendida;
      return data.consumo ?? 0;
    });

    if (historico.length < 2) continue;

    const prediction = predictConsumo(historico, targetMonth);

    const pred: Omit<PrediccionConsumo, 'createdAt'> = {
      id: `${medidor.id}_${periodoTarget}`,
      medidorId: medidor.id,
      clienteId: medidor.clienteId,
      zonaId: medidor.zonaId,
      periodo: periodoTarget,
      ...prediction,
      companiId,
    };

    await savePrediccion(pred);
    prediccionesGeneradas++;
    consumoTotalPredicho += prediction.consumoPredicho;
  }

  return { prediccionesGeneradas, consumoTotalPredicho };
}

export async function evaluarPrecision(
  companiId: string,
  periodo: string
): Promise<{
  maePromedio: number;
  precisionGlobal: number;
  totalEvaluadas: number;
}> {
  const predicciones = await getPredicciones({ companiId, periodo });

  let totalError = 0;
  let dentroRango = 0;
  let evaluadas = 0;

  for (const p of predicciones) {
    if (p.consumoReal !== undefined && p.consumoReal !== null) {
      const error = Math.abs(p.consumoReal - p.consumoPredicho);
      totalError += error;
      if (p.consumoReal >= p.rangoMinimo && p.consumoReal <= p.rangoMaximo) {
        dentroRango++;
      }
      evaluadas++;
    }
  }

  return {
    maePromedio: evaluadas > 0 ? totalError / evaluadas : 0,
    precisionGlobal: evaluadas > 0 ? (dentroRango / evaluadas) * 100 : 0,
    totalEvaluadas: evaluadas,
  };
}
