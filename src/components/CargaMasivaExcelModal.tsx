import React, { useState, useRef } from 'react';
import { Proyecto, Entregable } from '../types';
import { 
  downloadExcelTemplate, 
  exportProjectToExcel,
  analyzeExcelWorkbook, 
  parseExcelWithMapping, 
  ParsedBulkImportResult, 
  WorkbookAnalysis, 
  ColumnMapping 
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
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Settings2,
  Table,
  Calculator,
  RefreshCw
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
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<WorkbookAnalysis | null>(null);
  const [customMapping, setCustomMapping] = useState<ColumnMapping | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [parseResult, setParseResult] = useState<ParsedBulkImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [previewFilter, setPreviewFilter] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const res = await analyzeExcelWorkbook(selectedFile);
      setAnalysis(res);
      setSelectedSheet(res.activeSheet);
      setCustomMapping(res.suggestedMapping);

      // Calcular resultado preliminar
      const initialParsed = parseExcelWithMapping(res.rawRows, res.suggestedMapping, proyecto);
      setParseResult(initialParsed);
      setCurrentStep(2); // Avanzar al asistente de mapeo
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error al procesar el archivo Excel.');
      setAnalysis(null);
      setParseResult(null);
      setCurrentStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSheetChange = async (newSheet: string) => {
    if (!file) return;
    setSelectedSheet(newSheet);
    setIsProcessing(true);
    try {
      const res = await analyzeExcelWorkbook(file, newSheet);
      setAnalysis(res);
      setCustomMapping(res.suggestedMapping);
      const updatedParsed = parseExcelWithMapping(res.rawRows, res.suggestedMapping, proyecto);
      setParseResult(updatedParsed);
    } catch (err: any) {
      setErrorMsg(`Error al cambiar a la hoja ${newSheet}: ${err?.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMappingFieldChange = (field: keyof ColumnMapping, value: string) => {
    if (!customMapping || !analysis) return;
    const nextMapping: ColumnMapping = {
      ...customMapping,
      [field]: value,
    };
    setCustomMapping(nextMapping);
    const updated = parseExcelWithMapping(analysis.rawRows, nextMapping, proyecto);
    setParseResult(updated);
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
    setAnalysis(null);
    setCustomMapping(null);
    setParseResult(null);
    setErrorMsg(null);
    setCurrentStep(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-carga-masiva-title"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-carga-masiva-title" className="text-base font-bold text-white flex items-center gap-2">
                <span>Asistente de Carga y Mapeo de Presupuestos Excel</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Cómputo & Gantt
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Importa presupuestos de obra, cronogramas Gantt o cómputos métricos con autodetección de columnas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadExcelTemplate(proyecto)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition"
              title="Descargar plantilla de Excel con fórmulas de cómputo y presupuesto"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Plantilla Presupuesto</span>
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

        {/* Wizard Steps Indicator */}
        <div className="bg-slate-950/60 px-5 py-2.5 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto py-1">
            <button 
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 font-semibold transition ${
                currentStep === 1 ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}>1</span>
              <span>1. Cargar Archivo</span>
            </button>

            <span className="text-slate-600 hidden sm:inline">→</span>

            <button 
              type="button"
              disabled={!analysis}
              onClick={() => analysis && setCurrentStep(2)}
              className={`flex items-center gap-2 font-semibold transition ${
                currentStep === 2 ? 'text-emerald-400' : analysis ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep === 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}>2</span>
              <span>2. Mapeo de Columnas</span>
            </button>

            <span className="text-slate-600 hidden sm:inline">→</span>

            <button 
              type="button"
              disabled={!parseResult}
              onClick={() => parseResult && setCurrentStep(3)}
              className={`flex items-center gap-2 font-semibold transition ${
                currentStep === 3 ? 'text-emerald-400' : parseResult ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep === 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}>3</span>
              <span>3. Revisión y Confirmación</span>
            </button>
          </div>

          {file && (
            <div className="text-[11px] text-slate-400 hidden md:flex items-center gap-2 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              <span className="text-slate-300 font-mono font-semibold">{file.name}</span>
              <span>•</span>
              <span className="text-emerald-400">{parseResult?.totalRows || 0} filas</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* STEP 1: FILE UPLOAD */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-emerald-500/70 bg-slate-950/50 hover:bg-slate-950/80 rounded-2xl p-10 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-4"
              >
                <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Upload className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Arrastra aquí el presupuesto de obra, cómputo o cronograma Gantt
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Archivos compatibles: .xlsx, .xls • El sistema mapeará automáticamente columnas como Ítem, Descripción, Unidad, Cantidad y Precio Unitario
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  Seleccionar archivo desde la computadora
                </button>
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

              {/* Guía rápida de formatos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    <span>Presupuesto con Cómputo</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Soporta Unidad (m3, m2, etc.), Cantidad y P.U. Si no hay valor total, lo calcula como Cantidad × Precio Unitario.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <Table className="w-4 h-4 text-sky-400" />
                    <span>Cronograma Gantt</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Reconoce fechas de inicio y fin, orden de compra y calcula los hitos y plazos automáticamente.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <Settings2 className="w-4 h-4 text-purple-400" />
                    <span>Cualquier Estructura Excel</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    En el siguiente paso podrás confirmar o modificar qué columna corresponde a cada campo en un clic.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING WIZARD */}
          {currentStep === 2 && analysis && customMapping && (
            <div className="space-y-5">
              {/* Sheet & Overview Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{file?.name}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-emerald-400 font-mono">{analysis.rawRows.length} filas detectadas</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Verifica que las columnas detectadas coincidan con tu archivo o selecciona la correspondiente
                    </div>
                  </div>
                </div>

                {/* Sheet Selector */}
                {analysis.sheetNames.length > 1 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Hoja a importar:</span>
                    <select
                      value={selectedSheet}
                      onChange={(e) => handleSheetChange(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      {analysis.sheetNames.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Column Mapping Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Settings2 className="w-4 h-4 text-emerald-400" />
                    <span>Mapeo de Campos de Presupuesto y Cómputo Métrico</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    * Código y Descripción son indispensables
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Código / Item */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="text-emerald-400">*</span>
                        <span>Código / Ítem / Rubro</span>
                      </span>
                      {customMapping.codigo && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Mapeado
                        </span>
                      )}
                    </label>
                    <select
                      value={customMapping.codigo}
                      onChange={(e) => handleMappingFieldChange('codigo', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Seleccionar columna --</option>
                      {analysis.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500">Identificador del ítem (ej: 1.01, OB-001, B1.0001)</p>
                  </div>

                  {/* Descripción */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="text-emerald-400">*</span>
                        <span>Descripción del Trabajo</span>
                      </span>
                      {customMapping.descripcion && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Mapeado
                        </span>
                      )}
                    </label>
                    <select
                      value={customMapping.descripcion}
                      onChange={(e) => handleMappingFieldChange('descripcion', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Seleccionar columna --</option>
                      {analysis.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500">Detalle o nombre de la actividad de obra</p>
                  </div>

                  {/* Unidad */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Unidad de Medida</span>
                      {customMapping.unidad ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Mapeado
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Opcional</span>
                      )}
                    </label>
                    <select
                      value={customMapping.unidad || ''}
                      onChange={(e) => handleMappingFieldChange('unidad', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Ninguna (Por defecto: gl) --</option>
                      {analysis.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500">Ejemplo: m3, m2, ml, kg, un, gl</p>
                  </div>

                  {/* Cantidad */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Cantidad / Cómputo</span>
                      {customMapping.cantidad ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Mapeado
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Opcional</span>
                      )}
                    </label>
                    <select
                      value={customMapping.cantidad || ''}
                      onChange={(e) => handleMappingFieldChange('cantidad', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Ninguna --</option>
                      {analysis.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500">Metrado proyectado en la planilla</p>
                  </div>

                  {/* Precio Unitario */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Precio Unitario (P.U.)</span>
                      {customMapping.precioUnitario ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Mapeado
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Opcional</span>
                      )}
                    </label>
                    <select
                      value={customMapping.precioUnitario || ''}
                      onChange={(e) => handleMappingFieldChange('precioUnitario', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Ninguna --</option>
                      {analysis.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500">Precio por unidad de medida ($)</p>
                  </div>

                  {/* Valor Total */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Monto Total Contratado ($)</span>
                      {customMapping.valorTotal ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Mapeado
                        </span>
                      ) : (
                        <span className="text-[10px] text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800">
                          Auto (Cant × P.U.)
                        </span>
                      )}
                    </label>
                    <select
                      value={customMapping.valorTotal || ''}
                      onChange={(e) => handleMappingFieldChange('valorTotal', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Calcular automáticamente (Cant × P.U.) --</option>
                      {analysis.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500">Monto total presupuestado</p>
                  </div>

                  {/* Categoría / Rubro */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Categoría / Especialidad</span>
                      {customMapping.categoria && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Mapeado
                        </span>
                      )}
                    </label>
                    <select
                      value={customMapping.categoria || ''}
                      onChange={(e) => handleMappingFieldChange('categoria', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Opcional (Ingeniería / Obras) --</option>
                      {analysis.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500">Estructuras, Albañilería, Instalaciones, etc.</p>
                  </div>

                  {/* Fecha Base / Inicio */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Fecha Inicio (Gantt)</span>
                      {customMapping.fechaBase && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Mapeado
                        </span>
                      )}
                    </label>
                    <select
                      value={customMapping.fechaBase || ''}
                      onChange={(e) => handleMappingFieldChange('fechaBase', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Opcional (Inicio de proyecto) --</option>
                      {analysis.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500">Fecha de comienzo de la tarea</p>
                  </div>

                  {/* Orden de Compra */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Orden de Compra / Contrato</span>
                      {customMapping.ordenCompra && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Mapeado
                        </span>
                      )}
                    </label>
                    <select
                      value={customMapping.ordenCompra || ''}
                      onChange={(e) => handleMappingFieldChange('ordenCompra', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">-- Opcional --</option>
                      {analysis.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500">N° de O.C. o Contrato asociado</p>
                  </div>
                </div>
              </div>

              {/* Previsualización en Vivo de Primeras Filas */}
              {parseResult && parseResult.groupedEntregables.length > 0 && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Table className="w-4 h-4 text-emerald-400" />
                      <span>Previsualización en tiempo real (Primeras 3 filas interpretadas):</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Total interpretado: {formatCurrency(parseResult.totalValue)}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                          <th className="py-1 px-2">Código</th>
                          <th className="py-1 px-2">Descripción</th>
                          <th className="py-1 px-2">Unidad</th>
                          <th className="py-1 px-2 text-right">Cantidad</th>
                          <th className="py-1 px-2 text-right">P. Unitario</th>
                          <th className="py-1 px-2 text-right">Total ($)</th>
                          <th className="py-1 px-2">Categoría</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-200">
                        {parseResult.groupedEntregables.slice(0, 3).map((item, i) => (
                          <tr key={i} className="hover:bg-slate-900/50">
                            <td className="py-1.5 px-2 font-mono font-bold text-emerald-400">{item.codigo}</td>
                            <td className="py-1.5 px-2 truncate max-w-xs">{item.descripcion}</td>
                            <td className="py-1.5 px-2 text-slate-400">{item.unidad || 'gl'}</td>
                            <td className="py-1.5 px-2 text-right font-mono">{item.cantidad ?? '-'}</td>
                            <td className="py-1.5 px-2 text-right font-mono">
                              {item.precioUnitario ? formatCurrency(item.precioUnitario) : '-'}
                            </td>
                            <td className="py-1.5 px-2 text-right font-mono font-bold text-white">
                              {formatCurrency(item.valorTotal)}
                            </td>
                            <td className="py-1.5 px-2 text-slate-400">{item.categoria}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PREVIEW & FINAL CONFIRMATION */}
          {currentStep === 3 && parseResult && (
            <div className="space-y-4">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-400">Total Filas Leídas</div>
                  <div className="text-xl font-bold text-white font-mono mt-0.5">
                    {parseResult.totalRows}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-400">Nuevos Rubros / Ítems</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                    +{parseResult.newDeliverablesCount}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-400">Actualizaciones</div>
                  <div className="text-xl font-bold text-sky-400 font-mono mt-0.5">
                    {parseResult.updatedDeliverablesCount}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-[11px] text-slate-400">Presupuesto Total ($)</div>
                  <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">
                    {formatCurrency(parseResult.totalValue)}
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {parseResult.errors.length > 0 && (
                <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Observaciones de validación:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-amber-200">
                    {parseResult.errors.slice(0, 4).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {parseResult.errors.length > 4 && (
                      <li>...y {parseResult.errors.length - 4} avisos más.</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Search & Deliverables Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-200">
                    Detalle de ítems listos para importar ({parseResult.groupedEntregables.length})
                  </span>
                  <input
                    type="text"
                    value={previewFilter}
                    onChange={(e) => setPreviewFilter(e.target.value)}
                    placeholder="Filtrar por código o descripción..."
                    className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-3 py-1 focus:ring-1 focus:ring-emerald-500 w-full sm:w-64"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/80 text-slate-400 sticky top-0 border-b border-slate-800 font-semibold text-[11px]">
                      <tr>
                        <th className="px-3 py-2 w-28">Código</th>
                        <th className="px-3 py-2 min-w-[220px]">Descripción</th>
                        <th className="px-3 py-2">Unidad</th>
                        <th className="px-3 py-2 text-right">Cantidad</th>
                        <th className="px-3 py-2 text-right">P. Unitario</th>
                        <th className="px-3 py-2 text-right">Total ($)</th>
                        <th className="px-3 py-2 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {parseResult.groupedEntregables
                        .filter((ent) => 
                          !previewFilter ||
                          ent.codigo.toLowerCase().includes(previewFilter.toLowerCase()) ||
                          ent.descripcion.toLowerCase().includes(previewFilter.toLowerCase())
                        )
                        .map((ent) => {
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
                                <div className="text-[10px] text-slate-500">{ent.categoria}</div>
                              </td>
                              <td className="px-3 py-2 text-slate-400 font-mono">
                                {ent.unidad || 'gl'}
                              </td>
                              <td className="px-3 py-2 text-right font-mono">
                                {ent.cantidad !== undefined ? ent.cantidad.toLocaleString() : '-'}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-slate-400">
                                {ent.precioUnitario ? formatCurrency(ent.precioUnitario) : '-'}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-slate-100">
                                {formatCurrency(ent.valorTotal)}
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

              {/* Mode Selection */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-white">Modo de integración al proyecto</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label 
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
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
                        Agrega nuevos rubros y actualiza existentes conservando los certificados cargados previamente.
                      </div>
                    </div>
                  </label>

                  <label 
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
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
                      <div className="text-xs font-bold text-white">Reemplazar lista completa</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Sustituye la lista del proyecto con los ítems de esta planilla.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as any) : 1))}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 text-slate-400 hover:text-slate-200 text-xs font-medium transition"
            >
              Reiniciar
            </button>

            {currentStep === 2 && (
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition"
              >
                <span>Continuar a Revisión</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                disabled={!parseResult || parseResult.groupedEntregables.length === 0}
                onClick={handleConfirmImport}
                className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg shadow-sm transition ${
                  parseResult && parseResult.groupedEntregables.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-emerald-900/40'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Aplicar e Importar al Proyecto</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
