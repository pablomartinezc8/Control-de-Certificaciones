import React, { useState, useEffect, useMemo } from 'react';
import { Proyecto, Certificado, Entregable, Hito } from '../types';
import { 
  normalizeDate, 
  formatCurrency, 
  getHitoValorEfectivo,
  getGroupedCertificates,
  CertificadoDocumento 
} from '../utils/calculations';
import { X, Search } from 'lucide-react';

export interface ActividadSeleccionada {
  entregableId: string;
  codigo: string;
  descripcion: string;
  hitoId: string;
  hitoNombre: string;
  hitoPorcentaje: number;
  valorHito: number;
  pendiente: number;
  importeACobrar: number;
  seleccionado: boolean;
}

interface CertificadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  proyecto: Proyecto;
  onSaveCertificado: (
    entregableId: string,
    hitoId: string,
    certificado: Certificado,
    isEdit: boolean
  ) => void;
  onSaveMultiCertificado?: (
    baseCertificado: Omit<Certificado, 'id' | 'importe'>,
    actividades: { entregableId: string; hitoId: string; importe: number }[]
  ) => void;
  onSaveDocumento?: (
    docKey: string,
    baseCertificado: Omit<Certificado, 'id' | 'importe'>,
    actividades: { entregableId: string; hitoId: string; importe: number; seleccionado: boolean }[]
  ) => void;
  initialCertificado?: {
    certificado: Certificado;
    entregableId: string;
    hitoId: string;
  } | null;
  initialDocumento?: CertificadoDocumento | null;
  defaultHito?: {
    entregableId: string;
    hitoId: string;
  } | null;
}

export const CertificadoModal: React.FC<CertificadoModalProps> = ({
  isOpen,
  onClose,
  proyecto,
  onSaveCertificado,
  onSaveMultiCertificado,
  onSaveDocumento,
  initialCertificado,
  initialDocumento,
  defaultHito,
}) => {
  const isEditMode = Boolean(initialCertificado || initialDocumento);

  // Common Header Form
  const [nombre, setNombre] = useState('Certificado OC');
  const [numero, setNumero] = useState('');
  const [ordenCompra, setOrdenCompra] = useState('');
  const [fechaPresentacion, setFechaPresentacion] = useState('');
  const [fechaAprobacion, setFechaAprobacion] = useState('');
  const [fechaCobro, setFechaCobro] = useState('');
  const [estado, setEstado] = useState<string>('Presentado');
  const [tipo, setTipo] = useState<string>('Normal');
  const [observaciones, setObservaciones] = useState('');
  const [activeDocKey, setActiveDocKey] = useState<string>('');

  // Multi-activity table states
  const [searchQuery, setSearchQuery] = useState('');
  const [actividades, setActividades] = useState<ActividadSeleccionada[]>([]);

  // Initialize form data
  useEffect(() => {
    if (!isOpen) return;

    // Detect if we have an existing document or a grouped certificate
    let targetDoc: CertificadoDocumento | null = initialDocumento || null;

    if (!targetDoc && initialCertificado) {
      const allDocs = getGroupedCertificates(proyecto);
      const c = initialCertificado.certificado;
      targetDoc = allDocs.find((d) =>
        d.actividades.some((a) => a.certId === c.id) ||
        (c.grupo && d.grupoKey === c.grupo)
      ) || null;
    }

    if (targetDoc) {
      setActiveDocKey(targetDoc.grupoKey || targetDoc.id);
      setNombre(targetDoc.nombre || 'Certificado');
      setNumero(targetDoc.numero || '1');
      setOrdenCompra(targetDoc.ordenCompra || '');
      setFechaPresentacion(normalizeDate(targetDoc.fechaPresentacion) || '');
      setFechaAprobacion(normalizeDate(targetDoc.fechaAprobacion) || '');
      setFechaCobro(normalizeDate(targetDoc.fechaCobro) || '');
      setEstado(targetDoc.estado || 'Presentado');
      setTipo(targetDoc.tipo || 'Normal');
      setObservaciones('');

      // Build activity list including the activities in this document
      const acts: ActividadSeleccionada[] = [];
      const docActsMap = new Map<string, number>();
      targetDoc.actividades.forEach((a) => {
        docActsMap.set(`${a.entregableId}__${a.hitoId}`, a.cobrado);
      });

      proyecto.entregables.forEach((e) => {
        e.hitos.forEach((h) => {
          const valorHito = getHitoValorEfectivo(e, h, proyecto);
          const certTotal = h.certificados.reduce((sum, c) => sum + (Number(c.importe) || 0), 0);
          const key = `${e.id}__${h.id}`;
          const isSelected = docActsMap.has(key);
          const currentInDoc = docActsMap.get(key) || 0;
          const pendienteSinEsteDoc = Math.max(0, Math.round((valorHito - (certTotal - currentInDoc)) * 100) / 100);

          acts.push({
            entregableId: e.id,
            codigo: e.codigo,
            descripcion: e.descripcion,
            hitoId: h.id,
            hitoNombre: h.nombre,
            hitoPorcentaje: h.porcentaje,
            valorHito,
            pendiente: pendienteSinEsteDoc,
            importeACobrar: isSelected ? currentInDoc : pendienteSinEsteDoc,
            seleccionado: isSelected,
          });
        });
      });

      setActividades(acts);
    } else if (initialCertificado) {
      // Fallback single certificate not in a group
      const c = initialCertificado.certificado;
      setActiveDocKey('');
      setNombre(c.nombre || 'Certificado');
      setNumero(c.numero || '1');
      setOrdenCompra(c.ordenCompra || '');
      setFechaPresentacion(normalizeDate(c.fechaPresentacion) || '');
      setFechaAprobacion(normalizeDate(c.fechaAprobacion) || '');
      setFechaCobro(normalizeDate(c.fechaCobro) || '');
      setEstado(c.estado || 'Presentado');
      setTipo(c.tipo || 'Normal');
      setObservaciones(c.observaciones || '');

      const acts: ActividadSeleccionada[] = [];
      proyecto.entregables.forEach((e) => {
        e.hitos.forEach((h) => {
          const valorHito = getHitoValorEfectivo(e, h, proyecto);
          const certTotal = h.certificados.reduce((sum, cert) => sum + (Number(cert.importe) || 0), 0);
          const isTarget = e.id === initialCertificado.entregableId && h.id === initialCertificado.hitoId;
          const currentCert = isTarget ? Number(c.importe) || 0 : 0;
          const pendiente = Math.max(0, Math.round((valorHito - (certTotal - currentCert)) * 100) / 100);

          acts.push({
            entregableId: e.id,
            codigo: e.codigo,
            descripcion: e.descripcion,
            hitoId: h.id,
            hitoNombre: h.nombre,
            hitoPorcentaje: h.porcentaje,
            valorHito,
            pendiente,
            importeACobrar: isTarget ? currentCert : pendiente,
            seleccionado: isTarget,
          });
        });
      });

      setActividades(acts);
    } else {
      // New Multi-Activity Certificate
      setActiveDocKey('');
      const acts: ActividadSeleccionada[] = [];
      let certCount = 0;
      proyecto.entregables.forEach((e) => {
        e.hitos.forEach((h) => {
          certCount += h.certificados.length;
        });
      });
      const nextCertNum = certCount + 1;

      proyecto.entregables.forEach((e) => {
        e.hitos.forEach((h) => {
          const valorHito = getHitoValorEfectivo(e, h, proyecto);
          const certTotal = h.certificados.reduce((sum, c) => sum + (Number(c.importe) || 0), 0);
          const pendiente = Math.max(0, Math.round((valorHito - certTotal) * 100) / 100);
          const isDefault = defaultHito && defaultHito.entregableId === e.id && defaultHito.hitoId === h.id;

          acts.push({
            entregableId: e.id,
            codigo: e.codigo,
            descripcion: e.descripcion,
            hitoId: h.id,
            hitoNombre: h.nombre,
            hitoPorcentaje: h.porcentaje,
            valorHito,
            pendiente,
            importeACobrar: pendiente,
            seleccionado: Boolean(isDefault),
          });
        });
      });

      setActividades(acts);

      const defaultEnt = defaultHito
        ? proyecto.entregables.find((e) => e.id === defaultHito.entregableId)
        : proyecto.entregables[0];

      setNombre('Certificado OC');
      setNumero(String(nextCertNum));
      setOrdenCompra(defaultEnt?.ordenCompra || '');
      setFechaPresentacion(new Date().toISOString().split('T')[0]);
      setFechaAprobacion('');
      setFechaCobro('');
      setEstado('Presentado');
      setTipo('Normal');
      setObservaciones('');
    }
  }, [isOpen, initialCertificado, initialDocumento, defaultHito, proyecto]);

  // Toggle activity checkbox
  const handleToggleSelect = (entregableId: string, hitoId: string) => {
    setActividades((prev) =>
      prev.map((act) => {
        if (act.entregableId === entregableId && act.hitoId === hitoId) {
          const nuevoSeleccionado = !act.seleccionado;
          return {
            ...act,
            seleccionado: nuevoSeleccionado,
            importeACobrar: nuevoSeleccionado
              ? act.importeACobrar > 0
                ? act.importeACobrar
                : act.pendiente
              : act.importeACobrar,
          };
        }
        return act;
      })
    );
  };

  // Change amount for an activity
  const handleAmountChange = (entregableId: string, hitoId: string, value: number) => {
    setActividades((prev) =>
      prev.map((act) => {
        if (act.entregableId === entregableId && act.hitoId === hitoId) {
          return {
            ...act,
            importeACobrar: isNaN(value) ? 0 : value,
          };
        }
        return act;
      })
    );
  };

  // Filter activities by search query
  const filteredActividades = useMemo(() => {
    if (!searchQuery.trim()) return actividades;
    const q = searchQuery.toLowerCase();
    return actividades.filter(
      (a) =>
        a.codigo.toLowerCase().includes(q) ||
        a.descripcion.toLowerCase().includes(q) ||
        a.hitoNombre.toLowerCase().includes(q)
    );
  }, [actividades, searchQuery]);

  const seleccionadasCount = actividades.filter((a) => a.seleccionado).length;

  // Calculate total certificate amount: true sum of all selected activities
  const totalCertificado = useMemo(() => {
    return (
      Math.round(
        actividades
          .filter((a) => a.seleccionado)
          .reduce((sum, a) => sum + (Number(a.importeACobrar) || 0), 0) * 100
      ) / 100
    );
  }, [actividades]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedActs = actividades.filter((a) => a.seleccionado && a.importeACobrar > 0);
    if (selectedActs.length === 0) {
      alert('Por favor seleccione al menos una actividad con un importe mayor a 0 para certificar.');
      return;
    }

    const baseData = {
      nombre: nombre.trim() || 'Certificado OC',
      numero: numero.trim() || '1',
      ordenCompra: ordenCompra.trim(),
      fechaPresentacion,
      fechaAprobacion,
      fechaCobro,
      estado,
      tipo,
      observaciones,
    };

    if (activeDocKey && onSaveDocumento) {
      onSaveDocumento(
        activeDocKey,
        baseData,
        actividades.map((a) => ({
          entregableId: a.entregableId,
          hitoId: a.hitoId,
          importe: Number(a.importeACobrar) || 0,
          seleccionado: a.seleccionado,
        }))
      );
      onClose();
      return;
    }

    if (isEditMode && initialCertificado) {
      const targetAct = selectedActs[0];
      const updatedCert: Certificado = {
        ...initialCertificado.certificado,
        ...baseData,
        importe: targetAct ? Number(targetAct.importeACobrar) || 0 : totalCertificado,
      };
      onSaveCertificado(initialCertificado.entregableId, initialCertificado.hitoId, updatedCert, true);
      onClose();
      return;
    }

    // Multi-activity save mode
    if (onSaveMultiCertificado) {
      onSaveMultiCertificado(
        baseData,
        selectedActs.map((a) => ({
          entregableId: a.entregableId,
          hitoId: a.hitoId,
          importe: Number(a.importeACobrar) || 0,
        }))
      );
    } else {
      // Fallback single save
      selectedActs.forEach((act) => {
        const newCert: Certificado = {
          id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          ...baseData,
          importe: Number(act.importeACobrar) || 0,
        };
        onSaveCertificado(act.entregableId, act.hitoId, newCert, false);
      });
    }

    onClose();
  };

  return (
    <div
      id="certificado-modal-backdrop"
      className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <div
        id="certificado-modal-card"
        className="bg-[#0B1324] border border-slate-800 rounded-xl max-w-4xl w-full p-6 shadow-2xl my-6 text-slate-200"
      >
        {/* Modal Header matching Screenshot 3 */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              {isEditMode ? 'Editar certificación' : 'Nueva certificación (multi-actividad)'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Una misma orden de compra puede cobrar varias actividades. Complete los datos comunes y marque en la tabla las actividades a cobrar, indicando el importe de cada una.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Fila 1: Nombre & Número */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Nombre
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Certificado OC"
                className="w-full px-3 py-2 bg-[#080d19] border border-sky-500/60 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-sky-400 transition"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Número
              </label>
              <input
                type="text"
                required
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder=""
                className="w-full px-3 py-2 bg-[#080d19] border border-slate-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
              />
            </div>
          </div>

          {/* Fila 2: Orden de compra, Fecha presentación, Fecha aprobación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Orden de compra
              </label>
              <input
                type="text"
                value={ordenCompra}
                onChange={(e) => setOrdenCompra(e.target.value)}
                placeholder=""
                className="w-full px-3 py-2 bg-[#080d19] border border-slate-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Fecha presentación
              </label>
              <input
                type="date"
                value={fechaPresentacion}
                onChange={(e) => setFechaPresentacion(e.target.value)}
                className="w-full px-3 py-2 bg-[#080d19] border border-slate-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Fecha aprobación
              </label>
              <input
                type="date"
                value={fechaAprobacion}
                onChange={(e) => setFechaAprobacion(e.target.value)}
                className="w-full px-3 py-2 bg-[#080d19] border border-slate-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
              />
            </div>
          </div>

          {/* Fila 3: Fecha cobro, Estado, Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Fecha cobro
              </label>
              <input
                type="date"
                value={fechaCobro}
                onChange={(e) => setFechaCobro(e.target.value)}
                className="w-full px-3 py-2 bg-[#080d19] border border-slate-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full px-3 py-2 bg-[#080d19] border border-slate-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
              >
                <option value="Presentado">Presentado</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Cobrado">Cobrado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 bg-[#080d19] border border-slate-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
              >
                <option value="Normal">Normal</option>
                <option value="Anticipo">Anticipo</option>
                <option value="Retención">Retención</option>
              </select>
            </div>
          </div>

          {/* Section: Actividades a cobrar / incluidas */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">
                {isEditMode ? 'Actividades incluidas en el certificado' : 'Actividades a cobrar'} ({seleccionadasCount} seleccionadas)
              </span>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar actividad..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#080d19] border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-800 rounded-lg overflow-hidden max-h-64 overflow-y-auto bg-[#070c17]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#0b1426] text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="w-10 px-3 py-2 text-center">✓</th>
                    <th className="px-3 py-2">Entregable</th>
                    <th className="px-3 py-2">Hito</th>
                    <th className="px-3 py-2 text-right">Valor hito</th>
                    <th className="px-3 py-2 text-right">Pendiente</th>
                    <th className="px-3 py-2 text-right w-36">Importe a cobrar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredActividades.map((act) => {
                    const isZeroPendiente = act.pendiente <= 0.01;
                    return (
                      <tr
                        key={`${act.entregableId}_${act.hitoId}`}
                        className={`hover:bg-slate-800/40 transition ${
                          act.seleccionado ? 'bg-sky-950/20' : ''
                        }`}
                      >
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={act.seleccionado}
                            onChange={() => handleToggleSelect(act.entregableId, act.hitoId)}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-white">{act.codigo}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {act.descripcion}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-slate-300">
                          {act.hitoNombre} ({act.hitoPorcentaje.toFixed(2).replace('.', ',')}%)
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-slate-200">
                          {formatCurrency(act.valorHito, '').trim()}
                        </td>
                        <td
                          className={`px-3 py-2.5 text-right font-mono ${
                            isZeroPendiente ? 'text-emerald-400' : 'text-amber-400 font-semibold'
                          }`}
                        >
                          {formatCurrency(act.pendiente, '').trim()}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {act.seleccionado ? (
                            <input
                              type="number"
                              step="0.01"
                              value={act.importeACobrar}
                              onChange={(e) =>
                                handleAmountChange(
                                  act.entregableId,
                                  act.hitoId,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-28 px-2 py-1 bg-[#0b1324] border border-sky-500 rounded text-right font-mono text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                            />
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total del certificado */}
            <div className="flex items-center justify-between pt-3 px-1">
              <div className="text-xs text-slate-400">
                {seleccionadasCount} actividades seleccionadas
              </div>
              <div className="text-sm font-bold text-white font-mono bg-[#070c17] px-3.5 py-1.5 rounded-lg border border-slate-800">
                Total del certificado: <span className="text-emerald-400 ml-1">{formatCurrency(totalCertificado)}</span>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Observaciones
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder=""
              className="w-full px-3 py-1.5 bg-[#080d19] border border-slate-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-slate-800 text-slate-300 rounded-md font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-md font-medium shadow-md transition"
            >
              {isEditMode ? 'Guardar Cambios' : 'Guardar Certificación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
