import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { generatePDF, addHeader, addTable, addSectionTitle, addFooter, addKeyValue } from '../utils/pdf-generator';
import type jsPDF from 'jspdf';

function formatTimestamp(ts: unknown): string {
  if (!ts) return '-';
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts) {
    return (ts as { toDate: () => Date }).toDate().toLocaleDateString('es-PE');
  }
  return String(ts);
}

export async function generateReporteIndividual(clienteId: string, periodo: string): Promise<jsPDF> {
  const pdfDoc = generatePDF({
    title: 'Reporte Individual de Cliente',
    subtitle: `Cliente: ${clienteId}`,
    periodo,
    generadoPor: 'Vertiente Reader Web',
  });

  let y = 55;

  // Fetch client
  const clienteRef = doc(db, 'clientes', clienteId);
  const clienteSnap = await getDoc(clienteRef);

  if (clienteSnap.exists()) {
    const c = clienteSnap.data();
    y = addSectionTitle(pdfDoc, 'Datos del Cliente', y);
    y = addKeyValue(pdfDoc, 'Nombre', c.nombreCompleto || '-', y);
    y = addKeyValue(pdfDoc, 'Documento', `${c.tipoDocumento || ''} ${c.numeroDocumento || ''}`, y);
    y = addKeyValue(pdfDoc, 'Dirección', c.direccion || '-', y);
    y = addKeyValue(pdfDoc, 'Estado', c.estado || '-', y);
    y += 5;
  } else {
    y = addSectionTitle(pdfDoc, 'Cliente no encontrado', y);
    y += 5;
  }

  // Fetch lecturas for client's meters
  const medidoresQ = query(collection(db, 'medidores'), where('clienteId', '==', clienteId));
  const medidoresSnap = await getDocs(medidoresQ);
  const medidorIds = medidoresSnap.docs.map(d => d.id);

  if (medidorIds.length > 0) {
    y = addSectionTitle(pdfDoc, 'Historial de Lecturas', y);

    const lecturasQ = query(
      collection(db, 'lecturas'),
      where('medidorId', 'in', medidorIds.slice(0, 10)),
      orderBy('fechaHora', 'desc'),
      limit(50)
    );
    const lecturasSnap = await getDocs(lecturasQ);

    const rows = lecturasSnap.docs.map(d => {
      const l = d.data();
      return [
        formatTimestamp(l.fechaHora),
        l.medidorId?.substring(0, 12) || '-',
        String(l.valorLectura ?? '-'),
        String(l.consumo ?? '-'),
        l.estadoValidacion || l.estado || '-',
      ];
    });

    if (rows.length > 0) {
      y = addTable(pdfDoc, ['Fecha', 'Medidor', 'Lectura', 'Consumo (m³)', 'Estado'], rows, y, {
        columnWidths: [35, 40, 30, 35, 42],
      });

      // Stats
      const valores = lecturasSnap.docs.map(d => d.data().valorLectura || 0);
      const consumos = lecturasSnap.docs.map(d => d.data().consumo || 0);
      y += 5;
      y = addSectionTitle(pdfDoc, 'Estadísticas', y);
      y = addKeyValue(pdfDoc, 'Total lecturas', String(valores.length), y);
      y = addKeyValue(pdfDoc, 'Consumo promedio', (consumos.reduce((a: number, b: number) => a + b, 0) / consumos.length).toFixed(2) + ' m³', y);
      y = addKeyValue(pdfDoc, 'Consumo máximo', Math.max(...consumos).toFixed(2) + ' m³', y);
      y = addKeyValue(pdfDoc, 'Consumo mínimo', Math.min(...consumos).toFixed(2) + ' m³', y);
    } else {
      pdfDoc.setFontSize(9);
      pdfDoc.setTextColor(150, 150, 150);
      pdfDoc.text('Sin lecturas para este periodo.', 14, y);
    }
  } else {
    pdfDoc.setFontSize(9);
    pdfDoc.setTextColor(150, 150, 150);
    pdfDoc.text('No se encontraron medidores para este cliente.', 14, y);
  }

  const totalPages = pdfDoc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdfDoc.setPage(i);
    addFooter(pdfDoc, i, totalPages);
  }

  return pdfDoc;
}

export async function generateReporteZona(zonaId: string, periodo: string): Promise<jsPDF> {
  const pdfDoc = generatePDF({
    title: 'Reporte por Zona',
    subtitle: `Zona: ${zonaId}`,
    periodo,
    generadoPor: 'Vertiente Reader Web',
  });

  let y = 55;

  // Fetch zona
  const zonaRef = doc(db, 'zonas', zonaId);
  const zonaSnap = await getDoc(zonaRef);

  if (zonaSnap.exists()) {
    const z = zonaSnap.data();
    y = addSectionTitle(pdfDoc, 'Datos de la Zona', y);
    y = addKeyValue(pdfDoc, 'Nombre', z.nombre || '-', y);
    y = addKeyValue(pdfDoc, 'Código', z.codigo || '-', y);
    y = addKeyValue(pdfDoc, 'Descripción', z.descripcion || '-', y);
    y += 5;
  }

  // Fetch medidores in zona
  const medidoresQ = query(collection(db, 'medidores'), where('zonaId', '==', zonaId));
  const medidoresSnap = await getDocs(medidoresQ);

  y = addSectionTitle(pdfDoc, 'Resumen', y);
  y = addKeyValue(pdfDoc, 'Total medidores', String(medidoresSnap.size), y);

  const leidos = medidoresSnap.docs.filter(d => d.data().estadoLectura === 'leido').length;
  y = addKeyValue(pdfDoc, 'Medidores leídos', String(leidos), y);
  y = addKeyValue(pdfDoc, 'Avance', ((leidos / Math.max(medidoresSnap.size, 1)) * 100).toFixed(1) + '%', y);
  y += 5;

  // Lecturas de la zona
  const lecturasQ = query(
    collection(db, 'lecturas'),
    where('zonaId', '==', zonaId),
    orderBy('fechaHora', 'desc'),
    limit(100)
  );
  const lecturasSnap = await getDocs(lecturasQ);

  if (lecturasSnap.size > 0) {
    y = addSectionTitle(pdfDoc, 'Top Consumidores', y);
    const consumoMap: Record<string, number> = {};
    lecturasSnap.docs.forEach(d => {
      const l = d.data();
      const key = l.medidorId || 'unknown';
      consumoMap[key] = (consumoMap[key] || 0) + (l.consumo || 0);
    });

    const sorted = Object.entries(consumoMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const rows = sorted.map(([medId, consumo]) => [medId.substring(0, 20), consumo.toFixed(2) + ' m³']);
    y = addTable(pdfDoc, ['Medidor', 'Consumo Total'], rows, y, { columnWidths: [100, 82] });

    // Anomalías
    const anomalias = lecturasSnap.docs.filter(d => {
      const a = d.data().anomalia;
      return a && a !== 'ninguna';
    });
    if (anomalias.length > 0) {
      y += 5;
      y = addSectionTitle(pdfDoc, 'Anomalías Detectadas', y);
      const anomRows = anomalias.slice(0, 15).map(d => {
        const l = d.data();
        return [formatTimestamp(l.fechaHora), l.medidorId?.substring(0, 15) || '-', l.anomalia || '-'];
      });
      y = addTable(pdfDoc, ['Fecha', 'Medidor', 'Anomalía'], anomRows, y, { columnWidths: [50, 70, 62] });
    }
  } else {
    pdfDoc.setFontSize(9);
    pdfDoc.setTextColor(150, 150, 150);
    pdfDoc.text('Sin datos para este periodo.', 14, y);
  }

  const totalPages = pdfDoc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdfDoc.setPage(i);
    addFooter(pdfDoc, i, totalPages);
  }

  return pdfDoc;
}

export async function generateReporteOperario(operarioId: string, periodo: string): Promise<jsPDF> {
  const pdfDoc = generatePDF({
    title: 'Reporte de Operario',
    subtitle: `Operario: ${operarioId}`,
    periodo,
    generadoPor: 'Vertiente Reader Web',
  });

  let y = 55;

  // Fetch user
  const userRef = doc(db, 'users', operarioId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const u = userSnap.data();
    y = addSectionTitle(pdfDoc, 'Datos del Operario', y);
    y = addKeyValue(pdfDoc, 'Nombre', `${u.nombre || ''} ${u.apellidos || ''}`.trim(), y);
    y = addKeyValue(pdfDoc, 'Email', u.email || '-', y);
    y = addKeyValue(pdfDoc, 'Rol', u.usertype || '-', y);
    y += 5;
  }

  // Fetch lecturas by operario
  const lecturasQ = query(
    collection(db, 'lecturas'),
    where('operarioId', '==', operarioId),
    orderBy('fechaHora', 'desc'),
    limit(200)
  );
  const lecturasSnap = await getDocs(lecturasQ);

  y = addSectionTitle(pdfDoc, 'Productividad', y);
  y = addKeyValue(pdfDoc, 'Total lecturas', String(lecturasSnap.size), y);

  const validadas = lecturasSnap.docs.filter(d => d.data().estadoValidacion === 'validada').length;
  const rechazadas = lecturasSnap.docs.filter(d => d.data().estadoValidacion === 'rechazada').length;
  y = addKeyValue(pdfDoc, 'Validadas', String(validadas), y);
  y = addKeyValue(pdfDoc, 'Rechazadas', String(rechazadas), y);
  y = addKeyValue(pdfDoc, 'Tasa de aprobación', lecturasSnap.size > 0 ? ((validadas / lecturasSnap.size) * 100).toFixed(1) + '%' : 'N/A', y);
  y += 5;

  // Rutas cubiertas
  const rutasSet = new Set<string>();
  lecturasSnap.docs.forEach(d => {
    const r = d.data().rutaId;
    if (r) rutasSet.add(r);
  });
  y = addKeyValue(pdfDoc, 'Rutas cubiertas', String(rutasSet.size), y);
  y += 5;

  if (lecturasSnap.size > 0) {
    y = addSectionTitle(pdfDoc, 'Últimas Lecturas', y);
    const rows = lecturasSnap.docs.slice(0, 20).map(d => {
      const l = d.data();
      return [
        formatTimestamp(l.fechaHora),
        l.medidorId?.substring(0, 12) || '-',
        String(l.valorLectura ?? '-'),
        l.estadoValidacion || '-',
        l.anomalia || 'ninguna',
      ];
    });
    y = addTable(pdfDoc, ['Fecha', 'Medidor', 'Lectura', 'Estado', 'Anomalía'], rows, y, {
      columnWidths: [35, 38, 30, 40, 39],
    });
  }

  const totalPages = pdfDoc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdfDoc.setPage(i);
    addFooter(pdfDoc, i, totalPages);
  }

  return pdfDoc;
}

export async function generateReporteEjecutivo(periodo: string, companiId: string): Promise<jsPDF> {
  const pdfDoc = generatePDF({
    title: 'Reporte Ejecutivo del Periodo',
    subtitle: `Resumen gerencial`,
    periodo,
    empresa: companiId,
    generadoPor: 'Vertiente Reader Web',
  });

  let y = 55;

  // Fetch all lecturas
  const lecturasQ = query(
    collection(db, 'lecturas'),
    orderBy('fechaHora', 'desc'),
    limit(500)
  );
  const lecturasSnap = await getDocs(lecturasQ);

  y = addSectionTitle(pdfDoc, 'KPIs del Periodo', y);
  y = addKeyValue(pdfDoc, 'Total lecturas', String(lecturasSnap.size), y);

  const validadas = lecturasSnap.docs.filter(d => d.data().estadoValidacion === 'validada').length;
  const pendientes = lecturasSnap.docs.filter(d => d.data().estadoValidacion === 'pendiente').length;
  const conAnomalia = lecturasSnap.docs.filter(d => {
    const a = d.data().anomalia;
    return a && a !== 'ninguna';
  }).length;

  y = addKeyValue(pdfDoc, 'Validadas', String(validadas), y);
  y = addKeyValue(pdfDoc, 'Pendientes', String(pendientes), y);
  y = addKeyValue(pdfDoc, 'Con anomalía', String(conAnomalia), y);
  y = addKeyValue(pdfDoc, 'Tasa de completitud', ((validadas / Math.max(lecturasSnap.size, 1)) * 100).toFixed(1) + '%', y);
  y += 5;

  // Consumo stats
  const consumos = lecturasSnap.docs.map(d => d.data().consumo || 0).filter((c: number) => c > 0);
  if (consumos.length > 0) {
    y = addSectionTitle(pdfDoc, 'Consumo', y);
    const avg = consumos.reduce((a: number, b: number) => a + b, 0) / consumos.length;
    y = addKeyValue(pdfDoc, 'Consumo promedio', avg.toFixed(2) + ' m³', y);
    y = addKeyValue(pdfDoc, 'Consumo total', consumos.reduce((a: number, b: number) => a + b, 0).toFixed(2) + ' m³', y);
    y += 5;
  }

  // Ranking operarios
  const operarioMap: Record<string, number> = {};
  lecturasSnap.docs.forEach(d => {
    const op = d.data().operarioId;
    if (op) operarioMap[op] = (operarioMap[op] || 0) + 1;
  });

  if (Object.keys(operarioMap).length > 0) {
    y = addSectionTitle(pdfDoc, 'Ranking de Operarios', y);
    const sorted = Object.entries(operarioMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const rows = sorted.map(([opId, count], i) => [
      String(i + 1),
      opId.substring(0, 20),
      String(count),
    ]);
    y = addTable(pdfDoc, ['#', 'Operario', 'Lecturas'], rows, y, { columnWidths: [20, 110, 52] });
  }

  // Anomalías resumen
  const anomaliaMap: Record<string, number> = {};
  lecturasSnap.docs.forEach(d => {
    const a = d.data().anomalia;
    if (a && a !== 'ninguna') anomaliaMap[a] = (anomaliaMap[a] || 0) + 1;
  });

  if (Object.keys(anomaliaMap).length > 0) {
    y += 5;
    y = addSectionTitle(pdfDoc, 'Resumen de Anomalías', y);
    const rows = Object.entries(anomaliaMap).map(([tipo, count]) => [tipo, String(count)]);
    y = addTable(pdfDoc, ['Tipo', 'Cantidad'], rows, y, { columnWidths: [110, 72] });
  }

  const totalPages = pdfDoc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdfDoc.setPage(i);
    addFooter(pdfDoc, i, totalPages);
  }

  return pdfDoc;
}
