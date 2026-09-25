import React, { useState, useMemo } from 'react';
import { Proyecto, GastoActividad } from '../types';
import { 
  formatCurrency, 
  computeGastosTracking, 
  getGastoPorEntregable 
} from '../utils/calculations';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Info,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  Percent,
  Search,
  ChevronDown,
  ChevronUp,
  Receipt,
  FileCheck2,
  BarChart3
} from 'lucide-react';

interface GastosViewProps {
  proyecto: Proyecto;
  onUpdateGastos: (gastos: Record<string, GastoActividad[]>) => void;
}

export const GastosView: React.FC<GastosViewProps> = ({ proyecto, onUpdateGastos }) => {
  const empresaId = proyecto.empresas[0]?.id || 'emp_taging';
  const gastosActuales = proyecto.gastosActividad?.[empresaId] || [];

  const [nombreNuevo, setNombreNuevo] = useState('');
  const [montoNuevo, setMontoNuevo] = useState<number | ''>('');
  const [modoNuevo, setModoNuevo] = useState<'igual' | 'pesos'>('igual');

  // Breakdown view controls
  const [activeBreakdownTab, setActiveBreakdownTab] = useState<'certificados' | 'entregables'>('certificados');
  const [searchTerm, setSearchTerm] = useState('');
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(true);
  const [expandedCertId, setExpandedCertId] = useState<string | null>(null);

  // Compute all tracking metrics
  const tracking = useMemo(() => computeGastosTracking(proyecto), [proyecto]);

  const totalGastosGenerales = tracking.totalGastos;
  const totalEntregables = tracking.totalBase;
  const totalProyectoConGastos = tracking.totalProyecto;
  const cuotaPorEntregable = getGastoPorEntregable(proyecto);

  const handleAddGasto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreNuevo.trim() || Number(montoNuevo) <= 0) return;

    const newGasto: GastoActividad = {
      id: `gasto_${Date.now()}`,
      nombre: nombreNuevo.trim(),
      monto: Number(montoNuevo),
      modo: modoNuevo,
      pesos: {},
    };

    const updated = {
      ...(proyecto.gastosActividad || {}),
      [empresaId]: [...gastosActuales, newGasto],
    };

    onUpdateGastos(updated);
    setNombreNuevo('');
    setMontoNuevo('');
  };

  const handleRemoveGasto = (id: string) => {
    const updated = {
      ...(proyecto.gastosActividad || {}),
      [empresaId]: gastosActuales.filter((g) => g.id !== id),
    };
    onUpdateGastos(updated);
  };

  // Filtered lists for breakdown
  const filteredCertificados = useMemo(() => {
    if (!searchTerm.trim()) return tracking.certificados;
    const term = searchTerm.toLowerCase();
    return tracking.certificados.filter(
      (c) =>
        c.nombre.toLowerCase().includes(term) ||
        c.numero.toLowerCase().includes(term) ||
        c.estado.toLowerCase().includes(term)
    );
  }, [tracking.certificados, searchTerm]);

  const filteredEntregables = useMemo(() => {
    if (!searchTerm.trim()) return tracking.entregables;
    const term = searchTerm.toLowerCase();
    return tracking.entregables.filter(
      (e) =>
        e.codigo.toLowerCase().includes(term) ||
        e.descripcion.toLowerCase().includes(term)
    );
  }, [tracking.entregables, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Primary KPI Cards: Cobro y Saldo de Generales del Proyecto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Generales Facturados */}
        <div className="bg-white border border-emerald-200/80 rounded-xl p-4.5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Generales Facturados</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {tracking.porcentajeCobrado.toFixed(1).replace('.', ',')}%
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 tracking-tight">
            {formatCurrency(tracking.gastosCobrados)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Efectivizado en certificaciones</span>
            <span className="font-medium text-emerald-600">Facturado</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, tracking.porcentajeCobrado)}%` }}
            />
          </div>
        </div>

        {/* Saldo de Generales Pendiente */}
        <div className="bg-white border border-blue-200/80 rounded-xl p-4.5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Saldo Pendiente de Generales</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Clock className="w-3 h-3 text-blue-600" />
              {tracking.porcentajeRestante.toFixed(1).replace('.', ',')}%
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-800 tracking-tight">
            {formatCurrency(tracking.gastosRestantes)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Por certificar en hitos futuros</span>
            <span className="font-medium text-blue-600">Restante</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, tracking.porcentajeRestante)}%` }}
            />
          </div>
        </div>

        {/* Generales Certificados Emitidos */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Generales Emitidos</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
              <FileCheck2 className="w-3 h-3 text-slate-500" />
              {tracking.porcentajeCertificado.toFixed(1).replace('.', ',')}%
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(tracking.gastosCertificados)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              {tracking.gastosPendientesCobro > 0 
                ? `En trámite de cobro: ${formatCurrency(tracking.gastosPendientesCobro)}` 
                : '100% de emitidos facturados'}
            </span>
            <span className="font-medium text-slate-600">Certificado</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-slate-700 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, tracking.porcentajeCertificado)}%` }}
            />
          </div>
        </div>

        {/* Total Generales del Proyecto */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Generales del Proyecto</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <Layers className="w-3 h-3 text-purple-600" />
              100% GG
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalGastosGenerales)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{gastosActuales.length} ítem{gastosActuales.length === 1 ? '' : 's'} sumado{gastosActuales.length === 1 ? '' : 's'}</span>
            <span className="font-medium text-slate-600">${cuotaPorEntregable.toFixed(2)}/ítem</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* Progress Bar & Contractual Context Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Avance de Facturación de Generales del Proyecto</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Proporción de generales recuperada mediante certificados de hitos respecto al presupuesto total sumado
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Facturado: </span>
              <strong className="text-slate-900">{tracking.porcentajeCobrado.toFixed(1).replace('.', ',')}%</strong>
              <span className="text-slate-400">({formatCurrency(tracking.gastosCobrados)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-600 font-medium">Por Certificar: </span>
              <strong className="text-slate-900">{tracking.porcentajeRestante.toFixed(1).replace('.', ',')}%</strong>
              <span className="text-slate-400">({formatCurrency(tracking.gastosRestantes)})</span>
            </div>
          </div>
        </div>

        {/* Multi-segment visual bar */}
        <div className="w-full bg-slate-100 rounded-lg h-3 overflow-hidden flex">
          <div 
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${Math.min(100, tracking.porcentajeCobrado)}%` }}
            title={`Generales Facturados: ${formatCurrency(tracking.gastosCobrados)} (${tracking.porcentajeCobrado.toFixed(1)}%)`}
          />
          {tracking.gastosPendientesCobro > 0 && (
            <div 
              className="bg-amber-400 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (tracking.gastosPendientesCobro / (tracking.totalGastos || 1)) * 100)}%` }}
              title={`Generales en trámite de cobro: ${formatCurrency(tracking.gastosPendientesCobro)}`}
            />
          )}
          <div 
            className="bg-slate-200 h-full flex-1"
            title={`Generales Restantes por Certificar: ${formatCurrency(tracking.gastosRestantes)} (${tracking.porcentajeRestante.toFixed(1)}%)`}
          />
        </div>

        {/* Base Contractual Context Summary */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
            <span className="text-slate-500 block">Base Contractual Entregables:</span>
            <span className="font-bold text-slate-800 text-sm">{formatCurrency(totalEntregables)}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Suma ítems ingeniería</span>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
            <span className="text-slate-500 block">Valor Consolidado (Base + GG):</span>
            <span className="font-bold text-slate-900 text-sm">{formatCurrency(totalProyectoConGastos)}</span>
            <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">Monto total contractual</span>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
            <span className="text-slate-500 block">Avance Económico Global Proyecto:</span>
            <span className="font-bold text-blue-700 text-sm">
              {tracking.porcentajeAvanceGlobal.toFixed(1).replace('.', ',')}%
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Certificado global: {formatCurrency(tracking.totalProyecto * (tracking.porcentajeAvanceGlobal / 100))}
            </span>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50/60 border border-blue-200/60 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">Metodología de Generales del Proyecto en Base44</div>
          <p className="mt-0.5 text-blue-800 leading-relaxed">
            Los generales del proyecto (${formatCurrency(totalGastosGenerales)}) se componen de la suma de sus ítems (gerenciamiento, utilidades, gastos administrativos, etc.) y se distribuyen entre los entregables (${formatCurrency(cuotaPorEntregable)} por ítem). A medida que se emiten y cobran las certificaciones de cada hito, se certifica en forma proporcional tanto la base técnica como la cuota de generales del proyecto asignada.
          </p>
        </div>
      </div>

      {/* Gastos List & Add Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of expenses */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Ítems de Generales del Proyecto</span>
            </span>
            <span className="text-xs font-semibold text-slate-600">
              Total Generales del Proyecto: {formatCurrency(totalGastosGenerales)}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {gastosActuales.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay ítems registrados en Generales del Proyecto. Agrega ítems como Gerenciamiento, Utilidades o Gastos Administrativos.
              </div>
            ) : (
              gastosActuales.map((gasto) => {
                const pctOfTotal = totalGastosGenerales > 0 ? (gasto.monto / totalGastosGenerales) : 0;
                const gastoCobradoConcepto = tracking.gastosCobrados * pctOfTotal;
                const gastoRestanteConcepto = gasto.monto - gastoCobradoConcepto;
                const pctCobradoConcepto = gasto.monto > 0 ? (gastoCobradoConcepto / gasto.monto) * 100 : 0;

                return (
                  <div
                    key={gasto.id}
                    className="p-4 hover:bg-slate-50/70 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{gasto.nombre}</div>
                          <div className="text-[11px] text-slate-400">
                            Modo: {gasto.modo === 'igual' ? 'Prorrateo uniforme entre entregables' : 'Ponderado por hitos'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-900">{formatCurrency(gasto.monto)}</div>
                          <div className="text-[10px] text-slate-400">
                            {totalGastosGenerales > 0 ? ((gasto.monto / totalGastosGenerales) * 100).toFixed(1) : 0}% del total
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveGasto(gasto.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar concepto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress details for this specific gasto */}
                    <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-slate-500">Facturado: </span>
                          <strong className="text-emerald-700">{formatCurrency(gastoCobradoConcepto)}</strong>
                          <span className="text-emerald-600 font-semibold ml-1">({pctCobradoConcepto.toFixed(1).replace('.', ',')}%)</span>
                        </div>
                        <span className="text-slate-300">|</span>
                        <div>
                          <span className="text-slate-500">Por certificar: </span>
                          <strong className="text-blue-700">{formatCurrency(gastoRestanteConcepto)}</strong>
                          <span className="text-blue-600 font-semibold ml-1">({(100 - pctCobradoConcepto).toFixed(1).replace('.', ',')}%)</span>
                        </div>
                      </div>

                      <div className="w-full sm:w-36 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, pctCobradoConcepto)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Add expense form */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs h-fit">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-purple-600" />
            <span>Sumar Ítem a Generales</span>
          </h4>

          {/* Quick preset suggestions */}
          <div className="mb-3">
            <span className="text-[11px] text-slate-400 block mb-1.5">Sugerencias rápidas:</span>
            <div className="flex flex-wrap gap-1.5">
              {['Gerenciamiento del proyecto', 'Utilidades', 'Gastos administrativos', 'Supervisión técnica'].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setNombreNuevo(sug)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-300 transition-colors"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddGasto} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nombre del ítem / concepto</label>
              <input
                type="text"
                value={nombreNuevo}
                onChange={(e) => setNombreNuevo(e.target.value)}
                placeholder="Ej. Gerenciamiento del proyecto"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Monto (USD)</label>
              <input
                type="number"
                step="0.01"
                value={montoNuevo}
                onChange={(e) => setMontoNuevo(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ej. 5000"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Modo de cálculo</label>
              <select
                value={modoNuevo}
                onChange={(e) => setModoNuevo(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="igual">Uniforme entre entregables</option>
                <option value="pesos">Ponderado por valor contractual</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!nombreNuevo.trim() || Number(montoNuevo) <= 0}
              className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Sumar Ítem a Generales</span>
            </button>
          </form>

          {/* Sum preview */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex items-center justify-between">
            <span className="text-slate-500">Total Generales:</span>
            <span className="font-bold text-purple-700 font-mono text-sm">
              {formatCurrency(totalGastosGenerales + (Number(montoNuevo) > 0 ? Number(montoNuevo) : 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Section: Gastos en Certificados y por Entregable */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
              className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-blue-600 transition-colors"
            >
              <Receipt className="w-4 h-4 text-blue-600" />
              <span>Desglose Detallado de Generales del Proyecto</span>
              {isBreakdownExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>

          {isBreakdownExpanded && (
            <div className="flex items-center gap-2">
              {/* Tab Selector */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveBreakdownTab('certificados')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeBreakdownTab === 'certificados'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Por Certificado ({tracking.certificados.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBreakdownTab('entregables')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeBreakdownTab === 'entregables'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Por Entregable ({tracking.entregables.length})
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg w-36 sm:w-48 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {isBreakdownExpanded && (
          <div>
            {activeBreakdownTab === 'certificados' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Certificado / Doc</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3 text-right">Total Certificado</th>
                      <th className="px-4 py-3 text-right">Porción Base</th>
                      <th className="px-4 py-3 text-right text-emerald-700 bg-emerald-50/40">Generales Facturados</th>
                      <th className="px-4 py-3 text-center">% Gen. s/ Cert</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCertificados.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                          No se encontraron certificados con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      filteredCertificados.map((cert) => {
                        const pctGG = cert.importeTotal > 0 ? (cert.gastosParte / cert.importeTotal) * 100 : 0;
                        const displayEstado = (cert.estado === 'Cobrado' || cert.estado === 'Facturado') ? 'Facturado' : cert.estado;
                        const isExpanded = expandedCertId === cert.id;
                        const acts = cert.actividades || [];

                        return (
                          <React.Fragment key={cert.id}>
                            <tr 
                              onClick={() => setExpandedCertId(isExpanded ? null : cert.id)}
                              className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400">
                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </span>
                                  <div>
                                    <div className="font-bold text-slate-900">
                                      Cert. #{cert.numero} {cert.nombre && cert.nombre !== cert.numero ? `— ${cert.nombre}` : ''}
                                    </div>
                                    <div className="text-[11px] text-blue-600 font-medium">
                                      {acts.length === 1 ? '1 actividad • Ver desglose' : `${acts.length} actividades • Ver desglose`}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {cert.fecha || '—'}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-slate-800">
                                {formatCurrency(cert.importeTotal)}
                              </td>
                              <td className="px-4 py-3 text-right text-slate-600">
                                {formatCurrency(cert.baseParte)}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-emerald-700 bg-emerald-50/40">
                                {formatCurrency(cert.gastosParte)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                  {pctGG.toFixed(1).replace('.', ',')}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  displayEstado === 'Facturado'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {displayEstado}
                                </span>
                              </td>
                            </tr>

                            {/* Sub-row with certificate activities */}
                            {isExpanded && (
                              <tr className="bg-slate-50/80 border-y border-slate-200">
                                <td colSpan={7} className="px-6 py-3">
                                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    {acts.length === 1 ? 'Actividad Certificada en este Documento' : `Actividades Certificadas (${acts.length})`}
                                  </div>
                                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                                    <table className="w-full text-xs text-left">
                                      <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px]">
                                        <tr>
                                          <th className="py-2 px-3">Código</th>
                                          <th className="py-2 px-3">Descripción</th>
                                          <th className="py-2 px-3">Hito / Etapa</th>
                                          <th className="py-2 px-3 text-right">Valor Efectivo</th>
                                          <th className="py-2 px-3 text-right">Monto Certificado</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {acts.map((act, actIdx) => (
                                          <tr key={actIdx} className="hover:bg-slate-50">
                                            <td className="py-1.5 px-3 font-mono font-bold text-blue-600">{act.codigo}</td>
                                            <td className="py-1.5 px-3 text-slate-700">{act.descripcion}</td>
                                            <td className="py-1.5 px-3 text-slate-600">{act.hitoNombre} ({act.hitoPorcentaje}%)</td>
                                            <td className="py-1.5 px-3 text-right font-mono text-slate-500">{formatCurrency(act.valorHito)}</td>
                                            <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-700">
                                              {formatCurrency(act.importe ?? (act.cobrado || act.pendiente))}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                  {filteredCertificados.length > 0 && (
                    <tfoot className="bg-slate-50/90 border-t border-slate-200 font-bold text-slate-900">
                      <tr>
                        <td className="px-4 py-3" colSpan={2}>
                          Total Certificados Filtrados ({filteredCertificados.length})
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(filteredCertificados.reduce((s, c) => s + c.importeTotal, 0))}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(filteredCertificados.reduce((s, c) => s + c.baseParte, 0))}
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-700 bg-emerald-50/60">
                          {formatCurrency(filteredCertificados.reduce((s, c) => s + c.gastosParte, 0))}
                        </td>
                        <td className="px-4 py-3 text-center text-[11px] text-slate-600">
                          {tracking.porcentajeCobrado.toFixed(1).replace('.', ',')}% del total Generales
                        </td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Descripción</th>
                      <th className="px-4 py-3 text-right">Generales Asignados</th>
                      <th className="px-4 py-3 text-right text-emerald-700 bg-emerald-50/40">Generales Facturados</th>
                      <th className="px-4 py-3 text-right text-blue-700">Generales Restantes</th>
                      <th className="px-4 py-3 text-center">% Facturado</th>
                      <th className="px-4 py-3">Avance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEntregables.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                          No se encontraron entregables con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      filteredEntregables.map((ent) => (
                        <tr key={ent.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {ent.codigo}
                            {ent.esCHO && (
                              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded font-semibold">
                                CHO
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={ent.descripcion}>
                            {ent.descripcion}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-slate-700">
                            {formatCurrency(ent.gastoAsignado)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-700 bg-emerald-50/40">
                            {formatCurrency(ent.gastoCobrado)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-blue-700">
                            {formatCurrency(ent.gastoRestante)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              ent.porcentajeCobrado >= 99
                                ? 'bg-emerald-100 text-emerald-800'
                                : ent.porcentajeCobrado > 0
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {ent.porcentajeCobrado.toFixed(1).replace('.', ',')}%
                            </span>
                          </td>
                          <td className="px-4 py-3 w-28">
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  ent.porcentajeCobrado >= 99 ? 'bg-emerald-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${Math.min(100, ent.porcentajeCobrado)}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {filteredEntregables.length > 0 && (
                    <tfoot className="bg-slate-50/90 border-t border-slate-200 font-bold text-slate-900">
                      <tr>
                        <td className="px-4 py-3" colSpan={2}>
                          Total Entregables ({filteredEntregables.length})
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(filteredEntregables.reduce((s, e) => s + e.gastoAsignado, 0))}
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-700 bg-emerald-50/60">
                          {formatCurrency(filteredEntregables.reduce((s, e) => s + e.gastoCobrado, 0))}
                        </td>
                        <td className="px-4 py-3 text-right text-blue-700">
                          {formatCurrency(filteredEntregables.reduce((s, e) => s + e.gastoRestante, 0))}
                        </td>
                        <td className="px-4 py-3 text-center text-[11px] text-emerald-700" colSpan={2}>
                          {tracking.porcentajeCobrado.toFixed(1).replace('.', ',')}% Facturado
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
