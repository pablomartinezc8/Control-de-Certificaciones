import React, { useState } from 'react';
import { AppData, Proyecto } from '../types';
import { 
  Upload, 
  Download, 
  FileCode, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  FileSpreadsheet,
  FileDown
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { exportProjectToExcel, downloadExcelTemplate } from '../utils/excel';

interface ImportarExportarViewProps {
  appData: AppData;
  onImportJSON: (jsonString: string) => boolean;
  onDownloadJSON: () => void;
  onResetData: () => void;
  onOpenVercelGuide: () => void;
  onOpenCargaMasivaExcel?: () => void;
}

export const ImportarExportarView: React.FC<ImportarExportarViewProps> = ({
  appData,
  onImportJSON,
  onDownloadJSON,
  onResetData,
  onOpenVercelGuide,
  onOpenCargaMasivaExcel,
}) => {
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const ok = onImportJSON(content);
        if (ok) {
          setStatusMsg({ type: 'success', text: `Archivo "${file.name}" cargado e importado con éxito.` });
        } else {
          setStatusMsg({ type: 'error', text: 'El archivo no contiene un formato de datos válido.' });
        }
      } catch (err: any) {
        setStatusMsg({ type: 'error', text: `Error al leer archivo: ${err?.message}` });
      }
    };
    reader.readAsText(file);
  };

  const currentProject = appData.proyectos.find((p) => p.id === appData.proyectoActual) || appData.proyectos[0];
  const totalEntregables = currentProject?.entregables?.length || 0;
  let totalCerts = 0;
  currentProject?.entregables?.forEach((e) => {
    e.hitos?.forEach((h) => {
      totalCerts += h.certificados?.length || 0;
    });
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Proyecto Actual en Memoria</div>
          <div className="mt-2 text-xl font-bold text-slate-900">{currentProject?.nombre || 'TAGING'}</div>
          <div className="mt-1 text-[11px] text-slate-400">
            {totalEntregables} entregables • {totalCerts} certificados
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Compatibilidad Base44</div>
          <div className="mt-2 text-xl font-bold text-emerald-600">100% Sincronizado</div>
          <div className="mt-1 text-[11px] text-slate-400">
            Estructura de hitos, fechas de corte y gastos
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Despliegue Continuo</div>
          <div className="mt-2 text-xl font-bold text-purple-600">GitHub & Vercel</div>
          <div className="mt-1 text-[11px] text-purple-600/80 cursor-pointer hover:underline" onClick={onOpenVercelGuide}>
            Configuración lista para exportar →
          </div>
        </div>
      </div>

      {/* Excel Bulk Management Panel */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Carga Masiva y Exportación a Excel (.xlsx)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Administra todas las actividades e hitos del proyecto por lotes utilizando planillas de cálculo Excel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => downloadExcelTemplate(currentProject)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
              title="Descargar plantilla de Excel vacía con ejemplos"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-600" />
              <span>Plantilla Excel</span>
            </button>

            <button
              type="button"
              onClick={() => exportProjectToExcel(currentProject)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg transition-colors"
              title="Descargar todas las actividades e hitos a Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar a Excel</span>
            </button>

            {onOpenCargaMasivaExcel && (
              <button
                type="button"
                onClick={onOpenCargaMasivaExcel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Cargar Planilla Excel</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-semibold text-slate-900 mb-1">1. Descarga la plantilla</div>
            <p className="text-[11px] text-slate-500">
              Usa el formato preconfigurado con columnas para ID, hitos, porcentajes y fechas.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-semibold text-slate-900 mb-1">2. Completa tus actividades</div>
            <p className="text-[11px] text-slate-500">
              Puedes cargar entregables nuevos o actualizar los existentes en bloque.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-semibold text-slate-900 mb-1">3. Carga y previsualiza</div>
            <p className="text-[11px] text-slate-500">
              Revisa los importes y datos antes de confirmar la importación a Base44.
            </p>
          </div>
        </div>
      </div>

      {/* Compact JSON Backup & Restore Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-600" />
              Copia de Seguridad y Archivo JSON
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Descarga o carga el archivo JSON con todas las configuraciones, entregables y proyectos del sistema.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Cargar Archivo .json</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              type="button"
              onClick={onDownloadJSON}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
              title="Descargar copia de seguridad en archivo .json"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .json</span>
            </button>

            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-600 border border-slate-200 text-xs font-semibold rounded-lg transition-colors"
              title="Restablecer datos originales"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Datos</span>
            </button>
          </div>
        </div>

        {/* Status notification */}
        {statusMsg && (
          <div className={`mt-3 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
            statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {statusMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </div>

      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={showResetModal}
        title="Restablecer Datos del Proyecto"
        message="¿Estás seguro de que deseas restablecer todos los datos al archivo JSON original importado de Base44? Se perderán las modificaciones locales no exportadas."
        confirmText="Restablecer Todo"
        confirmVariant="danger"
        onConfirm={() => {
          onResetData();
          setShowResetModal(false);
          setStatusMsg({ type: 'success', text: 'Datos restablecidos exitosamente al estado inicial de Base44.' });
        }}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
};
