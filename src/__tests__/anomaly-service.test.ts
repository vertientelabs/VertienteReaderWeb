/**
 * Tests unitarios: src/lib/services/anomaly-service.ts
 * Módulo: Detección automática de anomalías en lecturas
 */
import { detectAnomaly } from '@/lib/services/anomaly-service';

describe('anomaly-service - detectAnomaly', () => {
  // ============================
  // Retroceso de lectura
  // ============================
  describe('retroceso', () => {
    it('detecta retroceso cuando lectura actual < anterior', () => {
      expect(detectAnomaly({
        lecturaActual: 100,
        lecturaAnterior: 150,
        promedioHistorico: 20,
      })).toBe('retroceso');
    });

    it('detecta retroceso con diferencia mínima', () => {
      expect(detectAnomaly({
        lecturaActual: 149,
        lecturaAnterior: 150,
        promedioHistorico: 20,
      })).toBe('retroceso');
    });
  });

  // ============================
  // Medidor parado
  // ============================
  describe('medidor_parado', () => {
    it('detecta medidor parado: consumo 0 con 2+ periodos', () => {
      expect(detectAnomaly({
        lecturaActual: 150,
        lecturaAnterior: 150,
        promedioHistorico: 20,
        periodosConsumoZero: 2,
      })).toBe('medidor_parado');
    });

    it('detecta medidor parado con 5 periodos en cero', () => {
      expect(detectAnomaly({
        lecturaActual: 200,
        lecturaAnterior: 200,
        promedioHistorico: 15,
        periodosConsumoZero: 5,
      })).toBe('medidor_parado');
    });

    it('NO detecta medidor parado si consumo es 0 pero pocos periodos', () => {
      expect(detectAnomaly({
        lecturaActual: 150,
        lecturaAnterior: 150,
        promedioHistorico: 20,
        periodosConsumoZero: 1,
      })).toBe('ninguna'); // consumo 0 + promedio check => ninguna (0 < 20% of 20 = 4, but consumo > 0 is false)
    });
  });

  // ============================
  // Consumo alto
  // ============================
  describe('consumo_alto', () => {
    it('detecta consumo alto cuando supera 200% del promedio', () => {
      expect(detectAnomaly({
        lecturaActual: 250,
        lecturaAnterior: 200,
        promedioHistorico: 20,
        // consumo = 50, porcentaje = 50/20 * 100 = 250% > 200%
      })).toBe('consumo_alto');
    });

    it('NO detecta consumo alto si está justo en el límite (200%)', () => {
      expect(detectAnomaly({
        lecturaActual: 240,
        lecturaAnterior: 200,
        promedioHistorico: 20,
        // consumo = 40, porcentaje = 40/20 * 100 = 200%, NO > 200%
      })).toBe('ninguna');
    });

    it('detecta consumo alto extremo', () => {
      expect(detectAnomaly({
        lecturaActual: 500,
        lecturaAnterior: 200,
        promedioHistorico: 15,
        // consumo = 300, porcentaje = 2000%
      })).toBe('consumo_alto');
    });
  });

  // ============================
  // Consumo bajo
  // ============================
  describe('consumo_bajo', () => {
    it('detecta consumo bajo cuando es menor al 20% del promedio', () => {
      expect(detectAnomaly({
        lecturaActual: 202,
        lecturaAnterior: 200,
        promedioHistorico: 20,
        // consumo = 2, porcentaje = 2/20 * 100 = 10% < 20%
      })).toBe('consumo_bajo');
    });

    it('NO detecta consumo bajo si consumo es 0 (ya manejado por medidor_parado)', () => {
      // consumo 0 sin periodos suficientes: no es consumo_bajo porque consumo > 0 es false
      expect(detectAnomaly({
        lecturaActual: 200,
        lecturaAnterior: 200,
        promedioHistorico: 20,
        periodosConsumoZero: 0,
      })).toBe('ninguna');
    });
  });

  // ============================
  // Normal (ninguna anomalía)
  // ============================
  describe('ninguna', () => {
    it('retorna ninguna para consumo normal', () => {
      expect(detectAnomaly({
        lecturaActual: 220,
        lecturaAnterior: 200,
        promedioHistorico: 20,
        // consumo = 20, porcentaje = 100%
      })).toBe('ninguna');
    });

    it('retorna ninguna para consumo ligeramente alto pero dentro de rango', () => {
      expect(detectAnomaly({
        lecturaActual: 238,
        lecturaAnterior: 200,
        promedioHistorico: 20,
        // consumo = 38, porcentaje = 190% < 200%
      })).toBe('ninguna');
    });

    it('retorna ninguna para consumo ligeramente bajo pero dentro de rango', () => {
      expect(detectAnomaly({
        lecturaActual: 205,
        lecturaAnterior: 200,
        promedioHistorico: 20,
        // consumo = 5, porcentaje = 25% > 20%
      })).toBe('ninguna');
    });

    it('retorna ninguna si promedioHistorico es 0 (no hay datos para comparar)', () => {
      expect(detectAnomaly({
        lecturaActual: 250,
        lecturaAnterior: 200,
        promedioHistorico: 0,
      })).toBe('ninguna');
    });
  });

  // ============================
  // Prioridad de anomalías
  // ============================
  describe('prioridad de detección', () => {
    it('retroceso tiene prioridad sobre todo', () => {
      // Lectura retrocede Y tendría consumo_alto si fuera positivo
      expect(detectAnomaly({
        lecturaActual: 50,
        lecturaAnterior: 200,
        promedioHistorico: 10,
      })).toBe('retroceso');
    });
  });
});
