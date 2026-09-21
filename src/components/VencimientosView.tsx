import React, { useState } from 'react';
import { Proyecto, VencimientoItem } from '../types';
import { computeVencimientos, formatCurrency, formatShortDate } from '../utils/calculations';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  Plus
} from 'lucide-react';

interface VencimientosViewProps {
  proyecto: Proyecto;
  onOpenCertificadoModal: (entregableId: string) => void;
}

export const VencimientosView: React.FC<VencimientosViewProps> = ({
  proyecto,
  onOpenCertificadoModal,
}) => {
  const [filterRango, setFilterRango] = useState<'todos' | 'vencidos' | '15' | '30' | '60'>('todos');
  const [filterTipo, setFilterTipo] = useState<'todos' | 'hito' | 'certificado'>('todos');

  const items = computeVencimientos(proyecto);

  const filteredItems = items.filter((item) => {
    if (filterTipo !== 'todos' && item.tipo !== filterTipo) return false;
    if (filterRango === 'vencidos') return item.diasRestantes < 0;
    if (filterRango === '15') return item.diasRestantes >= 0 && item.diasRestantes <= 15;
    if (filterRango === '30') return item.diasRestantes >= 0 && item.diasRestantes <= 30;
    if (filterRango === '60') return item.diasRestantes >= 0 && item.diasRestantes <= 60;
    return true;
  });

  const countVencidos = items.filter((i) => i.diasRestantes < 0).length;
  const count15 = items.filter((i) => i.diasRestantes >= 0 && i.diasRestantes <= 15).length;
  const count30 = items.filter((i) => i.diasRestantes > 15 && i.diasRestantes <= 30).length;
  const count60 = items.filter((i) => i.diasRestantes > 30).length;

  return (
    <div className="space-y-6">
      {/* Time Horizon Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterRango(filterRango === 'vencidos' ? 'todos' : 'vencidos')}
          className={`cursor-pointer bg-white border rounded-xl p-4 shadow-xs transition-all ${
            filterRango === 'vencidos' ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-600 font-medium">
            <span>Vencidos</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">{countVencidos}</div>
          <div className="mt-1 text-[11px] text-slate-400">Sin cobrar con fecha pasada</div>
        </div>

        <div
          onClick={() => setFilterRango(filterRango === '15' ? 'todos' : '15')}
          className={`cursor-pointer bg-white border rounded-xl p-4 shadow-xs transition-all ${
            filterRango === '15' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-600 font-medium">
            <span>Próximos 15 Días</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{count15}</div>
          <div className="mt-1 text-[11px] text-slate-400">Vencimientos inminentes</div>
        </div>

        <div
          onClick={() => setFilterRango(filterRango === '30' ? 'todos' : '30')}
          className={`cursor-pointer bg-white border rounded-xl p-4 shadow-xs transition-all ${
            filterRango === '30' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-blue-600 font-medium">
            <span>Próximos 30 Días</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600">{count30}</div>
          <div className="mt-1 text-[11px] text-slate-400">Horizonte mensual</div>
        </div>

        <div
          onClick={() => setFilterRango(filterRango === '60' ? 'todos' : '60')}
          className={`cursor-pointer bg-white border rounded-xl p-4 shadow-xs transition-all ${
            filterRango === '60' ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-indigo-600 font-medium">
            <span>Posteriores (60+ Días)</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{count60}</div>
          <div className="mt-1 text-[11px] text-slate-400">Planificación a mediano plazo</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Filtrar por categoría:</span>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="todos">Todos los eventos ({items.length})</option>
            <option value="hito">Solo hitos de entregables</option>
            <option value="certificado">Solo certificados / cobros</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Mostrando <span className="font-semibold text-slate-800">{filteredItems.length}</span> eventos
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No hay vencimientos registrados en este rango temporal.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                    item.diasRestantes < 0 ? 'bg-rose-50 text-rose-600' :
                    item.diasRestantes <= 15 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <Calendar className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{item.codigo}</span>
                      <span className="text-xs text-slate-600 font-medium">— {item.hitoNombre}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.diasRestantes < 0
                          ? 'bg-rose-100 text-rose-800'
                          : item.tipo === 'hito'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {item.tipo === 'hito' 
                          ? (item.diasRestantes < 0 ? 'Vencido sin cobrar' : 'Hito de entrega') 
                          : (item.diasRestantes < 0 ? 'Cobro atrasado' : 'Cobro Certificado')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-0.5">{item.descripcion}</div>

                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-slate-600">
                        Fecha: <span className="font-semibold text-slate-800">{formatShortDate(item.fechaVencimiento)}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600">
                        Importe estimado: <span className="font-semibold text-blue-600">{formatCurrency(item.monto)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Days remaining badge & action */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    item.diasRestantes < 0 ? 'bg-rose-100 text-rose-800' :
                    item.diasRestantes <= 15 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.diasRestantes < 0 
                      ? `Vencido hace ${Math.abs(item.diasRestantes)} días` 
                      : item.diasRestantes === 0 
                      ? 'Vence hoy' 
                      : `En ${item.diasRestantes} días`}
                  </span>

                  {item.tipo === 'hito' && (
                    <button
                      type="button"
                      onClick={() => onOpenCertificadoModal(item.entregableId)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Emitir certificado para este hito"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
