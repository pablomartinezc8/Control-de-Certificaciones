import React, { useState } from 'react';
import { Proyecto, AlertaItem } from '../types';
import { computeAlertas, formatCurrency, formatShortDate } from '../utils/calculations';
import { 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  FileQuestion, 
  CheckCircle, 
  ChevronRight,
  Filter,
  PlusCircle
} from 'lucide-react';

interface AlertasViewProps {
  proyecto: Proyecto;
  onOpenCertificadoModal: (entregableId: string, hitoId?: string) => void;
  onNavigateToEntregable: (codigo: string) => void;
}

export const AlertasView: React.FC<AlertasViewProps> = ({
  proyecto,
  onOpenCertificadoModal,
  onNavigateToEntregable,
}) => {
  const [filterSeveridad, setFilterSeveridad] = useState<'todas' | 'alta' | 'media' | 'baja'>('todas');
  const [filterTipo, setFilterTipo] = useState<string>('todos');

  const alerts = computeAlertas(proyecto);

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeveridad !== 'todas' && a.severidad !== filterSeveridad) return false;
    if (filterTipo !== 'todos' && a.tipo !== filterTipo) return false;
    return true;
  });

  const countAlta = alerts.filter((a) => a.severidad === 'alta').length;
  const countMedia = alerts.filter((a) => a.severidad === 'media').length;
  const countBaja = alerts.filter((a) => a.severidad === 'baja').length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilterSeveridad('todas')}
          className={`cursor-pointer bg-white border rounded-xl p-4 shadow-xs transition-all ${
            filterSeveridad === 'todas' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Alertas</span>
            <AlertCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{alerts.length}</div>
          <div className="mt-1 text-[11px] text-slate-400">Atención requerida</div>
        </div>

        <div 
          onClick={() => setFilterSeveridad('alta')}
          className={`cursor-pointer bg-white border rounded-xl p-4 shadow-xs transition-all ${
            filterSeveridad === 'alta' ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-600 font-medium">
            <span>Prioridad Alta</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">{countAlta}</div>
          <div className="mt-1 text-[11px] text-rose-500/80">Hitos vencidos o desvíos</div>
        </div>

        <div 
          onClick={() => setFilterSeveridad('media')}
          className={`cursor-pointer bg-white border rounded-xl p-4 shadow-xs transition-all ${
            filterSeveridad === 'media' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-600 font-medium">
            <span>Prioridad Media</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{countMedia}</div>
          <div className="mt-1 text-[11px] text-amber-500/80">Cobros pendientes prolongados</div>
        </div>

        <div 
          onClick={() => setFilterSeveridad('baja')}
          className={`cursor-pointer bg-white border rounded-xl p-4 shadow-xs transition-all ${
            filterSeveridad === 'baja' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Falta Orden de Compra</span>
            <FileQuestion className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{countBaja}</div>
          <div className="mt-1 text-[11px] text-slate-400">Regularización documental</div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Filtrar por tipo:</span>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="todos">Todos los tipos ({alerts.length})</option>
            <option value="vencido">Hitos vencidos</option>
            <option value="cobro_pendiente">Cobros pendientes</option>
            <option value="desvio">Desvío presupuestario</option>
            <option value="sin_oc">Sin Orden de Compra</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Mostrando <span className="font-semibold text-slate-800">{filteredAlerts.length}</span> alertas activas
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-800">¡Sin alertas pendientes!</div>
            <p className="text-xs text-slate-500 mt-1">
              Todos los hitos y certificaciones se encuentran alineados con los criterios seleccionados.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alerta) => (
            <div
              key={alerta.id}
              className={`bg-white border rounded-xl p-4 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                alerta.severidad === 'alta'
                  ? 'border-l-4 border-l-rose-500 border-slate-200'
                  : alerta.severidad === 'media'
                  ? 'border-l-4 border-l-amber-500 border-slate-200'
                  : 'border-l-4 border-l-blue-500 border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                  alerta.severidad === 'alta' ? 'bg-rose-50 text-rose-600' :
                  alerta.severidad === 'media' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {alerta.severidad === 'alta' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : alerta.severidad === 'media' ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <FileQuestion className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{alerta.titulo}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {alerta.codigoEntregable}
                    </span>
                    {alerta.fecha && (
                      <span className="text-[11px] text-slate-400">
                        Fecha límite: {formatShortDate(alerta.fecha)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{alerta.descripcion}</p>
                  {alerta.monto !== undefined && alerta.monto > 0 && (
                    <div className="mt-1.5 text-xs font-semibold text-slate-700">
                      Monto involucrado: <span className="text-blue-600 font-bold">{formatCurrency(alerta.monto)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {alerta.tipo === 'vencido' && (
                  <button
                    type="button"
                    onClick={() => onOpenCertificadoModal(alerta.entregableId, alerta.hitoId)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Emitir Certificado</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onNavigateToEntregable(alerta.codigoEntregable)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  <span>Ver Entregable</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
