import React, { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  GitBranch, 
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
  Plus,
  DollarSign,
  Sparkles,
  Tag,
  BarChart3,
  Percent
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
      categoria: 'estructura',
      titulo: 'Proyectos',
      icon: Building2,
      color: 'blue',
      resumen: 'Independencia total entre obras y control de configuración del proyecto.',
      contenido: [
        'Cada proyecto es totalmente independiente: tiene sus propias empresas, entregables, certificaciones, gastos generales, fechas de corte y curva S.',
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
      categoria: 'estructura',
      titulo: 'Empresas y Contratistas',
      icon: Building2,
      color: 'indigo',
      resumen: 'Gestión de clientes, contratistas y subcontratos con colores distintivos.',
      contenido: [
        'Dentro de un proyecto se gestionan las empresas (clientes mandantes o contratistas) involucradas.',
        'Cada empresa tiene su color identificatorio, sus entregables asignados, sus fechas de corte y sus registros particulares.',
        'Puede agregar, renombrar, recolorear o eliminar empresas desde el gestor "Empresas" ubicado en la barra superior.',
        'Al filtrar por empresa en la barra superior, todos los indicadores (KPI), tablas y proyecciones se adaptan automáticamente a esa entidad.',
      ],
      linkTab: 'taging',
      linkLabel: 'Ver Entregables por Empresa',
    },
    {
      id: 'entregables',
      numero: '3',
      categoria: 'estructura',
      titulo: 'Entregables e Hitos Técnicos',
      icon: Layers,
      color: 'emerald',
      resumen: 'Estructura de partidas de ingeniería con valor contractual puro y reglas de emisión.',
      contenido: [
        'Un entregable representa un documento técnico contractual (plano, informe, memoria de cálculo, especificación, etc.) con su código, descripción y presupuesto pactado.',
        'Valor contractual puro: El valor del entregable y de sus hitos representa estrictamente la base técnica contractual acordada con el cliente (sin gastos generales inflados ni prorrateos artificiales).',
        'Cada entregable se subdivide en hitos de certificación porcentual. La regla estándar de ingeniería aplica:',
        '• Emisión B (60%): Se devenga al emitir el documento preliminar para revisión del cliente o mandante.',
        '• Emisión 0 (30%): Se certifica una vez incorporadas las observaciones y aprobado el documento para construcción o licitación.',
        '• Cierre (10%): Se liquida con la conformidad técnica final y cierre del contrato.',
        'También puede configurar esquemas personalizados con cualquier cantidad de hitos que sumen el 100% del valor contractual.',
      ],
      linkTab: 'taging',
      linkLabel: 'Ir al Módulo de Entregables',
    },
    {
      id: 'certificaciones',
      numero: '4',
      categoria: 'certificaciones',
      titulo: 'Certificaciones y Cobros',
      icon: Receipt,
      color: 'amber',
      resumen: 'Numeración oficial, distintivo personalizado, valor neto de actividades y gastos en certificado.',
      contenido: [
        'Identificación Clara y Sin Códigos Innecesarios: Cada certificado se identifica mediante su Número correlativo (N° 1, N° 2...) y su Nombre o Distintivo personalizado (ej. "Certificado 1", "Anticipo Financiero", "Avance Obra Civil", "Certificado Final"). Ya no se exige ningún código técnico obligatorio.',
        'Edición Rápida de Nombre (✎): Puede renombrar o ajustar el distintivo de cualquier certificado directamente desde la tabla de certificaciones haciendo clic en el botón de edición rápida (icono lápiz ✎), sin necesidad de reabrir el formulario completo.',
        'Valor Contractual Puro en Actividades: Al seleccionar una o varias actividades para certificar, el sistema toma estrictamente su valor contractual neto o pendiente (ej. si una actividad vale $5.184,00, se toma exactamente $5.184,00). Los gastos generales ya no se suman a las actividades.',
        'Gastos Generales en el Certificado: Los gastos generales se imputan como un ítem propio a nivel del documento mediante el campo "Monto a certificar de Gastos Generales". El total del certificado suma de forma transparente: Total = Suma de Actividades seleccionadas + Gastos Generales facturados.',
        'Certificación Multi-Actividad: Permite asociar múltiples entregables e hitos en un solo certificado oficial con un clic, o certificar avances parciales ajustando el importe a cobrar de cada fila.',
        'Estados del Certificado: "Presentado" (ingresado al cliente), "Aprobado" (conformidad técnica), "Facturado" y "Cobrado" (acreditado en banco, impactando en la Curva S y proyecciones).',
      ],
      linkTab: 'certificaciones',
      linkLabel: 'Ir a Certificaciones',
    },
    {
      id: 'gastos',
      numero: '5',
      categoria: 'certificaciones',
      titulo: 'Gastos Generales del Proyecto',
      icon: DollarSign,
      color: 'purple',
      resumen: 'Presupuesto global, facturación directa en certificados y control de saldo restante.',
      contenido: [
        'Presupuesto Global Desacoplado: Permite fijar el presupuesto total de generales (gerenciamiento, costos indirectos, utilidades, supervisión, etc.) de manera global para todo el proyecto.',
        'Facturación Directa por Certificado: En lugar de inflar o prorratear las partidas de ingeniería, los gastos generales se van facturando directamente en cada certificado según la necesidad comercial de cada período.',
        'Monitoreo en Tiempo Real: En el panel de Gastos Generales puede auditar en tiempo real: Total Presupuestado, Generales Facturados a la fecha, y Saldo Restante por Certificar.',
        'Auditoría por Certificado y por Entregable: Dispone de dos pestañas para consultar exactamente cuánto de gastos generales se cobró en cada documento, así como el avance contractual neto de cada partida técnica.',
      ],
      linkTab: 'gastos',
      linkLabel: 'Ir a Gastos Generales',
    },
    {
      id: 'fechas_corte',
      numero: '6',
      categoria: 'gestion',
      titulo: 'Fechas de Corte Contractual',
      icon: Calendar,
      color: 'purple',
      resumen: 'Períodos ordenados cronológicamente de menor a mayor y editables sin borrar.',
      contenido: [
        'Las fechas de corte son los momentos temporales (quincenales o mensuales) en los que se congela la contabilidad para computar el avance económico del proyecto.',
        'Orden cronológico automático: Todas las fechas se acomodan estrictamente en orden de menor a mayor (más antigua a más reciente), sin importar cuándo o cómo se creen, facilitando su distinción.',
        'Edición directa: Puede modificar cualquier fecha de corte existente haciendo clic en su botón de edición (icono lápiz ✎), sin tener que borrarla para corregirla.',
        'Generador periódico: Use "Generar Períodos" para insertar automáticamente cortes cada 15 o 30 días en un rango de fechas.',
      ],
      linkTab: 'fechas_corte',
      linkLabel: 'Gestionar Fechas de Corte',
    },
    {
      id: 'curva_s',
      numero: '7',
      categoria: 'curva',
      titulo: 'Curva S y Control de Avance',
      icon: TrendingUp,
      color: 'cyan',
      resumen: 'Gráfico planificado vs. real, sistema anti-superposición de % y descarga en PNG.',
      contenido: [
        'Líneas del Gráfico Sincronizadas:',
        '• Planificado (Azul #2563EB): Progreso teórico acumulado según las fechas previstas de los hitos.',
        '• Real Certificado (Verde Esmeralda #10B981): Avance contractual acumulado devengado que corta con precisión en la fecha de corte seleccionada.',
        '• Facturado (Púrpura punteado #8B5CF6): Montos percibidos y acreditados efectivamente.',
        'Sistema Inteligente Anti-Superposición de %: Dispone de un selector en la barra superior con tres modos:',
        '• "% Clave" (Predeterminado): Algoritmo que elimina el solapamiento entre fechas contiguas muy próximas, garantizando legibilidad en el hito inicial (0%), la fecha de corte activa (resaltada con pastilla azul), el cierre final (100%) y las variaciones porcentuales reales, separando verticalmente Planificado y Real con pastillas nítidas de fondo.',
        '• "Todos": Muestra las etiquetas numéricas de todos los períodos de corte.',
        '• "Sin %": Vista minimalista limpia para análisis visual con lectura interactiva al pasar el cursor (tooltip).',
        'Alternar Unidades (% o $ USD): Conmute entre la curva porcentual o monetaria en dólares según el tipo de presentación que requiera.',
        'Descarga de Imagen: Puede descargar el gráfico en alta resolución como imagen PNG lista para adjuntar en minutas e informes ejecutivos (botón "Descargar Imagen"), o exportar los datos numéricos a CSV.',
      ],
      linkTab: 'curva_s',
      linkLabel: 'Ver Gráfico de Curva S',
    },
    {
      id: 'proyecciones',
      numero: '8',
      categoria: 'curva',
      titulo: 'Proyecciones de Cobro y Flujo de Fondos',
      icon: BarChart3,
      color: 'blue',
      resumen: 'Previsión financiera período a período y consolidado mensual de ingresos.',
      contenido: [
        'Proyección Período a Período: Cuantifica los montos previstos a facturar en cada fecha de corte según las fechas planificadas de los hitos.',
        'Consolidado Mensual: Agrupa los ingresos proyectados mes a mes para coordinar el flujo de caja con finanzas y administración.',
        'Seguimiento de Desvíos: Identifica inmediatamente los hitos vencidos no certificados para replanificar o acelerar gestiones de cobro.',
      ],
      linkTab: 'proyecciones',
      linkLabel: 'Ir a Proyecciones de Cobro',
    },
    {
      id: 'carga_masiva',
      numero: '9',
      categoria: 'gestion',
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
      numero: '10',
      categoria: 'gestion',
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

  const categories = [
    { id: 'todos', label: `Todas las Secciones (${sections.length})` },
    { id: 'estructura', label: 'Proyectos y Entregables' },
    { id: 'certificaciones', label: 'Certificaciones y Gastos' },
    { id: 'curva', label: 'Curva S y Proyecciones' },
    { id: 'gestion', label: 'Fechas, Excel y Alertas' },
  ];

  const filteredSections = sections.filter((s) => {
    const matchesSearch = 
      s.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.resumen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contenido.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = 
      selectedCategory === 'todos' || 
      s.categoria === selectedCategory || 
      s.id === selectedCategory;

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
              Centro de Ayuda y Manual del Usuario
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              CertControl Pro es una herramienta para controlar, certificar y proyectar el avance económico de proyectos de ingeniería. Cada proyecto agrupa empresas y entregables; los entregables se dividen en hitos que se certifican con su valor contractual puro, los gastos generales se facturan directamente a nivel del certificado, y todo se refleja en proyecciones y la Curva S con sistema anti-superposición.
            </p>
          </div>
        </div>

        {/* Quick Search & Topic Navigation */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en el manual (ej: Curva S, gastos generales, renombrar certificado, valor actividades, fechas de corte, excel)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-medium">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
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
          Siga este flujo secuencial para operar y controlar cualquier proyecto de ingeniería con total precisión:
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
              Carga partidas con su valor contractual neto (manual o Excel).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10 text-xs space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-xs">
              3
            </div>
            <div className="font-bold text-white text-sm">Fechas Corte</div>
            <p className="text-[11px] text-blue-100/80 leading-relaxed">
              Define los períodos (ordenados cronológicamente y editables con ✎).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10 text-xs space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-xs">
              4
            </div>
            <div className="font-bold text-white text-sm">Certificar</div>
            <p className="text-[11px] text-blue-100/80 leading-relaxed">
              Emite certificados con número y nombre; suma gastos generales si aplica.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10 text-xs space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-900 font-bold flex items-center justify-center text-xs">
              5
            </div>
            <div className="font-bold text-white text-sm">Curva S</div>
            <p className="text-[11px] text-blue-100/80 leading-relaxed">
              Analiza el avance sin superposiciones (% Clave) y descarga el PNG.
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
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
                  >
                    <span>{sec.linkLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {sec.action && (
                  <button
                    onClick={sec.action}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
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
              Partida técnica cuantificable (plano, informe, cómputo) con presupuesto contractual neto u Orden de Compra asignada.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">Hito de Avance</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Etapa de emisión técnica (ej. 60% Emisión B, 30% Emisión 0, 10% Cierre) que liquida un valor contractual específico.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">Nombre / Distintivo del Certificado</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Denominación personalizada (ej. "Certificado 1", "Anticipo", "Avance Obra") que acompaña al número oficial para distinguirlo.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">Gastos Generales (GG)</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Presupuesto global facturable en certificados como ítem propio, sin alterar el valor de las actividades técnicas.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">Curva S y Modo % Clave</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Gráfico de avance económico con algoritmo anti-superposición que asegura legibilidad en inicio, corte activo y fin.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/70 dark:border-slate-700/60 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">Fecha de Corte</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Período de medición ordenado cronológicamente para congelar y consolidar el avance económico.
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
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Importar / Exportar JSON Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenVercelGuide}
            className="flex items-center gap-2 px-3.5 py-2 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-900 dark:text-purple-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Ver Guía de Despliegue en Vercel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
