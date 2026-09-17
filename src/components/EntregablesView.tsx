import React, { useState, useMemo } from 'react';
import { Proyecto, Entregable, Hito, Certificado, FiltrosState } from '../types';
import { 
  formatCurrency, 
  formatShortDate, 
  normalizeDate, 
  getEntregableValorEfectivo, 
  getHitoValorEfectivo, 
  getHitoPlannedDate 
} from '../utils/calculations';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Copy,
  Calendar,
  FileText,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { exportProjectToExcel } from '../utils/excel';

interface EntregablesViewProps {
  proyecto: Proyecto;
  filtros?: FiltrosState;
  onAddEntregable: () => void;
  onEditEntregable: (entregable: Entregable) => void;
  onDeleteEntregable: (id: string) => void;
  onDuplicateEntregable: (entregable: Entregable) => void;
  onToggleCurva: (id: string) => void;
  onOpenAddCertificado: (entregableId: string, hitoId: string) => void;
  onDeleteCertificado: (entregableId: string, hitoId: string, certId: string) => void;
  onOpenCargaMasiva?: () => void;
}

export const EntregablesView: React.FC<EntregablesViewProps> = ({
  proyecto,
  filtros,
  onAddEntregable,
  onEditEntregable,
  onDeleteEntregable,
  onDuplicateEntregable,
  onOpenAddCertificado,
  onDeleteCertificado,
  onOpenCargaMasiva,
}) => {
  // Confirmation modals state
  const [entregableToDelete, setEntregableToDelete] = useState<Entregable | null>(null);
  const [certToDelete, setCertToDelete] = useState<{
    entId: string;
    hitoId: string;
    certId: string;
    name: string;
  } | null>(null);

  // All deliverables are expanded by default or controllable
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    proyecto.entregables.forEach((e) => {
      init[e.id] = true;
    });
    return init;
  });

  const allExpanded = useMemo(() => {
    return proyecto.entregables.length > 0 && proyecto.entregables.every((e) => expandedIds[e.id]);
  }, [proyecto.entregables, expandedIds]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleExpandAll = () => {
    if (allExpanded) {
      setExpandedIds({});
    } else {
      const next: Record<string, boolean> = {};
      proyecto.entregables.forEach((e) => {
        next[e.id] = true;
      });
      setExpandedIds(next);
    }
  };

  // Filtered deliverables with external FiltrosState
  const filteredEntregables = useMemo(() => {
    return proyecto.entregables.filter((e) => {
      const valorEfectivo = getEntregableValorEfectivo(e, proyecto);
      let certTotal = 0;
      e.hitos.forEach((h) => {
        h.certificados.forEach((c) => {
          certTotal += Number(c.importe) || 0;
        });
      });
      const saldo = Math.max(0, valorEfectivo - certTotal);

      if (filtros) {
        if (filtros.empresa) {
          const emp = e.empresaId || proyecto.empresas?.[0]?.id;
          if (emp && emp !== filtros.empresa) return false;
        }
        if (filtros.idEntregable && filtros.idEntregable.trim()) {
          const needle = filtros.idEntregable.trim().toLowerCase();
          if (!e.codigo.toLowerCase().includes(needle)) return false;
        }
        if (filtros.descripcion && filtros.descripcion.trim()) {
          const needle = filtros.descripcion.trim().toLowerCase();
          if (!e.descripcion.toLowerCase().includes(needle)) return false;
        }
        if (filtros.categoria && e.categoria?.toLowerCase() !== filtros.categoria.toLowerCase()) {
          return false;
        }

        if (filtros.estado === 'totalmente' && (certTotal < valorEfectivo - 5 || certTotal === 0)) return false;
        if (filtros.estado === 'parcial' && (certTotal === 0 || certTotal >= valorEfectivo - 5)) return false;
        if (filtros.estado === 'sin_certificar' && certTotal > 0) return false;
        if (filtros.estado === 'con_saldo' && saldo <= 0) return false;

        if (filtros.conSaldoPendiente && saldo <= 0) return false;
        if (filtros.completamenteCertificados && (certTotal < valorEfectivo - 5 || certTotal === 0)) return false;

        if (filtros.vencidos) {
          const hasOverdue = e.hitos.some((h) => {
            const f = getHitoPlannedDate(e, h);
            return f && f < '2026-09-16' && h.certificados.length === 0;
          });
          if (!hasOverdue) return false;
        }

        const fBase = normalizeDate(e.fechaBase);
        if (filtros.fechaDesde && fBase && fBase < filtros.fechaDesde) return false;
        if (filtros.fechaHasta && fBase && fBase > filtros.fechaHasta) return false;
      }

      return true;
    });
  }, [proyecto, filtros]);

  return (
    <div id="entregables-view-container" className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Top Banner exactly matching Screenshot 1 */}
      <div className="bg-[#172554] px-4 py-3 sm:px-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-sky-400" />
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            Certificaciones de Taging
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportProjectToExcel(proyecto)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md shadow-xs transition"
            title="Exportar todas las actividades e hitos a Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>
          {onOpenCargaMasiva && (
            <button
              type="button"
              onClick={onOpenCargaMasiva}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-md shadow-xs transition"
              title="Carga masiva de entregables e hitos por planilla Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Carga masiva</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleToggleExpandAll}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-md shadow-xs transition"
          >
            {allExpanded ? 'Contraer todos' : 'Expandir todos'}
          </button>
          <button
            type="button"
            onClick={onAddEntregable}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-md shadow-xs transition"
          >
            <Plus className="w-4 h-4 text-slate-700" />
            <span>Nuevo entregable</span>
          </button>
        </div>
      </div>

      {/* Table matching Base44 columns and styling */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <th className="py-2.5 px-2 w-7 text-center"></th>
              <th className="py-2.5 px-2 w-10 text-center">Item</th>
              <th className="py-2.5 px-3 w-28">ID</th>
              <th className="py-2.5 px-4 min-w-[240px]">Descripción / Hito</th>
              <th className="py-2.5 px-3 text-center">Tipo</th>
              <th className="py-2.5 px-3 text-right">Valor total</th>
              <th className="py-2.5 px-3 text-right">Valor hito</th>
              <th className="py-2.5 px-3 text-center">Fecha prevista</th>
              <th className="py-2.5 px-3 text-right">Certificado</th>
              <th className="py-2.5 px-3 text-right">Pendiente</th>
              <th className="py-2.5 px-3 text-center">Estado</th>
              <th className="py-2.5 px-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
            {filteredEntregables.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400">
                  No se encontraron entregables con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredEntregables.map((ent, index) => {
                const isExpanded = Boolean(expandedIds[ent.id]);
                const valorEfectivo = getEntregableValorEfectivo(ent, proyecto);

                // Calculate deliverable certified total
                let totalCertificado = 0;
                ent.hitos.forEach((h) => {
                  h.certificados.forEach((c) => {
                    totalCertificado += Number(c.importe) || 0;
                  });
                });

                const pendienteTotal = Math.max(0, valorEfectivo - totalCertificado);

                // Status Badge determination
                let estadoBadge = 'Planificado';
                let estadoClass = 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300';

                if (totalCertificado >= valorEfectivo - 5 && totalCertificado > 0) {
                  estadoBadge = 'Certificado';
                  estadoClass = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300';
                } else if (totalCertificado > 0) {
                  estadoBadge = 'Parcialmente certificado';
                  estadoClass = 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300';
                }

                return (
                  <React.Fragment key={ent.id}>
                    {/* Deliverable Row */}
                    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60">
                      {/* Expander arrow */}
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => toggleExpand(ent.id)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 transition"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>

                      {/* Item number */}
                      <td className="py-2.5 px-2 text-center font-medium text-slate-600 dark:text-slate-400">
                        {index + 1}
                      </td>

                      {/* ID */}
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white font-mono whitespace-nowrap">
                        {ent.codigo}
                      </td>

                      {/* Descripción */}
                      <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-100">
                        <span>{ent.descripcion}</span>
                      </td>

                      {/* Tipo */}
                      <td className="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {ent.tipoDistribucion === 'pago_unico' ? 'pago_unico' : 'estandar'}
                      </td>

                      {/* Valor total (with general expenses prorated!) */}
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(valorEfectivo, '').trim()}
                      </td>

                      {/* Valor hito: deliverable row has dash */}
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        —
                      </td>

                      {/* Fecha prevista */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {formatShortDate(ent.fechaBase)}
                      </td>

                      {/* Certificado */}
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatCurrency(totalCertificado, '').trim()}
                      </td>

                      {/* Pendiente */}
                      <td
                        className={`py-2.5 px-3 text-right whitespace-nowrap font-medium ${
                          pendienteTotal <= 0.01
                            ? 'text-slate-400 dark:text-slate-500'
                            : 'text-amber-600 dark:text-amber-400 font-semibold'
                        }`}
                      >
                        {formatCurrency(pendienteTotal, '').trim()}
                      </td>

                      {/* Estado */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${estadoClass}`}>
                          {estadoBadge}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <button
                            type="button"
                            onClick={() => onEditEntregable(ent)}
                            className="p-1 hover:text-blue-600 rounded transition"
                            title="Editar entregable"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicateEntregable(ent)}
                            className="p-1 hover:text-indigo-600 rounded transition"
                            title="Duplicar entregable"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEntregableToDelete(ent)}
                            className="p-1 hover:text-rose-600 rounded transition"
                            title="Eliminar entregable"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Sub-rows: Milestones (Hitos) */}
                    {isExpanded &&
                      ent.hitos.map((hito) => {
                        const valorHito = getHitoValorEfectivo(ent, hito, proyecto);
                        const fechaPrevista = getHitoPlannedDate(ent, hito);

                        let hitoCertificado = 0;
                        hito.certificados.forEach((c) => {
                          hitoCertificado += Number(c.importe) || 0;
                        });

                        const hitoPendiente = Math.max(0, valorHito - hitoCertificado);
                        const hasCerts = hito.certificados.length > 0;

                        return (
                          <tr
                            key={hito.id}
                            className="bg-slate-50/40 dark:bg-slate-800/20 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-300 transition"
                          >
                            {/* Empty spacer */}
                            <td className="py-2 px-2"></td>
                            <td className="py-2 px-2"></td>

                            {/* Sub arrow icon */}
                            <td className="py-2 px-3 text-right text-slate-400">
                              ↳
                            </td>

                            {/* Milestone name */}
                            <td className="py-2 px-4 font-normal text-slate-700 dark:text-slate-200">
                              {hito.nombre}
                            </td>

                            {/* Percentage (e.g. 60,00%, 30,00%, 10,00%) */}
                            <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400">
                              {hito.porcentaje.toFixed(2).replace('.', ',')}%
                            </td>

                            {/* Valor total: milestone row has dash */}
                            <td className="py-2 px-3 text-right text-slate-400">
                              —
                            </td>

                            {/* Valor hito */}
                            <td className="py-2 px-3 text-right font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {formatCurrency(valorHito, '').trim()}
                            </td>

                            {/* Fecha prevista with calendar icon matching Screenshot 1 */}
                            <td className="py-2 px-3 text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                {formatShortDate(fechaPrevista)}
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              </span>
                            </td>

                            {/* Certificado */}
                            <td className="py-2 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              {formatCurrency(hitoCertificado, '').trim()}
                            </td>

                            {/* Pendiente */}
                            <td
                              className={`py-2 px-3 text-right whitespace-nowrap font-medium ${
                                hitoPendiente <= 0.01
                                  ? 'text-slate-400 dark:text-slate-500'
                                  : 'text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {formatCurrency(hitoPendiente, '').trim()}
                            </td>

                            {/* Estado: 1 cert. badge and links with 'x' deletion */}
                            <td className="py-2 px-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1.5">
                                {hasCerts && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                    {hito.certificados.length} cert.
                                  </span>
                                )}
                                {hito.certificados.map((cert) => (
                                  <span
                                    key={cert.id}
                                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    <span>
                                      {cert.nombre.includes('Certificado') ? cert.nombre : `Certificado ${cert.numero || cert.nombre}`}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setCertToDelete({
                                          entId: ent.id,
                                          hitoId: hito.id,
                                          certId: cert.id,
                                          name: cert.nombre || `Certificado ${cert.numero || ''}`,
                                        })
                                      }
                                      className="text-slate-400 hover:text-rose-600 transition"
                                      title="Eliminar este certificado"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* Acciones: '+' button to add certificate for this milestone */}
                            <td className="py-2 px-3 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => onOpenAddCertificado(ent.id, hito.id)}
                                className="p-1 text-slate-500 hover:text-blue-600 rounded transition"
                                title="Emitir certificado para este hito"
                              >
                                <Plus className="w-3.5 h-3.5 font-bold" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Confirm deletion of Entregable */}
      <ConfirmModal
        isOpen={Boolean(entregableToDelete)}
        title="Eliminar Entregable"
        message={`¿Estás seguro de que deseas eliminar el entregable "${entregableToDelete?.codigo} - ${entregableToDelete?.descripcion}" y todos sus hitos y certificaciones asociadas?`}
        confirmText="Eliminar Entregable"
        confirmVariant="danger"
        onConfirm={() => {
          if (entregableToDelete) {
            onDeleteEntregable(entregableToDelete.id);
            setEntregableToDelete(null);
          }
        }}
        onCancel={() => setEntregableToDelete(null)}
      />

      {/* Confirm deletion of single certificate */}
      <ConfirmModal
        isOpen={Boolean(certToDelete)}
        title="Eliminar Certificado"
        message={`¿Estás seguro de que deseas eliminar el "${certToDelete?.name}" de este hito?`}
        confirmText="Eliminar"
        confirmVariant="danger"
        onConfirm={() => {
          if (certToDelete) {
            onDeleteCertificado(certToDelete.entId, certToDelete.hitoId, certToDelete.certId);
            setCertToDelete(null);
          }
        }}
        onCancel={() => setCertToDelete(null)}
      />
    </div>
  );
};
