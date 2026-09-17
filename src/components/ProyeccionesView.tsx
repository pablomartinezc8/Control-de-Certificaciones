import React from 'react';
import { Proyecto } from '../types';
import { 
  computeProyecciones, 
  computeCurvaS, 
  getProyeccionCorteSummary, 
  formatCurrency, 
  formatShortDate 
} from '../utils/calculations';
import { 
  TrendingUp, 
  Calendar, 
  Download, 
  BarChart3, 
  Clock, 
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ProyeccionesViewProps {
  proyecto: Proyecto;
}

export const ProyeccionesView: React.FC<ProyeccionesViewProps> = ({ proyecto }) => {
  const proyecciones = computeProyecciones(proyecto);
  const curvaPuntos = computeCurvaS(proyecto);
  const summary = getProyeccionCorteSummary(proyecto);

  // Chart data
  const chartData = curvaPuntos.map((c) => ({
    name: c.fechaCorta,
    fecha: c.fecha,
    'Plan Periodo': c.planificadoPeriodo,
    'Certificado Periodo': c.certificadoPeriodo,
    'Cobrado Periodo': c.cobradoPeriodo,
    'Plan Acumulado': c.planificadoAcumulado,
    'Cert Acumulado': c.certificadoAcumulado,
  }));

  const handleExportCSV = () => {
    const headers = ['Período', 'Fecha Corte', 'Planificado Período', 'Planificado Acumulado', 'Hitos Estimados'];
    const rows = proyecciones.map((p) => [
      p.periodo,
      p.fecha,
      p.montoPlanificado.toFixed(2),
      p.montoAcumulado.toFixed(2),
      p.hitosCount.toString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `proyecciones_fechas_corte_${(proyecto.nombre || 'proyecto').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI based on Fechas de Corte */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Próximo Corte Estimado */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            <span>Próximo Corte ({summary.corteProximo ? formatShortDate(summary.corteProximo) : 'Fin'})</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-cyan-400 tracking-tight">
            {formatCurrency(summary.montoProximoCorte)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Período: {formatShortDate(summary.corteActual)} al {summary.corteProximo ? formatShortDate(summary.corteProximo) : '—'}
          </div>
        </div>

        {/* KPI 2: Período Anterior de Corte */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            <span>Corte Actual ({formatShortDate(summary.corteActual)})</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatCurrency(
              curvaPuntos.find((c) => c.fecha === summary.corteActual)?.planificadoPeriodo || 0
            )}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Período: {summary.corteAnterior ? formatShortDate(summary.corteAnterior) : 'Inicio'} al {formatShortDate(summary.corteActual)}
          </div>
        </div>

        {/* KPI 3: Total Planificado Restante */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            <span>Restante a Certificar</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(summary.totalPlanificadoRestante)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Flujo planificado en los siguientes cortes
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Proyección de Flujo por Fechas de Corte</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Montos planificados y certificados agrupados según los intervalos de corte configurados.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(val: any) => [formatCurrency(Number(val)), '']}
                labelFormatter={(label) => `Fecha de Corte: ${label}`}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Bar dataKey="Plan Periodo" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Planificado en Período" />
              <Bar dataKey="Certificado Periodo" fill="#06B6D4" radius={[4, 4, 0, 0]} name="Certificado Real" />
              <Bar dataKey="Cobrado Periodo" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Cobrado Real" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projection Table */}
      <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Detalle Periódico por Fechas de Corte
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {proyecciones.length} intervalos de corte analizados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Intervalo / Fecha de Corte</th>
                <th className="py-2.5 px-4 text-right">Planificado Período</th>
                <th className="py-2.5 px-4 text-right">Planificado Acumulado</th>
                <th className="py-2.5 px-4 text-center">Hitos en Intervalo</th>
                <th className="py-2.5 px-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {proyecciones.map((p, idx) => {
                const fechaAnterior = idx > 0 ? proyecciones[idx - 1].fecha : 'Inicio';
                const isCurrent = p.fecha === summary.corteActual;
                const isNext = p.fecha === summary.corteProximo;
                return (
                  <tr 
                    key={idx} 
                    className={`transition-colors ${
                      isCurrent 
                        ? 'bg-cyan-50/60 dark:bg-cyan-950/30' 
                        : isNext 
                        ? 'bg-blue-50/50 dark:bg-blue-950/20' 
                        : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{p.periodo}</span>
                        <span className="text-[11px] text-slate-400">
                          ({fechaAnterior === 'Inicio' ? 'Inicio' : formatShortDate(fechaAnterior)} → {p.fecha})
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold bg-cyan-600 text-white px-1.5 py-0.5 rounded uppercase">
                            Corte Actual
                          </span>
                        )}
                        {isNext && (
                          <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase">
                            Próximo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(p.montoPlanificado)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-blue-600 dark:text-cyan-400">
                      {formatCurrency(p.montoAcumulado)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {p.hitosCount} hitos
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {p.fecha < summary.corteActual ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Histórico
                        </span>
                      ) : p.fecha === summary.corteActual ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 font-bold">
                          En Curso
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-cyan-400 font-semibold">
                          Proyectado
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
