/**
 * Tests unitarios: src/lib/utils/formatters.ts
 * Módulo: Utilidades de formateo
 */
import { formatNumber, formatConsumo, formatPercentage, getInitials, truncate } from '@/lib/utils/formatters';

describe('formatters', () => {
  // ============================
  // formatNumber
  // ============================
  describe('formatNumber', () => {
    it('formatea entero sin decimales por defecto', () => {
      const result = formatNumber(1500);
      // es-PE usa coma como separador de miles
      expect(result).toMatch(/1[,.]?500/);
    });

    it('formatea con decimales especificados', () => {
      const result = formatNumber(1500.5, 2);
      // locale es-PE puede usar coma o punto, y separador de miles
      expect(result).toMatch(/1[,.]?500[.,]50/);
    });

    it('maneja cero correctamente', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('maneja negativos', () => {
      const result = formatNumber(-250);
      expect(result).toContain('250');
    });
  });

  // ============================
  // formatConsumo
  // ============================
  describe('formatConsumo', () => {
    it('agrega sufijo m³', () => {
      const result = formatConsumo(15.5);
      expect(result).toContain('m³');
    });

    it('formatea con 2 decimales', () => {
      const result = formatConsumo(15);
      expect(result).toMatch(/15[.,]00/);
    });

    it('maneja cero', () => {
      const result = formatConsumo(0);
      expect(result).toContain('0');
      expect(result).toContain('m³');
    });
  });

  // ============================
  // formatPercentage
  // ============================
  describe('formatPercentage', () => {
    it('agrega sufijo %', () => {
      expect(formatPercentage(75.5)).toContain('%');
    });

    it('formatea con 1 decimal', () => {
      const result = formatPercentage(75.56);
      expect(result).toMatch(/75[.,]6%/);
    });

    it('maneja 100%', () => {
      expect(formatPercentage(100)).toContain('100');
    });

    it('maneja 0%', () => {
      expect(formatPercentage(0)).toContain('0');
    });
  });

  // ============================
  // getInitials
  // ============================
  describe('getInitials', () => {
    it('retorna iniciales con nombre y apellido', () => {
      expect(getInitials('Juan', 'Pérez')).toBe('JP');
    });

    it('retorna solo inicial del nombre si no hay apellido', () => {
      expect(getInitials('María')).toBe('M');
    });

    it('convierte a mayúsculas', () => {
      expect(getInitials('ana', 'garcía')).toBe('AG');
    });

    it('maneja strings vacíos', () => {
      expect(getInitials('')).toBe('');
    });
  });

  // ============================
  // truncate
  // ============================
  describe('truncate', () => {
    it('no trunca si está dentro del límite', () => {
      expect(truncate('Hola', 10)).toBe('Hola');
    });

    it('trunca y agrega ... si excede', () => {
      expect(truncate('Hola Mundo Cruel', 10)).toBe('Hola Mundo...');
    });

    it('no trunca si es exactamente el límite', () => {
      expect(truncate('12345', 5)).toBe('12345');
    });

    it('maneja string vacío', () => {
      expect(truncate('', 5)).toBe('');
    });
  });
});
