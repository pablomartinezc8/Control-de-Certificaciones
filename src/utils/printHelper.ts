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
 * Imprime el reporte de forma totalmente aislada a través de un iframe invisible.
 * Esto garantiza que:
 * 1. NUNCA salga la página web o el dashboard de fondo (fondo 100% blanco puro).
 * 2. El reporte ocupe el ancho completo de la hoja A4 / Carta sin recortes.
 * 3. Todas las hojas tengan el pie de página oficial ("Documento confidencial...").
 * 4. Las tablas que no entren completas en la hoja salten íntegras abajo sin cortarse a la mitad.
 */
export function printReportIsolated(printableHtml: string, title: string): boolean {
  try {
    // Eliminar cualquier iframe de impresión previo si quedó en el DOM
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

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 14mm 12mm;
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
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            width: 100% !important;
          }

          /* Contenedor principal a ancho completo */
          .report-root {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto;
            background: #ffffff !important;
          }

          /* Pie de página repetido en CADA hoja impresa */
          .print-footer-fixed {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 22px;
            border-top: 1px solid #cbd5e1;
            padding-top: 4px;
            font-size: 8.5px;
            color: #64748b;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #ffffff;
            z-index: 9999;
          }

          /* Espaciador al pie para que las tablas no se superpongan con el footer fijo */
          .print-footer-spacer {
            height: 28px;
          }

          /* Estilos de tablas */
          table {
            width: 100% !important;
            border-collapse: collapse;
            font-size: 10.5px;
            page-break-inside: auto;
          }

          thead {
            display: table-header-group;
          }

          tfoot {
            display: table-footer-group;
          }

          /* Cada fila evita cortarse a la mitad */
          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          th, td {
            padding: 5px 8px;
            border: 1px solid #cbd5e1;
          }

          /* Regla estricta para bloques que no deben dividirse entre páginas:
             Si la tabla o el bloque no entra en la hoja 1, salta completo a la hoja 2 */
          .print-avoid-break,
          .print-keep-together,
          .print-table-section {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            display: block !important;
            margin-bottom: 14px;
          }

          .signatures-section {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-top: 20px;
            padding-top: 14px;
          }

          /* Clases de utilidad */
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .uppercase { text-transform: uppercase; }
          .text-rose { color: #b91c1c; }
          .text-emerald { color: #047857; }
          .text-blue { color: #1d4ed8; }
          .text-slate { color: #475569; }

          @media screen {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <!-- Pie de página fijo que se replica en todas las hojas impresas -->
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
            }, 250);
          });
        </script>
      </body>
      </html>
    `);
    iframeDoc.close();

    // Invocar impresión con fallback
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Fallback al invocar impresión de iframe:', err);
      }
    }, 400);

    return true;
  } catch (err) {
    console.error('Error en printReportIsolated:', err);
    return false;
  }
}

/**
 * Abre el reporte en una ventana independiente limpia para impresión a pantalla completa
 */
export function printHtmlInNewWindow(title: string, printableHtml: string): boolean {
  try {
    const printWindow = window.open('', '_blank', 'width=1080,height=850');
    if (!printWindow) {
      return false;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 14mm 12mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 24px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #ffffff;
            color: #0f172a;
          }
          .print-toolbar {
            position: sticky;
            top: 0;
            background: #0f172a;
            color: white;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 10px;
            margin-bottom: 24px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            z-index: 1000;
          }
          .btn-print {
            background: #0284c7;
            color: white;
            border: none;
            padding: 8px 20px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 8px;
            cursor: pointer;
          }
          .btn-print:hover {
            background: #0369a1;
          }
          .btn-close {
            background: transparent;
            color: #94a3b8;
            border: 1px solid #334155;
            padding: 8px 14px;
            font-size: 12px;
            border-radius: 8px;
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
              height: 22px;
              border-top: 1px solid #cbd5e1;
              padding-top: 4px;
              font-size: 8.5px;
              color: #64748b;
              display: flex !important;
              justify-content: space-between;
              align-items: center;
              background: #ffffff;
            }
            .print-keep-together,
            .print-table-section {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
              display: block !important;
            }
            table {
              width: 100% !important;
            }
            tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-toolbar">
          <div>
            <strong style="font-size: 14px;">${title}</strong>
            <div style="font-size: 11px; color: #94a3b8;">Listo para enviar a la impresora de tu equipo o Guardar como PDF</div>
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
