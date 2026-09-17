import React from 'react';
import { FiltrosState, Empresa } from '../types';
import { Filter, RotateCcw, Calendar, Search } from 'lucide-react';

interface FiltrosSectionProps {
  filtros: FiltrosState;
  onFiltrosChange?: (newFiltros: FiltrosState) => void;
  onChangeFiltros?: (newFiltros: FiltrosState) => void;
  onLimpiarFiltros?: () => void;
  onResetFiltros?: () => void;
  empresas: Empresa[];
  categorias: string[];
}

export const FiltrosSection: React.FC<FiltrosSectionProps> = ({
  filtros,
  onFiltrosChange,
  onChangeFiltros,
  onLimpiarFiltros,
  onResetFiltros,
  empresas,
  categorias,
}) => {
  const [localFiltros, setLocalFiltros] = React.useState<FiltrosState>(filtros);

  React.useEffect(() => {
    setLocalFiltros(filtros);
  }, [filtros]);

  const emitChange = (updated: FiltrosState) => {
    setLocalFiltros(updated);
    if (onChangeFiltros) onChangeFiltros(updated);
    if (onFiltrosChange) onFiltrosChange(updated);
  };

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    emitChange(localFiltros);
  };

  const handleReset = () => {
    const empty: FiltrosState = {
      empresa: '',
      idEntregable: '',
      descripcion: '',
      categoria: '',
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
      conSaldoPendiente: false,
      vencidos: false,
      completamenteCertificados: false,
    };
    setLocalFiltros(empty);
    if (onLimpiarFiltros) onLimpiarFiltros();
    if (onResetFiltros) onResetFiltros();
    if (onChangeFiltros) onChangeFiltros(empty);
    if (onFiltrosChange) onFiltrosChange(empty);
  };

  return (
    <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4.5 shadow-xs mb-6 transition-colors">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Filtros de Búsqueda</h3>
        </div>
        <div className="text-[11px] text-slate-400">
          Filtro en tiempo real
        </div>
      </div>

      <form onSubmit={handleApply} className="space-y-3">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Empresa</label>
            <select
              value={localFiltros.empresa}
              onChange={(e) => emitChange({ ...localFiltros, empresa: e.target.value })}
              className="w-full text-xs bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">ID del entregable</label>
            <div className="relative">
              <input
                type="text"
                value={localFiltros.idEntregable}
                onChange={(e) => emitChange({ ...localFiltros, idEntregable: e.target.value })}
                placeholder="Ej. B2.0001"
                className="w-full text-xs bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Descripción</label>
            <div className="relative">
              <input
                type="text"
                value={localFiltros.descripcion}
                onChange={(e) => emitChange({ ...localFiltros, descripcion: e.target.value })}
                placeholder="Texto a buscar..."
                className="w-full text-xs bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Categoría</label>
            <select
              value={localFiltros.categoria}
              onChange={(e) => emitChange({ ...localFiltros, categoria: e.target.value })}
              className="w-full text-xs bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Categoría (Todas)</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Estado</label>
            <select
              value={localFiltros.estado}
              onChange={(e) => emitChange({ ...localFiltros, estado: e.target.value })}
              className="w-full text-xs bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="totalmente">Totalmente certificados</option>
              <option value="parcial">Parcialmente certificados</option>
              <option value="sin_certificar">Sin certificar</option>
              <option value="con_saldo">Con saldo pendiente</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Fecha desde</label>
            <div className="relative">
              <input
                type="date"
                value={localFiltros.fechaDesde}
                onChange={(e) => emitChange({ ...localFiltros, fechaDesde: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Fecha hasta</label>
            <div className="relative">
              <input
                type="date"
                value={localFiltros.fechaHasta}
                onChange={(e) => emitChange({ ...localFiltros, fechaHasta: e.target.value })}
                className="w-full text-xs bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Checkboxes in column 4 */}
          <div className="flex flex-col justify-center space-y-1.5 pt-2 sm:pt-0">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={localFiltros.conSaldoPendiente}
                onChange={(e) => emitChange({ ...localFiltros, conSaldoPendiente: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
              />
              <span>Con saldo pendiente</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={localFiltros.vencidos}
                onChange={(e) => emitChange({ ...localFiltros, vencidos: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
              />
              <span>Vencidos</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={localFiltros.completamenteCertificados}
                onChange={(e) => emitChange({ ...localFiltros, completamenteCertificados: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
              />
              <span>Completamente certificados</span>
            </label>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            id="btn-aplicar-filtros"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B1528] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Aplicar filtros</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            id="btn-limpiar-filtros"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-medium rounded-lg shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar filtros</span>
          </button>
        </div>
      </form>
    </div>
  );
};
