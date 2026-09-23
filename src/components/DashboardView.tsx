import React, { useState, useMemo, useRef } from 'react';
import { Proyecto, AppData, Entregable, Hito } from '../types';
import { 
  computeProjectMetrics, 
  computeCurvaS, 
  getVencimientosHitos,
  formatCurrency, 
  formatShortDate, 
  normalizeDate 
} from '../utils/calculations';
import { MetricsCards } from './MetricsCards';
import { CurvaSView } from './CurvaSView';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Briefcase, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Layers, 
  Camera, 
  Printer,
  ChevronRight,
  ExternalLink,
  Plus,
  ClipboardCheck
} from 'lucide-react';
import { exportElementToPng } from '../utils/imageExport';
import { PrintReportModal } from './PrintReportModal';

interface DashboardViewProps {
  proyecto: Proyecto;
  onNavigateToTab: (tabId: string) => void;
  onOpenNewCert?: (entregableId?: string, hitoId?: string) => void;
  selectedCutoffDateProp?: string;
  onCutoffDateChange?: (date: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  proyecto,
  onNavigateToTab,
  onOpenNewCert,
  selectedCutoffDateProp,
  onCutoffDateChange,
}) => {
  const dashboardCardRef = useRef<HTMLDivElement>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Fechas de corte disponibles ordenadas cronológicamente
  const todasLasFechasCorte = useMemo(() => {
    const list: string[] = [];
    if (proyecto.fechasCorte) {
      Object.values(proyecto.fechasCorte).forEach((arr) => {
        if (Array.isArray(arr)) list.push(...arr);
      });
    }
    return Array.from(new Set(list.map(normalizeDate).filter(Boolean))).sort();
  }, [proyecto]);

  const todayStr = '2026-09-16';

  const defaultActualDate = useMemo(() => {
    const past = todasLasFechasCorte.filter((d) => d <= todayStr);
    return past[past.length - 1] || todasLasFechasCorte[todasLasFechasCorte.length - 1] || todayStr;
  }, [todasLasFechasCorte]);

  // Fecha de corte activa seleccionada en el dashboard
  const [internalCutoffDate, setInternalCutoffDate] = useState<string>(() => {
    return selectedCutoffDateProp || defaultActualDate;
  });

  const selectedCutoffDate = selectedCutoffDateProp || internalCutoffDate;

  const handleDateChange = (newDate: string) => {
    setInternalCutoffDate(newDate);
    if (onCutoffDateChange) {
      onCutoffDateChange(newDate);
    }
  };

  // Métricas sincronizadas asociadas a la fecha de corte elegida
  const metrics = useMemo(() => {
    return computeProjectMetrics(proyecto, selectedCutoffDate);
  }, [proyecto, selectedCutoffDate]);

  // Vencidos y Próximos Vencimientos asociados a la fecha de corte seleccionada
  const { vencidos, proximos } = useMemo(() => {
    return getVencimientosHitos(proyecto, selectedCutoffDate);
  }, [proyecto, selectedCutoffDate]);

  // Filtro de horizonte para los próximos vencimientos (7, 15, 30 días o todos, por defecto 15 días)
  const [horizonteProximos, setHorizonteProximos] = useState<7 | 15 | 30 | 'todos'>(15);

  // Próximos filtrados por el horizonte temporal elegido (por defecto <= 15 días para no saturar)
  const proximosFiltrados = useMemo(() => {
    if (horizonteProximos === 'todos') return proximos;
    return proximos.filter((p) => p.diasDiferencia <= horizonteProximos);
  }, [proximos, horizonteProximos]);

  const totalMontoProximos = useMemo(() => {
    return proximosFiltrados.reduce((acc, p) => acc + (p.montoHito || 0), 0);
  }, [proximosFiltrados]);

  // Puntos de la curva al corte seleccionado
  const puntosCurva = useMemo(() => {
    return computeCurvaS(proyecto, selectedCutoffDate);
  }, [proyecto, selectedCutoffDate]);

  const puntoAlCorte = useMemo(() => {
    const found = puntosCurva.find((p) => p.fecha === selectedCutoffDate);
    if (found) return found;
    const past = puntosCurva.filter((p) => p.fecha <= selectedCutoffDate);
    return past[past.length - 1] || puntosCurva[0];
  }, [puntosCurva, selectedCutoffDate]);

  const avancePlan = Number((puntoAlCorte?.porcentajePlanAcumulado || 0).toFixed(1));
  const avanceReal = Number((puntoAlCorte?.porcentajeCertAcumulado || 0).toFixed(1));
  const desvio = Number((avanceReal - avancePlan).toFixed(1));

  // Descarga de la carátula ejecutiva como imagen
  const handleDownloadDashboardImage = async () => {
    if (!dashboardCardRef.current) return;
    setDownloadingReport(true);
    try {
      const projectNameClean = (proyecto.nombre || 'proyecto').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `caratula_dashboard_${projectNameClean}_${selectedCutoffDate}.png`;

      await exportElementToPng(dashboardCardRef.current, fileName, {
        backgroundColor: '#F8FAFC',
        hideElementIds: ['dashboard-header-actions'],
        scale: 2,
      });
    } catch (err) {
      console.error('Error generando reporte:', err);
      alert('No se pudo generar la imagen de la carátula.');
    } finally {
      setDownloadingReport(false);
    }
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  return (
    <>
      <div ref={dashboardCardRef} className={`space-y-6 ${isPrintModalOpen ? 'print:hidden' : ''}`}>
      {/* Encabezado Oficial exclusivo para Impresión directa en Papel / PDF */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-slate-900 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-10 h-10 shrink-0" viewBox="0 0 32 32" fill="none">
              <polygon points="4,28 28,4 28,28" fill="#009BE5" />
            </svg>
            <div>
              <div className="text-xl font-black tracking-wider text-slate-900">TAGING</div>
              <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                INGENIERÍA INTELIGENTE
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-900 uppercase">Reporte Ejecutivo de Gestión</div>
            <div className="text-xs text-slate-600">Proyecto: <strong>{proyecto.nombre}</strong></div>
            <div className="text-xs text-slate-600">Cliente / Mandante: <strong>{proyecto.empresas?.[0]?.nombre || 'Mandante'}</strong></div>
            <div className="text-xs text-slate-600">Fecha de Corte: <strong>{selectedCutoffDate}</strong></div>
          </div>
        </div>
      </div>

      {/* 1. Encabezado de la Carátula / Dashboard */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold tracking-wide uppercase">
                Carátula Ejecutiva
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                Control de Gestión
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1.5 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-blue-600 shrink-0" />
              <span>{proyecto.nombre || 'Proyecto de Ingeniería'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tablero de control sincronizado en tiempo real con hitos, certificaciones y fechas de corte.
            </p>
          </div>

          {/* Selector de Fecha de Corte sincronizado & Botones */}
          <div id="dashboard-header-actions" className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Fecha de Corte Activa
                </span>
                <select
                  value={selectedCutoffDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer pr-1"
                >
                  {todasLasFechasCorte.map((f) => (
                    <option key={f} value={f}>
                      {f} {f === defaultActualDate ? '(Actual)' : ''}
                    </option>
                  ))}
                </select>
                {selectedCutoffDate !== defaultActualDate && (
                  <button
                    type="button"
                    onClick={() => handleDateChange(defaultActualDate)}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold text-left"
                    title={`Restablecer a la fecha de corte actual (${defaultActualDate})`}
                  >
                    Volver a actual
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTab('modo_campo')}
              id="btn-abrir-modo-campo-dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl shadow-xs transition-colors"
              title="Abrir Modo Campo / Inspección simplificado para celulares y tablets"
            >
              <ClipboardCheck className="w-4 h-4 text-emerald-600" />
              <span>Modo Campo 👷</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDashboardImage}
              disabled={downloadingReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              title="Descargar imagen completa de la carátula en alta definición"
            >
              <Camera className="w-4 h-4" />
              <span>{downloadingReport ? 'Generando...' : 'Descargar Carátula'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              id="btn-imprimir-dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              title="Imprimir con las impresoras de la computadora o descargar como reporte en PDF"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        {/* Barra de Comparación Planificado vs Real al corte seleccionado */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1.5">
              <span>PLANIFICADO AL CORTE</span>
              <span className="text-blue-700 font-bold">{avancePlan.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, avancePlan))}%` }}
              />
            </div>
            <div className="mt-2 text-xs font-mono text-slate-600 flex justify-between">
              <span>Monto proyectado:</span>
              <span className="font-bold text-blue-900">{formatCurrency(puntoAlCorte?.planificadoAcumulado || 0)}</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1.5">
              <span>REAL CERTIFICADO</span>
              <span className="text-emerald-700 font-bold">{avanceReal.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, avanceReal))}%` }}
              />
            </div>
            <div className="mt-2 text-xs font-mono text-slate-600 flex justify-between">
              <span>Monto certificado:</span>
              <span className="font-bold text-emerald-900">{formatCurrency(puntoAlCorte?.certificadoAcumulado || 0)}</span>
            </div>
          </div>

          <div className={`border rounded-xl p-4 flex flex-col justify-between ${
            desvio >= 0 ? 'bg-teal-50/70 border-teal-100 text-teal-900' : 'bg-amber-50/70 border-amber-100 text-amber-900'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase">
                DESVÍO ACUMULADO AL CORTE
              </span>
              {desvio >= 0 ? (
                <span className="p-1 rounded-md bg-teal-100 text-teal-800"><ArrowUpRight className="w-4 h-4" /></span>
              ) : (
                <span className="p-1 rounded-md bg-amber-100 text-amber-800"><ArrowDownRight className="w-4 h-4" /></span>
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black">
                {desvio >= 0 ? `+${desvio.toFixed(1)}%` : `${desvio.toFixed(1)}%`}
              </span>
              <span className="text-xs opacity-80">
                {desvio >= 0 ? 'Avance en fecha' : 'Atraso contractual detectado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Módulo de KPIs Principales del Proyecto (Centralizado aquí como carátula) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Indicadores Clave de Rendimiento (KPIs)</span>
          </h3>
          <span className="text-xs text-slate-400">
            Sincronizados al corte: <strong className="text-slate-700 font-mono">{selectedCutoffDate}</strong>
          </span>
        </div>
        <MetricsCards 
          metrics={metrics} 
          empresaNombre={proyecto.empresas[0]?.nombre || 'Taging'} 
          desvio={desvio}
        />
      </div>

      {/* 3. Módulo de la Curva S (Visualizador Integrado) */}
      <div>
        <CurvaSView 
          proyecto={proyecto} 
          selectedCutoffDateProp={selectedCutoffDate}
          onCutoffDateChange={handleDateChange}
          showDownloadButton={false}
        />
      </div>

      {/* 4. Módulo de Tablas Operativas: Próximos Vencimientos y Vencidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tabla: Vencidos / Atrasados */}
        <div className="bg-white border border-rose-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-950">
                  Hitos Vencidos / Atrasados
                </h4>
                <p className="text-[11px] text-rose-700">
                  Hitos cuya fecha prevista venció antes de la fecha de corte y poseen saldo sin certificar.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-200/80 text-rose-900">
              {vencidos.length} {vencidos.length === 1 ? 'vencido' : 'vencidos'}
            </span>
          </div>

          <div className="overflow-x-auto max-h-96">
            {vencidos.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                No hay hitos vencidos con saldo pendiente a la fecha de corte elegida.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-2.5 px-3">Actividad / Hito</th>
                    <th className="py-2.5 px-3">Fecha Prevista</th>
                    <th className="py-2.5 px-3 text-right">Saldo Pend.</th>
                    <th className="py-2.5 px-3 text-center">Atraso</th>
                    <th className="py-2.5 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {vencidos.map((v) => (
                    <tr key={v.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{v.entregableCodigo} - {v.hitoNombre}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]" title={v.entregableDescripcion}>
                          {v.entregableDescripcion}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {v.fechaPrevista}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700 whitespace-nowrap">
                        {formatCurrency(v.saldoPendiente)}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">
                          {Math.abs(v.diasDiferencia)} días atraso
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenNewCert) {
                              onOpenNewCert(v.entregableId, v.hitoId);
                            } else {
                              onNavigateToTab('taging');
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-[10px] font-semibold transition-colors"
                          title="Certificar este hito ahora"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Certificar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Tabla: Próximos Vencimientos */}
        <div className="bg-white border border-blue-200/90 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-blue-50/50 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-950">
                  Próximos Vencimientos Contractuales
                </h4>
                <p className="text-[11px] text-blue-700">
                  {horizonteProximos === 'todos'
                    ? `Todos los hitos futuros pendientes (${formatCurrency(totalMontoProximos)} programados).`
                    : `Hitos a vencer dentro de los próximos ${horizonteProximos} días (${formatCurrency(totalMontoProximos)} programados).`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Selector de Horizonte: 7 días, 15 días, 30 días, Todos */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-blue-200 shadow-2xs">
                {([7, 15, 30, 'todos'] as const).map((dias) => {
                  const isSelected = horizonteProximos === dias;
                  const label = dias === 'todos' ? 'Todos' : `${dias} días`;
                  const tooltip = dias === 'todos' ? 'Mostrar todos los hitos futuros' : `Mostrar hitos dentro de ${dias} días`;
                  return (
                    <button
                      key={dias}
                      type="button"
                      onClick={() => setHorizonteProximos(dias)}
                      title={tooltip}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-blue-900 hover:bg-blue-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-200/80 text-blue-900 shrink-0">
                {proximosFiltrados.length} {proximosFiltrados.length === 1 ? 'próximo' : 'próximos'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96">
            {proximosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                <p>No se registran vencimientos contractuales dentro de los próximos {horizonteProximos} días.</p>
                {horizonteProximos !== 'todos' && proximos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setHorizonteProximos(30)}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Ampliar horizonte a 30 días o ver todos ({proximos.length} futuros)
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-2.5 px-3">Actividad / Hito</th>
                    <th className="py-2.5 px-3">Fecha Prevista</th>
                    <th className="py-2.5 px-3 text-right">Monto Hito</th>
                    <th className="py-2.5 px-3 text-center">Faltan</th>
                    <th className="py-2.5 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {proximosFiltrados.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{p.entregableCodigo} - {p.hitoNombre}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]" title={p.entregableDescripcion}>
                          {p.entregableDescripcion}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {p.fechaPrevista}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-800 whitespace-nowrap">
                        {formatCurrency(p.montoHito)}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          p.diasDiferencia <= 3
                            ? 'bg-rose-100 text-rose-800'
                            : p.diasDiferencia <= 7
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {p.diasDiferencia === 0 ? 'Hoy' : `${p.diasDiferencia} días`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenNewCert) {
                              onOpenNewCert(p.entregableId, p.hitoId);
                            } else {
                              onNavigateToTab('taging');
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-[10px] font-semibold transition-colors"
                          title="Certificar este hito"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Certificar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* Bloque de Firmas exclusivo para Impresión en Papel / PDF */}
      <div className="hidden print:grid grid-cols-2 gap-8 pt-8 mt-8 border-t border-slate-300 text-center text-xs print-avoid-break">
        <div>
          <div className="border-b border-slate-400 w-48 mx-auto h-10 mb-2" />
          <strong className="block text-slate-800">Elaborado por: Control de Gestión</strong>
          <span className="text-[10px] text-slate-500">TAGING S.A.</span>
        </div>
        <div>
          <div className="border-b border-slate-400 w-48 mx-auto h-10 mb-2" />
          <strong className="block text-slate-800">Aprobado por: Dirección de Proyecto / Mandante</strong>
          <span className="text-[10px] text-slate-500">{proyecto.empresas?.[0]?.nombre || 'Mandante'}</span>
        </div>
      </div>
    </div>

    {/* Modal de Impresión con Impresoras del Sistema y Exportación a PDF */}
    <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        proyecto={proyecto}
        selectedCutoffDate={selectedCutoffDate}
        metrics={metrics}
        vencidos={vencidos}
        proximos={proximosFiltrados}
        avancePlan={avancePlan}
        avanceReal={avanceReal}
        desvio={desvio}
        montoPlanificado={puntoAlCorte?.planificadoAcumulado || 0}
        montoCertificado={puntoAlCorte?.certificadoAcumulado || 0}
        puntosCurva={puntosCurva}
      />
    </>
  );
};
