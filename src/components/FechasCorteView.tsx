import React, { useState, useMemo } from 'react';
import { Proyecto, GastoActividad } from '../types';
import { 
  normalizeDate, 
  formatShortDate, 
  formatCurrency,
  getCorteActual,
  getProximoCorte
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
  Clock
} from 'lucide-react';

interface FechasCorteViewProps {
  proyecto: Proyecto;
  onUpdateFechasCorte: (empresaId: string, newFechas: string[]) => void;
  onUpdateGastosGenerales: (empresaId: string, gastos: GastoActividad[]) => void;
}

// Utility to sort dates strictly from earliest to latest (menor a mayor)
const sortDatesChronologically = (dates: string[]): string[] => {
  return [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
};

export const FechasCorteView: React.FC<FechasCorteViewProps> = ({
  proyecto,
  onUpdateFechasCorte,
  onUpdateGastosGenerales,
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

  const totalGenerales = useMemo(() => {
    return gastosList.reduce((sum, g) => sum + (Number(g.monto) || 0), 0);
  }, [gastosList]);

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

  const handleAddDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    const clean = normalizeDate(newDate);
    if (!clean) return;
    
    // Merge, remove duplicates, and sort strictly ascending
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

    // Replace the original date with the new modified date
    const updatedList = fechas.map((d) => (d === originalDate ? clean : d));
    // Remove duplicates and ensure chronological order from earliest to latest
    const sorted = sortDatesChronologically(Array.from(new Set(updatedList)));
    
    onUpdateFechasCorte(activeEmpresa, sorted);
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

  const today = normalizeDate(new Date().toISOString().split('T')[0]);

  const proximoCorte = useMemo(() => getProximoCorte(fechas, today), [fechas, today]);
  const corteMasCercano = useMemo(() => getCorteActual(fechas, today), [fechas, today]);
  const corteAnterior = useMemo(() => {
    const past = fechas.filter((f) => f < today);
    return past[past.length - 1];
  }, [fechas, today]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda & Centro: Fechas de Corte */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        {/* Header with Empresa switcher if multiple */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Fechas de Corte Contractual
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Períodos ordenados cronológicamente (de menor a mayor) para el cálculo de la Curva S y certificaciones.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {proyecto.empresas.length > 1 && (
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg text-xs">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={activeEmpresa}
                  onChange={(e) => {
                    setSelectedEmpresaId(e.target.value);
                    handleCancelEdit();
                  }}
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {proyecto.empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setShowAutoGenerator(!showAutoGenerator)}
              id="btn-generar-periodos"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Generar Períodos</span>
            </button>
          </div>
        </div>

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
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerateDates}
                className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-xs"
              >
                Insertar y Ordenar
              </button>
            </div>
          </div>
        )}

        {/* Add single date form */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          <form onSubmit={handleAddDate} className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Nueva fecha:
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar</span>
            </button>
          </form>

          {/* Ordenamiento automático indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/50">
            <ArrowDownUp className="w-3 h-3" />
            <span>Ordenadas automáticamente de menor a mayor</span>
          </div>
        </div>

        {/* Status Strip: Hoy y Próximo Corte */}
        {fechas.length > 0 && (
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-slate-500 dark:text-slate-400">Fecha de referencia (Hoy):</span>
              <span className="font-semibold text-slate-800 dark:text-white font-mono">{formatShortDate(today)}</span>
            </div>
            {proximoCorte && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Próximo corte contractual:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{formatShortDate(proximoCorte)}</span>
                {(() => {
                  const dDiff = Math.round((new Date(proximoCorte).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-medium">
                      {dDiff === 0 ? 'Hoy' : dDiff === 1 ? 'Mañana' : `En ${dDiff} días`}
                    </span>
                  );
                })()}
              </div>
            )}
            {corteAnterior && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span>Corte anterior:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{formatShortDate(corteAnterior)}</span>
              </div>
            )}
          </div>
        )}

        {/* Fechas Grid */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
            <span>{fechas.length} Fechas de Corte Programadas:</span>
            <span className="text-[11px] font-normal text-slate-400">
              Haga clic en el lápiz para modificar cualquier fecha sin borrarla
            </span>
          </div>

          {fechas.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-xs">No hay fechas de corte registradas.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Agrega fechas individuales arriba o usa "Generar Períodos" para crearlas en lote.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {fechas.map((fecha, idx) => {
                const isEditing = editingIndex === idx;
                const isPast = fecha < today;
                const isToday = fecha === today;
                const isNext = fecha === proximoCorte;
                const isClosest = fecha === corteMasCercano;

                const todayTime = new Date(today).getTime();
                const fTime = new Date(fecha).getTime();
                const diffDays = Math.round((fTime - todayTime) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={`${fecha}-${idx}`}
                    className={`p-2.5 rounded-lg border transition-all ${
                      isEditing
                        ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-400 dark:border-blue-700 shadow-xs ring-2 ring-blue-500/20'
                        : isNext
                        ? 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-300 dark:border-amber-700/80 shadow-xs ring-1 ring-amber-400/30'
                        : isClosest
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800/60 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/70 hover:border-slate-300'
                    }`}
                  >
                    {isEditing ? (
                      /* Inline editing form */
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-blue-800 dark:text-blue-300">
                          <span>Modificar fecha #{idx + 1}</span>
                          <span className="text-slate-400 font-normal">Antigua: {fecha}</span>
                        </div>
                        <input
                          type="date"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-blue-400 dark:border-blue-600 rounded text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                        <div className="flex justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            title="Cancelar edición"
                            className="flex items-center gap-1 px-2 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded text-[11px] font-medium transition-colors"
                          >
                            <X className="w-3 h-3" />
                            <span>Cancelar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(fecha)}
                            title="Guardar nueva fecha"
                            className="flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition-colors shadow-xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Guardar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display mode */
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Sequential Ordinal Number Badge (#1, #2, #3...) */}
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold shrink-0">
                            {idx + 1}
                          </span>

                          <div className="truncate">
                            <div className="font-semibold text-slate-800 dark:text-slate-100 text-xs font-mono">
                              {formatShortDate(fecha)}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-400 font-mono">
                              {fecha}
                            </div>
                          </div>
                        </div>

                        {/* Status badge + Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isToday && (
                            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider border border-emerald-300 dark:border-emerald-700">
                              Hoy
                            </span>
                          )}

                          {isNext && !isToday && (
                            <span className="text-[9px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 font-bold uppercase tracking-wider border border-amber-300 dark:border-amber-700/60 flex items-center gap-1 shadow-xs" title={`Corte contractual planificado en ${diffDays} días`}>
                              <span>Próxima</span>
                              <span className="text-[8px] font-normal opacity-85 font-mono">({diffDays === 1 ? 'mañana' : `en ${diffDays}d`})</span>
                            </span>
                          )}

                          {isClosest && !isNext && !isToday && (
                            <span className="text-[9px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 font-bold uppercase tracking-wider border border-blue-300 dark:border-blue-700/60 flex items-center gap-1 shadow-xs" title="Corte más cercano por fecha">
                              <span>Más cercana</span>
                              <span className="text-[8px] font-normal opacity-85 font-mono">({diffDays < 0 ? `hace ${Math.abs(diffDays)}d` : `en ${diffDays}d`})</span>
                            </span>
                          )}

                          {/* Botón Editar sin borrar */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(idx, fecha)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
                            title="Modificar esta fecha"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Botón Eliminar */}
                          <button
                            type="button"
                            onClick={() => handleDeleteDate(fecha)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
                            title="Eliminar esta fecha"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Columna Derecha: Generales del Proyecto */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              <span>Generales del Proyecto</span>
            </h3>
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              {gastosList.length} ítems
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-4">
            Ítems de generales (gerenciamiento, utilidades, administración, etc.) que componen el total indirecto del proyecto.
          </p>

          {/* Form to add item */}
          <form onSubmit={handleAddConcepto} className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-800/50 rounded-xl mb-4 space-y-2.5">
            <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Sumar Ítem a Generales</span>
            </span>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Ej. Gerenciamiento del proyecto"
                value={nuevoConcepto}
                onChange={(e) => setNuevoConcepto(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Monto USD (Ej. 5000)"
                  value={nuevoMonto}
                  onChange={(e) => setNuevoMonto(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs shrink-0"
                >
                  Sumar Ítem
                </button>
              </div>
            </div>
          </form>

          {/* List of items */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {gastosList.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                No hay ítems registrados en Generales del Proyecto. Agrega uno arriba (ej. Gerenciamiento, Utilidades, Administrativos).
              </div>
            ) : (
              gastosList.map((gasto) => (
                <div
                  key={gasto.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs hover:border-slate-300 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {gasto.nombre}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {totalGenerales > 0 ? ((gasto.monto / totalGenerales) * 100).toFixed(1) : 0}% del total
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(gasto.monto)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteConcepto(gasto.id)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
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

        {/* Live Total Box */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl">
            <div className="text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
              TOTAL GENERALES DEL PROYECTO
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 font-mono mt-0.5 tracking-tight">
              {formatCurrency(totalGenerales)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Suma de {gastosList.length} ítems presupuestados
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
