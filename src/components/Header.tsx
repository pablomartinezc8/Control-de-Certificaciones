import React, { useState } from 'react';
import { Proyecto, Empresa } from '../types';
import { 
  Building2, 
  Plus, 
  Palette, 
  Calendar, 
  Save, 
  Undo2, 
  ChevronDown,
  Check,
  Sparkles,
  Sun,
  Pencil,
  FolderEdit,
  ClipboardCheck
} from 'lucide-react';
import { EmpresasModal } from './EmpresasModal';

interface HeaderProps {
  proyectos: Proyecto[];
  proyectoActualId: string;
  onSelectProyecto: (id: string) => void;
  onAddProyecto: (nombre: string) => void;
  onRenameProyecto?: (id: string, nuevoNombre: string, nuevaEmpresa?: string) => void;
  onOpenNewCert: () => void;
  onSaveData: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onUpdateEmpresas: (empresas: Empresa[]) => void;
  themeStyle?: 'formal' | 'futurista';
  onToggleThemeStyle?: (style: 'formal' | 'futurista') => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  proyectos,
  proyectoActualId,
  onSelectProyecto,
  onAddProyecto,
  onRenameProyecto,
  onOpenNewCert,
  onSaveData,
  onUndo,
  canUndo,
  onUpdateEmpresas,
  themeStyle = 'formal',
  onToggleThemeStyle,
  activeTab,
  onSelectTab,
}) => {
  const [showNewProjModal, setShowNewProjModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showEmpresasModal, setShowEmpresasModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [editProjName, setEditProjName] = useState('');
  const [editEmpresaName, setEditEmpresaName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentProject = proyectos.find((p) => p.id === proyectoActualId) || proyectos[0];
  const empresasCount = currentProject?.empresas?.length || 1;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjName.trim()) {
      onAddProyecto(newProjName.trim());
      setNewProjName('');
      setShowNewProjModal(false);
    }
  };

  const handleManualSave = () => {
    onSaveData();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <header id="app-header" className={`no-print ${themeStyle === 'futurista' ? 'bg-[#060D1A] border-cyan-900/50 shadow-[0_4px_20px_rgba(0,112,243,0.15)]' : 'bg-[#0B1528] border-slate-800/80'} text-white border-b sticky top-0 z-30 shadow-md transition-colors duration-200`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Left Brand and Title */}
          <div className="flex items-center gap-4">
            {/* Logo de la empresa: Solo el triángulo azul sólido (#009BE5), sin recuadro ni dos colores */}
            <div className="flex items-center gap-2.5">
              <svg className="w-8 h-8 shrink-0" viewBox="0 0 32 32" fill="none">
                <polygon points="4,28 28,4 28,28" fill="#009BE5" />
              </svg>
              <div className="leading-tight">
                <div className="text-base font-black tracking-wider text-white">
                  TAGING
                </div>
                <div className="text-[9px] font-semibold tracking-widest text-slate-300 uppercase">
                  INGENIERÍA INTELIGENTE
                </div>
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-700/60" />

            {/* Title & Subtitle */}
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
                Control de Certificaciones
              </h1>
              <p className="text-xs text-slate-400 mt-1 hidden sm:block">
                Proyección, certificación real y seguimiento económico
              </p>
            </div>
          </div>

          {/* Right Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Project Switcher Pill with Edit and Add actions */}
            <div className="flex items-center gap-1">
              <div className="relative inline-flex items-center bg-white text-slate-900 rounded-lg px-3 py-1.5 shadow-xs border border-slate-200">
                <Building2 className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
                <select
                  value={proyectoActualId}
                  onChange={(e) => onSelectProyecto(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-900 pr-5 focus:outline-none cursor-pointer appearance-none max-w-[170px] truncate"
                  title="Cambiar proyecto activo"
                >
                  {proyectos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 pointer-events-none" />
              </div>

              {/* Botón Modificar / Configurar Nombre del Proyecto y Empresa */}
              <button
                type="button"
                onClick={() => {
                  setEditProjName(currentProject?.nombre || '');
                  setEditEmpresaName(currentProject?.empresas?.[0]?.nombre || '');
                  setShowRenameModal(true);
                }}
                id="btn-renombrar-proyecto"
                title="Configurar proyecto y empresa cliente"
                className="flex items-center justify-center p-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="sr-only">Configurar proyecto</span>
              </button>

              {/* Botón Nuevo Proyecto */}
              <button
                type="button"
                onClick={() => setShowNewProjModal(true)}
                id="btn-nuevo-proyecto"
                title="Crear nuevo proyecto"
                className="flex items-center justify-center p-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="sr-only">Nuevo proyecto</span>
              </button>
            </div>

            {/* Empresas Button */}
            <button
              type="button"
              onClick={() => setShowEmpresasModal(true)}
              id="btn-empresas"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700/90 text-white text-xs font-medium rounded-lg border border-slate-700 shadow-xs transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-300" />
              <span>Empresas ({empresasCount})</span>
            </button>

            {/* Nueva Certificación Button */}
            <button
              type="button"
              onClick={onOpenNewCert}
              id="btn-nueva-certificacion"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-slate-900" />
              <span>Nueva certificación</span>
            </button>

            {/* Modo Campo / Inspección Button (Móvil / Tablet / Terreno) */}
            {onSelectTab && (
              <button
                type="button"
                onClick={() => onSelectTab(activeTab === 'modo_campo' ? 'dashboard' : 'modo_campo')}
                id="btn-toggle-modo-campo"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-xs transition-colors ${
                  activeTab === 'modo_campo'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black ring-2 ring-emerald-300'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500/50'
                }`}
                title={activeTab === 'modo_campo' ? 'Volver al tablero principal' : 'Abrir Modo Campo / Inspección optimizado para celulares y tablets'}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>{activeTab === 'modo_campo' ? 'Salir de Campo' : 'Modo Campo 👷'}</span>
              </button>
            )}

            {/* Tema de página / Selector de Estilo */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                id="btn-tema-pagina"
                title="Tema de página"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-lg shadow-xs transition-colors ${
                  themeStyle === 'futurista'
                    ? 'bg-cyan-600 hover:bg-cyan-500 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>{themeStyle === 'futurista' ? 'Estilo oscuro' : 'Estilo blanco'}</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {showColorPicker && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2.5 z-50 text-slate-800 dark:text-slate-100 text-xs space-y-2.5">
                  <div>
                    <div className="font-bold text-slate-400 dark:text-slate-500 px-2 py-0.5 uppercase text-[10px] tracking-wider">
                      Tema de página
                    </div>
                    <div className="mt-1 space-y-1">
                      {/* Blanco Formal Option */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onToggleThemeStyle) onToggleThemeStyle('formal');
                          setShowColorPicker(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                          themeStyle === 'formal'
                            ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-amber-500" />
                          <div>
                            <div className="font-medium">Estilo blanco</div>
                            <div className="text-[10px] text-slate-400 font-normal">Formal y corporativo limpio</div>
                          </div>
                        </div>
                        {themeStyle === 'formal' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>

                      {/* Azules Futuristas / Estilo Oscuro Option */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onToggleThemeStyle) onToggleThemeStyle('futurista');
                          setShowColorPicker(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                          themeStyle === 'futurista'
                            ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                          <div>
                            <div className="font-medium">Estilo oscuro</div>
                            <div className="text-[10px] text-cyan-500 dark:text-cyan-400 font-normal">Azules futuristas cyber tech</div>
                          </div>
                        </div>
                        {themeStyle === 'futurista' && <Check className="w-3.5 h-3.5 text-cyan-500" />}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2">
                    <div className="font-bold text-slate-400 dark:text-slate-500 px-2 py-0.5 uppercase text-[10px] tracking-wider">
                      Acento de Marca
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {[
                        { id: 'blue', label: 'Azul Taging', color: 'bg-blue-600' },
                        { id: 'emerald', label: 'Verde Esmeralda', color: 'bg-emerald-600' },
                        { id: 'indigo', label: 'Índigo Moderno', color: 'bg-indigo-600' },
                        { id: 'purple', label: 'Púrpura Deep', color: 'bg-purple-600' },
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => {
                            if (currentProject?.empresas?.[0]) {
                              const updated = [...currentProject.empresas];
                              updated[0] = { ...updated[0], color: theme.id };
                              onUpdateEmpresas(updated);
                            }
                            setShowColorPicker(false);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors"
                        >
                          <span className={`w-3 h-3 rounded-full ${theme.color}`} />
                          <span className="text-xs">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Calendar Icon Button */}
            <button
              type="button"
              className="p-2 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              title="Calendario de corte"
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>

            {/* Guardar Button */}
            <button
              type="button"
              onClick={handleManualSave}
              id="btn-guardar-header"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-slate-700" />
              <span>Guardar</span>
            </button>

            {/* Deshacer Button */}
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              id="btn-deshacer-header"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:pointer-events-none text-slate-900 text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5 text-slate-700" />
              <span>Deshacer</span>
            </button>

            {/* Auto save indicator */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-1">
              <span className={`w-2 h-2 rounded-full ${saveSuccess ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
              <span className="text-[11px] hidden sm:inline text-slate-300">
                {saveSuccess ? '¡Guardado con éxito!' : 'Guardado automáticamente'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nueva Empresa */}
      <EmpresasModal
        isOpen={showEmpresasModal}
        onClose={() => setShowEmpresasModal(false)}
        empresas={currentProject?.empresas || []}
        onSaveEmpresas={onUpdateEmpresas}
      />

      {/* Modal Nuevo Proyecto */}
      {showNewProjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold mb-4 text-slate-900">Crear Nuevo Proyecto</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="Ej: Proyecto Minero Expansión"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500"
                >
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modificar Nombre del Proyecto y Empresa Mandante */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <FolderEdit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Configurar Proyecto</h3>
                <p className="text-xs text-slate-500">Modifica el nombre del proyecto y la empresa con la que se trabaja</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editProjName.trim() && onRenameProyecto) {
                  onRenameProyecto(currentProject.id, editProjName.trim(), editEmpresaName.trim());
                  setShowRenameModal(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  value={editProjName}
                  onChange={(e) => setEditProjName(e.target.value)}
                  placeholder="Ej: Cabinas Filtro Prensa VEL"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Empresa / Mandante con la que se trabaja
                </label>
                <input
                  type="text"
                  value={editEmpresaName}
                  onChange={(e) => setEditEmpresaName(e.target.value)}
                  placeholder="Ej: VEL, Minera Escondida, Techint..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Este nombre reemplaza a &quot;Taging&quot; en la pestaña principal de entregables (ej: &quot;VEL (33)&quot;) y en los encabezados.
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Identificador interno:</span>
                  <span className="font-mono text-slate-700 font-semibold">{currentProject.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Entregables asociados:</span>
                  <span className="text-slate-800 font-semibold">{currentProject.entregables?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Empresas registradas:</span>
                  <span className="text-slate-800 font-semibold">{empresasCount}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!editProjName.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
