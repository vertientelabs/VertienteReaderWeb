import jsPDF from 'jspdf';

export interface PDFConfig {
  title: string;
  subtitle?: string;
  empresa?: string;
  periodo?: string;
  generadoPor?: string;
}

export function generatePDF(config: PDFConfig): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  addHeader(doc, config);
  return doc;
}

export function addHeader(doc: jsPDF, config: PDFConfig): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top bar
  doc.setFillColor(10, 132, 255);
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Company name
  let y = 18;
  if (config.empresa) {
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(config.empresa, 14, y);
    y += 8;
  }

  // Title
  doc.setFontSize(20);
  doc.setTextColor(30, 30, 30);
  doc.text(config.title, 14, y);
  y += 7;

  // Subtitle
  if (config.subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(config.subtitle, 14, y);
    y += 6;
  }

  // Metadata line
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const meta: string[] = [];
  if (config.periodo) meta.push(`Periodo: ${config.periodo}`);
  if (config.generadoPor) meta.push(`Generado por: ${config.generadoPor}`);
  meta.push(`Fecha: ${new Date().toLocaleDateString('es-PE')}`);
  doc.text(meta.join('  |  '), 14, y);
  y += 4;

  // Separator line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  return y;
}

export function addFooter(doc: jsPDF, pageNum: number, totalPages: number): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Vertiente Reader Web - Reporte generado automáticamente', 14, pageHeight - 10);
  doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
}

export function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(13);
  doc.setTextColor(10, 132, 255);
  doc.text(title, 14, y);
  y += 2;
  doc.setDrawColor(10, 132, 255);
  doc.setLineWidth(0.8);
  doc.line(14, y, 70, y);
  y += 6;
  return y;
}

export function addTable(
  doc: jsPDF,
  headers: string[],
  rows: string[][],
  startY: number,
  options?: { columnWidths?: number[] }
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const tableWidth = pageWidth - margin * 2;
  const colCount = headers.length;
  const colWidths = options?.columnWidths || headers.map(() => tableWidth / colCount);
  const rowHeight = 7;
  let y = startY;

  // Header row
  doc.setFillColor(245, 247, 250);
  doc.rect(margin, y, tableWidth, rowHeight, 'F');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);

  let x = margin;
  for (let i = 0; i < colCount; i++) {
    doc.text(headers[i], x + 2, y + 5);
    x += colWidths[i];
  }
  y += rowHeight;

  // Separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  // Data rows
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);

  for (let r = 0; r < rows.length; r++) {
    // Check page break
    if (y + rowHeight > pageHeight - 25) {
      doc.addPage();
      y = 20;
      // Re-draw header on new page
      doc.setFillColor(245, 247, 250);
      doc.rect(margin, y, tableWidth, rowHeight, 'F');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      x = margin;
      for (let i = 0; i < colCount; i++) {
        doc.text(headers[i], x + 2, y + 5);
        x += colWidths[i];
      }
      y += rowHeight;
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
    }

    // Alternate row bg
    if (r % 2 === 0) {
      doc.setFillColor(252, 252, 253);
      doc.rect(margin, y, tableWidth, rowHeight, 'F');
    }

    x = margin;
    for (let i = 0; i < colCount; i++) {
      const text = (rows[r][i] || '').substring(0, 35);
      doc.text(text, x + 2, y + 5);
      x += colWidths[i];
    }
    y += rowHeight;
  }

  // Bottom border
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);

  return y + 5;
}

export function addKeyValue(doc: jsPDF, key: string, value: string, y: number, x: number = 14): number {
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text(key + ':', x, y);
  doc.setTextColor(40, 40, 40);
  doc.text(value, x + 40, y);
  return y + 5;
}
