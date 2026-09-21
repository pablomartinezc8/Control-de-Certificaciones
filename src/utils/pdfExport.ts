import jsPDF from 'jspdf';
import html2canvasPro from 'html2canvas-pro';

export interface ExportPdfOptions {
  fileName?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  scale?: number;
  marginMm?: number;
  hideElementIds?: string[];
  projectTitle?: string;
}

/**
 * Exporta un elemento HTML directamente a un archivo PDF estructurado y de alta resolución.
 * Garantiza:
 * 1. Fondo 100% blanco puro.
 * 2. Aprovechamiento óptimo de la hoja A4.
 * 3. Inclusión del pie de página oficial y numeración en TODAS las hojas del documento.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportPdfOptions = {}
): Promise<boolean> {
  const orientation = options.orientation || 'portrait';
  const format = options.format || 'a4';
  const scale = options.scale || 2;
  const marginMm = options.marginMm ?? 10;
  const fileName = options.fileName || 'reporte_ejecutivo.pdf';
  const hideIds = options.hideElementIds || [];

  try {
    const canvas = await html2canvasPro(element, {
      scale,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
      onclone: (clonedDoc) => {
        hideIds.forEach((id) => {
          const el = clonedDoc.getElementById(id);
          if (el) el.style.display = 'none';
        });

        // Asegurar tamaños explícitos en elementos SVG para Recharts y gráficos
        const svgs = clonedDoc.querySelectorAll('svg');
        svgs.forEach((svg) => {
          const width = svg.clientWidth || svg.getBoundingClientRect().width;
          const height = svg.clientHeight || svg.getBoundingClientRect().height;
          if (width > 0) svg.setAttribute('width', `${width}`);
          if (height > 0) svg.setAttribute('height', `${height}`);
        });

        // Forzar ancho completo y fondo blanco puro en el clon
        const root = clonedDoc.getElementById('printable-report-content');
        if (root) {
          root.style.width = '100%';
          root.style.maxWidth = '100%';
          root.style.backgroundColor = '#ffffff';
          root.style.boxShadow = 'none';
          root.style.border = 'none';
        }
      },
    });

    // Dimensiones en mm según formato
    const pdfWidth = orientation === 'portrait' ? (format === 'a4' ? 210 : 215.9) : (format === 'a4' ? 297 : 279.4);
    const pdfHeight = orientation === 'portrait' ? (format === 'a4' ? 297 : 279.4) : (format === 'a4' ? 210 : 215.9);

    const footerReservedMm = 10; // Espacio reservado para el pie de página en cada hoja
    const contentWidth = pdfWidth - marginMm * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;
    const pageHeightAvailable = pdfHeight - marginMm * 2 - footerReservedMm;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
      compress: true,
    });

    if (contentHeight <= pageHeightAvailable) {
      // Entra en una sola página
      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      pdf.addImage(imgData, 'JPEG', marginMm, marginMm, contentWidth, contentHeight);
    } else {
      // Documento multipágina: segmentar canvas respetando el espacio del pie de página
      const pxPerPage = (canvas.width / contentWidth) * pageHeightAvailable;
      let renderedHeight = 0;
      let pageIndex = 0;

      while (renderedHeight < canvas.height) {
        if (pageIndex > 0) {
          pdf.addPage(format, orientation);
        }

        const chunkHeight = Math.min(pxPerPage, canvas.height - renderedHeight);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = chunkHeight;
        const ctx = tempCanvas.getContext('2d');

        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            renderedHeight,
            canvas.width,
            chunkHeight,
            0,
            0,
            canvas.width,
            chunkHeight
          );

          const chunkImgData = tempCanvas.toDataURL('image/jpeg', 0.96);
          const chunkMmHeight = (chunkHeight * contentWidth) / canvas.width;
          pdf.addImage(chunkImgData, 'JPEG', marginMm, marginMm, contentWidth, chunkMmHeight);
        }

        renderedHeight += chunkHeight;
        pageIndex++;
      }
    }

    // Agregar pie de página y numeración en TODAS las hojas
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139); // slate-500

      // Línea divisoria superior del pie de página
      const lineY = pdfHeight - marginMm - 4;
      pdf.setDrawColor(226, 232, 240); // slate-200
      pdf.setLineWidth(0.2);
      pdf.line(marginMm, lineY, pdfWidth - marginMm, lineY);

      // Texto de confidencialidad
      const footerNotice =
        'Documento confidencial emitido por el Sistema de Control de Certificaciones e Ingeniería TAGING. Prohibida su copia o distribución no autorizada.';
      pdf.text(footerNotice, marginMm, pdfHeight - marginMm);

      // Número de página
      const pageStr = `${i} / ${totalPages}`;
      const textWidth = pdf.getTextWidth(pageStr);
      pdf.text(pageStr, pdfWidth - marginMm - textWidth, pdfHeight - marginMm);
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generando PDF:', error);
    return false;
  }
}
