import Papa from 'papaparse';
import type { LecturaExtendida } from '../types';

interface ExportData {
  periodo: string;
  empresa: string;
  generadoPor: string;
  lecturas: LecturaExtendida[];
}

export function exportToCSV(data: ExportData): string {
  const rows = data.lecturas.map((l) => ({
    PERIODO: data.periodo,
    MEDIDOR_ID: l.medidorId,
    OPERARIO_ID: l.operarioId,
    LECTURA_ANTERIOR: '',
    LECTURA_ACTUAL: l.valorLectura,
    CONSUMO: l.consumo,
    FECHA_LECTURA: l.fechaHora?.toDate?.()?.toISOString() || '',
    ZONA_ID: l.zonaId,
    RUTA_ID: l.rutaId,
    ESTADO: l.estadoValidacion,
    ANOMALIA: l.anomalia || 'ninguna',
  }));

  return Papa.unparse(rows);
}

export function exportToJSON(data: ExportData): string {
  return JSON.stringify(
    {
      metadata: {
        periodo: data.periodo,
        empresa: data.empresa,
        generadoPor: data.generadoPor,
        fecha: new Date().toISOString(),
        totalRegistros: data.lecturas.length,
      },
      lecturas: data.lecturas.map((l) => ({
        medidorId: l.medidorId,
        operarioId: l.operarioId,
        valorLectura: l.valorLectura,
        consumo: l.consumo,
        fechaHora: l.fechaHora?.toDate?.()?.toISOString() || '',
        zonaId: l.zonaId,
        rutaId: l.rutaId,
        estadoValidacion: l.estadoValidacion,
        anomalia: l.anomalia,
      })),
    },
    null,
    2
  );
}

export function exportToXML(data: ExportData): string {
  const lecturasXml = data.lecturas
    .map(
      (l) => `    <Lectura>
      <MedidorId>${l.medidorId}</MedidorId>
      <OperarioId>${l.operarioId}</OperarioId>
      <ValorLectura>${l.valorLectura}</ValorLectura>
      <Consumo>${l.consumo}</Consumo>
      <FechaHora>${l.fechaHora?.toDate?.()?.toISOString() || ''}</FechaHora>
      <ZonaId>${l.zonaId}</ZonaId>
      <RutaId>${l.rutaId}</RutaId>
      <Estado>${l.estadoValidacion}</Estado>
      <Anomalia>${l.anomalia || 'ninguna'}</Anomalia>
    </Lectura>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<PaqueteLecturas periodo="${data.periodo}">
  <Metadata>
    <Empresa>${data.empresa}</Empresa>
    <GeneradoPor>${data.generadoPor}</GeneradoPor>
    <Fecha>${new Date().toISOString()}</Fecha>
    <TotalRegistros>${data.lecturas.length}</TotalRegistros>
  </Metadata>
  <Lecturas>
${lecturasXml}
  </Lecturas>
</PaqueteLecturas>`;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
