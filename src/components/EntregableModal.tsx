import React, { useState, useEffect } from 'react';
import { Entregable, Empresa, Hito } from '../types';
import { normalizeDate, addDays } from '../utils/calculations';
import { X, Calendar } from 'lucide-react';

interface EntregableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entregable: Entregable) => void;
  initialEntregable?: Entregable | null;
  empresas: Empresa[];
}

export const EntregableModal: React.FC<EntregableModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEntregable,
  empresas,
}) => {
  const [formData, setFormData] = useState<Partial<Entregable>>({
    empresaId: empresas[0]?.id || 'emp_taging',
    codigo: '',
    descripcion: '',
    categoria: '',
    valorTotal: 0,
    fechaBase: new Date().toISOString().split('T')[0],
    tipoDistribucion: 'estandar',
    ordenCompra: '',
    incluirCurva: true,
    esCHO: false,
    porcentajes: {
      emisionB: 60,
      emision0: 30,
      restante: 10,
    },
    diasRevision: 21,
    intervaloCert: 15,
    fechaFinProyecto: '2026-12-31',
    observaciones: '',
  });

  useEffect(() => {
    if (initialEntregable) {
      setFormData({
        ...initialEntregable,
        fechaBase: normalizeDate(initialEntregable.fechaBase) || '',
        fechaFinProyecto: normalizeDate(initialEntregable.fechaFinProyecto) || '2026-12-31',
        diasRevision: initialEntregable.diasRevision ?? 21,
        intervaloCert: initialEntregable.intervaloCert ?? 15,
        tipoDistribucion: initialEntregable.tipoDistribucion || 'estandar',
        porcentajes: initialEntregable.porcentajes || {
          emisionB: 60,
          emision0: 30,
          restante: 10,
        },
      });
    } else {
      setFormData({
        empresaId: empresas[0]?.id || 'emp_taging',
        codigo: '',
        descripcion: '',
        categoria: '',
        valorTotal: 0,
        fechaBase: new Date().toISOString().split('T')[0],
        tipoDistribucion: 'estandar',
        ordenCompra: '',
        incluirCurva: true,
        esCHO: false,
        porcentajes: {
          emisionB: 60,
          emision0: 30,
          restante: 10,
        },
        diasRevision: 21,
        intervaloCert: 15,
        fechaFinProyecto: '2026-12-31',
        observaciones: '',
      });
    }
  }, [initialEntregable, isOpen, empresas]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isPagoUnico = formData.tipoDistribucion === 'pago_unico';
    const fBase = formData.fechaBase || '';
    const dRev = Number(formData.diasRevision) || 0;
    const dInt = Number(formData.intervaloCert) || 15;
    const fFin = formData.fechaFinProyecto || '2026-12-31';

    // Calculate dates
    const dateEmisionB = addDays(fBase, dRev);
    const dateEmision0 = addDays(dateEmisionB, dInt);
    const dateRestante = fFin;

    let updatedHitos: Hito[] = [];

    if (isPagoUnico) {
      updatedHitos = [
        {
          id: initialEntregable?.hitos?.[0]?.id || `hito_${Date.now()}_pu`,
          nombre: 'Pago único',
          porcentaje: 100,
          reglaFecha: 'pago_unico',
          diasAdicionales: 0,
          fechaManual: fBase,
          certificados: initialEntregable?.hitos?.[0]?.certificados || [],
        },
      ];
    } else {
      const pctB = formData.porcentajes?.emisionB ?? 60;
      const pct0 = formData.porcentajes?.emision0 ?? 30;
      const pctRest = formData.porcentajes?.restante ?? 10;

      updatedHitos = [
        {
          id: initialEntregable?.hitos?.[0]?.id || `hito_${Date.now()}_b`,
          nombre: 'Emisión B',
          porcentaje: pctB,
          reglaFecha: 'emision_b',
          diasAdicionales: dRev,
          fechaManual: dateEmisionB,
          certificados: initialEntregable?.hitos?.[0]?.certificados || [],
        },
        {
          id: initialEntregable?.hitos?.[1]?.id || `hito_${Date.now()}_0`,
          nombre: 'Emisión 0',
          porcentaje: pct0,
          reglaFecha: 'emision_0',
          diasAdicionales: dInt,
          fechaManual: dateEmision0,
          certificados: initialEntregable?.hitos?.[1]?.certificados || [],
        },
        {
          id: initialEntregable?.hitos?.[2]?.id || `hito_${Date.now()}_c`,
          nombre: 'Restante Final',
          porcentaje: pctRest,
          reglaFecha: 'cierre',
          diasAdicionales: 0,
          fechaManual: dateRestante,
          certificados: initialEntregable?.hitos?.[2]?.certificados || [],
        },
      ];
    }

    const entregableToSave: Entregable = {
      id: initialEntregable?.id || `ent_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      empresaId: formData.empresaId || empresas[0]?.id || 'emp_taging',
      codigo: formData.codigo?.trim() || 'S/C',
      descripcion: formData.descripcion?.trim() || '',
      categoria: formData.categoria?.trim() || 'Ingeniería',
      valorTotal: Number(formData.valorTotal) || 0,
      fechaBase: fBase,
      tipoDistribucion: formData.tipoDistribucion || 'estandar',
      porcentajes: formData.porcentajes || { emisionB: 60, emision0: 30, restante: 10 },
      intervaloCert: dInt,
      diasRevision: dRev,
      fechaFinProyecto: fFin,
      hitos: updatedHitos,
      incluirCurva: formData.incluirCurva ?? true,
      esCHO: formData.esCHO ?? false,
      ordenCompra: formData.ordenCompra?.trim() || '',
      observaciones: formData.observaciones || '',
    };

    onSave(entregableToSave);
    onClose();
  };

  return (
    <div
      id="entregable-modal-backdrop"
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <div
        id="entregable-modal-card"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-6 text-slate-800 dark:text-slate-100"
      >
        {/* Header matching Base44 screenshot 2 */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {initialEntregable ? 'Editar entregable' : 'Nuevo entregable'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
          {/* Fila 1: Empresa & ID / código contractual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Empresa
              </label>
              <select
                value={formData.empresaId}
                onChange={(e) => setFormData({ ...formData, empresaId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              >
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                ID / código contractual
              </label>
              <input
                type="text"
                required
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="B2.0001.01"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              >
              </input>
            </div>
          </div>

          {/* Fila 2: Descripción */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Descripción
            </label>
            <input
              type="text"
              required
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder=""
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
          </div>

          {/* Fila 3: Categoría / disciplina & Valor total */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Categoría / disciplina
              </label>
              <input
                type="text"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                placeholder="Ingeniería, Gerencia y Costos..."
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Valor total
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.valorTotal || 0}
                onChange={(e) => setFormData({ ...formData, valorTotal: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>
          </div>

          {/* Fila 4: Fecha base / entrega & Tipo de distribución */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Fecha base / entrega
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.fechaBase}
                  onChange={(e) => setFormData({ ...formData, fechaBase: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Tipo de distribución
              </label>
              <select
                value={formData.tipoDistribucion}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    tipoDistribucion: val,
                    porcentajes:
                      val === 'pago_unico'
                        ? { emisionB: 100, emision0: 0, restante: 0 }
                        : { emisionB: 60, emision0: 30, restante: 10 },
                  });
                }}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              >
                <option value="estandar">Estándar 60/30/10</option>
                <option value="pago_unico">Pago único 100%</option>
              </select>
            </div>
          </div>

          {/* Fila 5: Orden de compra */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Orden de compra
            </label>
            <input
              type="text"
              value={formData.ordenCompra || ''}
              onChange={(e) => setFormData({ ...formData, ordenCompra: e.target.value })}
              placeholder=""
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
          </div>

          {/* Fila 6: Checkboxes (Incluir en la curva, Marcar como CHO) */}
          <div className="flex items-center gap-6 py-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.incluirCurva}
                onChange={(e) => setFormData({ ...formData, incluirCurva: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
              />
              <span>Incluir en la curva</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.esCHO}
                onChange={(e) => setFormData({ ...formData, esCHO: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
              />
              <span>Marcar como CHO</span>
            </label>
          </div>

          {/* Fila 7: Porcentajes (solo si tipoDistribucion !== 'pago_unico') */}
          {formData.tipoDistribucion !== 'pago_unico' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  % Emisión B
                </label>
                <input
                  type="number"
                  value={formData.porcentajes?.emisionB}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      porcentajes: {
                        emisionB: Number(e.target.value) || 0,
                        emision0: formData.porcentajes?.emision0 ?? 30,
                        restante: formData.porcentajes?.restante ?? 10,
                      },
                    })
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  % Emisión 0
                </label>
                <input
                  type="number"
                  value={formData.porcentajes?.emision0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      porcentajes: {
                        emisionB: formData.porcentajes?.emisionB ?? 60,
                        emision0: Number(e.target.value) || 0,
                        restante: formData.porcentajes?.restante ?? 10,
                      },
                    })
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  % Restante Final
                </label>
                <input
                  type="number"
                  value={formData.porcentajes?.restante}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      porcentajes: {
                        emisionB: formData.porcentajes?.emisionB ?? 60,
                        emision0: formData.porcentajes?.emision0 ?? 30,
                        restante: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
            </div>
          )}

          {/* Fila 8: Días de revisión, Intervalo, Fecha fin proyecto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Días de revisión (doc. → cobro)
              </label>
              <input
                type="number"
                value={formData.diasRevision}
                onChange={(e) => setFormData({ ...formData, diasRevision: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Intervalo entre cert. (días)
              </label>
              <input
                type="number"
                value={formData.intervaloCert}
                onChange={(e) => setFormData({ ...formData, intervaloCert: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Fecha fin proyecto (Restante)
              </label>
              <input
                type="date"
                value={formData.fechaFinProyecto}
                onChange={(e) => setFormData({ ...formData, fechaFinProyecto: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>
          </div>

          {/* Fila 9: Observaciones */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Observaciones
            </label>
            <textarea
              rows={3}
              value={formData.observaciones || ''}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder=""
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition resize-none"
            />
          </div>

          {/* Footer buttons matching Screenshot 2 */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#172554] hover:bg-[#1e3a8a] text-white rounded-lg font-medium shadow-sm transition"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
