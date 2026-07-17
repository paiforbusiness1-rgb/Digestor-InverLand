import { jsPDF } from 'jspdf';
import { RealEstateDocument } from '../types';

export function generatePDFReport(activeDoc: RealEstateDocument) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const analysis = activeDoc.analysis;
  if (!analysis) return;

  const docWidth = 210;
  const docHeight = 297;
  const margin = 20;
  const contentWidth = docWidth - (margin * 2);

  let y = 15;

  // Draw Page Header (for pages 2+)
  function drawHeader() {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Muted Gray
    doc.text('INVERLAND DESARROLLOS  |  AUDITORÍA LEGAL DE PROPIEDADES', margin, 12);
    
    // Thin gold divider under top header
    doc.setDrawColor(196, 164, 112); // Gold
    doc.setLineWidth(0.3);
    doc.line(margin, 14, docWidth - margin, 14);
  }

  // Draw Page Footer (for all pages)
  function drawFooter() {
    const pageNum = doc.getNumberOfPages();
    
    // Thin gold divider above footer
    doc.setDrawColor(196, 164, 112); // Gold
    doc.setLineWidth(0.3);
    doc.line(margin, docHeight - 15, docWidth - margin, docHeight - 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Este reporte fue generado de manera automatizada mediante Inteligencia Artificial (Gemini).', margin, docHeight - 10);
    doc.text(`Página ${pageNum}`, docWidth - margin - 15, docHeight - 10);
  }

  // Helper to check for page overflow
  function checkOverflow(neededHeight: number) {
    if (y + neededHeight > docHeight - 20) {
      drawFooter();
      doc.addPage();
      y = 25; // Reset Y with top margin
      drawHeader();
    }
  }

  // --- PAGE 1 COVER / BANNER ---
  // Draw primary dark navy banner
  doc.setFillColor(12, 21, 45); // Deep Blue
  doc.rect(0, 0, docWidth, 45, 'F');

  // Gold accent bar below banner
  doc.setFillColor(196, 164, 112); // Gold
  doc.rect(0, 45, docWidth, 3, 'F');

  // Title in the banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255); // White
  doc.text('INVERLAND DESARROLLOS', margin, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(196, 164, 112); // Gold text
  doc.text('AUDITORÍA LEGAL Y ANÁLISIS SINTÉTICO DE EXPEDIENTE', margin, 27);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240); // Soft Slate Gray
  doc.text(`Expediente: ${activeDoc.name}`, margin, 35);

  y = 60;

  // Document Metadata Table
  checkOverflow(50);
  doc.setFillColor(248, 250, 252); // Soft gray card background
  doc.setDrawColor(226, 232, 240); // Soft border
  doc.setLineWidth(0.2);
  doc.rect(margin, y, contentWidth, 38, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(12, 21, 45); // Deep Blue
  doc.text('Detalles del Expediente Analizado', margin + 5, y + 7);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 5, y + 10, margin + contentWidth - 5, y + 10);

  // Metadata Fields Grid
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate Gray
  doc.text('Categoría:', margin + 5, y + 16);
  doc.text('Fecha Carga:', margin + 5, y + 22);
  doc.text('Método de Extracción:', margin + 5, y + 28);
  doc.text('ID Documento:', margin + 5, y + 34);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59); // Dark Slate Text
  doc.text(activeDoc.category.toUpperCase(), margin + 45, y + 16);
  doc.text(activeDoc.uploadedAt, margin + 45, y + 22);
  doc.text(analysis.ocrMethodUsed || 'Extracción Digital Directa', margin + 45, y + 28);
  doc.text(activeDoc.id, margin + 45, y + 34);

  y += 48;

  // 2. Executive Summary Section
  checkOverflow(40);
  // Gold Left accent line for the header
  doc.setFillColor(196, 164, 112); // Gold
  doc.rect(margin, y, 3, 6, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(12, 21, 45); // Deep Blue
  doc.text('1. Resumen Ejecutivo por Inteligencia Artificial', margin + 6, y + 5);

  y += 10;

  // Summary content box
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59); // Dark Slate Text

  const summaryLines = doc.splitTextToSize(analysis.summary, contentWidth - 10);
  const boxHeight = (summaryLines.length * 5) + 10;

  checkOverflow(boxHeight + 10);
  doc.setFillColor(248, 250, 252); // Soft background
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, boxHeight, 'FD');

  let textY = y + 7;
  for (const line of summaryLines) {
    doc.text(line, margin + 5, textY);
    textY += 5;
  }

  y += boxHeight + 15;

  // 3. Key Parties and Attributes Section
  checkOverflow(65);
  doc.setFillColor(196, 164, 112); // Gold
  doc.rect(margin, y, 3, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(12, 21, 45); // Deep Blue
  doc.text('2. Entidades Clave y Métricas Detectadas', margin + 6, y + 5);

  y += 10;

  // Two columns for Entities vs Metrics
  const colWidth = (contentWidth - 6) / 2;
  const colHeight = 45;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  // Col 1: Entities
  doc.rect(margin, y, colWidth, colHeight, 'D');
  doc.setFillColor(12, 21, 45);
  doc.rect(margin, y, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('PARTES Y ENTIDADES', margin + 4, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('Arrendador / Vendedor:', margin + 4, y + 13);
  doc.text('Arrendatario / Comprador:', margin + 4, y + 21);
  doc.text('Dirección Propiedad:', margin + 4, y + 29);
  doc.text('Clave Catastral / Notario:', margin + 4, y + 37);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(analysis.entities.sellerOrLandlord || 'N/A', margin + 4, y + 17, { maxWidth: colWidth - 8 });
  doc.text(analysis.entities.buyerOrTenant || 'N/A', margin + 4, y + 25, { maxWidth: colWidth - 8 });
  doc.text(analysis.entities.propertyAddress || 'N/A', margin + 4, y + 33, { maxWidth: colWidth - 8 });
  doc.text(analysis.entities.cadastralKey || analysis.entities.notary || 'N/A', margin + 4, y + 41, { maxWidth: colWidth - 8 });

  // Col 2: Metrics & Dates
  doc.rect(margin + colWidth + 6, y, colWidth, colHeight, 'D');
  doc.setFillColor(12, 21, 45);
  doc.rect(margin + colWidth + 6, y, colWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('MÉTRICAS Y PLAZOS', margin + colWidth + 10, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('Superficie:', margin + colWidth + 10, y + 13);
  doc.text('Monto de Transacción:', margin + colWidth + 10, y + 21);
  doc.text('Fecha de Firma:', margin + colWidth + 10, y + 29);
  doc.text('Vigencia / Plazo:', margin + colWidth + 10, y + 37);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(analysis.metrics.surfaceArea || 'No declarada', margin + colWidth + 10, y + 17);
  const amountStr = analysis.metrics.transactionAmount ? `${analysis.metrics.currency || 'MXN'} $${analysis.metrics.transactionAmount}` : 'N/A';
  doc.text(amountStr, margin + colWidth + 10, y + 25);
  doc.text(analysis.dates.signingDate || 'N/A', margin + colWidth + 10, y + 33);
  doc.text(analysis.metrics.duration || 'N/A', margin + colWidth + 10, y + 41, { maxWidth: colWidth - 8 });

  y += colHeight + 15;

  // 4. Key Clauses Section
  checkOverflow(40);
  doc.setFillColor(196, 164, 112); // Gold
  doc.rect(margin, y, 3, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(12, 21, 45); // Deep Blue
  doc.text('3. Auditoría Legal Detallada (Cláusulas Clave)', margin + 6, y + 5);

  y += 10;

  analysis.keyClauses.forEach((clause) => {
    // Height estimation of a clause description
    const titleLines = doc.splitTextToSize(clause.title, contentWidth - 30);
    const summaryLines = doc.splitTextToSize(clause.summary, contentWidth - 10);
    const explanationLines = doc.splitTextToSize(`Análisis de riesgo: ${clause.riskExplanation}`, contentWidth - 10);
    
    const neededHeight = (titleLines.length * 5) + (summaryLines.length * 4.5) + (explanationLines.length * 4) + 16;
    checkOverflow(neededHeight);

    // Clause container Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, neededHeight, 'FD');

    // Left Border based on Risk Level (No green! High is Red, Med is Gold, Low is Slate)
    let riskColor = [100, 116, 139]; // Slate for low
    let riskBg = [241, 245, 249];
    let riskText = [71, 85, 105];

    if (clause.risk === 'high') {
      riskColor = [220, 38, 38]; // Red
      riskBg = [254, 242, 242];
      riskText = [185, 28, 28];
    } else if (clause.risk === 'medium') {
      riskColor = [196, 164, 112]; // Gold
      riskBg = [254, 251, 236];
      riskText = [133, 77, 14];
    }

    doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.rect(margin, y, 1.5, neededHeight, 'F');

    // Risk badge
    doc.setFillColor(riskBg[0], riskBg[1], riskBg[2]);
    doc.rect(margin + 5, y + 4, 16, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(riskText[0], riskText[1], riskText[2]);
    doc.text(clause.risk.toUpperCase(), margin + 13, y + 7.5, { align: 'center' });

    // Clause Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(12, 21, 45); // Deep Blue
    let titleY = y + 8;
    for (const tLine of titleLines) {
      doc.text(tLine, margin + 25, titleY);
      titleY += 5;
    }

    // Divider
    doc.setDrawColor(241, 245, 249);
    doc.line(margin + 5, titleY, margin + contentWidth - 5, titleY);
    titleY += 4;

    // Clause Summary
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85); // Slate
    for (const sLine of summaryLines) {
      doc.text(sLine, margin + 5, titleY);
      titleY += 4.5;
    }

    titleY += 1.5;

    // Risk Explanation
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Muted Slate
    for (const eLine of explanationLines) {
      doc.text(eLine, margin + 5, titleY);
      titleY += 4;
    }

    y += neededHeight + 5;
  });

  // 5. Alerts Section (if any)
  if (analysis.alerts && analysis.alerts.length > 0) {
    const alertsHeight = (analysis.alerts.length * 6) + 15;
    checkOverflow(alertsHeight);

    y += 5;
    doc.setFillColor(254, 243, 199); // Amber soft background
    doc.setDrawColor(245, 158, 11); // Amber border
    doc.rect(margin, y, contentWidth, alertsHeight, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(146, 64, 14); // Dark Amber
    doc.text('ALERTAS CRÍTICAS DETECTADAS', margin + 5, y + 7);

    // List alerts
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9);

    let alertY = y + 13;
    analysis.alerts.forEach((alert) => {
      const wrappedAlert = doc.splitTextToSize(`• ${alert.message}`, contentWidth - 15);
      wrappedAlert.forEach((line: string) => {
        doc.text(line, margin + 7, alertY);
        alertY += 4.5;
      });
    });
  }

  // Draw footer on last page
  drawFooter();

  // Save PDF
  const sanitizedFileName = activeDoc.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`auditoria_${sanitizedFileName}.pdf`);
}
