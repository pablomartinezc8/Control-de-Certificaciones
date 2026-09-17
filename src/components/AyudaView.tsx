import React, { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  GitBranch, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Layers,
  Receipt,
  Download,
  Camera,
  FileSpreadsheet,
  AlertTriangle,
  Scale,
  CalendarClock,
  Search,
  Check,
  Pencil,
  Plus
} from 'lucide-react';

interface AyudaViewProps {
  onOpenSyncModal: () => void;
  onOpenVercelGuide: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenCargaMasivaExcel?: () => void;
}

export const AyudaView: React.FC<AyudaViewProps> = ({
  onOpenSyncModal,
  onOpenVercelGuide,
  onNavigateTab,
  onOpenCargaMasivaExcel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const sections = [
    {
      id: 'proyectos',
      numero: '1',
      titulo: 'Proyectos',
      icon: Building2,
      color: 'blue',
      resumen: 'Independencia total entre obras y control de configuración del proyecto.',
      contenido: [
        'Cada proyecto es independiente: tiene sus propias empresas, entregables, certificaciones, gastos, fechas de corte y curva S.',
        'Cambie de proyecto en cualquier momento usando el selector desplegable situado en el encabezado superior.',
        'Modifique el nombre del proyecto haciendo clic en el botón de lápiz (✎) junto al selector para actualizar su denominación oficial y configuración.',
        'Cree nuevos proyectos desde el botón (+) en el encabezado. Los datos de un proyecto nunca se mezclan ni interfieren con los de otro.',
      ],
      linkTab: 'taging',
      linkLabel: 'Ir a Entregables del Proyecto',
    },
    {
      id: 'empresas',
      numero: '2',
      titulo: 'Empresas y Contratistas',
      icon: Building2,
      color: 'indigo',
      resumen: 'Gestión de clientes, contratistas y subcontratos con colores distintivos.',
      contenido: [
        'Dentro de un proyecto se gestionan las empresas (clientes o contratistas) involucradas.',
        'Cada empresa tiene su color identificatorio, sus entregables asignados, sus fechas de corte y sus gastos particulares.',
        'Puede agregar, renombrar, recolorear o eliminar empresas desde el gestor "Empresas" ubicado en la barra superior.',
        'Al filtrar por empresa en la sección de filtros, todos los KPI, tablas y proyecciones se adaptan a esa entidad.',
      ],
      linkTab: 'taging',
      linkLabel: 'Ver Entregables por Empresa',
    },
    {
      id: 'entregables',
      numero: '3',
      titulo: 'Entregables e Hitos',
      icon: Layers,
      color: 'emerald',
      resumen: 'Estructura de partidas de ingeniería, reglas de emisión y fechas base.',
      contenido: [
        'Un entregable representa un documento técnico facturable (plano, informe, especificación, memoria de cálculo, etc.) con su código, descripción y presupuesto contractual.',
        'Cada entregable se subdivide en hitos de certificación porcentual. La regla estándar de ingeniería aplica:',
        '• Emisión B (60%): Se devenga al emitir el documento preliminar para revisión del cliente o mandante.',
        '• Emisión 0 (30%): Se certifica una vez incorporadas las observaciones y aprobado el documento para construcción o licitación.',
        '• Cierre (10%): Se liquida con la conformidad técnica final y cierre del contrato.',
        'También puede configurar esquemas personalizados con cualquier cantidad de hitos que sumen el 100% del valor.',
      ],
      linkTab: 'taging',
      linkLabel: 'Ir al Módulo de Entregables',
    },
    {
      id: 'certificaciones',
      numero: '4',
      titulo: 'Certificaciones y Cobros',
      icon: Receipt,
      color: 'amber',
      resumen: 'Emisión de certificados, asociación de múltiples hitos y seguimiento de cobros.',
      contenido: [
        'Una certificación es el registro oficial que aprueba el devengo y cobro de uno o más hitos de entregables.',
        'Puede emitir certificados individuales o multidocumento agrupando varios hitos bajo un mismo N° de Certificado desde el botón "Nueva certificación".',
        'Cada certificado registra: N° oficial, fecha de presentación, fecha de aprobación técnica y fecha de cobro en banco.',
        'Diferencia clave de estados: Al emitirse figura como "Certificado" (avance real), y al cancelarse la factura se marca como "Cobrado" (ingreso en caja reflejado en la Curva S).',
      ],
      linkTab: 'certificaciones',
      linkLabel: 'Ir a Certificaciones',
    },
    {
      id: 'fechas_corte',
      numero: '5',
      titulo: 'Fechas de Corte Contractual',
      icon: Calendar,
      color: 'purple',
      resumen: 'Períodos ordenados cronológicamente de menor a mayor y editables sin borrar.',
      contenido: [
        'Las fechas de corte son los momentos temporales (quincenales o mensuales) en los que se congela la contabilidad para computar el avance económico del proyecto.',
        'Orden cronológico automático: Todas las fechas se acomodan estrictamente en orden de menor a mayor (más antigua a más reciente), sin importar cuándo o cómo se creen, facilitando su distinción.',
        'Edición directa: Ahora puede modificar cualquier fecha de corte existente haciendo clic en su botón de edición (icono lápiz ✎), sin tener que borrarla para corregirla.',
        'Generador periódico: Use "Generar Períodos" para insertar automáticamente cortes cada 15 o 30 días en un rango de fechas.',
      ],
      linkTab: 'fechas_corte',
      linkLabel: 'Gestionar Fechas de Corte',
    },
    {
      id: 'curva_s',
      numero: '6',
      titulo: 'Curva S y Control de Avance',
      icon: TrendingUp,
      color: 'cyan',
      resumen: 'Gráfico planificado vs. real, desvío porcentual y descarga de imagen PNG.',
      contenido: [
        'La Curva S compara en un gráfico interactivo tres magnitudes acumuladas:',
        '• Planificado (Azul): Progreso teórico acumulado según las fechas previstas de los hitos.',
        '• Real Certificado (Celeste): Avance contractual acumulado devengado y aprobado por el cliente.',
        '• Cobrado (Violeta): Montos percibidos y acreditados efectivamente.',
        'Desvío a la fecha: La fórmula ((Real - Planificado) / Planificado) × 100 calcula el retraso o adelanto. Un desvío negativo (ej. -11,2%) evidencia que el ritmo de certificación está por debajo del cronograma.',
        'Descarga de Imagen: Puede descargar el gráfico en alta resolución como imagen PNG o archivo vectorial SVG para adjuntar directamente en minutas e informes ejecutivos.',
      ],
      linkTab: 'curva_s',
      linkLabel: 'Ver Gráfico de Curva S',
    },
    {
      id: 'carga_masiva',
      numero: '7',
      titulo: 'Carga Masiva y Exportación a Excel',
      icon: FileSpreadsheet,
      color: 'emerald',
      resumen: 'Importación por lotes mediante plantilla Excel oficial con validación previa.',
      contenido: [
        'Para proyectos con gran volumen de documentación técnica, evite la carga manual uno a uno utilizando la Carga Masiva:',
        '1. Descargue la plantilla Excel (.xlsx) oficial desde la pestaña Importar/Exportar o desde el botón en Entregables.',
        '2. Complete sus actividades e hitos respetando las columnas guiadas (código, descripción, valor, fechas, etc.).',
        '3. Suba el archivo: el sistema analizará la información, mostrará una vista previa con detección de posibles errores o avisos, y al confirmar cargará todo el lote en segundos.',
        'También puede exportar el proyecto completo a Excel para respaldos o reportes externos.',
      ],
      action: onOpenCargaMasivaExcel,
      linkLabel: 'Abrir Carga Masiva Excel',
    },
    {
      id: 'conciliacion',
      numero: '8',
      titulo: 'Conciliación, Alertas y Vencimientos',
      icon: Scale,
      color: 'rose',
      resumen: 'Auditoría de Órdenes de Compra (OC), detección de desvíos y agenda preventiva.',
      contenido: [
        'Conciliación Financiera: Compara el presupuesto contractual contra el monto comprometido en la Orden de Compra (OC) y los saldos pendientes por cobrar.',
        'Alertas Inteligentes: Detecta automáticamente entregables sin OC asignada, certificados pendientes de cobro con más de 30 días de antigüedad, e hitos cuya fecha ya expiró sin certificación emitida.',
        'Vencimientos: Muestra una línea de tiempo ordenada de los próximos hitos a certificar y certificados por cobrar en los próximos 7, 15 y 30 días.',
      ],
      linkTab: 'conciliacion',
      linkLabel: 'Revisar Conciliación y Alertas',
    },
  ];

  const filteredSections = sections.filter((s) => {
    const matchesSearch = 
      s.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.resumen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contenido.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'todos' || s.id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Welcome Card matching Reference Image */}
      <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              ¿Cómo funciona CertControl Pro?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              CertControl Pro es una herramienta para controlar, certificar y proyectar el avance económico de proyectos de ingeniería. Cada proyecto agrupa empresas y entregables; los entregables se dividen en hitos que se certifican al cobrarse, y todo se refleja en proyecciones y la curva S. Lea las secciones a continuación para entender cada parte.
            </p>
          </div>
        </div>

        {/* Quick Search & Topic Navigation */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en el manual (ej: Curva S, descargar imagen, modificar proyecto, fechas de corte, excel)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-medium">
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'todos'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Todas las Secciones ({sections.length})
            </button>
          </div>
        </div>
      </div>

      {/* Flujo de Trabajo en 5 Pasos para Nuevos Usuarios */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-blue-300 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Guía Rápida de Inicio</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          Ciclo de Trabajo Recomendado en 5 Pasos
        </h3>
        <p className="text-xs sm:text-sm text-blue-100/90 max-w-3xl mb-6">
          Siga este flujo secuencial para poner en marcha cualquier proyecto de ingeniería en pocos minutos:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10 text-xs space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-xs">
              1
            </div>
            <div className="font-bold text-white text-sm">Proyecto</div>
            <p className="text-[11px] text-blue-100/80 leading-relaxed">
              Crea o renombra el proyecto desde el encabezado (botón ✎).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10 text-xs space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-xs">
              2
            </div>
            <div className="font-bold text-white text-sm">Entregables</div>
            <p className="text-[11px] text-blue-100/80 leading-relaxed">
              Carga tus partidas técnicas manualmente o en lote por Excel.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10 text-xs space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-xs">
              3
            </div>
            <div className="font-bold text-white text-sm">Fechas Corte</div>
            <p className="text-[11px] text-blue-100/80 leading-relaxed">
              Define los cortes (se ordenan de menor a mayor y se pueden editar).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10 text-xs space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-xs">
              4
            </div>
            <div className="font-bold text-white text-sm">Certificar</div>
            <p className="text-[11px] text-blue-100/80 leading-relaxed">
              Emite certificados de pago con N° y fecha al aprobar hitos.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10 text-xs space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-900 font-bold flex items-center justify-center text-xs">
              5
            </div>
            <div className="font-bold text-white text-sm">Curva S</div>
            <p className="text-[11px] text-blue-100/80 leading-relaxed">
              Analiza el desvío y descarga la imagen (PNG) para el reporte.
            </p>
          </div>
        </div>
      </div>

      {/* Sections Grid matching Base44 / CertControl Pro */}
      <div className="space-y-4">
        {filteredSections.map((sec) => {
          const IconComponent = sec.icon;
          return (
            <div 
              key={sec.id} 
              id={`sec-${sec.id}`}
              className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80 gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 text-white dark:bg-blue-600 font-bold text-xs shrink-0">
                    {sec.numero}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{sec.titulo}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {sec.resumen}
                    </p>
                  </div>
                </div>

                {/* Quick Action Button to Navigate */}
                {sec.linkTab && onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab(sec.linkTab!)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto"
                  >
                    <span>{sec.linkLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {sec.action && (
                  <button
                    onClick={sec.action}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{sec.linkLabel}</span>
                  </button>
                )}
              </div>

              {/* Content Points */}
              <div className="mt-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {sec.contenido.map((parr, pidx) => (
                  <div key={pidx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mt-1.5 shrink-0" />
                    <span>{parr}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Glosario Rápido de Términos de Ingeniería */}
      <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 sm:p-6 shadow-xs">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Glosario de Términos Clave</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">Entregable</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Partida técnica cuantificable (plano, informe, cómputo) con presupuesto u Orden de Compra asignada.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">Hito de Avance</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Etapa de emisión técnica (ej. 60% Emisión B, 30% Emisión 0, 10% Cierre) que habilita una certificación parcial.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">Curva S</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Gráfico representativo del avance económico acumulado a lo largo del cronograma de fechas de corte.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">Desvío Porcentual</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Diferencia porcentual entre lo certificado y lo planificado. Si es negativo indica retraso en las certificaciones.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">Orden de Compra (OC)</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Documento comercial contractual emitido por el mandante que respalda la aprobación del gasto.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">Fecha de Corte</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Período de medición quincenal o mensual para consolidar el estado de avance de la ingeniería.
            </p>
          </div>
        </div>
      </div>

      {/* Sincronización y Respaldo Externo */}
      <div className="bg-white dark:bg-[#0B1426] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-3 text-slate-900 dark:text-white font-bold text-sm">
          <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            <GitBranch className="w-4 h-4" />
          </div>
          <span>Sincronización, Respaldo JSON y Despliegue en la Nube</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Puede exportar el archivo JSON completo de su proyecto en cualquier momento para resguardo local o migración entre dispositivos, y configurar el despliegue automático continuo con GitHub y Vercel:
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onOpenSyncModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <span>Importar / Exportar JSON Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenVercelGuide}
            className="flex items-center gap-2 px-3.5 py-2 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-900 dark:text-purple-300 rounded-lg text-xs font-semibold transition-colors"
          >
            <span>Ver Guía de Despliegue en Vercel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
