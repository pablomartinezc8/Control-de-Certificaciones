import jsPDF from 'jspdf';
import html2canvasPro from 'html2canvas-pro';

export interface ExportPdfOptions {
  fileName?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  scale?: number;
  marginMm?: number;
  hideElementIds?: string[];
}

/**
 * Exporta un elemento HTML directamente a un archivo PDF estructurado y de alta resolución.
 * Soporta documentos de una o múltiples páginas con ajuste automático de escala y márgenes.
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
      },
    });

    // Dimensiones en mm según formato
    const pdfWidth = orientation === 'portrait' ? (format === 'a4' ? 210 : 215.9) : (format === 'a4' ? 297 : 279.4);
    const pdfHeight = orientation === 'portrait' ? (format === 'a4' ? 297 : 279.4) : (format === 'a4' ? 210 : 215.9);

    const contentWidth = pdfWidth - marginMm * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
      compress: true,
    });

    const pageHeightAvailable = pdfHeight - marginMm * 2;

    if (contentHeight <= pageHeightAvailable) {
      // Entra perfectamente en una sola página
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', marginMm, marginMm, contentWidth, contentHeight);
    } else {
      // Documento multipágina: segmentar canvas por páginas para evitar cortes abruptos
      const pxPerPage = (canvas.width / contentWidth) * pageHeightAvailable;
      let renderedHeight = 0;
      let pageIndex = 0;

      while (renderedHeight < canvas.height) {
        if (pageIndex > 0) {
          pdf.addPage(format, orientation);
        }

        const chunkHeight = Math.min(pxPerPage, canvas.height - renderedHeight);

        // Crear canvas temporal para la porción de la página
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

          const chunkImgData = tempCanvas.toDataURL('image/jpeg', 0.95);
          const chunkMmHeight = (chunkHeight * contentWidth) / canvas.width;
          pdf.addImage(chunkImgData, 'JPEG', marginMm, marginMm, contentWidth, chunkMmHeight);
        }

        renderedHeight += chunkHeight;
        pageIndex++;
      }
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generando PDF:', error);
    return false;
  }
}
