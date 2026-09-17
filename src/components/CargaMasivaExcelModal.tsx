import React, { useState, useRef } from 'react';
import { Proyecto, Entregable } from '../types';
import { 
  downloadExcelTemplate, 
  parseExcelData, 
  ParsedBulkImportResult 
} from '../utils/excel';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  Layers, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface CargaMasivaExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  proyecto: Proyecto;
  onApplyImport: (newOrUpdatedEntregables: Entregable[], mode: 'merge' | 'replace') => void;
}

export const CargaMasivaExcelModal: React.FC<CargaMasivaExcelModalProps> = ({
  isOpen,
  onClose,
  proyecto,
  onApplyImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParsedBulkImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const result = await parseExcelData(selectedFile, proyecto);
      setParseResult(result);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al procesar el archivo Excel.');
      setParseResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleConfirmImport = () => {
    if (!parseResult || parseResult.groupedEntregables.length === 0) return;
    onApplyImport(parseResult.groupedEntregables, importMode);
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-carga-masiva-title"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-carga-masiva-title" className="text-base font-bold text-white">
                Carga Masiva de Datos por Excel
              </h2>
              <p className="text-xs text-slate-400">
                Importa o actualiza múltiples entregables e hitos a partir de un archivo Excel (.xlsx o .xls)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadExcelTemplate(proyecto)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition"
              title="Descargar plantilla de Excel vacía con ejemplos"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Descargar Plantilla</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* File Upload Zone */}
          {!parseResult ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-emerald-500/70 bg-slate-950/50 hover:bg-slate-950 rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3"
            >
              <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">
                  Arrastra tu archivo Excel aquí o haz clic para seleccionarlo
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Formatos compatibles: .xlsx, .xls • Hasta 5,000 registros
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileChange(f);
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{file?.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {parseResult.totalRows} filas leídas • {parseResult.groupedEntregables.length} entregables listos
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 hover:bg-rose-950/30 rounded-lg transition"
              >
                Cambiar archivo
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-800/80 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Results Preview */}
          {parseResult && (
            <div className="space-y-4">
              {/* Metric stats banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-400">Total Filas</div>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">
                    {parseResult.totalRows}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-400">Nuevos Entregables</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                    +{parseResult.newDeliverablesCount}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-400">Actualizaciones</div>
                  <div className="text-lg font-bold text-sky-400 font-mono mt-0.5">
                    {parseResult.updatedDeliverablesCount}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-400">Importe Total de OC</div>
                  <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                    {formatCurrency(parseResult.totalValue)}
                  </div>
                </div>
              </div>

              {/* Warnings / Notices */}
              {parseResult.errors.length > 0 && (
                <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Advertencias encontradas en la planilla:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-200">
                    {parseResult.errors.slice(0, 4).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {parseResult.errors.length > 4 && (
                      <li>...y {parseResult.errors.length - 4} advertencias más.</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">
                    Vista previa de datos a importar ({parseResult.groupedEntregables.length} entregables)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Mostrando las primeras filas
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/80 text-slate-400 sticky top-0 border-b border-slate-800 font-semibold">
                      <tr>
                        <th className="px-3 py-2 w-24">ID</th>
                        <th className="px-3 py-2 min-w-[200px]">Descripción</th>
                        <th className="px-3 py-2 text-right">Valor Total</th>
                        <th className="px-3 py-2">Hitos</th>
                        <th className="px-3 py-2 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {parseResult.groupedEntregables.map((ent) => {
                        const isExisting = proyecto.entregables.some(
                          (e) => e.codigo.toLowerCase().trim() === ent.codigo.toLowerCase().trim()
                        );
                        return (
                          <tr key={ent.id} className="hover:bg-slate-800/30">
                            <td className="px-3 py-2 font-mono font-bold text-white">
                              {ent.codigo}
                            </td>
                            <td className="px-3 py-2">
                              <div className="truncate max-w-xs">{ent.descripcion}</div>
                              <div className="text-[10px] text-slate-500">
                                {ent.categoria || 'General'}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-200">
                              {formatCurrency(ent.valorTotal)}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-slate-400">
                              {ent.hitos.map((h) => `${h.nombre} (${h.porcentaje}%)`).join(', ')}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {isExisting ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-950 text-sky-400 border border-sky-800/60">
                                  Actualizar
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                                  Nuevo
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Import Mode Selection */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-white">Modo de integración al proyecto</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label 
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                      importMode === 'merge'
                        ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="mt-0.5 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">Fusionar / Actualizar (Recomendado)</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Agrega entregables nuevos y actualiza los existentes conservando los certificados cargados previamente.
                      </div>
                    </div>
                  </label>

                  <label 
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                      importMode === 'replace'
                        ? 'bg-amber-950/30 border-amber-500/60 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">Reemplazar todos los entregables</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Sustituye la lista completa del proyecto con los entregables de este archivo Excel.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={!parseResult || parseResult.groupedEntregables.length === 0}
            onClick={handleConfirmImport}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg shadow-sm transition ${
              parseResult && parseResult.groupedEntregables.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Aplicar e Importar al Proyecto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
