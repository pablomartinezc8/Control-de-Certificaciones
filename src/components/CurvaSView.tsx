import React, { useMemo, useState, useRef } from 'react';
import { Proyecto } from '../types';
import { computeCurvaS, formatCurrency, formatShortDate, normalizeDate } from '../utils/calculations';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  LabelList,
} from 'recharts';
import { 
  TrendingUp, 
  FileSpreadsheet, 
  Percent, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Camera,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';
import { exportElementToPng } from '../utils/imageExport';

interface CurvaSViewProps {
  proyecto: Proyecto;
  selectedCutoffDateProp?: string;
  onCutoffDateChange?: (date: string) => void;
  showDownloadButton?: boolean;
}

export const CurvaSView: React.FC<CurvaSViewProps> = ({
  proyecto,
  selectedCutoffDateProp,
  onCutoffDateChange,
  showDownloadButton = true,
}) => {
  const [viewMode, setViewMode] = useState<'porcentaje' | 'monto'>('porcentaje');
  const [downloadingImage, setDownloadingImage] = useState(false);
  const cardToExportRef = useRef<HTMLDivElement>(null);

  // Extraer todas las fechas de corte ordenadas cronológicamente
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

  // Fecha de corte seleccionada local si no viene por prop
  const [internalCutoffDate, setInternalCutoffDate] = useState<string>(() => {
    if (selectedCutoffDateProp) return selectedCutoffDateProp;
    try {
      const saved = localStorage.getItem(`curva_cutoff_${proyecto.id}`);
      if (saved && todasLasFechasCorte.includes(saved)) return saved;
    } catch {}
    return defaultActualDate;
  });

  const activeCutoffDate = selectedCutoffDateProp || internalCutoffDate;

  const handleSelectDate = (date: string) => {
    setInternalCutoffDate(date);
    try {
      localStorage.setItem(`curva_cutoff_${proyecto.id}`, date);
    } catch {}
    if (onCutoffDateChange) {
      onCutoffDateChange(date);
    }
  };

  // Puntos calculados de la Curva S cortando el avance Real en activeCutoffDate
  const puntosCurva = useMemo(() => {
    return computeCurvaS(proyecto, activeCutoffDate);
  }, [proyecto, activeCutoffDate]);

  // Punto correspondiente a la fecha de corte seleccionada
  const puntoSeleccionado = useMemo(() => {
    const found = puntosCurva.find((p) => p.fecha === activeCutoffDate);
    if (found) return found;
    const past = puntosCurva.filter((p) => p.fecha <= activeCutoffDate);
    return past[past.length - 1] || puntosCurva[0];
  }, [puntosCurva, activeCutoffDate]);

  const avancePlanificado = Number((puntoSeleccionado?.porcentajePlanAcumulado || 0).toFixed(1));
  const avanceReal = Number((puntoSeleccionado?.porcentajeCertAcumulado || 0).toFixed(1));
  const desvio = Number((avanceReal - avancePlanificado).toFixed(1));

  const montoPlanificado = puntoSeleccionado?.planificadoAcumulado || 0;
  const montoReal = puntoSeleccionado?.certificadoAcumulado || 0;

  const exportCurvaCSV = () => {
    const headers = [
      'Fecha_Corte',
      'Plan_Periodo_USD',
      'Plan_Acum_USD',
      'Pct_Plan_Acum',
      'Real_Periodo_USD',
      'Real_Acum_USD',
      'Pct_Real_Acum',
      'Cobrado_Periodo_USD',
      'Cobrado_Acum_USD',
    ];

    const rows = puntosCurva.map((p) => [
      `"${p.fecha}"`,
      p.planificadoPeriodo,
      p.planificadoAcumulado,
      `${p.porcentajePlanAcumulado}%`,
      p.certificadoPeriodo !== null ? p.certificadoPeriodo : '',
      p.certificadoAcumulado !== null ? p.certificadoAcumulado : '',
      p.porcentajeCertAcumulado !== null ? `${p.porcentajeCertAcumulado}%` : '',
      p.cobradoPeriodo !== null ? p.cobradoPeriodo : '',
      p.cobradoAcumulado !== null ? p.cobradoAcumulado : '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `curva_s_${(proyecto.nombre || 'proyecto').replace(/\s+/g, '_')}_corte_${activeCutoffDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCurvaImage = async () => {
    if (!cardToExportRef.current) return;
    setDownloadingImage(true);

    try {
      const projectNameClean = (proyecto.nombre || 'proyecto').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `curva_s_${projectNameClean}_corte_${activeCutoffDate}.png`;

      await exportElementToPng(cardToExportRef.current, fileName, {
        backgroundColor: '#ffffff',
        hideElementIds: ['curva-export-controls'],
        scale: 2,
      });
    } catch (err) {
      console.error('Error exportando imagen de la curva:', err);
    } finally {
      setDownloadingImage(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data: any = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[210px]">
        <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-1.5 mb-2 flex items-center justify-between">
          <span>Fecha de corte:</span>
          <span className="text-blue-400 font-mono">{data.fecha}</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-blue-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Planificado Acumulado:
            </span>
            <span className="font-semibold font-mono">
              {viewMode === 'porcentaje'
                ? `${data.porcentajePlanAcumulado}%`
                : formatCurrency(data.planificadoAcumulado)}
            </span>
          </div>

          {data.porcentajeCertAcumulado !== null ? (
            <div className="flex items-center justify-between text-emerald-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Real Certificado:
              </span>
              <span className="font-semibold font-mono">
                {viewMode === 'porcentaje'
                  ? `${data.porcentajeCertAcumulado}%`
                  : formatCurrency(data.certificadoAcumulado || 0)}
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic">
              (Posterior a fecha de corte seleccionada)
            </div>
          )}

          {data.cobradoAcumulado !== null && (
            <div className="flex items-center justify-between text-purple-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Cobrado:
              </span>
              <span className="font-semibold font-mono">
                {viewMode === 'porcentaje'
                  ? `${data.porcentajeCobradoAcumulado}%`
                  : formatCurrency(data.cobradoAcumulado || 0)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta exportable completa con encabezado, selectores y gráfico */}
      <div 
        ref={cardToExportRef}
        id="card-curva-s-exportable"
        className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs"
      >
        {/* Encabezado Superior de la Curva */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold tracking-wide uppercase">
                Curva S Contractual
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {proyecto.nombre || 'Proyecto'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              Control de Avance Planificado vs. Real
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Curva planificada completa (línea azul) y avance real certificado hasta la fecha de corte seleccionada (línea verde esmeralda).
            </p>
          </div>

          {/* Selector de Fecha de Corte Activa */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Corte de Control Real
                </span>
                <select
                  value={activeCutoffDate}
                  onChange={(e) => handleSelectDate(e.target.value)}
                  className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer pr-1"
                >
                  {todasLasFechasCorte.map((f) => (
                    <option key={f} value={f}>
                      {f} {f === defaultActualDate ? '(Actual)' : ''}
                    </option>
                  ))}
                </select>
                {activeCutoffDate !== defaultActualDate && (
                  <button
                    type="button"
                    onClick={() => handleSelectDate(defaultActualDate)}
                    className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline font-semibold text-left"
                    title={`Restablecer a la fecha de corte actual (${defaultActualDate})`}
                  >
                    Volver a actual
                  </button>
                )}
              </div>
            </div>

            {/* Controles de Vista y Exportación */}
            <div id="curva-export-controls" className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setViewMode('porcentaje')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'porcentaje'
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Percent className="w-3 h-3" />
                  <span>%</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('monto')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'monto'
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <DollarSign className="w-3 h-3" />
                  <span>$</span>
                </button>
              </div>

              <button
                type="button"
                onClick={downloadCurvaImage}
                disabled={downloadingImage || puntosCurva.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
                title="Descargar imagen nítida en PNG con los valores y porcentajes"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{downloadingImage ? 'Descargando...' : 'Descargar Imagen'}</span>
              </button>

              <button
                type="button"
                onClick={exportCurvaCSV}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                title="Exportar datos a CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Resumen de Métricas al Corte Seleccionado */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3">
            <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              Planificado al Corte
            </div>
            <div className="mt-1 text-lg sm:text-xl font-bold text-blue-900">
              {avancePlanificado.toFixed(1)}%
            </div>
            <div className="text-[11px] text-blue-600 font-mono mt-0.5">
              {formatCurrency(montoPlanificado)}
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3">
            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              Real Certificado
            </div>
            <div className="mt-1 text-lg sm:text-xl font-bold text-emerald-900">
              {avanceReal.toFixed(1)}%
            </div>
            <div className="text-[11px] text-emerald-600 font-mono mt-0.5">
              {formatCurrency(montoReal)}
            </div>
          </div>

          <div className={`rounded-xl p-3 border ${
            desvio >= 0 ? 'bg-teal-50/70 border-teal-100' : 'bg-amber-50/70 border-amber-100'
          }`}>
            <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              {desvio >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-teal-600" /> : <ArrowDownRight className="w-3.5 h-3.5 text-amber-600" />}
              Desvío a la Fecha
            </div>
            <div className={`mt-1 text-lg sm:text-xl font-bold ${
              desvio >= 0 ? 'text-teal-700' : 'text-amber-700'
            }`}>
              {desvio >= 0 ? `+${desvio.toFixed(1)}%` : `${desvio.toFixed(1)}%`}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {desvio >= 0 ? 'En fecha / Adelantado' : 'Atraso contractual'}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Fecha de Corte Activa
            </div>
            <div className="mt-1 text-sm sm:text-base font-bold text-slate-800 font-mono">
              {activeCutoffDate}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {todasLasFechasCorte.indexOf(activeCutoffDate) + 1} de {todasLasFechasCorte.length} cortes
            </div>
          </div>
        </div>

        {/* Gráfico Recharts con alta nitidez, colores distinguibles y etiquetas numéricas */}
        <div className="h-80 sm:h-96 w-full pt-2">
          {puntosCurva.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No hay fechas de corte configuradas para generar la curva.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={puntosCurva}
                margin={{ top: 25, right: 30, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="fechaCorta"
                  stroke="#64748B"
                  fontSize={11}
                  angle={-30}
                  textAnchor="end"
                  dy={6}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  domain={viewMode === 'porcentaje' ? [0, 105] : [0, 'auto']}
                  tickFormatter={(val) => (viewMode === 'porcentaje' ? `${val}%` : `$${(val / 1000).toFixed(0)}k`)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '14px', fontSize: '12px' }}
                />

                {/* Línea Planificada: Azul Clásico (#2563EB) de inicio a fin con sombra suave */}
                <Area
                  type="monotone"
                  dataKey={viewMode === 'porcentaje' ? 'porcentajePlanAcumulado' : 'planificadoAcumulado'}
                  name="Planificado"
                  fill="#3B82F6"
                  fillOpacity={0.06}
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                >
                  <LabelList
                    dataKey={viewMode === 'porcentaje' ? 'porcentajePlanAcumulado' : 'planificadoAcumulado'}
                    position="top"
                    offset={8}
                    formatter={(val: any) => {
                      if (typeof val !== 'number') return '';
                      return viewMode === 'porcentaje' ? `${val.toFixed(0)}%` : `$${(val / 1000).toFixed(0)}k`;
                    }}
                    style={{ fontSize: '10px', fill: '#1E40AF', fontWeight: 700 }}
                  />
                </Area>

                {/* Línea Real Certificado: Verde Esmeralda (#10B981) ALTO CONTRASTE que CORTA en la fecha seleccionada */}
                <Line
                  type="monotone"
                  connectNulls={false}
                  dataKey={viewMode === 'porcentaje' ? 'porcentajeCertAcumulado' : 'certificadoAcumulado'}
                  name="Real (Certificado)"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4.5, fill: '#10B981', stroke: '#FFFFFF', strokeWidth: 2 }}
                >
                  <LabelList
                    dataKey={viewMode === 'porcentaje' ? 'porcentajeCertAcumulado' : 'certificadoAcumulado'}
                    position="bottom"
                    offset={8}
                    formatter={(val: any) => {
                      if (typeof val !== 'number') return '';
                      return viewMode === 'porcentaje' ? `${val.toFixed(0)}%` : `$${(val / 1000).toFixed(0)}k`;
                    }}
                    style={{ fontSize: '10px', fill: '#047857', fontWeight: 800 }}
                  />
                </Line>

                {/* Línea Cobrado: Púrpura punteado que también corta en la fecha seleccionada */}
                <Line
                  type="monotone"
                  connectNulls={false}
                  dataKey={viewMode === 'porcentaje' ? 'porcentajeCobradoAcumulado' : 'cobradoAcumulado'}
                  name="Cobrado"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#8B5CF6' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tabla detallada de períodos con distinción de corte */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Datos Numéricos por Fecha de Corte
            </h4>
            <p className="text-xs text-slate-500">
              Valores planificados versus valores reales certificados y cobrados en cada período.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {puntosCurva.length} fechas de corte
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3 text-right">Plan Período</th>
                <th className="py-2.5 px-3 text-right text-blue-700">Plan Acum.</th>
                <th className="py-2.5 px-3 text-right text-blue-700">% Plan</th>
                <th className="py-2.5 px-3 text-right text-emerald-700">Real Período</th>
                <th className="py-2.5 px-3 text-right text-emerald-700">Real Acum.</th>
                <th className="py-2.5 px-3 text-right text-emerald-700">% Real</th>
                <th className="py-2.5 px-3 text-right text-purple-700">Cobrado Acum.</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {puntosCurva.map((p, idx) => {
                const isSelected = p.fecha === activeCutoffDate;
                const isPastCutoff = p.fecha > activeCutoffDate;

                return (
                  <tr
                    key={p.fecha}
                    onClick={() => handleSelectDate(p.fecha)}
                    className={`transition-colors cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-emerald-50/60 font-semibold'
                        : isPastCutoff
                        ? 'bg-slate-50/30 text-slate-400'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                        <span>{p.fecha}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                      {formatCurrency(p.planificadoPeriodo)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-blue-800 font-medium">
                      {formatCurrency(p.planificadoAcumulado)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                      {p.porcentajePlanAcumulado.toFixed(1)}%
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                      {p.certificadoPeriodo !== null ? formatCurrency(p.certificadoPeriodo) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-800 font-medium">
                      {p.certificadoAcumulado !== null ? formatCurrency(p.certificadoAcumulado) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                      {p.porcentajeCertAcumulado !== null ? `${p.porcentajeCertAcumulado.toFixed(1)}%` : '—'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-purple-700">
                      {p.cobradoAcumulado !== null ? formatCurrency(p.cobradoAcumulado) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Corte Actual
                        </span>
                      ) : isPastCutoff ? (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px]">
                          Proyectado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px]">
                          Histórico
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
