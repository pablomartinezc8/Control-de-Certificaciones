import React, { useState, useMemo } from 'react';
import { Proyecto, Certificado } from '../types';
import { 
  getGroupedCertificates, 
  CertificadoDocumento, 
  formatCurrency, 
  formatShortDate 
} from '../utils/calculations';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit2, 
  Trash2,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  Eye
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface CertificadosViewProps {
  proyecto: Proyecto;
  onOpenAddCertificado: () => void;
  onEditCertificado: (item: {
    certificado: Certificado;
    entregableId: string;
    hitoId: string;
  }) => void;
  onEditCertificadoDocumento?: (doc: CertificadoDocumento) => void;
  onDeleteCertificado: (entregableId: string, hitoId: string, certId: string) => void;
  onDeleteCertificadoDocumento?: (doc: CertificadoDocumento) => void;
  onUpdateCertificadoStatus: (
    entregableId: string,
    hitoId: string,
    certId: string,
    newStatus: string
  ) => void;
}

export const CertificadosView: React.FC<CertificadosViewProps> = ({
  proyecto,
  onOpenAddCertificado,
  onEditCertificado,
  onEditCertificadoDocumento,
  onDeleteCertificado,
  onDeleteCertificadoDocumento,
  onUpdateCertificadoStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});

  // Confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<CertificadoDocumento | null>(null);

  const docs = useMemo(() => getGroupedCertificates(proyecto), [proyecto]);

  const toggleExpand = (id: string) => {
    setExpandedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredDocs = useMemo(() => {
    return docs.filter((doc) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        doc.nombre.toLowerCase().includes(term) ||
        doc.numero.toLowerCase().includes(term) ||
        doc.codigoPrincipal.toLowerCase().includes(term) ||
        doc.actividades.some(
          (a) =>
            a.codigo.toLowerCase().includes(term) ||
            a.descripcion.toLowerCase().includes(term) ||
            a.hitoNombre.toLowerCase().includes(term)
        );

      if (!matchSearch) return false;

      if (statusFilter !== 'all' && doc.estado !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [docs, searchTerm, statusFilter]);

  const allExpanded = filteredDocs.length > 0 && filteredDocs.every((doc) => Boolean(expandedDocs[doc.id]));

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedDocs({});
    } else {
      const next: Record<string, boolean> = {};
      filteredDocs.forEach((d) => {
        next[d.id] = true;
      });
      setExpandedDocs(next);
    }
  };

  // Totals
  const totalEmitido = useMemo(() => {
    return docs.reduce((sum, d) => sum + d.importeTotal, 0);
  }, [docs]);

  const totalCobrado = useMemo(() => {
    return docs
      .filter((d) => d.estado === 'Cobrado')
      .reduce((sum, d) => sum + d.importeTotal, 0);
  }, [docs]);

  const totalPendiente = totalEmitido - totalCobrado;

  const cobradosCount = docs.filter((d) => d.estado === 'Cobrado').length;
  const pendientesCount = docs.length - cobradosCount;

  const exportCertificatesCSV = () => {
    const headers = [
      'Item',
      'Codigo_Principal',
      'Nombre_Certificado',
      'Numero',
      'Orden_Compra',
      'Tipo',
      'Importe_Total_USD',
      'Estado',
      'Fecha_Presentacion',
      'Fecha_Aprobacion',
      'Fecha_Cobro',
      'Actividades_Detalle',
    ];

    const rows = docs.map((d) => [
      d.item,
      `"${d.codigoPrincipal}"`,
      `"${d.nombre}"`,
      `"${d.numero}"`,
      `"${d.ordenCompra}"`,
      `"${d.tipo}"`,
      d.importeTotal,
      `"${d.estado}"`,
      `"${d.fechaPresentacion}"`,
      `"${d.fechaAprobacion}"`,
      `"${d.fechaCobro}"`,
      `"${d.actividades.map((a) => `${a.codigo} (${a.hitoNombre})`).join('; ')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `certificados_emitidos_${(proyecto.nombre || 'proyecto').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (onDeleteCertificadoDocumento) {
      onDeleteCertificadoDocumento(deleteTarget);
    } else {
      deleteTarget.actividades.forEach((act) => {
        onDeleteCertificado(act.entregableId, act.hitoId, act.certId);
      });
    }

    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Stats Cards matching Base44 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* TOTAL EMITIDO */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              TOTAL EMITIDO
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">
            {formatCurrency(totalEmitido)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {docs.length} certificados emitidos
          </div>
        </div>

        {/* TOTAL COBRADO */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              TOTAL COBRADO
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
            {formatCurrency(totalCobrado)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {cobradosCount} certificados cobrados
          </div>
        </div>

        {/* PENDIENTE DE COBRO */}
        <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              PENDIENTE DE COBRO
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 tracking-tight">
            {formatCurrency(totalPendiente)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {pendientesCount} certificados pendientes
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar certificados..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">Todos los estados</option>
              <option value="Cobrado">Cobrado</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Presentado">Presentado</option>
              <option value="Pendiente">Pendiente</option>
            </select>

            <button
              onClick={exportCertificatesCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
              title="Exportar listado a Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Generar Reporte</span>
            </button>

            <button
              onClick={toggleExpandAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
              title={allExpanded ? "Ocultar detalles de todas las certificaciones" : "Ver qué se cobró en todas las certificaciones"}
            >
              {allExpanded ? (
                <>
                  <ChevronDown className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>Colapsar Detalles</span>
                </>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>Ver Todos los Detalles</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={onOpenAddCertificado}
            id="btn-add-certificado"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Certificado</span>
          </button>
        </div>

        {/* Table matching Base44 columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3">CÓDIGO</th>
                <th className="py-3 px-3">DESCRIPCIÓN</th>
                <th className="py-3 px-3 text-center">TIPO</th>
                <th className="py-3 px-3 text-right">MONTO</th>
                <th className="py-3 px-3 text-center">ESTADO</th>
                <th className="py-3 px-3 text-center">PRESENTACIÓN</th>
                <th className="py-3 px-3 text-center">APROBACIÓN</th>
                <th className="py-3 px-3 text-center">COBRO</th>
                <th className="py-3 px-3 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No se encontraron certificados registrados.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const isExpanded = Boolean(expandedDocs[doc.id]);

                  return (
                    <React.Fragment key={doc.id}>
                      <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        {/* # */}
                        <td className="py-3 px-3 text-center text-slate-500 dark:text-slate-400 font-medium">
                          {doc.item}
                        </td>

                        {/* CÓDIGO */}
                        <td className="py-3 px-3 font-mono font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-600 dark:text-cyan-400 font-bold">
                              {doc.codigoPrincipal}
                            </span>
                            {doc.otrosCodigosCount > 0 && (
                              <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-cyan-300 px-1.5 py-0.5 rounded">
                                +{doc.otrosCodigosCount}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* DESCRIPCIÓN */}
                        <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
                          <button
                            type="button"
                            onClick={() => toggleExpand(doc.id)}
                            className="flex items-center gap-1.5 text-left group hover:text-blue-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                            title={isExpanded ? "Ocultar detalle de lo cobrado" : "Ver detalle de lo cobrado"}
                          >
                            <span className="font-semibold">{doc.nombre}</span>
                            <span className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors p-0.5 rounded">
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </span>
                          </button>
                        </td>

                        {/* TIPO */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {doc.tipo}
                          </span>
                        </td>

                        {/* MONTO */}
                        <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white font-mono whitespace-nowrap">
                          {formatCurrency(doc.importeTotal)}
                        </td>

                        {/* ESTADO */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              doc.estado === 'Cobrado'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : doc.estado === 'Aprobado'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {doc.estado}
                          </span>
                        </td>

                        {/* PRESENTACIÓN */}
                        <td className="py-3 px-3 text-center whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono text-xs">
                          {formatShortDate(doc.fechaPresentacion) || '—'}
                        </td>

                        {/* APROBACIÓN */}
                        <td className="py-3 px-3 text-center whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono text-xs">
                          {formatShortDate(doc.fechaAprobacion) || formatShortDate(doc.fechaPresentacion) || '—'}
                        </td>

                        {/* COBRO */}
                        <td className="py-3 px-3 text-center whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono text-xs font-semibold">
                          {formatShortDate(doc.fechaCobro) || '—'}
                        </td>

                        {/* ACCIONES */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => toggleExpand(doc.id)}
                              className={`p-1.5 rounded transition-colors ${
                                isExpanded
                                  ? 'text-blue-600 dark:text-cyan-400 bg-blue-100 dark:bg-blue-900/60'
                                  : 'text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                              title={isExpanded ? "Ocultar detalle de actividades" : "Ver detalle de lo cobrado"}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (onEditCertificadoDocumento) {
                                  onEditCertificadoDocumento(doc);
                                  return;
                                }
                                const firstAct = doc.actividades[0];
                                if (firstAct) {
                                  const ent = proyecto.entregables.find((e) => e.id === firstAct.entregableId);
                                  const hit = ent?.hitos.find((h) => h.id === firstAct.hitoId);
                                  const cert = hit?.certificados.find((c) => c.id === firstAct.certId);
                                  if (cert) {
                                    onEditCertificado({
                                      certificado: cert,
                                      entregableId: firstAct.entregableId,
                                      hitoId: firstAct.hitoId,
                                    });
                                  }
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Editar certificado"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(doc)}
                              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              title="Eliminar certificado"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable sub-row with activities */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 dark:bg-slate-900/90 border-y border-slate-200 dark:border-slate-800">
                          <td colSpan={10} className="p-4 pl-12">
                            <div className="space-y-2">
                              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                <span>
                                  {doc.actividades.length === 1
                                    ? 'Actividad Cobrada en este Certificado (1)'
                                    : `Actividades Cobradas en este Certificado (${doc.actividades.length})`}
                                </span>
                                <span className="font-mono text-blue-600 dark:text-cyan-400 font-semibold">
                                  Total: {formatCurrency(doc.importeTotal)}
                                </span>
                              </div>
                              <div className="bg-white dark:bg-[#0B1426] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                                    <tr>
                                      <th className="py-2 px-3">Código</th>
                                      <th className="py-2 px-3">Descripción Entregable</th>
                                      <th className="py-2 px-3">Hito / Etapa</th>
                                      <th className="py-2 px-3 text-right">Valor Efectivo</th>
                                      <th className="py-2 px-3 text-right">Importe en este Certificado</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {doc.actividades.map((act, actIdx) => (
                                      <tr key={actIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                        <td className="py-2 px-3 font-mono font-bold text-blue-600 dark:text-cyan-400">
                                          {act.codigo}
                                        </td>
                                        <td className="py-2 px-3 text-slate-800 dark:text-slate-200">
                                          {act.descripcion}
                                        </td>
                                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                                          {act.hitoNombre} ({act.hitoPorcentaje}%)
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                                          {formatCurrency(act.valorHito)}
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                                          {formatCurrency(act.importe ?? (act.cobrado || act.pendiente))}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Eliminar Certificado"
        message={`¿Estás seguro de que deseas eliminar el certificado "${deleteTarget?.nombre}" (Monto: ${formatCurrency(deleteTarget?.importeTotal || 0)})? Esta acción revertirá el estado certificado de todas las actividades vinculadas.`}
        confirmText="Eliminar Certificado"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
