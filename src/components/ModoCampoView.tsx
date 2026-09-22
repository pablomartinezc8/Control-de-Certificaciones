import React, { useState, useMemo } from 'react';
import { Proyecto, Entregable, Hito, Certificado } from '../types';
import { 
  formatCurrency, 
  getEntregableValorEfectivo, 
  normalizeDate,
  formatShortDate 
} from '../utils/calculations';
import { 
  ClipboardCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Plus, 
  Check, 
  Sparkles,
  Calendar,
  Building,
  Filter,
  Layers,
  Save,
  MessageSquare,
  TrendingUp,
  Percent,
  RotateCcw,
  ArrowUpDown
} from 'lucide-react';

interface ModoCampoViewProps {
  proyecto: Proyecto;
  onUpdateEntregable: (entregable: Entregable) => void;
  onSaveCertificado: (
    entregableId: string,
    hitoId: string,
    certificado: Certificado,
    isEdit: boolean
  ) => void;
  onSaveData?: () => void;
  onSwitchToDesktopView?: () => void;
}

export const ModoCampoView: React.FC<ModoCampoViewProps> = ({
  proyecto,
  onUpdateEntregable,
  onSaveCertificado,
  onSaveData,
  onSwitchToDesktopView,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendientes' | 'en_curso' | 'completados'>('todos');
  const [fechaInspeccion, setFechaInspeccion] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [savedFeedbackId, setSavedFeedbackId] = useState<string | null>(null);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);
  const [tempPctInput, setTempPctInput] = useState<Record<string, number>>({});
  const [tempNotes, setTempNotes] = useState<Record<string, string>>({});

  // Categorías disponibles
  const categorias = useMemo(() => {
    const set = new Set<string>();
    proyecto.entregables.forEach((e) => {
      if (e.categoria) set.add(e.categoria);
    });
    return Array.from(set).sort();
  }, [proyecto.entregables]);

  // Métricas calculadas para cada entregable
  const entregablesData = useMemo(() => {
    return proyecto.entregables.map((ent) => {
      const valorEfectivo = getEntregableValorEfectivo(ent, proyecto);
      let certTotal = 0;
      let lastCertDate = '';

      ent.hitos.forEach((h) => {
        h.certificados.forEach((c) => {
          certTotal += Number(c.importe) || 0;
          if (c.fechaPresentacion && (!lastCertDate || c.fechaPresentacion > lastCertDate)) {
            lastCertDate = c.fechaPresentacion;
          }
        });
      });

      const pctAvance = valorEfectivo > 0 ? Math.min(100, (certTotal / valorEfectivo) * 100) : 0;
      const saldoPendiente = Math.max(0, valorEfectivo - certTotal);
      
      let estado: 'sin_iniciar' | 'en_curso' | 'completado' = 'sin_iniciar';
      if (pctAvance >= 99.5) {
        estado = 'completado';
      } else if (pctAvance > 0) {
        estado = 'en_curso';
      }

      // Cantidad certificada estimada en base a la unidad
      const cantidadTotal = ent.cantidad ?? 0;
      const cantidadCertificada = cantidadTotal > 0 ? (cantidadTotal * pctAvance) / 100 : 0;

      return {
        entregable: ent,
        valorEfectivo,
        certTotal,
        saldoPendiente,
        pctAvance,
        estado,
        lastCertDate,
        cantidadTotal,
        cantidadCertificada,
      };
    });
  }, [proyecto]);

  // Resumen global de campo
  const stats = useMemo(() => {
    let totalContratado = 0;
    let totalCertificado = 0;
    let completados = 0;
    let enCurso = 0;
    let sinIniciar = 0;

    entregablesData.forEach((item) => {
      totalContratado += item.valorEfectivo;
      totalCertificado += item.certTotal;
      if (item.estado === 'completado') completados++;
      else if (item.estado === 'en_curso') enCurso++;
      else sinIniciar++;
    });

    const pctGlobal = totalContratado > 0 ? (totalCertificado / totalContratado) * 100 : 0;

    return {
      totalItems: entregablesData.length,
      totalContratado,
      totalCertificado,
      completados,
      enCurso,
      sinIniciar,
      pctGlobal,
    };
  }, [entregablesData]);

  // Filtrado de entregables para la vista de checklist
  const filteredItems = useMemo(() => {
    return entregablesData.filter((item) => {
      const { entregable, estado } = item;

      // Filtro de texto
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchCode = entregable.codigo.toLowerCase().includes(query);
        const matchDesc = entregable.descripcion.toLowerCase().includes(query);
        const matchCat = (entregable.categoria || '').toLowerCase().includes(query);
        if (!matchCode && !matchDesc && !matchCat) return false;
      }

      // Filtro de categoría
      if (selectedCategoria !== 'TODAS') {
        if (entregable.categoria !== selectedCategoria) return false;
      }

      // Filtro de estado
      if (filtroEstado === 'completados' && estado !== 'completado') return false;
      if (filtroEstado === 'en_curso' && estado !== 'en_curso') return false;
      if (filtroEstado === 'pendientes' && estado === 'completado') return false;

      return true;
    });
  }, [entregablesData, searchTerm, selectedCategoria, filtroEstado]);

  /**
   * Registra un nuevo porcentaje de avance físico acumulado directamente
   */
  const handleApplyAvance = (ent: Entregable, nuevoPct: number) => {
    const clampedPct = Math.min(100, Math.max(0, Math.round(nuevoPct * 10) / 10));
    const valorEfectivo = getEntregableValorEfectivo(ent, proyecto);
    const montoMeta = (valorEfectivo * clampedPct) / 100;

    // Calcular cuánto ya está certificado
    let certTotalActual = 0;
    ent.hitos.forEach((h) => {
      h.certificados.forEach((c) => {
        certTotalActual += Number(c.importe) || 0;
      });
    });

    const diferenciaAcreditar = montoMeta - certTotalActual;

    if (Math.abs(diferenciaAcreditar) < 0.01) {
      setSavedFeedbackId(ent.id);
      setTimeout(() => setSavedFeedbackId(null), 2000);
      return;
    }

    // Buscamos el hito al cual imputar la certificación
    // Si hay un hito pendiente o el primer hito disponible
    const hitos = ent.hitos || [];
    if (hitos.length === 0) return;

    // Seleccionamos el hito más adecuado: el primer hito que tenga saldo o el último
    let targetHito = hitos[0];
    let acumuladoHitos = 0;

    for (const h of hitos) {
      const hitoVal = (valorEfectivo * (Number(h.porcentaje) || 0)) / 100;
      let hitoCert = 0;
      h.certificados.forEach((c) => (hitoCert += Number(c.importe) || 0));

      if (hitoCert < hitoVal - 1) {
        targetHito = h;
        break;
      }
      acumuladoHitos += hitoVal;
    }

    if (diferenciaAcreditar > 0) {
      // Crear certificado de avance de inspección
      const newCert: Certificado = {
        id: `cert_campo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        nombre: `Inspección de Campo (${clampedPct}%)`,
        numero: `IC-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`,
        fechaPresentacion: fechaInspeccion,
        fechaAprobacion: fechaInspeccion,
        fechaCobro: '',
        importe: Math.round(diferenciaAcreditar * 100) / 100,
        tipo: 'Avance Físico',
        estado: 'Aprobado',
        observaciones: tempNotes[ent.id] || `Avance registrado en inspección de campo (${clampedPct}% acumulado)`,
      };

      onSaveCertificado(ent.id, targetHito.id, newCert, false);
    } else {
      // Si el porcentaje ingresado es menor al existente, ajustamos el último certificado
      const ultimoHito = hitos[hitos.length - 1];
      const newCert: Certificado = {
        id: `cert_campo_${Date.now()}_ajuste`,
        nombre: `Ajuste de Campo (${clampedPct}%)`,
        numero: `AJ-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`,
        fechaPresentacion: fechaInspeccion,
        fechaAprobacion: fechaInspeccion,
        fechaCobro: '',
        importe: Math.round(diferenciaAcreditar * 100) / 100,
        tipo: 'Ajuste Medición',
        estado: 'Aprobado',
        observaciones: `Ajuste físico en campo a ${clampedPct}%`,
      };
      onSaveCertificado(ent.id, ultimoHito.id, newCert, false);
    }

    // Actualizar notas si se ingresaron
    if (tempNotes[ent.id]) {
      onUpdateEntregable({
        ...ent,
        observaciones: tempNotes[ent.id],
      });
    }

    setSavedFeedbackId(ent.id);
    setTimeout(() => setSavedFeedbackId(null), 2500);
    setActiveEditingId(null);
  };

  const handleQuickAddPct = (ent: Entregable, currentPct: number, addPct: number) => {
    handleApplyAvance(ent, Math.min(100, currentPct + addPct));
  };

  return (
    <div id="modo-campo-view" className="space-y-4 pb-20 sm:pb-8">
      {/* Top Banner: Modo Campo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl shadow-xs">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Modo Campo & Inspección de Obra
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Móvil / Tablet
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Checklist simplificado para registrar el avance físico acumulado desde el teléfono
              </p>
            </div>
          </div>

          {/* Selector de fecha de inspección y acciones */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-slate-400 hidden sm:inline">Fecha inspección:</span>
              <input
                type="date"
                value={fechaInspeccion}
                onChange={(e) => setFechaInspeccion(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              />
            </div>

            {onSaveData && (
              <button
                type="button"
                onClick={onSaveData}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
                title="Guardar cambios de la jornada en el dispositivo"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar</span>
              </button>
            )}

            {onSwitchToDesktopView && (
              <button
                type="button"
                onClick={onSwitchToDesktopView}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition"
              >
                <span>Vista Completa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Global Inspection Progress Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="text-[11px] text-slate-400">Avance Físico Global</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
              {stats.pctGlobal.toFixed(1)}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, stats.pctGlobal)}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="text-[11px] text-slate-400">Tareas en Obra</div>
            <div className="text-xl font-bold text-white font-mono mt-0.5">
              {stats.totalItems}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {stats.completados} terminadas (100%)
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="text-[11px] text-slate-400">En Ejecución</div>
            <div className="text-xl font-bold text-sky-400 font-mono mt-0.5">
              {stats.enCurso}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {stats.sinIniciar} sin iniciar
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="text-[11px] text-slate-400">Certificado Acumulado</div>
            <div className="text-lg font-bold text-amber-400 font-mono mt-0.5 truncate">
              {formatCurrency(stats.totalCertificado)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 truncate">
              de {formatCurrency(stats.totalContratado)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar (Mobile Touch-Friendly) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, rubro o descripción..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          {categorias.length > 0 && (
            <div className="sm:w-56">
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="TODAS">Todas las Especialidades ({categorias.length})</option>
                {categorias.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setFiltroEstado('todos')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
              filtroEstado === 'todos'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Todos ({entregablesData.length})
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstado('pendientes')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
              filtroEstado === 'pendientes'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Pendientes ({stats.sinIniciar + stats.enCurso})
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstado('en_curso')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
              filtroEstado === 'en_curso'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            En Curso ({stats.enCurso})
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstado('completados')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 ${
              filtroEstado === 'completados'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Completados 100% ({stats.completados})
          </button>
        </div>
      </div>

      {/* Cards List: Mobile Vertical Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <ClipboardCheck className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
              No se encontraron ítems de obra
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Prueba cambiando los filtros de búsqueda o categoría
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const { entregable, valorEfectivo, certTotal, saldoPendiente, pctAvance, estado, cantidadTotal, cantidadCertificada } = item;
            const isEditing = activeEditingId === entregable.id;
            const currentTempPct = tempPctInput[entregable.id] !== undefined ? tempPctInput[entregable.id] : Math.round(pctAvance);
            const isSaved = savedFeedbackId === entregable.id;

            return (
              <div
                key={entregable.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-xs transition-all duration-200 flex flex-col justify-between ${
                  estado === 'completado'
                    ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : estado === 'en_curso'
                    ? 'border-sky-500/40'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header Card */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono font-black text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg">
                        {entregable.codigo}
                      </span>
                      {entregable.categoria && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {entregable.categoria}
                        </span>
                      )}
                      {entregable.unidad && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {entregable.unidad}
                        </span>
                      )}
                    </div>

                    {/* Estado Badge */}
                    <div>
                      {estado === 'completado' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>100% Listo</span>
                        </span>
                      )}
                      {estado === 'en_curso' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{pctAvance.toFixed(0)}% En curso</span>
                        </span>
                      )}
                      {estado === 'sin_iniciar' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          <span>0% Pendiente</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {entregable.descripcion}
                  </h3>

                  {/* Cómputo Metric Info if Available */}
                  {cantidadTotal > 0 && (
                    <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>Cómputo:</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {cantidadCertificada.toFixed(1)} / {cantidadTotal.toLocaleString()} {entregable.unidad || 'un'}
                      </span>
                      {entregable.precioUnitario && (
                        <span className="text-slate-400">
                          (a {formatCurrency(entregable.precioUnitario)}/{entregable.unidad || 'un'})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Financial & Progress Values */}
                  <div className="mt-3 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 dark:text-slate-400">Avance Físico Acumulado</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                        {pctAvance.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          pctAvance >= 100
                            ? 'bg-emerald-500'
                            : pctAvance > 0
                            ? 'bg-sky-500'
                            : 'bg-slate-400 dark:bg-slate-700'
                        }`}
                        style={{ width: `${Math.min(100, pctAvance)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                      <span>Certificado: <strong className="text-slate-700 dark:text-slate-200">{formatCurrency(certTotal)}</strong></span>
                      <span>Total: <strong className="text-slate-700 dark:text-slate-200">{formatCurrency(valorEfectivo)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Quick Inspection Action Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <span>Registrar Avance en Campo:</span>
                    {isSaved && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                        <Check className="w-3.5 h-3.5" />
                        <span>¡Guardado!</span>
                      </span>
                    )}
                  </div>

                  {/* One-touch Increments: +5%, +10%, +25%, 100% */}
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickAddPct(entregable, pctAvance, 5)}
                      disabled={pctAvance >= 100}
                      className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg transition disabled:opacity-40"
                    >
                      +5%
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickAddPct(entregable, pctAvance, 10)}
                      disabled={pctAvance >= 100}
                      className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg transition disabled:opacity-40"
                    >
                      +10%
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickAddPct(entregable, pctAvance, 25)}
                      disabled={pctAvance >= 100}
                      className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg transition disabled:opacity-40"
                    >
                      +25%
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyAvance(entregable, 100)}
                      className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>100%</span>
                    </button>
                  </div>

                  {/* Manual Exact Input or Slider */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={currentTempPct}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setTempPctInput((prev) => ({ ...prev, [entregable.id]: val }));
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white pr-7 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                        %
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyAvance(entregable, currentTempPct)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition"
                    >
                      Fijar %
                    </button>
                  </div>

                  {/* Field Notes Input Toggle */}
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="Nota de campo / novedad de inspección..."
                      value={tempNotes[entregable.id] || entregable.observaciones || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTempNotes((prev) => ({ ...prev, [entregable.id]: val }));
                      }}
                      onBlur={() => {
                        if (tempNotes[entregable.id] !== undefined && tempNotes[entregable.id] !== entregable.observaciones) {
                          onUpdateEntregable({
                            ...entregable,
                            observaciones: tempNotes[entregable.id],
                          });
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 rounded-lg px-2.5 py-1.5 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Quick Action Bar for Mobile Devices */}
      <div className="fixed bottom-3 left-3 right-3 sm:hidden z-40 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-xs">
            <span className="font-bold text-white">{stats.pctGlobal.toFixed(1)}%</span>
            <span className="text-slate-400 text-[11px] ml-1">obra ({stats.completados}/{stats.totalItems})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSaveData && (
            <button
              type="button"
              onClick={onSaveData}
              className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Guardar
            </button>
          )}
          {onSwitchToDesktopView && (
            <button
              type="button"
              onClick={onSwitchToDesktopView}
              className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-xl border border-slate-700"
            >
              Tablero
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
