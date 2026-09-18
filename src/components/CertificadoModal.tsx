import React, { useState, useEffect, useMemo } from 'react';
import { Proyecto, Certificado, Entregable, Hito } from '../types';
import { 
  normalizeDate, 
  formatCurrency, 
  getHitoValorEfectivo,
  getHitoPlannedDate,
  getGroupedCertificates,
  CertificadoDocumento,
  formatShortDate
} from '../utils/calculations';
import { X, Search, Calendar, AlertCircle, Clock, CheckSquare, Square, ArrowUpDown, Filter } from 'lucide-react';

export interface ActividadSeleccionada {
  entregableId: string;
  codigo: string;
  descripcion: string;
  hitoId: string;
  hitoNombre: string;
  hitoPorcentaje: number;
  fechaPrevista: string;
  diasDiferencia: number;
  esVencido: boolean;
  valorHito: number;
  pendiente: number;
  importeACobrar: number;
  seleccionado: boolean;
  certId?: string;
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
    actividades: { entregableId: string; hitoId: string; importe: number; seleccionado: boolean; certId?: string }[]
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
  const [filterMode, setFilterMode] = useState<'todos' | 'vencidos' | 'proximos' | 'con_saldo' | 'seleccionados'>('todos');
  const [sortBy, setSortBy] = useState<'fecha' | 'codigo' | 'pendiente'>('fecha');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [actividades, setActividades] = useState<ActividadSeleccionada[]>([]);

  // Initialize form data
  useEffect(() => {
    if (!isOpen) return;

    // Reset filters
    setSearchQuery('');
    setFilterMode('todos');

    const todayStr = new Date().toISOString().split('T')[0];
    const todayTime = new Date(todayStr).getTime();

    const calculateDateInfo = (ent: Entregable, hit: Hito) => {
      const fPlan = getHitoPlannedDate(ent, hit) || hit.fechaManual || '';
      if (!fPlan) {
        return { fechaPrevista: '', diasDiferencia: 9999, esVencido: false };
      }
      const pTime = new Date(fPlan).getTime();
      const diffMs = pTime - todayTime;
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      return {
        fechaPrevista: fPlan,
        diasDiferencia: diffDays,
        esVencido: diffDays < 0,
      };
    };

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
      setObservaciones(targetDoc.observaciones || '');

      // Build activity list including the activities in this document
      const acts: ActividadSeleccionada[] = [];
      const targetDocCertIds = new Set(targetDoc.actividades.map((a) => a.certId).filter(Boolean));
      const docActsMap = new Map<string, { importe: number; certId?: string }>();
      
      targetDoc.actividades.forEach((a) => {
        const val = Number(a.importe) || (a.cobrado > 0 ? a.cobrado : a.pendiente) || 0;
        docActsMap.set(`${a.entregableId}__${a.hitoId}`, { importe: val, certId: a.certId });
      });

      proyecto.entregables.forEach((e) => {
        e.hitos.forEach((h) => {
          const valorHito = getHitoValorEfectivo(e, h, proyecto);
          const key = `${e.id}__${h.id}`;

          // Find if this milestone has a certificate belonging to this document
          const certInThisDoc = h.certificados.find((c) => {
            if (targetDocCertIds.has(c.id)) return true;
            if (c.grupo && (c.grupo === targetDoc!.grupoKey || c.grupo === targetDoc!.id)) return true;
            if (c.id === targetDoc!.id) return true;
            const pairKey = `${c.nombre}_${c.fechaCobro || c.fechaPresentacion}`;
            if (pairKey === targetDoc!.grupoKey || pairKey === targetDoc!.id) return true;
            return false;
          });

          const docEntry = docActsMap.get(key);
          const isSelected = Boolean(certInThisDoc) || Boolean(docEntry);
          const currentInDoc = certInThisDoc
            ? (Number(certInThisDoc.importe) || 0)
            : (docEntry ? docEntry.importe : 0);

          const certTotal = h.certificados.reduce((sum, c) => sum + (Number(c.importe) || 0), 0);
          const pendienteSinEsteDoc = Math.max(0, Math.round((valorHito - (certTotal - currentInDoc)) * 100) / 100);
          const dateInfo = calculateDateInfo(e, h);

          acts.push({
            entregableId: e.id,
            codigo: e.codigo,
            descripcion: e.descripcion,
            hitoId: h.id,
            hitoNombre: h.nombre,
            hitoPorcentaje: h.porcentaje,
            fechaPrevista: dateInfo.fechaPrevista,
            diasDiferencia: dateInfo.diasDiferencia,
            esVencido: dateInfo.esVencido,
            valorHito,
            pendiente: pendienteSinEsteDoc,
            importeACobrar: isSelected ? currentInDoc : pendienteSinEsteDoc,
            seleccionado: isSelected,
            certId: certInThisDoc?.id || docEntry?.certId,
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
          const dateInfo = calculateDateInfo(e, h);

          acts.push({
            entregableId: e.id,
            codigo: e.codigo,
            descripcion: e.descripcion,
            hitoId: h.id,
            hitoNombre: h.nombre,
            hitoPorcentaje: h.porcentaje,
            fechaPrevista: dateInfo.fechaPrevista,
            diasDiferencia: dateInfo.diasDiferencia,
            esVencido: dateInfo.esVencido,
            valorHito,
            pendiente,
            importeACobrar: isTarget ? currentCert : pendiente,
            seleccionado: isTarget,
            certId: isTarget ? c.id : undefined,
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
          const dateInfo = calculateDateInfo(e, h);

          acts.push({
            entregableId: e.id,
            codigo: e.codigo,
            descripcion: e.descripcion,
            hitoId: h.id,
            hitoNombre: h.nombre,
            hitoPorcentaje: h.porcentaje,
            fechaPrevista: dateInfo.fechaPrevista,
            diasDiferencia: dateInfo.diasDiferencia,
            esVencido: dateInfo.esVencido,
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
      setFechaPresentacion(todayStr);
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

  // Quick action: Select / Deselect all visible filtered activities
  const handleSelectFiltered = (select: boolean) => {
    const targetKeys = new Set(filteredActividades.map((a) => `${a.entregableId}__${a.hitoId}`));
    setActividades((prev) =>
      prev.map((act) => {
        const key = `${act.entregableId}__${act.hitoId}`;
        if (targetKeys.has(key)) {
          return {
            ...act,
            seleccionado: select,
            importeACobrar: select
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

  // Quick action: Select all overdue items with pending balance
  const handleSelectAllOverdue = () => {
    setActividades((prev) =>
      prev.map((act) => {
        if (act.esVencido && act.pendiente > 0.01) {
          return {
            ...act,
            seleccionado: true,
            importeACobrar: act.importeACobrar > 0 ? act.importeACobrar : act.pendiente,
          };
        }
        return act;
      })
    );
  };

  // Counts for badge indicators
  const totalVencidosCount = useMemo(() => {
    return actividades.filter((a) => a.esVencido && a.pendiente > 0.01).length;
  }, [actividades]);

  const totalProximosCount = useMemo(() => {
    return actividades.filter((a) => !a.esVencido && a.diasDiferencia <= 30 && a.pendiente > 0.01).length;
  }, [actividades]);

  const totalConSaldoCount = useMemo(() => {
    return actividades.filter((a) => a.pendiente > 0.01).length;
  }, [actividades]);

  // Filter & sort activities
  const filteredActividades = useMemo(() => {
    let result = [...actividades];

    // 1. Filter by mode
    if (filterMode === 'seleccionados') {
      result = result.filter((a) => a.seleccionado);
    } else if (filterMode === 'vencidos') {
      result = result.filter((a) => a.esVencido && a.pendiente > 0.01);
    } else if (filterMode === 'proximos') {
      result = result.filter((a) => !a.esVencido && a.diasDiferencia <= 30 && a.pendiente > 0.01);
    } else if (filterMode === 'con_saldo') {
      result = result.filter((a) => a.pendiente > 0.01);
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.codigo.toLowerCase().includes(q) ||
          a.descripcion.toLowerCase().includes(q) ||
          a.hitoNombre.toLowerCase().includes(q) ||
          (a.fechaPrevista && a.fechaPrevista.includes(q))
      );
    }

    // 3. Sorting
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'fecha') {
        // Sort by planned date; empty dates at the end
        if (!a.fechaPrevista && !b.fechaPrevista) cmp = 0;
        else if (!a.fechaPrevista) cmp = 1;
        else if (!b.fechaPrevista) cmp = -1;
        else cmp = a.fechaPrevista.localeCompare(b.fechaPrevista);
      } else if (sortBy === 'codigo') {
        cmp = a.codigo.localeCompare(b.codigo);
      } else if (sortBy === 'pendiente') {
        cmp = b.pendiente - a.pendiente;
      }

      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [actividades, filterMode, searchQuery, sortBy, sortOrder]);

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
          certId: a.certId,
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
        className="bg-[#0B1324] border border-slate-800 rounded-xl max-w-5xl w-full p-5 sm:p-6 shadow-2xl my-6 text-slate-200"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                {isEditMode ? 'Editar certificación' : 'Nueva certificación (multi-actividad)'}
              </h2>
              {totalVencidosCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  {totalVencidosCount} {totalVencidosCount === 1 ? 'vencido' : 'vencidos'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Una misma orden de compra puede cobrar varias actividades. Verifique las fechas límite de cada hito para certificar fácilmente los ítems vencidos o a vencer.
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
                required
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
                onChange={(e) => {
                  const newEstado = e.target.value;
                  setEstado(newEstado);
                  if (newEstado === 'Cobrado' && !fechaCobro) {
                    setFechaCobro(fechaPresentacion || new Date().toISOString().split('T')[0]);
                  }
                }}
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
              <div>
                <span className="font-semibold text-white text-sm">
                  {isEditMode ? 'Actividades incluidas en el certificado' : 'Actividades a cobrar'}
                </span>
                <span className="ml-2 text-xs text-sky-400 font-medium">
                  ({seleccionadasCount} seleccionadas de {actividades.length})
                </span>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar entregable, hito o fecha..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#080d19] border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Quick Filters Bar & Bulk Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#091122] p-2.5 rounded-lg border border-slate-800 mb-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3 text-slate-400" />
                  Filtrar:
                </span>

                <button
                  type="button"
                  onClick={() => setFilterMode('todos')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    filterMode === 'todos'
                      ? 'bg-sky-600 text-white font-semibold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Todos ({actividades.length})
                </button>

                <button
                  type="button"
                  onClick={() => setFilterMode('vencidos')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    filterMode === 'vencidos'
                      ? 'bg-rose-600 text-white font-semibold'
                      : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/40'
                  }`}
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>Vencidos ({totalVencidosCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterMode('proximos')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    filterMode === 'proximos'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-blue-950/40 text-blue-300 hover:bg-blue-900/60 border border-blue-800/40'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Próximos 30d ({totalProximosCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterMode('con_saldo')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    filterMode === 'con_saldo'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Con saldo ({totalConSaldoCount})
                </button>

                {isEditMode && seleccionadasCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilterMode('seleccionados')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      filterMode === 'seleccionados'
                        ? 'bg-sky-600 text-white font-semibold'
                        : 'bg-sky-950/40 text-sky-300 hover:bg-sky-900/60 border border-sky-800/40'
                    }`}
                  >
                    <CheckSquare className="w-3 h-3" />
                    <span>En este cert. ({seleccionadasCount})</span>
                  </button>
                )}
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-2">
                {totalVencidosCount > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllOverdue}
                    className="flex items-center gap-1 px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border border-rose-500/30 rounded-md text-[11px] font-semibold transition"
                    title="Marca automáticamente todos los hitos vencidos con saldo pendiente para certificar juntos"
                  >
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                    <span>Certificar todo lo vencido</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSelectFiltered(true)}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-[11px] font-medium transition"
                  title="Marcar todas las actividades de la vista actual"
                >
                  <CheckSquare className="w-3 h-3 text-sky-400" />
                  <span className="hidden sm:inline">Marcar visibles</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectFiltered(false)}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[11px] font-medium transition"
                  title="Desmarcar todas las actividades de la vista actual"
                >
                  <Square className="w-3 h-3 text-slate-400" />
                  <span className="hidden sm:inline">Desmarcar</span>
                </button>
              </div>
            </div>

            {/* Table with Date columns */}
            <div className="border border-slate-800 rounded-lg overflow-hidden max-h-72 overflow-y-auto bg-[#070c17]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#0b1426] text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="w-10 px-3 py-2 text-center">✓</th>
                    <th className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (sortBy === 'codigo') {
                            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                          } else {
                            setSortBy('codigo');
                            setSortOrder('asc');
                          }
                        }}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        <span>Entregable</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-3 py-2">Hito</th>
                    <th className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (sortBy === 'fecha') {
                            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                          } else {
                            setSortBy('fecha');
                            setSortOrder('asc');
                          }
                        }}
                        className="flex items-center justify-center gap-1 hover:text-white transition-colors w-full"
                      >
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        <span>Fecha Prevista</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-3 py-2 text-center">Estado / Plazo</th>
                    <th className="px-3 py-2 text-right">Valor hito</th>
                    <th className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (sortBy === 'pendiente') {
                            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                          } else {
                            setSortBy('pendiente');
                            setSortOrder('desc');
                          }
                        }}
                        className="flex items-center justify-end gap-1 hover:text-white transition-colors w-full"
                        title="Saldo disponible a certificar"
                      >
                        <span>Saldo dispon.</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-3 py-2 text-right w-36">Importe a cobrar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredActividades.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No se encontraron actividades con los filtros actuales.
                      </td>
                    </tr>
                  ) : (
                    filteredActividades.map((act) => {
                      const isZeroPendiente = act.pendiente <= 0.01;
                      const hasDate = Boolean(act.fechaPrevista);

                      return (
                        <tr
                          key={`${act.entregableId}_${act.hitoId}`}
                          className={`hover:bg-slate-800/40 transition ${
                            act.seleccionado ? 'bg-sky-950/25' : ''
                          } ${act.esVencido && !isZeroPendiente ? 'hover:bg-rose-950/15' : ''}`}
                        >
                          {/* Checkbox */}
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={act.seleccionado}
                              onChange={() => handleToggleSelect(act.entregableId, act.hitoId)}
                              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
                            />
                          </td>

                          {/* Entregable */}
                          <td className="px-3 py-2.5">
                            <div className="font-semibold text-white">{act.codigo}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[200px]" title={act.descripcion}>
                              {act.descripcion}
                            </div>
                          </td>

                          {/* Hito */}
                          <td className="px-3 py-2.5 text-slate-300">
                            <div className="font-medium text-slate-200">{act.hitoNombre}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {act.hitoPorcentaje.toFixed(2).replace('.', ',')}%
                            </div>
                          </td>

                          {/* Fecha Prevista */}
                          <td className="px-3 py-2.5 text-center whitespace-nowrap">
                            {hasDate ? (
                              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-200 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                                <Calendar className="w-3 h-3 text-sky-400" />
                                <span>{formatShortDate(act.fechaPrevista)}</span>
                              </div>
                            ) : (
                              <span className="text-slate-600 text-[11px]">—</span>
                            )}
                          </td>

                          {/* Estado / Plazo */}
                          <td className="px-3 py-2.5 text-center whitespace-nowrap">
                            {act.seleccionado ? (
                              <div className="inline-flex flex-col items-center gap-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950/70 text-sky-300 border border-sky-600/50">
                                  En este cert.
                                </span>
                                {act.esVencido && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-400">
                                    <AlertCircle className="w-2.5 h-2.5" />
                                    {Math.abs(act.diasDiferencia)}d atraso
                                  </span>
                                )}
                              </div>
                            ) : isZeroPendiente ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                                Certificado
                              </span>
                            ) : act.esVencido ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                <AlertCircle className="w-3 h-3 text-rose-400" />
                                {Math.abs(act.diasDiferencia)}d atraso
                              </span>
                            ) : hasDate ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                                act.diasDiferencia <= 7
                                  ? 'bg-amber-950/40 text-amber-300 border border-amber-700/40'
                                  : act.diasDiferencia <= 30
                                  ? 'bg-blue-950/40 text-blue-300 border border-blue-700/40'
                                  : 'bg-slate-800/80 text-slate-400'
                              }`}>
                                {act.diasDiferencia === 0 ? 'Vence hoy' : `En ${act.diasDiferencia}d`}
                              </span>
                            ) : (
                              <span className="text-slate-600 text-[11px]">Sin fecha</span>
                            )}
                          </td>

                          {/* Valor hito */}
                          <td className="px-3 py-2.5 text-right font-mono text-slate-300">
                            {formatCurrency(act.valorHito, '').trim()}
                          </td>

                          {/* Saldo disponible / Pendiente */}
                          <td
                            className={`px-3 py-2.5 text-right font-mono ${
                              act.seleccionado
                                ? 'text-sky-300 font-semibold'
                                : isZeroPendiente
                                ? 'text-emerald-400'
                                : act.esVencido
                                ? 'text-rose-400 font-bold'
                                : 'text-amber-400 font-semibold'
                            }`}
                          >
                            <div>{formatCurrency(act.pendiente, '').trim()}</div>
                            {act.seleccionado && act.importeACobrar < act.pendiente && (
                              <div className="text-[10px] text-sky-400/80 font-normal">
                                Resta: {formatCurrency(Math.max(0, act.pendiente - act.importeACobrar), '').trim()}
                              </div>
                            )}
                          </td>

                          {/* Importe a cobrar */}
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
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Total del certificado */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 px-1">
              <div className="text-xs text-slate-400 flex items-center gap-3">
                <span>
                  <strong className="text-white font-mono">{seleccionadasCount}</strong> actividades seleccionadas
                </span>
                {totalVencidosCount > 0 && (
                  <span className="text-rose-400 font-medium">
                    • {actividades.filter(a => a.seleccionado && a.esVencido).length} de {totalVencidosCount} vencidos seleccionados
                  </span>
                )}
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

