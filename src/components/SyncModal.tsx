import React, { useState } from 'react';
import { AppData } from '../types';
import { 
  X, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  AlertTriangle, 
  GitBranch, 
  FileCode2,
  Terminal
} from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  onImportData: (data: AppData) => void;
  onResetToDefault: () => void;
  defaultTab?: 'json' | 'vercel';
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  appData,
  onImportData,
  onResetToDefault,
  defaultTab = 'json',
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'vercel'>(defaultTab);
  const [jsonInput, setJsonInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const currentJsonString = JSON.stringify(appData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proyectos_base44_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportText = () => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.proyectos || !Array.isArray(parsed.proyectos)) {
        throw new Error('El JSON no contiene el arreglo "proyectos" requerido.');
      }
      onImportData(parsed);
      setSuccessMessage('¡Datos importados y restaurados correctamente!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(`Error al procesar JSON: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    setSuccessMessage('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.proyectos || !Array.isArray(parsed.proyectos)) {
          throw new Error('El JSON no contiene el arreglo "proyectos" requerido.');
        }
        onImportData(parsed);
        setSuccessMessage('¡Archivo importado con éxito!');
        setTimeout(() => {
          onClose();
        }, 1200);
      } catch (err: any) {
        setErrorMessage(`Error al leer archivo: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-3xl w-full p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-blue-500" />
              <span>Sincronización JSON, GitHub & Vercel</span>
            </h3>
            <p className="text-xs text-slate-500">
              Exporta o importa el esquema completo de Base44 y sincroniza tu flujo de despliegue.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mt-4">
          <button
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'json'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Importar / Exportar JSON
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'vercel'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Guía Despliegue GitHub & Vercel
          </button>
        </div>

        {/* Tab Content: JSON Sync */}
        {activeTab === 'json' ? (
          <div className="mt-4 space-y-4">
            {/* Notifications */}
            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-lg text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Export Section */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Exportar Datos Actuales
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Descarga el archivo .json para respaldar o sincronizar con tu repositorio.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 rounded-md text-xs font-medium transition-colors text-slate-700 dark:text-slate-200"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar JSON</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Import Section */}
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                Restaurar / Importar Nuevo JSON
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Pega el código JSON de Base44 o sube un archivo respaldado (.json):
              </p>

              <div className="mb-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300 cursor-pointer"
                />
              </div>

              <textarea
                rows={6}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='Pega aquí tu JSON: { "proyectos": [ ... ] }'
                className="w-full p-2.5 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              ></textarea>

              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={onResetToDefault}
                  type="button"
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Restablecer al JSON original de Base44
                </button>

                <button
                  onClick={handleImportText}
                  disabled={!jsonInput.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Cargar JSON</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Tab Content: Vercel & GitHub Guide */
          <div className="mt-4 space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl">
              <h4 className="font-bold text-purple-900 dark:text-purple-300 text-sm flex items-center gap-1.5">
                <GitBranch className="w-4 h-4" />
                <span>Flujo de Trabajo: Google AI Studio ➔ GitHub ➔ Vercel</span>
              </h4>
              <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                Este proyecto ya está configurado con <strong>Vite</strong>, <strong>Tailwind CSS</strong>, y un archivo <code>vercel.json</code> listo para despliegues continuos sin errores de enrutamiento SPA.
              </p>
            </div>

            <div className="space-y-3">
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Paso 1: Exportar o Sincronizar el Repositorio
                </span>
                <p className="text-slate-500">
                  En el menú de Google AI Studio (esquina superior derecha), haz clic en <strong>Export</strong> ➔ <strong>Export to GitHub</strong> o descarga el <strong>ZIP</strong> del proyecto.
                </p>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Paso 2: Conectar con Vercel
                </span>
                <p className="text-slate-500 mb-2">
                  1. Entra a tu panel de <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-blue-500 underline">Vercel</a>.<br />
                  2. Haz clic en <strong>Add New Project</strong> y selecciona tu repositorio de GitHub.<br />
                  3. Vercel detectará automáticamente <strong>Framework: Vite</strong> y el comando <code>npm run build</code> con directorio de salida <code>dist</code>.
                </p>
                <div className="bg-slate-900 text-slate-200 p-2.5 rounded font-mono text-[11px] space-y-1">
                  <div>Framework Preset: Vite</div>
                  <div>Build Command: npm run build</div>
                  <div>Output Directory: dist</div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Paso 3: Archivo de Configuración de Vercel Incluido
                </span>
                <p className="text-slate-500 mb-2">
                  El archivo <code>vercel.json</code> ya fue generado en la raíz del proyecto para manejar el enrutamiento directo:
                </p>
                <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded font-mono text-[11px] overflow-x-auto">
{`{
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 mt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
