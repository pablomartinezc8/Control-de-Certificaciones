import React, { useState, useMemo } from 'react';
import { Proyecto, GastoActividad, AvanceCorteData } from '../types';
import { 
  normalizeDate, 
  formatShortDate, 
  formatCurrency,
  getCorteActual,
  getProximoCorte,
  getTotalGastosGenerales
} from '../utils/calculations';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  DollarSign, 
  Wand2, 
  Check, 
  X, 
  Pencil, 
  ArrowDownUp, 
  Building2,
  Clock,
  Pin,
  HelpCircle,
  Percent,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  Sparkles
} from 'lucide-react';

interface FechasCorteViewProps {
  proyecto: Proyecto;
  onUpdateFechasCorte: (empresaId: string, newFechas: string[]) => void;
  onUpdateGastosGenerales: (empresaId: string, gastos: GastoActividad[]) => void;
  onUpdateAvanceCortes?: (empresaId: string, avances: AvanceCorteData[]) => void;
  onSetCorteActualFijado?: (empresaId: string, fecha: string | null) => void;
  selectedCutoffDate?: string;
  onSelectCutoffDate?: (date: string) => void;
}

// Utility to sort dates strictly from earliest to latest (menor a mayor)
const sortDatesChronologically = (dates: string[]): string[] => {
  return [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
};

export const FechasCorteView: React.FC<FechasCorteViewProps> = ({
  proyecto,
  onUpdateFechasCorte,
  onUpdateGastosGenerales,
  onUpdateAvanceCortes,
  onSetCorteActualFijado,
  selectedCutoffDate,
  onSelectCutoffDate,
}) => {
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>(
    proyecto.empresas[0]?.id || 'emp_taging'
  );

  const activeEmpresa = proyecto.empresas.some((e) => e.id === selectedEmpresaId)
    ? selectedEmpresaId
    : proyecto.empresas[0]?.id || 'emp_taging';

  const rawFechas = (proyecto.fechasCorte?.[activeEmpresa] || []).map(normalizeDate).filter(Boolean);
  // Guarantee dates are strictly sorted in ascending chronological order (menor a mayor)
  const fechas = sortDatesChronologically(Array.from(new Set(rawFechas)));

  const gastosList = proyecto.gastosActividad?.[activeEmpresa] || [];
  const totalGenerales = useMemo(() => {
    const sum = gastosList.reduce((acc, g) => acc + (Number(g.monto) || 0), 0);
    return sum > 0 ? sum : getTotalGastosGenerales(proyecto);
  }, [gastosList, proyecto]);

  // Tab view: 'tabla' (con columnas de avance y GG planificados) vs 'tarjetas'
  const [viewMode, setViewMode] = useState<'tabla' | 'tarjetas'>('tabla');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [newDate, setNewDate] = useState('');
  const [showAutoGenerator, setShowAutoGenerator] = useState(false);
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [intervalDays, setIntervalDays] = useState(15);

  // State for modifying existing dates without deleting
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // Generales del Proyecto itemized management
  const [nuevoConcepto, setNuevoConcepto] = useState('');
  const [nuevoMonto, setNuevoMonto] = useState<number | ''>('');

  // Avance planificado data
  const rawAvances = proyecto.avanceCortes?.[activeEmpresa] || [];
  const avanceMap = useMemo(() => {
    const map = new Map<string, AvanceCorteData>();
    rawAvances.forEach((a) => {
      const f = normalizeDate(a.fecha);
      if (f) map.set(f, a);
    });
    return map;
  }, [rawAvances]);

  const today = normalizeDate(new Date().toISOString().split('T')[0]);

  // Corte actual activo
  const corteActualActivo = useMemo(() => {
    if (proyecto.corteActualFijado?.[activeEmpresa] && fechas.includes(proyecto.corteActualFijado[activeEmpresa])) {
      return proyecto.corteActualFijado[activeEmpresa];
    }
    if (selectedCutoffDate && fechas.includes(selectedCutoffDate)) {
      return selectedCutoffDate;
    }
    return getCorteActual(fechas, today, proyecto, activeEmpresa);
  }, [fechas, today, proyecto, activeEmpresa, selectedCutoffDate]);

  const esFijadoManual = Boolean(proyecto.corteActualFijado?.[activeEmpresa]);
  const proximoCorte = useMemo(() => getProximoCorte(fechas, today), [fechas, today]);
  const corteMasCercanoAuto = useMemo(() => getCorteActual(fechas, today), [fechas, today]);

  // Manejo de Avance Planificado Manual
  const handleUpdatePorcentajePeriodo = (fecha: string, valorPct: number) => {
    if (!onUpdateAvanceCortes) return;
    const clampedPct = Math.max(0, Math.min(100, isNaN(valorPct) ? 0 : valorPct));

    // Update map
    const existing: AvanceCorteData = avanceMap.get(fecha) || { fecha };
    const updatedItem: AvanceCorteData = {
      ...existing,
      fecha,
      porcentajePlanificadoPeriodo: clampedPct,
      gastosPlanificadosPeriodo: Math.round((totalGenerales * (clampedPct / 100)) * 100) / 100,
    };

    const newMap = new Map<string, AvanceCorteData>(avanceMap);
    newMap.set(fecha, updatedItem);

    // Recalcular acumulados en orden cronológico
    let acum = 0;
    const resultList: AvanceCorteData[] = fechas.map((f) => {
      const item: AvanceCorteData = newMap.get(f) || { fecha: f, porcentajePlanificadoPeriodo: 0 };
      const pct = Number(item.porcentajePlanificadoPeriodo) || 0;
      acum += pct;
      const gastosPeriodo = Math.round((totalGenerales * (pct / 100)) * 100) / 100;
      const gastosAcum = Math.round((totalGenerales * (Math.min(100, acum) / 100)) * 100) / 100;

      return {
        ...item,
        fecha: f,
        porcentajePlanificadoPeriodo: pct,
        porcentajePlanificado: Math.round(acum * 100) / 100,
        gastosPlanificadosPeriodo: gastosPeriodo,
        gastosPlanificadosAcum: gastosAcum,
      };
    });

    onUpdateAvanceCortes(activeEmpresa, resultList);
  };

  const handleUpdateTareasPeriodo = (fecha: string, tareas: number | '') => {
    if (!onUpdateAvanceCortes) return;
    const numTareas = tareas === '' ? undefined : Math.max(0, Number(tareas));
    const existing: AvanceCorteData = avanceMap.get(fecha) || { fecha };

    const updatedItem: AvanceCorteData = {
      ...existing,
      fecha,
      tareasPlanificadas: numTareas,
    };

    const newMap = new Map<string, AvanceCorteData>(avanceMap);
    newMap.set(fecha, updatedItem);

    const resultList: AvanceCorteData[] = fechas.map((f): AvanceCorteData => {
      const item: AvanceCorteData = newMap.get(f) || { fecha: f };
      return item;
    });

    onUpdateAvanceCortes(activeEmpresa, resultList);
  };

  // Quick Action: Distribuir restante equitativamente
  const handleDistributeRemaining = () => {
    if (!onUpdateAvanceCortes || fechas.length === 0) return;
    const currentSum = fechas.reduce((sum, f) => {
      return sum + (Number(avanceMap.get(f)?.porcentajePlanificadoPeriodo) || 0);
    }, 0);

    const remaining = Math.max(0, 100 - currentSum);
    if (remaining <= 0) {
      alert('El porcentaje planificado ya alcanza o supera el 100%.');
      return;
    }

    const emptyDates = fechas.filter((f) => (Number(avanceMap.get(f)?.porcentajePlanificadoPeriodo) || 0) === 0);
    const targetDates = emptyDates.length > 0 ? emptyDates : fechas;
    const share = Math.round((remaining / targetDates.length) * 10) / 10;

    let acum = 0;
    const resultList: AvanceCorteData[] = fechas.map((f) => {
      const item = avanceMap.get(f) || { fecha: f };
      let pct = Number(item.porcentajePlanificadoPeriodo) || 0;
      if (targetDates.includes(f)) {
        pct = Math.round((pct + share) * 10) / 10;
      }
      acum += pct;
      const gastosPeriodo = Math.round((totalGenerales * (pct / 100)) * 100) / 100;
      const gastosAcum = Math.round((totalGenerales * (Math.min(100, acum) / 100)) * 100) / 100;

      return {
        ...item,
        fecha: f,
        porcentajePlanificadoPeriodo: pct,
        porcentajePlanificado: Math.round(acum * 100) / 100,
        gastosPlanificadosPeriodo: gastosPeriodo,
        gastosPlanificadosAcum: gastosAcum,
      };
    });

    onUpdateAvanceCortes(activeEmpresa, resultList);
  };

  // Quick Action: Limpiar porcentajes
  const handleClearPercentages = () => {
    if (!onUpdateAvanceCortes) return;
    if (!confirm('¿Desea restablecer todos los porcentajes planificados a 0%?')) return;
    const cleared: AvanceCorteData[] = fechas.map((f) => ({
      fecha: f,
      porcentajePlanificadoPeriodo: 0,
      porcentajePlanificado: 0,
      gastosPlanificadosPeriodo: 0,
      gastosPlanificadosAcum: 0,
    }));
    onUpdateAvanceCortes(activeEmpresa, cleared);
  };

  // Export Table to CSV
  const handleExportCSV = () => {
    const headers = [
      'Nro',
      'Fecha_Corte',
      'Es_Corte_Actual',
      'Pct_Planificado_Periodo',
      'Pct_Planificado_Acumulado',
      'Gastos_Generales_Planif_Periodo_USD',
      'Gastos_Generales_Planif_Acum_USD',
      'Tareas_Planificadas'
    ];

    let acum = 0;
    const rows = fechas.map((fecha, idx) => {
      const item = avanceMap.get(fecha);
      const pctPeriodo = Number(item?.porcentajePlanificadoPeriodo) || 0;
      acum += pctPeriodo;
      const ggPeriodo = Math.round((totalGenerales * (pctPeriodo / 100)) * 100) / 100;
      const ggAcum = Math.round((totalGenerales * (Math.min(100, acum) / 100)) * 100) / 100;

      return [
        idx + 1,
        `"${fecha}"`,
        fecha === corteActualActivo ? 'SI' : 'NO',
        `${pctPeriodo}%`,
        `${Math.round(acum * 100) / 100}%`,
        ggPeriodo,
        ggAcum,
        item?.tareasPlanificadas ?? ''
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cortes_y_avances_planificados_${activeEmpresa}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Total acumulado asignado
  const totalPctAsignado = useMemo(() => {
    return fechas.reduce((sum, f) => {
      return sum + (Number(avanceMap.get(f)?.porcentajePlanificadoPeriodo) || 0);
    }, 0);
  }, [fechas, avanceMap]);

  const totalGastosPlanificadosDistribuidos = useMemo(() => {
    return Math.round((totalGenerales * (Math.min(100, totalPctAsignado) / 100)) * 100) / 100;
  }, [totalGenerales, totalPctAsignado]);

  // Generales concept handlers
  const handleAddConcepto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoConcepto.trim() || Number(nuevoMonto) <= 0) return;
    const nuevoItem: GastoActividad = {
      id: `g_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      nombre: nuevoConcepto.trim(),
      monto: Number(nuevoMonto),
      modo: 'igual',
      pesos: {},
    };
    onUpdateGastosGenerales(activeEmpresa, [...gastosList, nuevoItem]);
    setNuevoConcepto('');
    setNuevoMonto('');
  };

  const handleDeleteConcepto = (id: string) => {
    const updated = gastosList.filter((g) => g.id !== id);
    onUpdateGastosGenerales(activeEmpresa, updated);
  };

  // Date manipulation handlers
  const handleAddDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    const clean = normalizeDate(newDate);
    if (!clean) return;
    
    const updated = sortDatesChronologically(Array.from(new Set([...fechas, clean])));
    onUpdateFechasCorte(activeEmpresa, updated);
    setNewDate('');
  };

  const handleStartEdit = (index: number, dateValue: string) => {
    setEditingIndex(index);
    setEditingValue(dateValue);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleSaveEdit = (originalDate: string) => {
    if (!editingValue) return;
    const clean = normalizeDate(editingValue);
    if (!clean) return;

    const updatedList = fechas.map((d) => (d === originalDate ? clean : d));
    const sorted = sortDatesChronologically(Array.from(new Set(updatedList)));
    
    onUpdateFechasCorte(activeEmpresa, sorted);

    // Update avance mapping if exists
    if (onUpdateAvanceCortes && avanceMap.has(originalDate)) {
      const item = avanceMap.get(originalDate)!;
      const updatedAvances = rawAvances.map((a) => (a.fecha === originalDate ? { ...item, fecha: clean } : a));
      onUpdateAvanceCortes(activeEmpresa, updatedAvances);
    }

    setEditingIndex(null);
    setEditingValue('');
  };

  const handleDeleteDate = (dateToDelete: string) => {
    const updated = fechas.filter((d) => d !== dateToDelete);
    onUpdateFechasCorte(activeEmpresa, updated);
    if (editingIndex !== null) {
      handleCancelEdit();
    }
  };

  const handleGenerateDates = () => {
    const dates: string[] = [];
    let current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + intervalDays);
    }

    const merged = sortDatesChronologically(Array.from(new Set([...fechas, ...dates])));
    onUpdateFechasCorte(activeEmpresa, merged);
    setShowAutoGenerator(false);
  };

  const handleFijarCorteActual = (fecha: string) => {
    if (onSetCorteActualFijado) {
      onSetCorteActualFijado(activeEmpresa, fecha);
    }
    if (onSelectCutoffDate) {
      onSelectCutoffDate(fecha);
    }
  };

  const handleRestablecerAutomatico = () => {
    if (onSetCorteActualFijado) {
      onSetCorteActualFijado(activeEmpresa, null);
    }
    if (onSelectCutoffDate && corteMasCercanoAuto) {
      onSelectCutoffDate(corteMasCercanoAuto);
    }
  };

  // Cumulative percentage calculation helper for row rendering
  let cumulativePercentageTracker = 0;

  return (
    <div className="space-y-6">
      {/* Top Header Card & Empresa Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Fechas de Corte y Avance Planificado del Proyecto</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Gestiona las fechas de corte, ingresa manualmente el % de avance planificado por período y calcula en tiempo real los Gastos Generales planificados.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Empresa selector */}
            {proyecto.empresas.length > 1 && (
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={activeEmpresa}
                  onChange={(e) => {
                    setSelectedEmpresaId(e.target.value);
                    handleCancelEdit();
                  }}
                  className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {proyecto.empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* View Mode Toggle: Tabla vs Tarjetas */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('tabla')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  viewMode === 'tabla'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Tabla de Avances</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('tarjetas')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  viewMode === 'tarjetas'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tarjetas</span>
              </button>
            </div>

            {/* Generar Períodos */}
            <button
              onClick={() => setShowAutoGenerator(!showAutoGenerator)}
              id="btn-generar-periodos"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition"
            >
              <Wand2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Generar Períodos</span>
            </button>

            {/* Botón de Ayuda: ¿Cómo toma el corte actual? */}
            <button
              type="button"
              onClick={() => setShowHelpModal(!showHelpModal)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs font-medium hover:bg-amber-100 transition"
              title="Ver explicación de cómo el sistema calcula o fija el corte actual"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>¿Cómo toma el Corte Actual?</span>
            </button>
          </div>
        </div>

        {/* Explicación desplegable: ¿Cómo toma el corte actual? */}
        {showHelpModal && (
          <div className="my-4 p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/80 rounded-xl text-xs space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 text-sm">
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>¿Cómo determina y toma el sistema el Corte Actual?</span>
              </span>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-amber-700 dark:text-amber-400 hover:text-amber-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-amber-900 dark:text-amber-200/90 space-y-1.5 text-xs leading-relaxed">
              <p>
                <strong>1. Cálculo automático:</strong> Por defecto, el sistema busca la fecha de corte cuya distancia en días con respecto a la fecha de referencia (Hoy: <span className="font-mono font-bold">{formatShortDate(today)}</span>) sea la mínima absoluta (<span className="font-mono">Math.abs(fecha - hoy)</span>).
              </p>
              <p>
                <strong>2. Selección o fijación manual:</strong> Si en la tabla haces clic en el botón <strong>"Fijar como actual"</strong> en cualquier fecha de corte (ej. <span className="font-mono font-semibold">27/09/2026</span>), esa fecha queda establecida como el <em>Corte Actual Activo</em> para todo el sistema (Dashboard, Curva S, Proyecciones y Conciliación), ignorando la fecha de hoy hasta que desees volver al modo automático.
              </p>
              <p>
                <strong>3. Corte actualmente activo:</strong>{' '}
                <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300">
                  {corteActualActivo ? formatShortDate(corteActualActivo) : 'Sin corte'}
                </span>
                {esFijadoManual ? (
                  <span className="ml-2 text-amber-700 dark:text-amber-300 font-medium">
                    (Fijado manualmente por el usuario. <button type="button" onClick={handleRestablecerAutomatico} className="underline font-bold hover:text-blue-600">Restablecer a automático</button>)
                  </span>
                ) : (
                  <span className="ml-2 text-blue-700 dark:text-blue-300 font-medium">
                    (Calculado automáticamente como el más cercano a hoy)
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Auto generator panel */}
        {showAutoGenerator && (
          <div className="my-4 p-4 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs space-y-3 animate-in fade-in duration-150">
            <div className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Generador Automático de Fechas Periódicas</span>
            </div>
            <p className="text-[11px] text-blue-700 dark:text-blue-400">
              Genera automáticamente una secuencia de fechas espaciadas uniformemente y las fusiona en orden cronológico ascendente.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Fecha Inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Fecha Fin</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Intervalo (Días)</label>
                <input
                  type="number"
                  min="1"
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(Math.max(1, Number(e.target.value) || 15))}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAutoGenerator(false)}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerateDates}
                className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition shadow-xs"
              >
                Insertar y Ordenar
              </button>
            </div>
          </div>
        )}

        {/* Add single date form & Active Cutoff Status Banner */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          <form onSubmit={handleAddDate} className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Nueva fecha de corte:
            </label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              id="btn-agregar-fecha-corte"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Corte</span>
            </button>
          </form>

          {/* Active Cutoff Status Display */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Corte actual activo:</span>
            <span className="font-mono font-bold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 shadow-xs">
              <Pin className="w-3 h-3 text-blue-500" />
              <span>{corteActualActivo ? formatShortDate(corteActualActivo) : 'Sin fecha'}</span>
              {esFijadoManual && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold">(Fijado)</span>
              )}
            </span>
            {esFijadoManual && (
              <button
                type="button"
                onClick={handleRestablecerAutomatico}
                className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-[11px] font-medium transition"
                title="Volver a calcular automáticamente el corte más cercano a hoy"
              >
                Volver a automático
              </button>
            )}
          </div>
        </div>

        {/* Gastos Generales & Planificado Tracking Strip */}
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50/80 via-blue-50/50 to-slate-50 dark:from-purple-950/30 dark:via-blue-950/20 dark:to-slate-800/40 border border-purple-200 dark:border-purple-800/60 rounded-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                  Gastos Generales Presupuestados: <strong className="font-mono text-base">{formatCurrency(totalGenerales)}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Al cargar manualmente los porcentajes planificados (% por período) en la tabla inferior, los Gastos Generales planificados se calculan automáticamente para cada corte contractual.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDistributeRemaining}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                title="Reparte el porcentaje restante equitativamente entre los cortes que aún tengan 0%"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Distribuir restante equitativamente</span>
              </button>

              <button
                type="button"
                onClick={handleClearPercentages}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition"
                title="Poner todos los porcentajes planificados a 0%"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar %</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition"
                title="Exportar planilla a archivo CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          {/* Progress Bar for Total Planificado */}
          <div className="mt-3 pt-3 border-t border-purple-200/60 dark:border-purple-800/40">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Avance Planificado Total Asignado:
              </span>
              <div className="flex items-center gap-3">
                <span className={`font-mono font-bold text-xs ${
                  totalPctAsignado === 100
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : totalPctAsignado > 100
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {totalPctAsignado.toFixed(1).replace('.', ',')}% / 100%
                </span>
                <span className="text-slate-500 font-mono text-xs">
                  (Distribuido: <strong className="text-purple-700 dark:text-purple-300">{formatCurrency(totalGastosPlanificadosDistribuidos)}</strong> de {formatCurrency(totalGenerales)})
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  totalPctAsignado === 100
                    ? 'bg-emerald-500'
                    : totalPctAsignado > 100
                    ? 'bg-rose-500'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}
                style={{ width: `${Math.min(100, totalPctAsignado)}%` }}
              />
            </div>
          </div>
        </div>

        {/* MAIN VIEW: Interactive Table with Manual Planned Percentages & Calculated GG */}
        {viewMode === 'tabla' ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-3 min-w-[130px]">Fecha de Corte</th>
                  <th className="py-3 px-3 text-center min-w-[130px]">Corte Actual / Estado</th>
                  <th className="py-3 px-3 text-center min-w-[150px] bg-blue-50/60 dark:bg-blue-950/30">
                    % Avance Planif. Período
                    <span className="block text-[9px] font-normal text-blue-600 dark:text-blue-400 lowercase">(manual editable)</span>
                  </th>
                  <th className="py-3 px-3 text-center min-w-[130px]">
                    % Planif. Acumulado
                  </th>
                  <th className="py-3 px-3 text-right min-w-[160px] bg-purple-50/50 dark:bg-purple-950/20">
                    Gastos Generales Período
                    <span className="block text-[9px] font-normal text-purple-600 dark:text-purple-400 lowercase">(calculado de %)</span>
                  </th>
                  <th className="py-3 px-3 text-right min-w-[160px]">
                    Gastos Generales Acumulado
                  </th>
                  <th className="py-3 px-3 text-center min-w-[110px]">
                    Tareas Planif.
                  </th>
                  <th className="py-3 px-3 text-center w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {fechas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No hay fechas de corte registradas. Agrega fechas individuales arriba o usa "Generar Períodos".
                    </td>
                  </tr>
                ) : (
                  fechas.map((fecha, idx) => {
                    const isEditing = editingIndex === idx;
                    const isToday = fecha === today;
                    const isNext = fecha === proximoCorte;
                    const isActual = fecha === corteActualActivo;

                    const item = avanceMap.get(fecha);
                    const pctPeriodo = Number(item?.porcentajePlanificadoPeriodo) || 0;
                    cumulativePercentageTracker += pctPeriodo;
                    const pctAcumulado = Math.round(cumulativePercentageTracker * 100) / 100;

                    const ggPeriodo = Math.round((totalGenerales * (pctPeriodo / 100)) * 100) / 100;
                    const ggAcumulado = Math.round((totalGenerales * (Math.min(100, pctAcumulado) / 100)) * 100) / 100;

                    const todayTime = new Date(today).getTime();
                    const fTime = new Date(fecha).getTime();
                    const diffDays = Math.round((fTime - todayTime) / (1000 * 60 * 60 * 24));

                    return (
                      <tr 
                        key={`${fecha}-${idx}`}
                        className={`transition-colors ${
                          isActual
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 font-medium'
                            : idx % 2 === 0
                            ? 'bg-white dark:bg-slate-900'
                            : 'bg-slate-50/50 dark:bg-slate-800/30'
                        } hover:bg-blue-50/40 dark:hover:bg-blue-950/20`}
                      >
                        {/* # */}
                        <td className="py-3 px-3 text-center text-slate-500 font-bold">
                          {idx + 1}
                        </td>

                        {/* Fecha de corte con edición inline */}
                        <td className="py-3 px-3 font-mono font-medium">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="date"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="px-2 py-1 bg-white dark:bg-slate-900 border border-blue-500 rounded text-xs text-slate-900 dark:text-white"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(fecha)}
                                className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                                title="Guardar fecha"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white text-xs">
                                {formatShortDate(fecha)}
                              </span>
                              <span className="block text-[10px] text-slate-400">
                                {fecha}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Corte actual / Estado */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {isActual ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>CORTE ACTUAL</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleFijarCorteActual(fecha)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-dashed border-slate-300 dark:border-slate-700 transition"
                              title="Establecer esta fecha como el corte actual del proyecto"
                            >
                              <Pin className="w-2.5 h-2.5" />
                              <span>Fijar como actual</span>
                            </button>
                          )}
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            {isToday ? 'Hoy' : diffDays === 1 ? 'Mañana' : diffDays > 0 ? `En ${diffDays}d` : `Hace ${Math.abs(diffDays)}d`}
                          </div>
                        </td>

                        {/* % Avance Planificado Período (Manual Editable) */}
                        <td className="py-3 px-3 text-center bg-blue-50/40 dark:bg-blue-950/20">
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={pctPeriodo === 0 ? '' : pctPeriodo}
                              onChange={(e) => handleUpdatePorcentajePeriodo(fecha, parseFloat(e.target.value))}
                              placeholder="0"
                              className="w-16 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold text-blue-700 dark:text-cyan-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-xs font-bold text-slate-500 font-mono">%</span>
                          </div>
                        </td>

                        {/* % Avance Planificado Acumulado */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            pctAcumulado === 100
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {pctAcumulado.toFixed(1).replace('.', ',')}%
                          </span>
                        </td>

                        {/* Gastos Generales Período (Calculado) */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50/30 dark:bg-purple-950/10">
                          {formatCurrency(ggPeriodo)}
                        </td>

                        {/* Gastos Generales Acumulado */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(ggAcumulado)}
                        </td>

                        {/* Tareas Planificadas (Opcional) */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={item?.tareasPlanificadas ?? ''}
                            onChange={(e) => handleUpdateTareasPeriodo(fecha, e.target.value === '' ? '' : parseInt(e.target.value))}
                            placeholder="—"
                            className="w-14 px-1.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            title="Cantidad de tareas estimadas para este período"
                          />
                        </td>

                        {/* Acciones */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(idx, fecha)}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition"
                              title="Modificar fecha de corte"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDate(fecha)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 transition"
                              title="Eliminar fecha de corte"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ALTERNATIVE VIEW: Cards */
          <div className="mt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {fechas.map((fecha, idx) => {
                const isEditing = editingIndex === idx;
                const isToday = fecha === today;
                const isNext = fecha === proximoCorte;
                const isActual = fecha === corteActualActivo;

                const item = avanceMap.get(fecha);
                const pctPeriodo = Number(item?.porcentajePlanificadoPeriodo) || 0;
                const ggPeriodo = Math.round((totalGenerales * (pctPeriodo / 100)) * 100) / 100;

                return (
                  <div
                    key={`${fecha}-${idx}`}
                    className={`p-3 rounded-xl border transition-all ${
                      isActual
                        ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-400 dark:border-blue-700 shadow-xs ring-2 ring-blue-500/20'
                        : isNext
                        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white text-xs font-mono">
                            {formatShortDate(fecha)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {fecha}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {isActual ? (
                          <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                            Actual
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleFijarCorteActual(fecha)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600"
                            title="Fijar como actual"
                          >
                            <Pin className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(idx, fecha)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDate(fecha)}
                          className="p-1 rounded text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">% Planif. Período:</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={pctPeriodo === 0 ? '' : pctPeriodo}
                          onChange={(e) => handleUpdatePorcentajePeriodo(fecha, parseFloat(e.target.value))}
                          placeholder="0%"
                          className="w-16 px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-center text-xs font-mono font-bold text-blue-600"
                        />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">GG Planif. Período:</span>
                        <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                          {formatCurrency(ggPeriodo)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Itemized Generales del Proyecto Panel (Conceptos de GG) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              <span>Conceptos e Ítems que Componen los Gastos Generales</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Presupuesto detallado de indirectos (gerenciamiento, utilidades, administración, etc.) que componen el total de Generales del Proyecto.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Presupuestado:</span>
            <span className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
              {formatCurrency(totalGenerales)}
            </span>
          </div>
        </div>

        {/* Formulario para agregar ítem a Generales */}
        <form onSubmit={handleAddConcepto} className="mt-4 p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-800/50 rounded-xl space-y-2">
          <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Concepto al Presupuesto de Gastos Generales</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Ej. Gerenciamiento de obra, Utilidades, Administrativos..."
              value={nuevoConcepto}
              onChange={(e) => setNuevoConcepto(e.target.value)}
              className="sm:col-span-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="Monto USD"
                value={nuevoMonto}
                onChange={(e) => setNuevoMonto(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs transition shadow-xs shrink-0"
              >
                Agregar
              </button>
            </div>
          </div>
        </form>

        {/* List of Conceptos */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {gastosList.length === 0 ? (
            <div className="col-span-full p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              No hay ítems registrados en Generales del Proyecto. Agrega conceptos arriba (ej. Gastos Generales: $47.514,00).
            </div>
          ) : (
            gastosList.map((gasto) => (
              <div
                key={gasto.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs hover:border-slate-300 transition"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {gasto.nombre}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {totalGenerales > 0 ? ((gasto.monto / totalGenerales) * 100).toFixed(1) : 0}% del total indirecto
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(gasto.monto)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteConcepto(gasto.id)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition"
                    title="Eliminar este ítem"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
