import React, { useState, useRef } from 'react';
import { Proyecto } from '../types';
import { formatCurrency } from '../utils/calculations';
import { 
  Printer, 
  Download, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  FileText,
  Clock,
  ChevronDown
} from 'lucide-react';
import { exportElementToPdf } from '../utils/pdfExport';
import { isSandboxedIframe, printReportIsolated, printHtmlInNewWindow } from '../utils/printHelper';

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

  // Acción 1: Imprimir mediante Iframe Aislado (Fondo blanco puro, sin fondo web y estilizado)
  const handleSystemPrint = () => {
    setPrintWarning(null);
    if (!reportRef.current) return;

    const title = `Reporte Ejecutivo - ${proyecto.nombre} (${selectedCutoffDate})`;
    const success = printReportIsolated(reportRef.current.innerHTML, title);

    if (!success) {
      setPrintWarning(
        'El visor restringió la impresión directa. Puedes usar "Descargar Archivo PDF Directo" o "Abrir en Nueva Pestaña".'
      );
    }
  };

  // Acción 2: Descargar PDF Directo ajustado a 1 sola hoja
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
        setPrintWarning('No se pudo generar el archivo PDF automáticamente.');
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
      window.open(window.location.href, '_blank');
    }
  };

  // Para asegurar que quepa perfectamente en 1 SOLA HOJA (One-Pager):
  // Mostramos hasta 6 hitos vencidos principales y resumimos los restantes si hubiera más
  const maxVencidosDisplay = 7;
  const vencidosVisibles = vencidos.slice(0, maxVencidosDisplay);
  const vencidosRestantes = vencidos.length - maxVencidosDisplay;
  const saldoRestanteVencidos = vencidosRestantes > 0 
    ? vencidos.slice(maxVencidosDisplay).reduce((acc, v) => acc + (v.saldoPendiente || 0), 0)
    : 0;

  const proximosVisibles = proximos.slice(0, maxVencidosDisplay);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print-modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[94vh] text-slate-900 animate-in fade-in zoom-in-95 duration-150 print-modal-card">
        
        {/* Barra superior de herramientas (Oculta al imprimir) */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 rounded-t-2xl print-hide">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Reporte Ejecutivo Oficial</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Formato 1 Hoja A4
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Fondo blanco puro, estructurado para caber completo en 1 sola hoja sin desbordes.
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

        {/* Acciones principales */}
        <div className="p-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 print-hide">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSystemPrint}
              id="btn-modal-system-print"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              title="Abrir el diálogo de impresión con fondo blanco y diseño para 1 hoja"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar en PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={generatingPdf}
              id="btn-modal-download-pdf"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              title="Descargar archivo PDF directo en 1 hoja"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{generatingPdf ? 'Generando PDF...' : 'Descargar Archivo PDF Directo'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenInNewWindow}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
              title="Abrir en ventana independiente limpia"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir en Nueva Pestaña</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Corte: <strong>{selectedCutoffDate}</strong></span>
          </div>
        </div>

        {/* Notificaciones */}
        {pdfSuccess && (
          <div className="mx-3 mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 print-hide">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¡Reporte descargado correctamente en formato PDF de 1 hoja!</span>
          </div>
        )}

        {printWarning && (
          <div className="mx-3 mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 print-hide">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{printWarning}</span>
          </div>
        )}

        {/* Contenedor del documento (Preview con scroll interno, fondo A4 profesional) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-100/80 print:p-0 print:bg-white print:overflow-visible">
          
          {/* Documento oficial a imprimir y convertir a PDF */}
          <div 
            ref={reportRef}
            id="printable-report-content"
            style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
            }}
            className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-slate-200 space-y-3 w-full max-w-[794px] mx-auto text-slate-900 print:max-w-none print:w-full print:p-0 print:border-none print:shadow-none print:space-y-2.5"
          >
            
            {/* 1. Encabezado Membretado Oficial */}
            <div className="border-b-2 border-slate-900 pb-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {/* SVG con dimensiones inline explícitas y fijas para evitar distorsiones */}
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 32 32" 
                  fill="none" 
                  style={{ width: '32px', height: '32px', maxWidth: '32px', maxHeight: '32px', flexShrink: 0, display: 'inline-block' }}
                >
                  <polygon points="4,28 28,4 28,28" fill="#009BE5" />
                </svg>
                <div>
                  <div className="text-base font-black tracking-wider text-slate-900 leading-none">TAGING</div>
                  <div className="text-[8.5px] font-bold tracking-widest text-slate-500 uppercase mt-0.5">
                    INGENIERÍA INTELIGENTE
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2 py-0.5 bg-slate-900 text-white text-[9px] font-bold rounded uppercase tracking-wider mb-0.5">
                  Informe de Gestión y Certificación
                </span>
                <div className="text-[10px] text-slate-500 leading-tight">
                  Emisión: <strong className="text-slate-800">{todayStr}</strong> &bull; Corte: <strong className="text-blue-700">{selectedCutoffDate}</strong>
                </div>
              </div>
            </div>

            {/* 2. Ficha Técnica Compacta (1 sola fila horizontal) */}
            <div className="bg-slate-50 rounded-lg p-2 px-3 border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Proyecto</span>
                <strong className="text-xs text-slate-900 block truncate" title={proyecto.nombre}>{proyecto.nombre}</strong>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Mandante / Cliente</span>
                <strong className="text-xs text-slate-900 block truncate" title={empresaNombre}>{empresaNombre}</strong>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Alcance</span>
                <span className="text-xs text-slate-700 font-medium block">{proyecto.entregables?.length || 0} Entregables</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Moneda</span>
                <span className="text-xs text-slate-700 font-medium block">Dólares (USD)</span>
              </div>
            </div>

            {/* 3. Resumen Ejecutivo Financiero Consolidado */}
            <div className="print-avoid-break">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" style={{ width: '14px', height: '14px' }} />
                  <span>Resumen Financiero Consolidado</span>
                </h4>
                <span className="text-[9.5px] text-slate-500 font-medium">Valores expresados en USD</span>
              </div>

              <table className="w-full text-[10px] border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold text-[9px] uppercase">
                    <th className="border border-slate-200 py-1 px-2.5 text-left">Concepto Financiero</th>
                    <th className="border border-slate-200 py-1 px-2.5 text-right">Monto (USD)</th>
                    <th className="border border-slate-200 py-1 px-2.5 text-right">% S/ Efectivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="border border-slate-200 py-0.5 px-2.5 font-medium">Monto Contractual Base</td>
                    <td className="border border-slate-200 py-0.5 px-2.5 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(metrics.totalContrato)}
                    </td>
                    <td className="border border-slate-200 py-0.5 px-2.5 text-right font-mono text-slate-500">-</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 py-0.5 px-2.5 font-medium">Gastos Generales Globales</td>
                    <td className="border border-slate-200 py-0.5 px-2.5 text-right font-mono font-bold text-amber-700">
                      {formatCurrency(metrics.gastosGeneralesGlobales || 0)}
                    </td>
                    <td className="border border-slate-200 py-0.5 px-2.5 text-right font-mono text-slate-500">-</td>
                  </tr>
                  <tr className="bg-blue-50/60 font-bold">
                    <td className="border border-slate-200 py-1 px-2.5 text-blue-950">VALOR EFECTIVO TOTAL</td>
                    <td className="border border-slate-200 py-1 px-2.5 text-right font-mono text-blue-950">
                      {formatCurrency(metrics.totalConGastos)}
                    </td>
                    <td className="border border-slate-200 py-1 px-2.5 text-right font-mono text-blue-950">100.0%</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 py-0.5 px-2.5 font-medium text-emerald-950">
                      Total Certificado Acumulado a la fecha
                    </td>
                    <td className="border border-slate-200 py-0.5 px-2.5 text-right font-mono font-bold text-emerald-800">
                      {formatCurrency(metrics.totalCertificado)}
                    </td>
                    <td className="border border-slate-200 py-0.5 px-2.5 text-right font-mono font-bold text-emerald-800">
                      {metrics.porcentajeCertificado.toFixed(1)}%
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 py-0.5 px-2.5 font-medium text-blue-950">
                      Total Cobrado Efectivo en Banco
                    </td>
                    <td className="border border-slate-200 py-0.5 px-2.5 text-right font-mono font-bold text-blue-800">
                      {formatCurrency(metrics.totalCobrado)}
                    </td>
                    <td className="border border-slate-200 py-0.5 px-2.5 text-right font-mono font-bold text-blue-800">
                      {metrics.porcentajeCobrado.toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="border border-slate-200 py-0.5 px-2.5 text-slate-600 font-medium">
                      Saldo Pendiente por Certificar
                    </td>
                    <td className="border border-slate-200 py-0.5 px-2.5 text-right font-mono font-bold text-slate-700">
                      {formatCurrency(metrics.saldoPorCertificar)}
                    </td>
                    <td className="border border-slate-200 py-0.5 px-2.5 text-right font-mono text-slate-600">
                      {(100 - metrics.porcentajeCertificado).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="bg-slate-50/50">
                    <td className="border border-slate-200 py-0.5 px-2.5 text-slate-600 font-medium">
                      Saldo Pendiente por Cobrar
                    </td>
                    <td className="border border-slate-200 py-0.5 px-2.5 text-right font-mono font-bold text-slate-700">
                      {formatCurrency(metrics.saldoPorCobrar)}
                    </td>
                    <td className="border border-slate-200 py-0.5 px-2.5 text-right font-mono text-slate-600">
                      {(100 - metrics.porcentajeCobrado).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. Avance Contractual al Corte (Tarjetas horizontales de 1 línea) */}
            <div className="print-avoid-break">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" style={{ width: '14px', height: '14px' }} />
                  <span>Avance Contractual al Corte ({selectedCutoffDate})</span>
                </h4>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="border border-slate-200 rounded-lg p-1.5 bg-slate-50/80">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase leading-tight">Planificado</span>
                  <span className="text-sm font-black text-blue-700 leading-tight block">{avancePlan.toFixed(1)}%</span>
                  <span className="text-[9px] text-slate-500 font-mono block">{formatCurrency(montoPlanificado)}</span>
                </div>
                <div className="border border-slate-200 rounded-lg p-1.5 bg-slate-50/80">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase leading-tight">Real Certificado</span>
                  <span className="text-sm font-black text-emerald-700 leading-tight block">{avanceReal.toFixed(1)}%</span>
                  <span className="text-[9px] text-slate-500 font-mono block">{formatCurrency(montoCertificado)}</span>
                </div>
                <div className={`border rounded-lg p-1.5 ${desvio >= 0 ? 'bg-teal-50 border-teal-200 text-teal-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                  <span className="text-[9px] font-bold block uppercase leading-tight">Desvío Acumulado</span>
                  <span className="text-sm font-black leading-tight block">{desvio >= 0 ? `+${desvio.toFixed(1)}%` : `${desvio.toFixed(1)}%`}</span>
                  <span className="text-[9px] block font-medium">{desvio >= 0 ? 'En fecha' : 'Atraso'}</span>
                </div>
              </div>
            </div>

            {/* 5. Sección Dual Lado a Lado: Hitos Vencidos (Izquierda) + Próximas Entregas (Derecha) */}
            {/* Este diseño de 2 columnas aprovecha el ancho completo y ahorra 250px verticales para asegurar 1 SOLA HOJA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2 print-avoid-break">
              
              {/* Columna Izquierda: Hitos Vencidos */}
              <div className="border border-rose-200/80 rounded-lg p-2 bg-rose-50/20">
                <div className="flex items-center justify-between border-b border-rose-200 pb-1 mb-1.5">
                  <h5 className="text-[10.5px] font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" style={{ width: '12px', height: '12px' }} />
                    <span>Hitos Vencidos ({vencidos.length})</span>
                  </h5>
                  <span className="text-[9px] font-semibold text-rose-700">Pendientes</span>
                </div>

                {vencidos.length === 0 ? (
                  <div className="text-[10px] text-slate-500 py-3 text-center">
                    No se registran hitos vencidos al corte.
                  </div>
                ) : (
                  <table className="w-full text-[9px] border-collapse">
                    <thead>
                      <tr className="bg-rose-100/60 text-rose-900 font-bold uppercase text-[8.5px]">
                        <th className="py-0.5 px-1.5 text-left">Código / Hito</th>
                        <th className="py-0.5 px-1 text-center">Fecha</th>
                        <th className="py-0.5 px-1.5 text-right">Saldo</th>
                        <th className="py-0.5 px-1 text-center">Atraso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100">
                      {vencidosVisibles.map((v) => (
                        <tr key={v.id}>
                          <td className="py-0.5 px-1.5 truncate max-w-[120px]" title={`${v.entregableCodigo} - ${v.hitoNombre}`}>
                            <strong className="text-slate-900">{v.entregableCodigo}</strong> {v.hitoNombre}
                          </td>
                          <td className="py-0.5 px-1 text-center font-mono text-slate-600 whitespace-nowrap">
                            {v.fechaPrevista}
                          </td>
                          <td className="py-0.5 px-1.5 text-right font-mono font-bold text-rose-700 whitespace-nowrap">
                            {formatCurrency(v.saldoPendiente)}
                          </td>
                          <td className="py-0.5 px-1 text-center text-rose-800 font-bold whitespace-nowrap">
                            {Math.abs(v.diasDiferencia)} d
                          </td>
                        </tr>
                      ))}
                      {vencidosRestantes > 0 && (
                        <tr className="bg-rose-100/40 font-semibold text-rose-800">
                          <td colSpan={2} className="py-0.5 px-1.5 text-[8.5px]">
                            + {vencidosRestantes} hitos adicionales en mora
                          </td>
                          <td colSpan={2} className="py-0.5 px-1.5 text-right font-mono text-[8.5px]">
                            Total: {formatCurrency(saldoRestanteVencidos)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Columna Derecha: Próximas Entregas Programadas */}
              <div className="border border-blue-200/80 rounded-lg p-2 bg-blue-50/20">
                <div className="flex items-center justify-between border-b border-blue-200 pb-1 mb-1.5">
                  <h5 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-600 shrink-0" style={{ width: '12px', height: '12px' }} />
                    <span>Próximas Entregas ({proximos.length})</span>
                  </h5>
                  <span className="text-[9px] font-semibold text-blue-700">Programadas</span>
                </div>

                {proximos.length === 0 ? (
                  <div className="text-[10px] text-slate-500 py-3 text-center">
                    No hay entregas inmediatas en agenda.
                  </div>
                ) : (
                  <table className="w-full text-[9px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[8.5px]">
                        <th className="py-0.5 px-1.5 text-left">Actividad / Hito</th>
                        <th className="py-0.5 px-1 text-center">Fecha Plan</th>
                        <th className="py-0.5 px-1.5 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {proximosVisibles.map((p) => (
                        <tr key={p.id}>
                          <td className="py-0.5 px-1.5 truncate max-w-[130px]" title={`${p.entregableCodigo} - ${p.hitoNombre}`}>
                            <strong className="text-slate-900">{p.entregableCodigo}</strong> {p.hitoNombre}
                          </td>
                          <td className="py-0.5 px-1 text-center font-mono text-slate-600 whitespace-nowrap">
                            {p.fechaPrevista}
                          </td>
                          <td className="py-0.5 px-1.5 text-right font-mono font-bold text-blue-900 whitespace-nowrap">
                            {formatCurrency(p.montoHito)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>

            {/* 6. Cuadro de Firmas y Validación Institucional (Compacto y equilibrado) */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-6 text-center text-xs text-slate-500 print-avoid-break">
              <div>
                <div className="border-b border-slate-300 w-36 mx-auto h-5 mb-1" />
                <strong className="text-slate-800 block text-[10.5px]">Ingeniería / Control de Gestión</strong>
                <span className="text-[9px] text-slate-400 block">TAGING S.A.</span>
              </div>

              <div>
                <div className="border-b border-slate-300 w-36 mx-auto h-5 mb-1" />
                <strong className="text-slate-800 block text-[10.5px]">Aprobación de Mandante</strong>
                <span className="text-[9px] text-slate-400 block">{empresaNombre}</span>
              </div>
            </div>

            {/* 7. Pie de página institucional visible en vista previa */}
            <div className="text-[8px] text-slate-400 text-center pt-1 border-t border-slate-100 print:hidden">
              Documento confidencial emitido por el Sistema de Control de Certificaciones e Ingeniería TAGING. Prohibida su copia o distribución no autorizada.
            </div>

          </div>
        </div>

        {/* Footer del Modal */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80 rounded-b-2xl flex items-center justify-between print-hide">
          <span className="text-[11px] text-slate-500">
            Formato A4 Portrait oficial • Optimizado para 1 hoja
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={generatingPdf}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{generatingPdf ? 'Generando...' : 'Descargar PDF (1 Hoja)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
