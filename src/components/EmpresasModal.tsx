import React, { useState } from 'react';
import { Empresa } from '../types';
import { Building2, Plus, Trash2, X, Check } from 'lucide-react';

interface EmpresasModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresas: Empresa[];
  onSaveEmpresas: (empresas: Empresa[]) => void;
}

const COLOR_OPTIONS = [
  { label: 'Azul (Taging)', value: 'blue', bg: 'bg-blue-600', text: 'text-blue-600' },
  { label: 'Verde Esmeralda', value: 'emerald', bg: 'bg-emerald-600', text: 'text-emerald-600' },
  { label: 'Índigo', value: 'indigo', bg: 'bg-indigo-600', text: 'text-indigo-600' },
  { label: 'Púrpura', value: 'purple', bg: 'bg-purple-600', text: 'text-purple-600' },
  { label: 'Ámbar / Naranja', value: 'amber', bg: 'bg-amber-600', text: 'text-amber-600' },
  { label: 'Rojo Carmesí', value: 'rose', bg: 'bg-rose-600', text: 'text-rose-600' },
];

export const EmpresasModal: React.FC<EmpresasModalProps> = ({
  isOpen,
  onClose,
  empresas,
  onSaveEmpresas,
}) => {
  const [list, setList] = useState<Empresa[]>(empresas);
  const [newNombre, setNewNombre] = useState('');
  const [newColor, setNewColor] = useState('blue');

  React.useEffect(() => {
    setList(empresas);
  }, [empresas]);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) return;
    const newEmp: Empresa = {
      id: `emp_${Date.now()}`,
      nombre: newNombre.trim(),
      color: newColor,
    };
    const updated = [...list, newEmp];
    setList(updated);
    setNewNombre('');
    onSaveEmpresas(updated);
  };

  const handleRemove = (id: string) => {
    if (list.length <= 1) {
      alert('Debe existir al menos una empresa en el proyecto.');
      return;
    }
    const updated = list.filter((e) => e.id !== id);
    setList(updated);
    onSaveEmpresas(updated);
  };

  const handleUpdateColor = (id: string, color: string) => {
    const updated = list.map((e) => (e.id === id ? { ...e, color } : e));
    setList(updated);
    onSaveEmpresas(updated);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Empresas del Proyecto</h3>
              <p className="text-xs text-slate-500">Configuración de empresas contratistas y colores de identificación</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of companies */}
        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
          {list.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
            >
              <div className="flex items-center gap-3">
                <span className={`w-3.5 h-3.5 rounded-full ${
                  emp.color === 'blue' ? 'bg-blue-600' :
                  emp.color === 'emerald' ? 'bg-emerald-600' :
                  emp.color === 'indigo' ? 'bg-indigo-600' :
                  emp.color === 'purple' ? 'bg-purple-600' :
                  emp.color === 'amber' ? 'bg-amber-600' : 'bg-rose-600'
                }`} />
                <div>
                  <div className="text-sm font-semibold text-slate-900">{emp.nombre}</div>
                  <div className="text-[11px] text-slate-500">ID: {emp.id}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={emp.color}
                  onChange={(e) => handleUpdateColor(emp.id, e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium"
                >
                  {COLOR_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleRemove(emp.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Eliminar empresa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new company */}
        <form onSubmit={handleAdd} className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-2">Agregar nueva empresa</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newNombre}
              onChange={(e) => setNewNombre(e.target.value)}
              placeholder="Nombre de la empresa..."
              className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              {COLOR_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!newNombre.trim()}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar</span>
            </button>
          </div>
        </form>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
