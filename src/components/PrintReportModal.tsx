import React, { useState, useRef } from 'react';
import { Proyecto } from '../types';
import { 
  formatCurrency, 
  formatShortDate,
} from '../utils/calculations';
import { 
  Printer, 
  Download, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  Briefcase,
  FileText,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { exportElementToPdf } from '../utils/pdfExport';
import { isSandboxedIframe, triggerSystemPrint, printHtmlInNewWindow } from '../utils/printHelper';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  proyecto: Proyecto;
  selectedCutoffDate: string;
  metrics: {
    totalContrato: number;
    totalConGastos: number;
    gastosGeneralesGlobales?: number;
    totalCertificado: number;
    porcentajeCertificado: number;
    totalCobrado: number;
    porcentajeCobrado: number;
    saldoPorCertificar: number;
    saldoPorCobrar: number;
  };
  vencidos: any[];
  proximos: any[];
  avancePlan: number;
  avanceReal: number;
  desvio: number;
  montoPlanificado: number;
  montoCertificado: number;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  proyecto,
  selectedCutoffDate,
  metrics,
  vencidos,
  proximos,
  avancePlan,
  avanceReal,
  desvio,
  montoPlanificado,
  montoCertificado,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [printWarning, setPrintWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const empresaNombre = proyecto.empresas?.[0]?.nombre || 'Mandante';
  const inIframe = isSandboxedIframe();

  // Acción 1: Disparar Diálogo de Impresoras del Sistema Operativo
  const handleSystemPrint = () => {
    setPrintWarning(null);
    const success = triggerSystemPrint();

    if (!success || inIframe) {
      // Si está en iframe o falla, informamos amistosamente y ofrecemos la alternativa directa
      setPrintWarning(
        'El visor de vista previa de tu navegador puede restringir ventanas modales de impresión. Si el cuadro de impresoras no apareció, utiliza el botón "Descargar PDF Directo" o "Abrir en Ventana Independiente".'
      );
    }
  };

  // Acción 2: Descargar PDF Directo usando jsPDF + html2canvasPro
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setGeneratingPdf(true);
    setPdfSuccess(false);
    setPrintWarning(null);

    try {
      const projClean = (proyecto.nombre || 'proyecto').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Reporte_Ejecutivo_${projClean}_${selectedCutoffDate}.pdf`;

      const ok = await exportElementToPdf(reportRef.current, {
        fileName,
        orientation: 'portrait',
        format: 'a4',
        marginMm: 8,
      });

      if (ok) {
        setPdfSuccess(true);
        setTimeout(() => setPdfSuccess(false), 3500);
      } else {
        setPrintWarning('No se pudo generar el archivo PDF automáticamente. Intenta con "Imprimir con Impresoras del Sistema".');
      }
    } catch (err) {
      console.error('Error al exportar PDF:', err);
      setPrintWarning('Ocurrió un inconveniente al generar el PDF.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Acción 3: Abrir en Ventana Limpia Independiente
  const handleOpenInNewWindow = () => {
    if (!reportRef.current) return;
    const title = `Reporte Ejecutivo - ${proyecto.nombre} (${selectedCutoffDate})`;
    const ok = printHtmlInNewWindow(title, reportRef.current.innerHTML);
    if (!ok) {
      // Si el popup fue bloqueado por el navegador
      window.open(window.location.href, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[92vh] text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Imprimir Reporte o Guardar en PDF</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                  Ejecutivo
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Optimizado para impresoras físicas (A4/Carta) y exportación a PDF para clientes o gerencia.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Botón Principal: Impresoras del Sistema */}
            <button
              type="button"
              onClick={handleSystemPrint}
              id="btn-modal-system-print"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              title="Abrir el cuadro de diálogo de impresión de la computadora (permite elegir impresora física o Guardar como PDF)"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir con Impresoras del Sistema</span>
            </button>

            {/* Botón Secundario: Descarga Directa de PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={generatingPdf}
              id="btn-modal-download-pdf"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              title="Generar y descargar archivo PDF en tu equipo inmediatamente"
            >
              <Download className="w-4 h-4" />
              <span>{generatingPdf ? 'Generando PDF...' : 'Descargar Archivo PDF Directo'}</span>
            </button>

            {/* Botón Terciario: Abrir en ventana independiente */}
            <button
              type="button"
              onClick={handleOpenInNewWindow}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
              title="Abrir en ventana independiente para imprimir a pantalla completa"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir en Nueva Pestaña</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Corte: <strong>{selectedCutoffDate}</strong></span>
          </div>
        </div>

        {/* Feedback / Notification alerts */}
        {pdfSuccess && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¡Reporte PDF descargado correctamente en tu computadora!</span>
          </div>
        )}

        {printWarning && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{printWarning}</span>
          </div>
        )}

        {/* Live Preview Container (Scrollable inside modal, printable layout) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
          <div className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center justify-between">
            <span>Vista Previa del Documento a Imprimir</span>
            <span className="text-slate-400 font-normal">Formato membretado A4 / Carta</span>
          </div>

          {/* El contenedor exacto que se imprime y se convierte a PDF */}
          <div 
            ref={reportRef}
            id="printable-report-content"
            className="bg-white p-6 sm:p-8 rounded-xl shadow-xs border border-slate-200 space-y-6 max-w-3xl mx-auto text-slate-900"
          >
            {/* 1. Encabezado Membretado Oficial */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <svg className="w-10 h-10 shrink-0" viewBox="0 0 32 32" fill="none">
                  <polygon points="4,28 28,4 28,28" fill="#009BE5" />
                </svg>
                <div>
                  <div className="text-lg font-black tracking-wider text-slate-900">TAGING</div>
                  <div className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                    INGENIERÍA INTELIGENTE
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block px-2.5 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded uppercase tracking-wider mb-1">
                  Informe de Gestión y Certificación
                </span>
                <div className="text-xs text-slate-500">
                  Fecha de emisión: <strong className="text-slate-800">{todayStr}</strong>
                </div>
                <div className="text-xs text-slate-500">
                  Fecha de corte analizada: <strong className="text-blue-700">{selectedCutoffDate}</strong>
                </div>
              </div>
            </div>

            {/* 2. Ficha Técnica del Proyecto */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Proyecto</span>
                <strong className="text-sm text-slate-900 block">{proyecto.nombre}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Mandante / Cliente</span>
                <strong className="text-sm text-slate-900 block">{empresaNombre}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Alcance Contratado</span>
                <span className="text-slate-700 font-medium">{proyecto.entregables?.length || 0} Entregables de Ingeniería</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Moneda de Control</span>
                <span className="text-slate-700 font-medium">Dólares Estadounidenses (USD)</span>
              </div>
            </div>

            {/* 3. Resumen Ejecutivo Financiero */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Resumen Financiero Consolidado</span>
              </h4>

              <table className="w-full text-xs border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                    <th className="border border-slate-200 py-2 px-3 text-left">Concepto Financiero</th>
                    <th className="border border-slate-200 py-2 px-3 text-right">Monto (USD)</th>
                    <th className="border border-slate-200 py-2 px-3 text-right">% S/ Efectivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="border border-slate-200 py-1.5 px-3 font-medium">Monto Contractual Base</td>
                    <td className="border border-slate-200 py-1.5 px-3 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(metrics.totalContrato)}
                    </td>
                    <td className="border border-slate-200 py-1.5 px-3 text-right font-mono text-slate-500">-</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 py-1.5 px-3 font-medium">Gastos Generales Globales</td>
                    <td className="border border-slate-200 py-1.5 px-3 text-right font-mono font-bold text-amber-700">
                      {formatCurrency(metrics.gastosGeneralesGlobales || 0)}
                    </td>
                    <td className="border border-slate-200 py-1.5 px-3 text-right font-mono text-slate-500">-</td>
                  </tr>
                  <tr className="bg-blue-50/50 font-bold">
                    <td className="border border-slate-200 py-1.5 px-3 text-blue-950">VALOR EFECTIVO TOTAL</td>
                    <td className="border border-slate-200 py-1.5 px-3 text-right font-mono text-blue-950">
                      {formatCurrency(metrics.totalConGastos)}
                    </td>
                    <td className="border border-slate-200 py-1.5 px-3 text-right font-mono text-blue-950">100.0%</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 py-1.5 px-3 font-medium text-emerald-950">
                      Total Certificado Acumulado a la fecha
                    </td>
                    <td className="border border-slate-200 py-1.5 px-3 text-right font-mono font-bold text-emerald-800">
                      {formatCurrency(metrics.totalCertificado)}
                    </td>
                    <td className="border border-slate-200 py-1.5 px-3 text-right font-mono font-bold text-emerald-800">
                      {metrics.porcentajeCertificado.toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 py-1.5 px-3 font-medium text-blue-950">
                      Total Cobrado Efectivo en Banco
                    </td>
                    <td className="border border-slate-200 py-1.5 px-3 text-right font-mono font-bold text-blue-800">
                      {formatCurrency(metrics.totalCobrado)}
                    </td>
                    <td className="border border-slate-200 py-1.5 px-3 text-right font-mono font-bold text-blue-800">
                      {metrics.porcentajeCobrado.toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-200 py-1.5 px-3 text-slate-600 font-medium">
                      Saldo Pendiente por Certificar
                    </td>
                    <td className="border border-slate-200 py-1.5 px-3 text-right font-mono font-bold text-slate-700">
                      {formatCurrency(metrics.saldoPorCertificar)}
                    </td>
                    <td className="border border-slate-200 py-1.5 px-3 text-right font-mono text-slate-600">
                      {(100 - metrics.porcentajeCertificado).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-200 py-1.5 px-3 text-slate-600 font-medium">
                      Saldo Pendiente por Cobrar
                    </td>
                    <td className="border border-slate-200 py-1.5 px-3 text-right font-mono font-bold text-slate-700">
                      {formatCurrency(metrics.saldoPorCobrar)}
                    </td>
                    <td className="border border-slate-200 py-1.5 px-3 text-right font-mono text-slate-600">
                      {(100 - metrics.porcentajeCobrado).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. Control de Avance y Desvío */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Avance Contractual al Corte ({selectedCutoffDate})</span>
              </h4>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Planificado</span>
                  <span className="text-base font-black text-blue-700">{avancePlan.toFixed(1)}%</span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{formatCurrency(montoPlanificado)}</span>
                </div>
                <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Real Certificado</span>
                  <span className="text-base font-black text-emerald-700">{avanceReal.toFixed(1)}%</span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{formatCurrency(montoCertificado)}</span>
                </div>
                <div className={`border rounded-lg p-2.5 ${desvio >= 0 ? 'bg-teal-50 border-teal-200 text-teal-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                  <span className="text-[10px] font-bold block uppercase">Desvío Acumulado</span>
                  <span className="text-base font-black">{desvio >= 0 ? `+${desvio.toFixed(1)}%` : `${desvio.toFixed(1)}%`}</span>
                  <span className="text-[10px] block mt-0.5 font-medium">{desvio >= 0 ? 'En fecha' : 'Atraso'}</span>
                </div>
              </div>
            </div>

            {/* 5. Tabla de Hitos Vencidos (si existen) */}
            {vencidos.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 mb-2 flex items-center gap-1.5 border-b border-rose-200 pb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Hitos Vencidos con Saldo Pendiente de Certificar ({vencidos.length})</span>
                </h4>

                <table className="w-full text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-rose-50 text-rose-900 font-bold text-[10px] uppercase">
                      <th className="border border-slate-200 py-1.5 px-2 text-left">Código / Hito</th>
                      <th className="border border-slate-200 py-1.5 px-2 text-center">Fecha Prevista</th>
                      <th className="border border-slate-200 py-1.5 px-2 text-right">Saldo Pendiente</th>
                      <th className="border border-slate-200 py-1.5 px-2 text-center">Días Atraso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vencidos.map((v) => (
                      <tr key={v.id} className="hover:bg-rose-50/40">
                        <td className="border border-slate-200 py-1.5 px-2">
                          <strong className="text-slate-900">{v.entregableCodigo}</strong> - {v.hitoNombre}
                        </td>
                        <td className="border border-slate-200 py-1.5 px-2 text-center font-mono text-slate-600">
                          {v.fechaPrevista}
                        </td>
                        <td className="border border-slate-200 py-1.5 px-2 text-right font-mono font-bold text-rose-700">
                          {formatCurrency(v.saldoPendiente)}
                        </td>
                        <td className="border border-slate-200 py-1.5 px-2 text-center text-rose-800 font-bold">
                          {Math.abs(v.diasDiferencia)} días
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 6. Próximos Vencimientos */}
            {proximos.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Próximas Entregas Programadas</span>
                </h4>

                <table className="w-full text-xs border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                      <th className="border border-slate-200 py-1.5 px-2 text-left">Actividad / Hito</th>
                      <th className="border border-slate-200 py-1.5 px-2 text-center">Fecha Plan</th>
                      <th className="border border-slate-200 py-1.5 px-2 text-right">Monto Estimado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proximos.slice(0, 6).map((p) => (
                      <tr key={p.id}>
                        <td className="border border-slate-200 py-1.5 px-2">
                          <strong className="text-slate-900">{p.entregableCodigo}</strong> - {p.hitoNombre}
                        </td>
                        <td className="border border-slate-200 py-1.5 px-2 text-center font-mono text-slate-600">
                          {p.fechaPrevista}
                        </td>
                        <td className="border border-slate-200 py-1.5 px-2 text-right font-mono font-bold text-blue-900">
                          {formatCurrency(p.montoHito)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 7. Bloque de Firmas y Validación */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
              <div className="space-y-6">
                <div className="border-b border-slate-300 w-48 mx-auto h-8" />
                <div>
                  <strong className="text-slate-800 block text-xs">Ingeniería / Control de Gestión</strong>
                  <span className="text-[10px] text-slate-400 block">TAGING S.A.</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-b border-slate-300 w-48 mx-auto h-8" />
                <div>
                  <strong className="text-slate-800 block text-xs">Aprobación de Mandante</strong>
                  <span className="text-[10px] text-slate-400 block">{empresaNombre}</span>
                </div>
              </div>
            </div>

            {/* Nota al pie */}
            <div className="text-[9px] text-slate-400 text-center pt-2 border-t border-slate-100">
              Documento confidencial emitido por el Sistema de Control de Certificaciones e Ingeniería TAGING. Prohibida su copia o distribución no autorizada.
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between rounded-b-2xl">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Consejo: Al hacer clic en <strong>Imprimir</strong>, selecciona <em>&quot;Guardar como PDF&quot;</em> en la lista de impresoras de Windows/Mac si deseas archivar el reporte.
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSystemPrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
