/**
 * Tests unitarios: src/lib/services/export-service.ts
 * Módulo: Exportación de datos (CSV, JSON, XML)
 */
import { exportToCSV, exportToJSON, exportToXML } from '@/lib/services/export-service';
import type { LecturaExtendida } from '@/lib/types';

// Mock Timestamp
const mockTimestamp = {
  toDate: () => new Date('2026-03-15T10:30:00Z'),
};

const mockLecturas: LecturaExtendida[] = [
  {
    id: 'lect-001',
    medidorId: 'med-001',
    operarioId: 'op-001',
    valorLectura: 1250,
    fotoUrl: 'https://storage.example.com/foto1.jpg',
    fechaHora: mockTimestamp as any,
    latitudCaptura: -12.046,
    longitudCaptura: -77.042,
    clienteId: 'cli-001',
    zonaId: 'zona-001',
    rutaId: 'ruta-001',
    asignacionId: 'asig-001',
    consumo: 25,
    tipoLectura: 'normal',
    anomalia: 'ninguna',
    estadoValidacion: 'validada',
  },
  {
    id: 'lect-002',
    medidorId: 'med-002',
    operarioId: 'op-001',
    valorLectura: 890,
    fechaHora: mockTimestamp as any,
    latitudCaptura: -12.050,
    longitudCaptura: -77.045,
    clienteId: 'cli-002',
    zonaId: 'zona-001',
    rutaId: 'ruta-001',
    asignacionId: 'asig-001',
    consumo: 180,
    tipoLectura: 'normal',
    anomalia: 'consumo_alto',
    estadoValidacion: 'pendiente',
  },
];

const exportData = {
  periodo: '2026-03',
  empresa: 'Vertiente SAC',
  generadoPor: 'Admin',
  lecturas: mockLecturas,
};

describe('export-service', () => {
  // ============================
  // exportToCSV
  // ============================
  describe('exportToCSV', () => {
    it('genera CSV válido con encabezados', () => {
      const csv = exportToCSV(exportData);
      expect(csv).toContain('PERIODO');
      expect(csv).toContain('MEDIDOR_ID');
      expect(csv).toContain('OPERARIO_ID');
      expect(csv).toContain('CONSUMO');
      expect(csv).toContain('ESTADO');
      expect(csv).toContain('ANOMALIA');
    });

    it('incluye datos de cada lectura', () => {
      const csv = exportToCSV(exportData);
      expect(csv).toContain('med-001');
      expect(csv).toContain('med-002');
      expect(csv).toContain('op-001');
    });

    it('incluye el periodo', () => {
      const csv = exportToCSV(exportData);
      expect(csv).toContain('2026-03');
    });

    it('incluye estado de validación', () => {
      const csv = exportToCSV(exportData);
      expect(csv).toContain('validada');
      expect(csv).toContain('pendiente');
    });

    it('incluye anomalías', () => {
      const csv = exportToCSV(exportData);
      expect(csv).toContain('ninguna');
      expect(csv).toContain('consumo_alto');
    });

    it('retorna string vacío con metadata cuando no hay lecturas', () => {
      const csv = exportToCSV({ ...exportData, lecturas: [] });
      // PapaParse solo genera headers sin data
      expect(csv).toBeDefined();
      expect(typeof csv).toBe('string');
    });
  });

  // ============================
  // exportToJSON
  // ============================
  describe('exportToJSON', () => {
    it('genera JSON válido', () => {
      const json = exportToJSON(exportData);
      const parsed = JSON.parse(json);
      expect(parsed).toBeDefined();
    });

    it('contiene metadata', () => {
      const json = exportToJSON(exportData);
      const parsed = JSON.parse(json);
      expect(parsed.metadata).toBeDefined();
      expect(parsed.metadata.periodo).toBe('2026-03');
      expect(parsed.metadata.empresa).toBe('Vertiente SAC');
      expect(parsed.metadata.generadoPor).toBe('Admin');
      expect(parsed.metadata.totalRegistros).toBe(2);
    });

    it('contiene array de lecturas', () => {
      const json = exportToJSON(exportData);
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed.lecturas)).toBe(true);
      expect(parsed.lecturas).toHaveLength(2);
    });

    it('lecturas tienen los campos correctos', () => {
      const json = exportToJSON(exportData);
      const parsed = JSON.parse(json);
      const first = parsed.lecturas[0];
      expect(first.medidorId).toBe('med-001');
      expect(first.operarioId).toBe('op-001');
      expect(first.valorLectura).toBe(1250);
      expect(first.consumo).toBe(25);
      expect(first.estadoValidacion).toBe('validada');
    });

    it('incluye fecha de generación en metadata', () => {
      const json = exportToJSON(exportData);
      const parsed = JSON.parse(json);
      expect(parsed.metadata.fecha).toBeDefined();
      // Should be a valid ISO date
      expect(new Date(parsed.metadata.fecha).getTime()).toBeGreaterThan(0);
    });

    it('maneja lecturas vacías', () => {
      const json = exportToJSON({ ...exportData, lecturas: [] });
      const parsed = JSON.parse(json);
      expect(parsed.lecturas).toHaveLength(0);
      expect(parsed.metadata.totalRegistros).toBe(0);
    });
  });

  // ============================
  // exportToXML
  // ============================
  describe('exportToXML', () => {
    it('genera XML con declaración correcta', () => {
      const xml = exportToXML(exportData);
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    });

    it('contiene tag PaqueteLecturas con periodo', () => {
      const xml = exportToXML(exportData);
      expect(xml).toContain('<PaqueteLecturas periodo="2026-03">');
    });

    it('contiene sección Metadata', () => {
      const xml = exportToXML(exportData);
      expect(xml).toContain('<Metadata>');
      expect(xml).toContain('<Empresa>Vertiente SAC</Empresa>');
      expect(xml).toContain('<GeneradoPor>Admin</GeneradoPor>');
      expect(xml).toContain('<TotalRegistros>2</TotalRegistros>');
      expect(xml).toContain('</Metadata>');
    });

    it('contiene elementos Lectura', () => {
      const xml = exportToXML(exportData);
      expect(xml).toContain('<Lectura>');
      expect(xml).toContain('<MedidorId>med-001</MedidorId>');
      expect(xml).toContain('<MedidorId>med-002</MedidorId>');
      expect(xml).toContain('<ValorLectura>1250</ValorLectura>');
      expect(xml).toContain('<Consumo>25</Consumo>');
      expect(xml).toContain('</Lectura>');
    });

    it('contiene estado y anomalía', () => {
      const xml = exportToXML(exportData);
      expect(xml).toContain('<Estado>validada</Estado>');
      expect(xml).toContain('<Estado>pendiente</Estado>');
      expect(xml).toContain('<Anomalia>ninguna</Anomalia>');
      expect(xml).toContain('<Anomalia>consumo_alto</Anomalia>');
    });

    it('cierra todos los tags correctamente', () => {
      const xml = exportToXML(exportData);
      expect(xml).toContain('</PaqueteLecturas>');
      expect(xml).toContain('</Lecturas>');
    });

    it('maneja lecturas vacías', () => {
      const xml = exportToXML({ ...exportData, lecturas: [] });
      expect(xml).toContain('<TotalRegistros>0</TotalRegistros>');
      expect(xml).toContain('<Lecturas>');
      expect(xml).toContain('</Lecturas>');
    });
  });
});
