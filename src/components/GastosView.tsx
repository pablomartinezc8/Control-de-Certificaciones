import React, { useState } from 'react';
import { Proyecto, GastoActividad } from '../types';
import { formatCurrency } from '../utils/calculations';
import { 
  DollarSign, 
  Layers, 
  Plus, 
  Trash2, 
  PieChart, 
  Sliders, 
  Check, 
  Info 
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

  const totalGastosGenerales = gastosActuales.reduce((sum, g) => sum + (Number(g.monto) || 0), 0);
  const totalEntregables = proyecto.entregables.reduce((sum, e) => sum + (Number(e.valorTotal) || 0), 0);
  const totalProyectoConGastos = totalEntregables + totalGastosGenerales;

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

  return (
    <div className="space-y-6">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Gastos Generales Asignados</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(totalGastosGenerales)}</div>
          <div className="mt-1 text-[11px] text-slate-400">
            {gastosActuales.length} conceptos de gasto registrados
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Base Contractual de Entregables</div>
          <div className="mt-2 text-2xl font-bold text-blue-600">{formatCurrency(totalEntregables)}</div>
          <div className="mt-1 text-[11px] text-slate-400">Suma total de ítems de ingeniería</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Valor Total Proyecto (Base + GG)</div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{formatCurrency(totalProyectoConGastos)}</div>
          <div className="mt-1 text-[11px] text-emerald-600/80">Valor consolidado Taging</div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50/60 border border-blue-200/60 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">Metodología de Gastos Generales en Base44</div>
          <p className="mt-0.5 text-blue-800">
            Los gastos generales complementan el alcance de los entregables individuales. Se prorratean en la valorización global y en la curva de avance económico del proyecto.
          </p>
        </div>
      </div>

      {/* Gastos List & Add Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of expenses */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Conceptos de Gastos Actividades
            </span>
            <span className="text-xs text-slate-500">
              Total: {formatCurrency(totalGastosGenerales)}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {gastosActuales.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay conceptos de gastos generales registrados para esta empresa.
              </div>
            ) : (
              gastosActuales.map((gasto) => (
                <div
                  key={gasto.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{gasto.nombre}</div>
                      <div className="text-[11px] text-slate-400">
                        Modo de distribución: {gasto.modo === 'igual' ? 'Prorrateo uniforme' : 'Ponderado por hitos'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">{formatCurrency(gasto.monto)}</div>
                      <div className="text-[10px] text-slate-400">
                        {totalGastosGenerales > 0 ? ((gasto.monto / totalGastosGenerales) * 100).toFixed(1) : 0}% del total GG
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
              ))
            )}
          </div>
        </div>

        {/* Add expense form */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs h-fit">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
            Nuevo Concepto de Gasto
          </h4>

          <form onSubmit={handleAddGasto} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nombre del concepto</label>
              <input
                type="text"
                value={nombreNuevo}
                onChange={(e) => setNombreNuevo(e.target.value)}
                placeholder="Ej. Coordinación técnica de campo"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Monto total ($)</label>
              <input
                type="number"
                step="0.01"
                value={montoNuevo}
                onChange={(e) => setMontoNuevo(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Modo de cálculo</label>
              <select
                value={modoNuevo}
                onChange={(e) => setModoNuevo(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="igual">Uniforme entre entregables</option>
                <option value="pesos">Ponderado por valor contractual</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!nombreNuevo.trim() || Number(montoNuevo) <= 0}
              className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 bg-[#0B1528] hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Gasto</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
