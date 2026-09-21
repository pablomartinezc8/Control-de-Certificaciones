import React, { useState, useRef, useMemo } from 'react';
import { Proyecto } from '../types';
import { 
  ProyectoMetrics, 
  CurvaPunto, 
  formatCurrency, 
  computeCurvaS 
} from '../utils/calculations';
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
  TrendingUp,
  TrendingDown,
  Layers,
  CheckSquare,
  Square,
  BarChart3
} from 'lucide-react';
import { exportElementToPdf } from '../utils/pdfExport';
import { printReportIsolated, printHtmlInNewWindow } from '../utils/printHelper';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  proyecto: Proyecto;
  selectedCutoffDate: string;
  metrics: ProyectoMetrics;
  vencidos: any[];
  proximos: any[];
  avancePlan: number;
  avanceReal: number;
  desvio: number;
  montoPlanificado: number;
  montoCertificado: number;
  puntosCurva?: CurvaPunto[];
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
  puntosCurva: puntosCurvaProp,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [printWarning, setPrintWarning] = useState<string | null>(null);

  // Opciones de configuración de impresión profesional
  const [reportMode, setReportMode] = useState<'ejecutivo' | 'completo'>('completo');
  const [showCurvaS, setShowCurvaS] = useState(true);
  const [showKPIs, setShowKPIs] = useState(true);
  const [showFinancialTable, setShowFinancialTable] = useState(true);
  const [showHitosTables, setShowHitosTables] = useState(true);

  // Curva S calculada si no viene provista
  const puntosCurva = useMemo(() => {
    if (puntosCurvaProp && puntosCurvaProp.length > 0) return puntosCurvaProp;
    return computeCurvaS(proyecto, selectedCutoffDate);
  }, [puntosCurvaProp, proyecto, selectedCutoffDate]);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const empresaNombre = proyecto.empresas?.[0]?.nombre || 'Mandante';

  // Manejo de límites de tablas según modo (Ejecutivo vs Completo Multipágina)
  const maxVencidosEjecutivo = 7;
  const maxProximosEjecutivo = 7;

  const vencidosVisibles = reportMode === 'completo' 
    ? vencidos 
    : vencidos.slice(0, maxVencidosEjecutivo);

  const vencidosRestantes = reportMode === 'completo' 
    ? 0 
    : Math.max(0, vencidos.length - maxVencidosEjecutivo);

  const saldoRestanteVencidos = vencidosRestantes > 0 
    ? vencidos.slice(maxVencidosEjecutivo).reduce((acc, v) => acc + (v.saldoPendiente || 0), 0)
    : 0;

  const proximosVisibles = reportMode === 'completo' 
    ? proximos 
    : proximos.slice(0, maxProximosEjecutivo);

  const proximosRestantes = reportMode === 'completo' 
    ? 0 
    : Math.max(0, proximos.length - maxProximosEjecutivo);

  // Acción 1: Imprimir mediante Iframe Aislado (Fondo blanco puro, sin fondo web y estilizado)
  const handleSystemPrint = () => {
    setPrintWarning(null);
    if (!reportRef.current) return;

    const title = `Informe Ejecutivo y Curva S - ${proyecto.nombre} (${selectedCutoffDate})`;
    const success = printReportIsolated(reportRef.current.innerHTML, title);

    if (!success) {
      setPrintWarning(
        'El visor restringió la impresión directa. Puedes usar "Descargar Archivo PDF Directo" o "Abrir en Nueva Pestaña".'
      );
    }
  };

  // Acción 2: Descargar PDF Directo multipágina con jsPDF + html2canvas
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setGeneratingPdf(true);
    setPdfSuccess(false);
    setPrintWarning(null);

    try {
      const projClean = (proyecto.nombre || 'proyecto').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Informe_Gestion_${projClean}_${selectedCutoffDate}.pdf`;

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
    const title = `Informe Ejecutivo - ${proyecto.nombre} (${selectedCutoffDate})`;
    const ok = printHtmlInNewWindow(title, reportRef.current.innerHTML);
    if (!ok) {
      window.open(window.location.href, '_blank');
    }
  };

  // Generador de Gráfico Curva S vectorial nativo de ultra-alta definición
  const renderCurvaSvg = () => {
    if (!puntosCurva || puntosCurva.length === 0) return null;

    const width = 740;
    const height = 190;
    const padLeft = 45;
    const padRight = 25;
    const padTop = 22;
    const padBottom = 34;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const n = puntosCurva.length;
    const getX = (idx: number) => padLeft + (n > 1 ? (idx / (n - 1)) * chartW : chartW / 2);
    const getY = (val: number) => padTop + chartH - Math.max(0, Math.min(100, val)) * (chartH / 100);

    // Línea y Área Planificada
    const planPoints = puntosCurva.map((p, i) => ({ x: getX(i), y: getY(p.porcentajePlanAcumulado || 0) }));
    const planPathD = planPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
    const planAreaD = `${planPathD} L ${planPoints[planPoints.length - 1].x.toFixed(1)} ${(padTop + chartH).toFixed(1)} L ${planPoints[0].x.toFixed(1)} ${(padTop + chartH).toFixed(1)} Z`;

    // Línea Real Certificado (hasta la fecha de corte)
    const realPuntos = puntosCurva.filter((p) => p.fecha <= selectedCutoffDate && p.porcentajeCertAcumulado !== null);
    const realPoints = realPuntos.map((p) => {
      const origIdx = puntosCurva.findIndex((pt) => pt.fecha === p.fecha);
      return { x: getX(origIdx), y: getY(p.porcentajeCertAcumulado || 0), pct: p.porcentajeCertAcumulado || 0, fecha: p.fecha };
    });
    const realPathD = realPoints.length > 0
      ? realPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ')
      : '';

    // Línea Cobrado Efectivo (hasta la fecha de corte)
    const cobradoPuntos = puntosCurva.filter((p) => p.fecha <= selectedCutoffDate && p.porcentajeCobradoAcumulado !== null);
    const cobradoPoints = cobradoPuntos.map((p) => {
      const origIdx = puntosCurva.findIndex((pt) => pt.fecha === p.fecha);
      return { x: getX(origIdx), y: getY(p.porcentajeCobradoAcumulado || 0) };
    });
    const cobradoPathD = cobradoPoints.length > 0
      ? cobradoPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ')
      : '';

    // Marcador vertical de la Fecha de Corte
    const cutoffIdx = puntosCurva.findIndex((p) => p.fecha === selectedCutoffDate);
    const cutoffX = cutoffIdx >= 0 ? getX(cutoffIdx) : (realPoints.length > 0 ? realPoints[realPoints.length - 1].x : null);

    const yTicks = [0, 25, 50, 75, 100];

    return (
      <svg 
        className="chart-svg w-full"
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '190px' }}
      >
        <defs>
          <linearGradient id="printReportPlanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Rejilla de Fondo */}
        {yTicks.map((tick) => {
          const y = getY(tick);
          return (
            <g key={tick}>
              <line x1={padLeft} y1={y} x2={padLeft + chartW} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
              <text x={padLeft - 6} y={y + 3} textAnchor="end" fontSize="8.5" fill="#64748B" fontFamily="monospace">
                {tick}%
              </text>
            </g>
          );
        })}

        {/* Área sombreada Planificada */}
        <path d={planAreaD} fill="url(#printReportPlanGrad)" />

        {/* Línea Planificada (Azul) */}
        <path d={planPathD} fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Línea Cobrado Efectivo (Púrpura Punteado) */}
        {cobradoPathD && (
          <path d={cobradoPathD} fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeDasharray="4 3" strokeLinecap="round" />
        )}

        {/* Línea Real Certificado (Verde Esmeralda) */}
        {realPathD && (
          <path d={realPathD} fill="none" stroke="#10B981" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Marcador vertical de la Fecha de Corte Activa */}
        {cutoffX !== null && (
          <g>
            <line x1={cutoffX} y1={padTop - 4} x2={cutoffX} y2={padTop + chartH} stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2" />
            <rect x={cutoffX - 26} y={padTop - 16} width="52" height="13" rx="3" fill="#EF4444" />
            <text x={cutoffX} y={padTop - 7} textAnchor="middle" fontSize="7.5" fill="#FFFFFF" fontWeight="bold">
              CORTE ACTIVO
            </text>
          </g>
        )}

        {/* Puntos Planificados */}
        {planPoints.map((pt, i) => (
          <circle key={`plan-${i}`} cx={pt.x} cy={pt.y} r="2.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1" />
        ))}

        {/* Puntos Reales Certificados */}
        {realPoints.map((pt, i) => {
          const isLast = i === realPoints.length - 1;
          return (
            <g key={`real-${i}`}>
              <circle cx={pt.x} cy={pt.y} r={isLast ? '4' : '3'} fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
              {isLast && (
                <g>
                  <rect x={pt.x - 20} y={pt.y - 18} width="40" height="13" rx="3" fill="#047857" />
                  <text x={pt.x} y={pt.y - 9} textAnchor="middle" fontSize="8" fill="#FFFFFF" fontWeight="bold">
                    {pt.pct.toFixed(1)}%
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Eje X Fechas de Corte */}
        {puntosCurva.map((p, i) => {
          const showTick = n <= 10 || i === 0 || i === n - 1 || i % Math.ceil(n / 8) === 0 || p.fecha === selectedCutoffDate;
          if (!showTick) return null;
          const x = getX(i);
          const isCutoff = p.fecha === selectedCutoffDate;
          return (
            <text 
              key={`x-${i}`} 
              x={x} 
              y={padTop + chartH + 13} 
              textAnchor="middle" 
              fontSize="8" 
              fill={isCutoff ? '#B91C1C' : '#64748B'}
              fontWeight={isCutoff ? 'bold' : 'normal'}
              fontFamily="monospace"
            >
              {p.fechaCorta}
            </text>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full flex flex-col max-h-[96vh] overflow-hidden print:border-none print:shadow-none print:max-w-none print:w-full print:max-h-none print:overflow-visible">
        
        {/* Header de la Ventana Modal */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 print-hide">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Impresión Profesional del Dashboard</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  reportMode === 'completo' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {reportMode === 'completo' ? 'Modo Integral Multipágina' : 'Modo Ejecutivo 1-2 Hojas'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Dashboard completo estructurado con Curva S, KPIs de gestión, resumen financiero y tablas de seguimiento.
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

        {/* Barra de Herramientas y Opciones de Impresión */}
        <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print-hide">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSystemPrint}
              id="btn-modal-system-print"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              title="Abrir el diálogo de impresión con fondo blanco puro y maquetación profesional"
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
              title="Descargar archivo PDF estructurado directamente"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{generatingPdf ? 'Generando PDF...' : 'Descargar Archivo PDF Directo'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenInNewWindow}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
              title="Abrir en ventana independiente limpia sin marco"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir en Nueva Pestaña</span>
            </button>
          </div>

          {/* Configuración de Modo y Secciones */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setReportMode('completo')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  reportMode === 'completo' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reporte Completo
              </button>
              <button
                type="button"
                onClick={() => setReportMode('ejecutivo')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  reportMode === 'ejecutivo' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Síntesis Ejecutiva
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-3 border-l border-slate-200 pl-3 text-[11px] text-slate-600">
              <label className="flex items-center gap-1 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={showCurvaS} 
                  onChange={(e) => setShowCurvaS(e.target.checked)} 
                  className="rounded text-blue-600 focus:ring-blue-500" 
                />
                <span>Curva S</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={showKPIs} 
                  onChange={(e) => setShowKPIs(e.target.checked)} 
                  className="rounded text-blue-600 focus:ring-blue-500" 
                />
                <span>KPIs</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={showFinancialTable} 
                  onChange={(e) => setShowFinancialTable(e.target.checked)} 
                  className="rounded text-blue-600 focus:ring-blue-500" 
                />
                <span>Finanzas</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={showHitosTables} 
                  onChange={(e) => setShowHitosTables(e.target.checked)} 
                  className="rounded text-blue-600 focus:ring-blue-500" 
                />
                <span>Hitos</span>
              </label>
            </div>
          </div>
        </div>

        {/* Notificaciones de Éxito / Advertencias */}
        {pdfSuccess && (
          <div className="mx-3 mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 print-hide">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¡Informe generado y descargado correctamente con formato profesional completo!</span>
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
            className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-slate-200 space-y-4 w-full max-w-[820px] mx-auto text-slate-900 print:max-w-none print:w-full print:p-0 print:border-none print:shadow-none print:space-y-4"
          >
            
            {/* 1. Encabezado Membretado Oficial */}
            <div className="border-b-2 border-slate-900 pb-2.5 flex items-center justify-between gap-3 print-avoid-break">
              <div className="flex items-center gap-2.5">
                <svg 
                  width="36" 
                  height="36" 
                  viewBox="0 0 32 32" 
                  fill="none" 
                  style={{ width: '36px', height: '36px', maxWidth: '36px', maxHeight: '36px', flexShrink: 0, display: 'inline-block' }}
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
                <span className="inline-block px-2.5 py-0.5 bg-slate-900 text-white text-[9.5px] font-bold rounded uppercase tracking-wider mb-0.5">
                  Informe de Gestión, Certificación y Curva S
                </span>
                <div className="text-[10px] text-slate-500 leading-tight">
                  Emisión: <strong className="text-slate-800">{todayStr}</strong> &bull; Corte Oficial: <strong className="text-blue-700 font-mono">{selectedCutoffDate}</strong>
                </div>
              </div>
            </div>

            {/* 2. Ficha Técnica del Proyecto */}
            <div className="bg-slate-50 rounded-xl p-2.5 px-3.5 border border-slate-200 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2.5 print-avoid-break">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Proyecto</span>
                <strong className="text-xs text-slate-900 block truncate" title={proyecto.nombre}>{proyecto.nombre}</strong>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Mandante / Cliente</span>
                <strong className="text-xs text-slate-900 block truncate" title={empresaNombre}>{empresaNombre}</strong>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Alcance Contractual</span>
                <span className="text-xs text-slate-700 font-semibold block">{proyecto.entregables?.length || 0} Entregables</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Moneda de Control</span>
                <span className="text-xs text-slate-700 font-semibold block">Dólares Estadounidenses (USD)</span>
              </div>
            </div>

            {/* 3. Panel Destacado: Avance Contractual al Corte */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs print-avoid-break">
              <div className="border border-blue-200 rounded-xl p-2 bg-blue-50/40">
                <span className="text-[9.5px] text-blue-700 font-bold block uppercase leading-tight">Planificado al Corte</span>
                <span className="text-lg font-black text-blue-900 leading-tight block my-0.5">{avancePlan.toFixed(1)}%</span>
                <span className="text-[10px] text-slate-600 font-mono block font-semibold">{formatCurrency(montoPlanificado)}</span>
              </div>
              <div className="border border-emerald-200 rounded-xl p-2 bg-emerald-50/40">
                <span className="text-[9.5px] text-emerald-700 font-bold block uppercase leading-tight">Real Certificado al Corte</span>
                <span className="text-lg font-black text-emerald-900 leading-tight block my-0.5">{avanceReal.toFixed(1)}%</span>
                <span className="text-[10px] text-slate-600 font-mono block font-semibold">{formatCurrency(montoCertificado)}</span>
              </div>
              <div className={`border rounded-xl p-2 flex flex-col justify-between ${
                desvio >= 0 ? 'bg-teal-50 border-teal-200 text-teal-900' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <span className="text-[9.5px] font-bold block uppercase leading-tight">Desvío Acumulado</span>
                <span className="text-lg font-black leading-tight block my-0.5">
                  {desvio >= 0 ? `+${desvio.toFixed(1)}%` : `${desvio.toFixed(1)}%`}
                </span>
                <span className="text-[10px] block font-medium">
                  {desvio >= 0 ? 'Avance en fecha contractual' : 'Atraso contractual detectado'}
                </span>
              </div>
            </div>

            {/* 4. Módulo de la Curva S Contractual Completa */}
            {showCurvaS && (
              <div className="border border-slate-200 rounded-xl p-3 bg-white print-avoid-break shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                      Curva S de Avance Contractual & Seguimiento Físico-Financiero
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] font-semibold text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                      <span>Planificado</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                      <span>Real Certificado</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                      <span>Cobrado</span>
                    </span>
                  </div>
                </div>

                {/* Contenedor del Gráfico SVG Vectorial */}
                <div className="w-full bg-slate-50/50 rounded-lg p-1 border border-slate-100">
                  {renderCurvaSvg()}
                </div>
              </div>
            )}

            {/* 5. Indicadores Clave de Rendimiento (KPIs Completos del Dashboard) */}
            {showKPIs && (
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 print-avoid-break">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Indicadores Clave de Gestión (KPIs Ejecutivos)</span>
                  </h4>
                  <span className="text-[9px] text-slate-500 font-medium">Sincronizados al corte {selectedCutoffDate}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {/* Fila 1 */}
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[8.5px] uppercase font-bold text-slate-400 block leading-tight">Valor Total de OC</span>
                    <strong className="text-xs text-slate-900 font-mono block mt-0.5">{formatCurrency(metrics.totalContratado)}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[8.5px] uppercase font-bold text-slate-400 block leading-tight">Total Certificado</span>
                    <strong className="text-xs text-emerald-700 font-mono block mt-0.5">{formatCurrency(metrics.totalCertificado)}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[8.5px] uppercase font-bold text-slate-400 block leading-tight">Saldo Pendiente a Cobrar</span>
                    <strong className="text-xs text-blue-900 font-mono block mt-0.5">{formatCurrency(metrics.totalPendienteCobro)}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[8.5px] uppercase font-bold text-slate-400 block leading-tight">% Certificado</span>
                    <strong className="text-xs text-emerald-700 block mt-0.5">{metrics.porcentajeCertificado.toFixed(1)}%</strong>
                  </div>

                  {/* Fila 2 */}
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[8.5px] uppercase font-bold text-slate-400 block leading-tight">Total Entregables</span>
                    <strong className="text-xs text-slate-900 block mt-0.5">{metrics.totalEntregables || proyecto.entregables.length}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[8.5px] uppercase font-bold text-slate-400 block leading-tight">Totalmente Certificados</span>
                    <strong className="text-xs text-emerald-700 block mt-0.5">{metrics.totalmenteCertificados}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[8.5px] uppercase font-bold text-slate-400 block leading-tight">Parcialmente Certificados</span>
                    <strong className="text-xs text-amber-700 block mt-0.5">{metrics.parcialmenteCertificados}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[8.5px] uppercase font-bold text-slate-400 block leading-tight">Sin Certificar</span>
                    <strong className="text-xs text-slate-500 block mt-0.5">{metrics.sinCertificar}</strong>
                  </div>

                  {/* Fila 3 */}
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[8.5px] uppercase font-bold text-slate-400 block leading-tight">Próxima Certificación</span>
                    <strong className="text-xs text-slate-900 block mt-0.5">{metrics.proximaCertificacionFecha}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[8.5px] uppercase font-bold text-slate-400 block leading-tight">Importe Próximo Período</span>
                    <strong className="text-xs text-blue-900 font-mono block mt-0.5">{formatCurrency(metrics.importeProximoPeriodo)}</strong>
                  </div>
                  <div className={`p-2 rounded-lg border ${desvio >= 0 ? 'bg-teal-50/50 border-teal-200' : 'bg-rose-50/50 border-rose-200'}`}>
                    <span className="text-[8.5px] uppercase font-bold text-slate-500 block leading-tight">Desvío Acumulado</span>
                    <strong className={`text-xs block mt-0.5 ${desvio >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
                      {desvio >= 0 ? `+${desvio.toFixed(1)}%` : `${desvio.toFixed(1)}%`}
                    </strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[8.5px] uppercase font-bold text-slate-400 block leading-tight">Estado Cronograma</span>
                    <strong className="text-xs text-slate-700 block mt-0.5 truncate">Control en tiempo real</strong>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Resumen Financiero Consolidado Completo */}
            {showFinancialTable && (
              <div className="print-avoid-break">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Resumen Financiero Consolidado</span>
                  </h4>
                  <span className="text-[9px] text-slate-500 font-medium">Valores expresados en USD</span>
                </div>

                <table className="w-full text-[9.5px] border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold text-[9px] uppercase">
                      <th className="border border-slate-200 py-1 px-2.5 text-left">Concepto Financiero</th>
                      <th className="border border-slate-200 py-1 px-2.5 text-right">Monto (USD)</th>
                      <th className="border border-slate-200 py-1 px-2.5 text-right">% S/ Efectivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="border border-slate-200 py-1 px-2.5 font-medium">Monto Contractual Base</td>
                      <td className="border border-slate-200 py-1 px-2.5 text-right font-mono font-bold text-slate-800">
                        {formatCurrency(metrics.totalContratado)}
                      </td>
                      <td className="border border-slate-200 py-1 px-2.5 text-right font-mono text-slate-500">
                        {metrics.valorTotalTaging > 0 ? `${((metrics.totalContratado / metrics.valorTotalTaging) * 100).toFixed(1)}%` : '100.0%'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 py-1 px-2.5 font-medium">Gastos Generales Globales</td>
                      <td className="border border-slate-200 py-1 px-2.5 text-right font-mono font-bold text-amber-700">
                        {formatCurrency(metrics.totalGastosGenerales)}
                      </td>
                      <td className="border border-slate-200 py-1 px-2.5 text-right font-mono text-slate-500">
                        {metrics.valorTotalTaging > 0 ? `${((metrics.totalGastosGenerales / metrics.valorTotalTaging) * 100).toFixed(1)}%` : '0.0%'}
                      </td>
                    </tr>
                    <tr className="bg-blue-50/70 font-bold">
                      <td className="border border-slate-200 py-1.5 px-2.5 text-blue-950">VALOR EFECTIVO TOTAL</td>
                      <td className="border border-slate-200 py-1.5 px-2.5 text-right font-mono text-blue-950">
                        {formatCurrency(metrics.valorTotalTaging)}
                      </td>
                      <td className="border border-slate-200 py-1.5 px-2.5 text-right font-mono text-blue-950">100.0%</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 py-1 px-2.5 font-medium text-emerald-950">
                        Total Certificado Acumulado a la fecha
                      </td>
                      <td className="border border-slate-200 py-1 px-2.5 text-right font-mono font-bold text-emerald-800">
                        {formatCurrency(metrics.totalCertificado)}
                      </td>
                      <td className="border border-slate-200 py-1 px-2.5 text-right font-mono font-bold text-emerald-800">
                        {metrics.porcentajeCertificado.toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 py-1 px-2.5 font-medium text-blue-950">
                        Total Cobrado Efectivo en Banco
                      </td>
                      <td className="border border-slate-200 py-1 px-2.5 text-right font-mono font-bold text-blue-800">
                        {formatCurrency(metrics.totalCobrado)}
                      </td>
                      <td className="border border-slate-200 py-1 px-2.5 text-right font-mono font-bold text-blue-800">
                        {metrics.porcentajeCobrado.toFixed(1)}%
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="border border-slate-200 py-1 px-2.5 text-slate-600 font-medium">
                        Saldo Pendiente por Certificar
                      </td>
                      <td className="border border-slate-200 py-1 px-2.5 text-right font-mono font-bold text-slate-700">
                        {formatCurrency(metrics.saldoPorCertificar)}
                      </td>
                      <td className="border border-slate-200 py-1 px-2.5 text-right font-mono text-slate-600">
                        {(100 - metrics.porcentajeCertificado).toFixed(1)}%
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="border border-slate-200 py-1 px-2.5 text-slate-600 font-medium">
                        Saldo Pendiente por Cobrar
                      </td>
                      <td className="border border-slate-200 py-1 px-2.5 text-right font-mono font-bold text-slate-700">
                        {formatCurrency(metrics.totalPendienteCobro)}
                      </td>
                      <td className="border border-slate-200 py-1 px-2.5 text-right font-mono text-slate-600">
                        {metrics.porcentajeCobrado > 0 ? `${(metrics.porcentajeCertificado - metrics.porcentajeCobrado).toFixed(1)}%` : '0.0%'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 7. Tablas Operativas: Hitos Vencidos + Próximas Entregas */}
            {showHitosTables && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 print:grid-cols-2 print-avoid-break">
                
                {/* Columna Izquierda: Hitos Vencidos */}
                <div className="border border-rose-200 rounded-xl p-2.5 bg-rose-50/20">
                  <div className="flex items-center justify-between border-b border-rose-200 pb-1 mb-1.5">
                    <h5 className="text-[10.5px] font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
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
                          <th className="py-1 px-1.5 text-left">Código / Hito</th>
                          <th className="py-1 px-1 text-center">Fecha</th>
                          <th className="py-1 px-1.5 text-right">Saldo</th>
                          <th className="py-1 px-1 text-center">Atraso</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100">
                        {vencidosVisibles.map((v) => (
                          <tr key={v.id}>
                            <td className="py-1 px-1.5 truncate max-w-[130px]" title={`${v.entregableCodigo} - ${v.hitoNombre}`}>
                              <strong className="text-slate-900">{v.entregableCodigo}</strong> {v.hitoNombre}
                            </td>
                            <td className="py-1 px-1 text-center font-mono text-slate-600 whitespace-nowrap">
                              {v.fechaPrevista}
                            </td>
                            <td className="py-1 px-1.5 text-right font-mono font-bold text-rose-700 whitespace-nowrap">
                              {formatCurrency(v.saldoPendiente)}
                            </td>
                            <td className="py-1 px-1 text-center text-rose-800 font-bold whitespace-nowrap">
                              {Math.abs(v.diasDiferencia)} d
                            </td>
                          </tr>
                        ))}
                        {vencidosRestantes > 0 && (
                          <tr className="bg-rose-100/40 font-semibold text-rose-800">
                            <td colSpan={2} className="py-1 px-1.5 text-[8.5px]">
                              + {vencidosRestantes} hitos adicionales en mora
                            </td>
                            <td colSpan={2} className="py-1 px-1.5 text-right font-mono text-[8.5px]">
                              Total: {formatCurrency(saldoRestanteVencidos)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Columna Derecha: Próximas Entregas Programadas */}
                <div className="border border-blue-200 rounded-xl p-2.5 bg-blue-50/20">
                  <div className="flex items-center justify-between border-b border-blue-200 pb-1 mb-1.5">
                    <h5 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-600 shrink-0" />
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
                          <th className="py-1 px-1.5 text-left">Actividad / Hito</th>
                          <th className="py-1 px-1 text-center">Fecha Plan</th>
                          <th className="py-1 px-1.5 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {proximosVisibles.map((p) => (
                          <tr key={p.id}>
                            <td className="py-1 px-1.5 truncate max-w-[140px]" title={`${p.entregableCodigo} - ${p.hitoNombre}`}>
                              <strong className="text-slate-900">{p.entregableCodigo}</strong> {p.hitoNombre}
                            </td>
                            <td className="py-1 px-1 text-center font-mono text-slate-600 whitespace-nowrap">
                              {p.fechaPrevista}
                            </td>
                            <td className="py-1 px-1.5 text-right font-mono font-bold text-blue-900 whitespace-nowrap">
                              {formatCurrency(p.montoHito)}
                            </td>
                          </tr>
                        ))}
                        {proximosRestantes > 0 && (
                          <tr className="bg-blue-100/40 font-semibold text-blue-800">
                            <td colSpan={3} className="py-1 px-1.5 text-[8.5px]">
                              + {proximosRestantes} entregas programadas adicionales
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            )}

            {/* 8. Cuadro de Firmas Oficial Institucional */}
            <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-500 print-avoid-break">
              <div>
                <div className="border-b border-slate-300 w-40 mx-auto h-6 mb-1" />
                <strong className="text-slate-800 block text-[10.5px]">Ingeniería / Control de Gestión</strong>
                <span className="text-[9px] text-slate-400 block">TAGING S.A.</span>
              </div>

              <div>
                <div className="border-b border-slate-300 w-40 mx-auto h-6 mb-1" />
                <strong className="text-slate-800 block text-[10.5px]">Aprobación de Mandante</strong>
                <span className="text-[9px] text-slate-400 block">{empresaNombre}</span>
              </div>
            </div>

            {/* 9. Pie de página institucional */}
            <div className="text-[8px] text-slate-400 text-center pt-2 border-t border-slate-100">
              Documento confidencial emitido por el Sistema de Control de Certificaciones e Ingeniería TAGING. Prohibida su copia o distribución no autorizada.
            </div>

          </div>
        </div>

        {/* Footer del Modal con Acciones Finales */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/90 rounded-b-2xl flex flex-wrap items-center justify-between gap-2 print-hide">
          <span className="text-[11px] text-slate-500">
            Formato A4 Oficial &bull; {reportMode === 'completo' ? 'Visualización Completa Multipágina' : 'Síntesis Ejecutiva Compacta'}
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
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{generatingPdf ? 'Generando...' : 'Descargar PDF'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
