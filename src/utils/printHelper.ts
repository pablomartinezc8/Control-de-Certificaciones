/**
 * Utilidades para impresión nativa del sistema y reportes ejecutivos limpios
 */

export function isSandboxedIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Obtiene todos los estilos CSS y enlaces de estilos del documento actual
 * para inyectarlos en la ventana o iframe de impresión.
 */
function getDocumentStyles(): string {
  try {
    const styleElements = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    );
    return styleElements.map((el) => el.outerHTML).join('\n');
  } catch {
    return '';
  }
}

/**
 * Imprime el reporte de forma totalmente aislada a través de un iframe invisible.
 * Garantiza:
 * 1. Fondo 100% blanco puro (sin elementos de la web de fondo).
 * 2. Formato ajustado para 1 SOLA HOJA A4 cuando el contenido es ejecutivo.
 * 3. Logotipos SVG con dimensiones fijas estrictas (no se expanden).
 * 4. Pie de página institucional en cada hoja.
 */
export function printReportIsolated(printableHtml: string, title: string): boolean {
  try {
    // Eliminar cualquier iframe previo
    const oldIframe = document.getElementById('taging-print-isolated-iframe');
    if (oldIframe) {
      oldIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'taging-print-isolated-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-9999';

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      console.warn('No se pudo acceder al documento del iframe de impresión');
      return false;
    }

    const parentStyles = getDocumentStyles();

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        ${parentStyles}
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm 10mm 10mm;
          }

          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 10px;
            line-height: 1.35;
            width: 100% !important;
          }

          /* Control de SVG: iconos compactos pero gráficos a tamaño completo */
          svg:not(.chart-svg):not(.recharts-surface) {
            display: inline-block;
            vertical-align: middle;
            max-width: 36px;
            max-height: 36px;
          }

          svg.chart-svg, .recharts-surface {
            width: 100% !important;
            max-width: 100% !important;
            max-height: none !important;
            height: auto !important;
            display: block !important;
          }

          .report-root {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto;
            background: #ffffff !important;
            padding: 0 !important;
          }

          /* Pie de página repetido en cada hoja */
          .print-footer-fixed {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 20px;
            border-top: 1px solid #cbd5e1;
            padding-top: 3px;
            font-size: 8px;
            color: #64748b;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #ffffff;
            z-index: 9999;
          }

          .print-footer-spacer {
            height: 24px;
          }

          /* Estilos de tablas ejecutivas compactas */
          table {
            width: 100% !important;
            border-collapse: collapse;
            font-size: 10px;
          }

          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          th, td {
            padding: 4px 6px;
            border: 1px solid #cbd5e1;
          }

          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /* Grid y flex fallback en caso de falta de clases */
          .grid-2col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .grid-3col {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 8px;
          }
          .grid-4col {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 8px;
          }
          .flex-between {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          @media screen {
            body {
              padding: 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-footer-fixed">
          <div>Documento confidencial emitido por el Sistema de Control de Certificaciones e Ingeniería TAGING. Prohibida su copia o distribución no autorizada.</div>
          <div style="font-weight: 600; color: #475569;">${title}</div>
        </div>

        <div class="report-root">
          ${printableHtml}
          <div class="print-footer-spacer"></div>
        </div>

        <script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 300);
          });
        </script>
      </body>
      </html>
    `);
    iframeDoc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Fallback al invocar impresión de iframe:', err);
      }
    }, 450);

    return true;
  } catch (err) {
    console.error('Error en printReportIsolated:', err);
    return false;
  }
}

/**
 * Abre el reporte en una ventana independiente limpia para impresión
 */
export function printHtmlInNewWindow(title: string, printableHtml: string): boolean {
  try {
    const printWindow = window.open('', '_blank', 'width=1080,height=850');
    if (!printWindow) {
      return false;
    }

    const parentStyles = getDocumentStyles();

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        ${parentStyles}
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm 10mm 10mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #ffffff;
            color: #0f172a;
            font-size: 10px;
          }
          svg:not(.chart-svg):not(.recharts-surface) {
            max-width: 36px;
            max-height: 36px;
          }
          svg.chart-svg, .recharts-surface {
            width: 100% !important;
            max-width: 100% !important;
            max-height: none !important;
            height: auto !important;
            display: block !important;
          }
          .print-toolbar {
            position: sticky;
            top: 0;
            background: #0f172a;
            color: white;
            padding: 10px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            z-index: 1000;
          }
          .btn-print {
            background: #0284c7;
            color: white;
            border: none;
            padding: 7px 18px;
            font-size: 12px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
          }
          .btn-print:hover {
            background: #0369a1;
          }
          .btn-close {
            background: transparent;
            color: #94a3b8;
            border: 1px solid #334155;
            padding: 7px 12px;
            font-size: 12px;
            border-radius: 6px;
            cursor: pointer;
          }
          .btn-close:hover {
            color: white;
            border-color: #64748b;
          }
          .print-footer-fixed {
            display: none;
          }
          @media print {
            .print-toolbar {
              display: none !important;
            }
            body {
              padding: 0 !important;
              background: #ffffff !important;
            }
            .print-footer-fixed {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              height: 20px;
              border-top: 1px solid #cbd5e1;
              padding-top: 3px;
              font-size: 8px;
              color: #64748b;
              display: flex !important;
              justify-content: space-between;
              align-items: center;
              background: #ffffff;
            }
            .print-avoid-break {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-toolbar">
          <div>
            <strong style="font-size: 13px;">${title}</strong>
            <div style="font-size: 11px; color: #94a3b8;">Listo para imprimir o Guardar como PDF (ajustado para 1 sola hoja)</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-print" onclick="window.print()">Imprimir / Guardar en PDF</button>
            <button class="btn-close" onclick="window.close()">Cerrar</button>
          </div>
        </div>

        <div class="print-footer-fixed">
          <div>Documento confidencial emitido por el Sistema de Control de Certificaciones e Ingeniería TAGING. Prohibida su copia o distribución no autorizada.</div>
          <div style="font-weight: 600; color: #475569;">${title}</div>
        </div>

        <div>
          ${printableHtml}
        </div>

        <script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              window.print();
            }, 300);
          });
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    return true;
  } catch (err) {
    console.error('Error al abrir ventana de impresión:', err);
    return false;
  }
}
