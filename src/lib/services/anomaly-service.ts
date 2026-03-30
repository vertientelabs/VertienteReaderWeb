import { ANOMALY_THRESHOLDS } from '../constants';
import type { AnomaliaType } from '../types';

interface AnomalyCheckParams {
  lecturaActual: number;
  lecturaAnterior: number;
  promedioHistorico: number;
  periodosConsumoZero?: number;
}

export function detectAnomaly(params: AnomalyCheckParams): AnomaliaType {
  const { lecturaActual, lecturaAnterior, promedioHistorico, periodosConsumoZero = 0 } = params;
  const consumo = lecturaActual - lecturaAnterior;

  // Retroceso: lectura actual menor que anterior
  if (consumo < 0) return 'retroceso';

  // Medidor parado: consumo 0 por varios periodos
  if (consumo === 0 && periodosConsumoZero >= ANOMALY_THRESHOLDS.PERIODOS_MEDIDOR_PARADO) {
    return 'medidor_parado';
  }

  if (promedioHistorico > 0) {
    const porcentaje = (consumo / promedioHistorico) * 100;

    // Consumo alto: > 200% del promedio
    if (porcentaje > ANOMALY_THRESHOLDS.CONSUMO_ALTO_PORCENTAJE) return 'consumo_alto';

    // Consumo bajo: < 20% del promedio
    if (porcentaje < ANOMALY_THRESHOLDS.CONSUMO_BAJO_PORCENTAJE && consumo > 0) return 'consumo_bajo';
  }

  return 'ninguna';
}
