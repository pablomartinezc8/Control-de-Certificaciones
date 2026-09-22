import React from 'react';
import { ProyectoMetrics, formatCurrency } from '../utils/calculations';
import { 
  Wallet, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  FileText, 
  Clock, 
  Calendar 
} from 'lucide-react';

interface MetricsCardsProps {
  metrics: ProyectoMetrics;
  empresaNombre?: string;
  desvio?: number;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ 
  metrics, 
  empresaNombre = 'EMPRESA',
  desvio,
}) => {
  const empUpper = (empresaNombre || 'EMPRESA').toUpperCase();
  const displayDesvio = desvio !== undefined ? desvio : metrics.desvioAcumulado;

  return (
    <div className="space-y-3.5 mb-6">
      {/* Fila 1: Totales Financieros Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: VALOR TOTAL DE OC */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              VALOR TOTAL DE OC
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(metrics.valorTotalTaging)}
          </div>
        </div>

        {/* Card 2: TOTAL CERTIFICADO */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              TOTAL CERTIFICADO
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatCurrency(metrics.certificadoTaging)}
          </div>
        </div>

        {/* Card 3: SALDO PENDIENTE A COBRAR */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              SALDO PENDIENTE A COBRAR
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
            {formatCurrency(metrics.saldoPendienteTaging)}
          </div>
        </div>

        {/* Card 4: % CERTIFICADO */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              % CERTIFICADO
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-cyan-400 tracking-tight">
            {metrics.porcentajeCertificadoTaging.toFixed(2).replace('.', ',')}%
          </div>
        </div>
      </div>

      {/* Fila 2: Estados de Entregables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 5: TOTAL ENTREGABLES */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              TOTAL ENTREGABLES
            </span>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {metrics.totalEntregables}
          </div>
        </div>

        {/* Card 6: TOTALMENTE CERTIFICADOS */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              TOTALMENTE CERTIFICADOS
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {metrics.totalmenteCertificados}
          </div>
        </div>

        {/* Card 7: PARCIALMENTE CERTIFICADOS */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              PARCIALMENTE CERTIFICADOS
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
            {metrics.parcialmenteCertificados}
          </div>
        </div>

        {/* Card 8: SIN CERTIFICAR */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              SIN CERTIFICAR
            </span>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-700 dark:text-slate-200 tracking-tight">
            {metrics.sinCertificar}
          </div>
        </div>
      </div>

      {/* Fila 3: Proyecciones y Desvíos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 9: PRÓXIMO CORTE */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              PRÓXIMO CORTE
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {metrics.proximaCertificacionFecha || '-'}
            </div>
            {metrics.diasHastaProximoCorte !== null && metrics.diasHastaProximoCorte !== undefined && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                metrics.diasHastaProximoCorte <= 3
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                  : metrics.diasHastaProximoCorte <= 7
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
              }`}>
                {metrics.diasHastaProximoCorte === 0 ? 'Hoy' : `En ${metrics.diasHastaProximoCorte} días`}
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            Siguiente hito de control cronograma
          </div>
        </div>

        {/* Card 10: PROYECTADO PRÓXIMO CORTE */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              PROYECTADO PRÓXIMO CORTE
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(metrics.proximaCertificacionImporte)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>
              {metrics.totalContratado > 0 && metrics.proximaCertificacionImporte > 0
                ? `${((metrics.proximaCertificacionImporte / metrics.totalContratado) * 100).toFixed(1).replace('.', ',')}% del contrato`
                : 'Monto del período'}
            </span>
            {metrics.valorProyectadoProximoCorte !== undefined && metrics.valorProyectadoProximoCorte > 0 && (
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Meta acum. {formatCurrency(metrics.valorProyectadoProximoCorte)}
              </span>
            )}
          </div>
        </div>

        {/* Card 11: DESVÍO ACUMULADO */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              DESVÍO ACUMULADO
            </span>
            <div className={`p-2 rounded-lg ${displayDesvio < 0 ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'}`}>
              {displayDesvio < 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className={`mt-2 text-2xl font-bold tracking-tight ${displayDesvio < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {displayDesvio > 0 ? '+' : ''}{displayDesvio.toFixed(1).replace('.', ',')}%
          </div>
          <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            {displayDesvio < 0 ? 'Atraso contractual al corte' : 'Avance en fecha / Adelantado'}
          </div>
        </div>

        {/* Card 12 / Status indicator helper */}
        <div className="bg-slate-50/80 dark:bg-[#0B1426]/60 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-center">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Estado del Cronograma
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Control de curva S, emisión de certificados y seguimiento en tiempo real sincronizado.
          </div>
        </div>
      </div>
    </div>
  );
};
