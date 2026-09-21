/**
 * Utilidades para impresión nativa del sistema y reportes ejecutivos
 */

export function isSandboxedIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Invoca el diálogo nativo de impresión del sistema con soporte para fallbacks.
 * Devuelve true si se pudo ejecutar sin excepciones.
 */
export function triggerSystemPrint(): boolean {
  try {
    window.print();
    return true;
  } catch (err) {
    console.warn('Fallo al invocar window.print() directamente:', err);
    return false;
  }
}

/**
 * Abre el contenido imprimible en una ventana o pestaña limpia independiente
 * y dispara automáticamente el cuadro de diálogo de impresión de la computadora.
 */
export function printHtmlInNewWindow(title: string, printableHtml: string): boolean {
  try {
    const printWindow = window.open('', '_blank', 'width=1024,height=800');
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
            margin: 12mm 10mm 15mm 10mm;
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
            border-radius: 8px;
            margin-bottom: 24px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          }
          .btn-print {
            background: #0284c7;
            color: white;
            border: none;
            padding: 8px 18px;
            font-size: 13px;
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
            padding: 6px 14px;
            font-size: 12px;
            border-radius: 6px;
            cursor: pointer;
          }
          .btn-close:hover {
            color: white;
            border-color: #64748b;
          }
          @media print {
            .print-toolbar {
              display: none !important;
            }
            body {
              padding: 0 !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-toolbar">
          <div>
            <strong style="font-size: 14px;">${title}</strong>
            <div style="font-size: 11px; color: #94a3b8;">Listo para enviar a la impresora de tu equipo o guardar en PDF</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-print" onclick="window.print()">Imprimir / Guardar en PDF</button>
            <button class="btn-close" onclick="window.close()">Cerrar</button>
          </div>
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
