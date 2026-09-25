import React, { useState } from 'react';
import { Proyecto, ConciliacionItem } from '../types';
import { computeConciliacion, formatCurrency } from '../utils/calculations';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Download, 
  Search,
  Scale
} from 'lucide-react';

interface ConciliacionViewProps {
  proyecto: Proyecto;
}

export const ConciliacionView: React.FC<ConciliacionViewProps> = ({ proyecto }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  const items = computeConciliacion(proyecto);

  const filteredItems = items.filter((item) => {
    if (filterEstado !== 'todos' && item.estadoConciliacion !== filterEstado) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        item.codigo.toLowerCase().includes(q) ||
        item.descripcion.toLowerCase().includes(q) ||
        item.ordenCompra.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Summary figures
  const totalPresupuesto = items.reduce((sum, i) => sum + i.presupuesto, 0);
  const totalCertificado = items.reduce((sum, i) => sum + i.montoCertificado, 0);
  const totalCobrado = items.reduce((sum, i) => sum + i.montoCobrado, 0);
  const totalSaldo = items.reduce((sum, i) => sum + i.saldoPendiente, 0);

  const handleExportCSV = () => {
    const headers = [
      'Código',
      'Descripción',
      'Categoría',
      'Orden de Compra',
      'Presupuesto Contratado',
      'Monto Certificado',
      'Monto Facturado',
      'Saldo Pendiente',
      '% Avance',
      'Estado Conciliación'
    ];
    const rows = filteredItems.map((i) => [
      i.codigo,
      `"${i.descripcion.replace(/"/g, '""')}"`,
      i.categoria,
      i.ordenCompra || 'S/N',
      i.presupuesto.toFixed(2),
      i.montoCertificado.toFixed(2),
      i.montoCobrado.toFixed(2),
      i.saldoPendiente.toFixed(2),
      `${i.porcentajeAvance.toFixed(1)}%`,
      i.estadoConciliacion,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `conciliacion_${proyecto.nombre.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Presupuesto Contractual Total</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(totalPresupuesto)}</div>
          <div className="mt-1 text-[11px] text-slate-400">Alcance total de entregables</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Certificado Real</div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">{formatCurrency(totalCertificado)}</div>
          <div className="mt-1 text-[11px] text-emerald-600/80">
            {totalPresupuesto > 0 ? ((totalCertificado / totalPresupuesto) * 100).toFixed(1) : 0}% ejecutado
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Facturado Efectivo</div>
          <div className="mt-2 text-2xl font-bold text-blue-600">{formatCurrency(totalCobrado)}</div>
          <div className="mt-1 text-[11px] text-slate-400">Importe en estado facturado</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Saldo por Certificar</div>
          <div className="mt-2 text-2xl font-bold text-amber-600">{formatCurrency(totalSaldo)}</div>
          <div className="mt-1 text-[11px] text-slate-400">Remanente de ingeniería</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, OC, texto..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-60"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600">Estado:</span>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium"
            >
              <option value="todos">Todos ({items.length})</option>
              <option value="ok">Conciliados al 100%</option>
              <option value="pendiente">Pendientes de avance</option>
              <option value="diferencia_oc">Sin OC registrada</option>
              <option value="excedido">Certificación excedida</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar Conciliación</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Código / Entregable</th>
                <th className="py-2.5 px-3">Orden Compra</th>
                <th className="py-2.5 px-3 text-right">Presupuesto</th>
                <th className="py-2.5 px-3 text-right">Certificado</th>
                <th className="py-2.5 px-3 text-right">Facturado</th>
                <th className="py-2.5 px-3 text-right">Saldo Pendiente</th>
                <th className="py-2.5 px-3 text-center">% Avance</th>
                <th className="py-2.5 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.entregableId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-slate-900">
                    <div className="font-bold text-blue-700">{item.codigo}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{item.descripcion}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    {item.ordenCompra ? (
                      <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                        {item.ordenCompra}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Sin OC</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                    {formatCurrency(item.presupuesto)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">
                    {formatCurrency(item.montoCertificado)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-blue-600">
                    {formatCurrency(item.montoCobrado)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-amber-600">
                    {formatCurrency(item.saldoPendiente)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, item.porcentajeAvance)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">
                        {item.porcentajeAvance.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {item.estadoConciliacion === 'ok' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Conciliado
                      </span>
                    ) : item.estadoConciliacion === 'excedido' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        Excedido
                      </span>
                    ) : item.estadoConciliacion === 'diferencia_oc' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Falta OC
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                        Pendiente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
