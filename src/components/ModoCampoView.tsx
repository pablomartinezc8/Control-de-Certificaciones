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
  ChevronDown,
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
  FileText,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Info
} from 'lucide-react';

interface ModoCampoViewProps {
  proyecto: Proyecto;
  onUpdateEntregable: (entregable: Entregable) => void;
  onSaveCertificado?: (
    entregableId: string,
    hitoId: string,
    certificado: Certificado,
    isEdit: boolean
  ) => void;
  onSaveData?: () => void;
  onSwitchToDesktopView?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const ModoCampoView: React.FC<ModoCampoViewProps> = ({
  proyecto,
  onUpdateEntregable,
  onSaveData,
  onSwitchToDesktopView,
  onNavigateToTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendientes' | 'en_curso' | 'completados'>('todos');
  const [savedFeedbackId, setSavedFeedbackId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<Record<string, string>>({});
  const [expandedCertHist, setExpandedCertHist] = useState<Record<string, boolean>>({});

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
      const allCerts: { hitoNombre: string; cert: Certificado }[] = [];

      ent.hitos.forEach((h) => {
        h.certificados.forEach((c) => {
          certTotal += Number(c.importe) || 0;
          allCerts.push({ hitoNombre: h.nombre, cert: c });
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

      // Cantidad certificada estimada en base a la unidad de cómputo
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
        allCerts,
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
   * Guarda notas de relevamiento de campo en el entregable sin emitir certificados
   */
  const handleSaveObservation = (ent: Entregable) => {
    const nota = tempNotes[ent.id] !== undefined ? tempNotes[ent.id] : (ent.observaciones || '');
    onUpdateEntregable({
      ...ent,
      observaciones: nota,
    });
    setSavedFeedbackId(ent.id);
    setTimeout(() => setSavedFeedbackId(null), 2500);
  };

  const toggleHistorial = (id: string) => {
    setExpandedCertHist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div id="modo-campo-view" className="space-y-4 pb-24 sm:pb-8">
      {/* Top Banner: Modo Campo & Inspección de Obra */}
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
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>Visualizador ágil de avance en terreno y registro de novedades de obra.</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  La emisión oficial de certificados se gestiona exclusivamente desde Gerencia.
                </span>
              </p>
            </div>
          </div>

          {/* Acciones del encabezado */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('certificaciones')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                title="Ir al módulo oficial de certificaciones de la empresa"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Certificaciones Oficiales</span>
              </button>
            )}

            {onSaveData && (
              <button
                type="button"
                onClick={onSaveData}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition"
                title="Guardar notas y cambios en el almacenamiento local del dispositivo"
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
                <span>Dashboard</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Progress Bar in Field Header */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Avance Oficial</span>
            <div className="text-lg font-black text-emerald-400 mt-0.5">
              {stats.pctGlobal.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {formatCurrency(stats.totalCertificado)}
            </div>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Contratado</span>
            <div className="text-lg font-black text-white mt-0.5">
              {formatCurrency(stats.totalContratado)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {stats.totalItems} ítems contractuales
            </div>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Estado de Tareas</span>
            <div className="text-lg font-black text-sky-400 mt-0.5">
              {stats.completados} <span className="text-xs font-normal text-slate-400">listos</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {stats.enCurso} en curso &bull; {stats.sinIniciar} pendientes
            </div>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Saldo por Certificar</span>
            <div className="text-lg font-black text-amber-400 mt-0.5">
              {formatCurrency(Math.max(0, stats.totalContratado - stats.totalCertificado))}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              A certificar por Gerencia
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código (ej: 1.01), descripción o rubro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
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

      {/* Cards List: Mobile Vertical Checklist optimizado para inspección */}
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
            const { 
              entregable, 
              valorEfectivo, 
              certTotal, 
              saldoPendiente, 
              pctAvance, 
              estado, 
              cantidadTotal, 
              cantidadCertificada, 
              allCerts 
            } = item;
            
            const isSaved = savedFeedbackId === entregable.id;
            const isCertExpanded = !!expandedCertHist[entregable.id];
            const currentObservation = tempNotes[entregable.id] !== undefined 
              ? tempNotes[entregable.id] 
              : (entregable.observaciones || '');

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
                          <span>100% Certificado</span>
                        </span>
                      )}
                      {estado === 'en_curso' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{pctAvance.toFixed(1)}% Oficial</span>
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
                    <div className="mt-2.5 p-2 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Cómputo en Obra:</span>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {cantidadCertificada.toFixed(1)} / {cantidadTotal.toLocaleString()} {entregable.unidad || 'un'}
                        </span>
                        {entregable.precioUnitario && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {formatCurrency(entregable.precioUnitario)} / {entregable.unidad || 'un'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Financial & Progress Values */}
                  <div className="mt-3 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Avance Oficial Emitido (Gerencia)</span>
                      <span className="font-black font-mono text-slate-900 dark:text-white text-sm">
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

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                      <span>Certificado: <strong className="text-emerald-700 dark:text-emerald-300 font-mono font-bold">{formatCurrency(certTotal)}</strong></span>
                      <span>Total: <strong className="text-slate-700 dark:text-slate-200 font-mono font-semibold">{formatCurrency(valorEfectivo)}</strong></span>
                    </div>
                  </div>

                  {/* Certificados Oficiales Emitidos (Desplegable si existen) */}
                  {allCerts.length > 0 && (
                    <div className="mt-2.5">
                      <button
                        type="button"
                        onClick={() => toggleHistorial(entregable.id)}
                        className="w-full flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-semibold py-1 hover:underline"
                      >
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{allCerts.length} {allCerts.length === 1 ? 'Certificado Oficial Emitido' : 'Certificados Oficiales Emitidos'}</span>
                        </span>
                        {isCertExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>

                      {isCertExpanded && (
                        <div className="mt-1.5 space-y-1.5 p-2 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl text-[11px]">
                          {allCerts.map(({ hitoNombre, cert }, idx) => (
                            <div key={cert.id || idx} className="flex items-center justify-between border-b border-blue-100/60 dark:border-blue-900/30 last:border-0 pb-1 last:pb-0">
                              <div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{cert.numero || cert.nombre}</span>
                                <span className="text-[10px] text-slate-500 ml-1.5">({hitoNombre})</span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(cert.importe)}</span>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">{cert.estado || 'Aprobado'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sección de Relevamiento / Bitácora de Campo (Sin botones de certificar) */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>Bitácora de Campo & Observaciones:</span>
                    </span>
                    {isSaved && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                        <Check className="w-3.5 h-3.5" />
                        <span>¡Guardado!</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Registrar estado relevado en obra, novedades técnicas o avance visible..."
                      value={currentObservation}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTempNotes((prev) => ({ ...prev, [entregable.id]: val }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveObservation(entregable);
                        }
                      }}
                      className="flex-1 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white rounded-xl px-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />

                    <button
                      type="button"
                      onClick={() => handleSaveObservation(entregable)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-xl shadow-xs transition shrink-0"
                      title="Guardar nota de inspección para que la vea Gerencia"
                    >
                      Anotar
                    </button>
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
            <span className="text-slate-400 text-[11px] ml-1">oficial ({stats.completados}/{stats.totalItems})</span>
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
