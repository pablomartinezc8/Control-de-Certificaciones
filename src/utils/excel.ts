import * as XLSX from 'xlsx';
import { Proyecto, Entregable, Hito, Empresa } from '../types';
import { getEntregableValorEfectivo, getHitoPlannedDate, normalizeDate, addDays } from './calculations';

export interface ParsedExcelRow {
  codigo: string;
  descripcion: string;
  empresaNombre?: string;
  categoria?: string;
  ordenCompra?: string;
  valorTotal: number;
  fechaBase?: string;
  tipoDistribucion?: string;
  porcentajeB?: number;
  porcentaje0?: number;
  porcentajeRevisionFinal?: number;
  diasRevision?: number;
  intervaloCert?: number;
  fechaFinProyecto?: string;
  incluirCurva: boolean;
  esCHO: boolean;
  observaciones?: string;
  // Hito info if generated or supplied
  hitoNombre?: string;
  hitoPorcentaje?: number;
  fechaPrevista?: string;
  reglaFecha?: string;
  isValid: boolean;
  errors: string[];
}

export interface ParsedBulkImportResult {
  rows: ParsedExcelRow[];
  groupedEntregables: Entregable[];
  totalRows: number;
  validRows: number;
  newDeliverablesCount: number;
  updatedDeliverablesCount: number;
  totalValue: number;
  errors: string[];
}

/**
 * Normaliza nombres de columna para emparejar flexiblemente
 */
function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Convierte diferentes formatos de fecha (DD/MM/AAAA, AAAA-MM-DD, números seriales de Excel) a AAAA-MM-DD
 */
function parseFlexibleExcelDate(rawVal: any): string {
  if (!rawVal) return '';

  // Si es número serial de Excel (ej: 46178)
  if (typeof rawVal === 'number' && rawVal > 20000 && rawVal < 60000) {
    try {
      const utcDays = Math.floor(rawVal - 25569);
      const utcValue = utcDays * 86400;
      const dateInfo = new Date(utcValue * 1000);
      return dateInfo.toISOString().split('T')[0];
    } catch {
      // fallback
    }
  }

  const str = String(rawVal).trim();
  if (!str) return '';

  // Formato DD/MM/AAAA
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      let day = parts[0].trim().padStart(2, '0');
      let month = parts[1].trim().padStart(2, '0');
      let year = parts[2].trim();
      if (year.length === 2) year = `20${year}`;
      // Si por alguna razón vino MM/DD/AAAA y month > 12
      if (parseInt(month, 10) > 12 && parseInt(day, 10) <= 12) {
        const tmp = day;
        day = month;
        month = tmp;
      }
      return `${year}-${month}-${day}`;
    }
  }

  // Formato DD-MM-AAAA
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // AAAA-MM-DD
        return str;
      } else if (parts[2].length === 4) {
        // DD-MM-AAAA
        const day = parts[0].trim().padStart(2, '0');
        const month = parts[1].trim().padStart(2, '0');
        const year = parts[2].trim();
        return `${year}-${month}-${day}`;
      }
    }
  }

  return normalizeDate(str) || '';
}

/**
 * Formato de fecha para visualización en Excel: DD/MM/AAAA
 */
function formatExcelDisplayDate(isoDate: string | undefined): string {
  if (!isoDate) return '';
  const norm = normalizeDate(isoDate);
  if (!norm) return '';
  const [y, m, d] = norm.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Exporta el proyecto completo a formato Excel (.xlsx)
 * Hoja principal: "Actividades" con la estructura exacta solicitada por el usuario (1 fila por actividad)
 * Hoja 2: "Detalle_Hitos_y_Certificaciones" con el desglose de hitos y pagos
 * Hoja 3: "Caratula_Financiera"
 */
export function exportProjectToExcel(proyecto: Proyecto, fileName?: string) {
  const empMap = new Map<string, string>();
  proyecto.empresas.forEach((e) => empMap.set(e.id, e.nombre));

  // Hoja 1: Actividades (Estructura exacta de la imagen del usuario: 1 actividad por fila)
  const actividadesRows: any[] = [];
  // Hoja 2: Detalle de Hitos y Certificaciones
  const hitosDetalleRows: any[] = [];

  let totalProyectoOC = 0;
  let totalProyectoCertificado = 0;
  let totalProyectoCobrado = 0;

  proyecto.entregables.forEach((ent) => {
    const valorEfectivo = getEntregableValorEfectivo(ent, proyecto);
    totalProyectoOC += valorEfectivo;

    const empNombre = ent.empresaId
      ? empMap.get(ent.empresaId) || ent.empresaId
      : proyecto.empresas[0]?.nombre || 'Taging';

    const isPagoUnico = ent.tipoDistribucion === 'pago_unico' || (ent.hitos && ent.hitos.length === 1);
    const tipoDist = isPagoUnico ? 'pago_unico' : (ent.tipoDistribucion || 'estandar');

    // Porcentajes B, 0 y Revisión Final
    let pctB = 60;
    let pct0 = 30;
    let pctFin = 10;

    if (isPagoUnico) {
      pctB = 0;
      pct0 = 0;
      pctFin = 100;
    } else if (ent.porcentajes) {
      pctB = ent.porcentajes.emisionB ?? 60;
      pct0 = ent.porcentajes.emision0 ?? 30;
      pctFin = ent.porcentajes.restante ?? 10;
    } else if (ent.hitos && ent.hitos.length >= 3) {
      pctB = Number(ent.hitos[0].porcentaje) || 60;
      pct0 = Number(ent.hitos[1].porcentaje) || 30;
      pctFin = Number(ent.hitos[2].porcentaje) || 10;
    }

    const fechaBaseDisplay = formatExcelDisplayDate(ent.fechaBase) || '01/06/2026';
    const fechaFinDisplay = formatExcelDisplayDate(ent.fechaFinProyecto) || (isPagoUnico ? '' : '31/12/2026');

    // Fila de actividad exactamente como en la planilla de la imagen
    actividadesRows.push({
      'Empresa': empNombre,
      'ID/Codigo': ent.codigo,
      'Descripcion': ent.descripcion,
      'Categoria': ent.categoria || 'Ingenieria',
      'Valor Total': valorEfectivo,
      'Fecha Base (Inicio)': fechaBaseDisplay,
      'Tipo Distribucion': tipoDist,
      'Porcentaje B': pctB,
      'Porcentaje 0': pct0,
      'Porcentaje Revision Final': pctFin,
      'Dias Revision': ent.diasRevision ?? 21,
      'Intervalo Cert': ent.intervaloCert ?? 15,
      'Fecha Fin Proyecto': fechaFinDisplay,
      'Orden de Compra': ent.ordenCompra || '',
      'Incluir en Curva': ent.incluirCurva !== false ? 'si' : 'no',
      'CHO': ent.esCHO ? 'si' : 'no',
      'Observaciones': ent.observaciones || '',
    });

    // Desglose de hitos para la hoja de detalle
    let entCertSum = 0;
    let entCobradoSum = 0;

    (ent.hitos || []).forEach((h) => {
      const valorHito = (valorEfectivo * (Number(h.porcentaje) || 0)) / 100;
      let certSum = 0;
      let cobradoSum = 0;
      const certNums: string[] = [];

      (h.certificados || []).forEach((c) => {
        const imp = Number(c.importe) || 0;
        certSum += imp;
        if (c.estado === 'Cobrado') {
          cobradoSum += imp;
        }
        if (c.numero) {
          certNums.push(`N° ${c.numero} ($${imp.toLocaleString()})`);
        }
      });

      entCertSum += certSum;
      entCobradoSum += cobradoSum;

      const pendiente = Math.max(0, valorHito - certSum);
      const fechaPlanned = getHitoPlannedDate(ent, h) || h.fechaManual || '';

      let estadoHito = 'Sin certificar';
      if (certSum >= valorHito - 1 && certSum > 0) {
        estadoHito = cobradoSum >= valorHito - 1 ? 'Cobrado' : 'Certificado 100%';
      } else if (certSum > 0) {
        estadoHito = 'Parcialmente Certificado';
      }

      hitosDetalleRows.push({
        'ID/Codigo': ent.codigo,
        'Descripcion Actividad': ent.descripcion,
        'Empresa': empNombre,
        'Hito': h.nombre,
        'Porcentaje Hito (%)': Number(h.porcentaje) || 0,
        'Monto Hito (USD)': Math.round(valorHito * 100) / 100,
        'Fecha Planificada': formatExcelDisplayDate(fechaPlanned),
        'Total Certificado (USD)': Math.round(certSum * 100) / 100,
        'Total Cobrado (USD)': Math.round(cobradoSum * 100) / 100,
        'Saldo Pendiente (USD)': Math.round(pendiente * 100) / 100,
        'Estado': estadoHito,
        'Certificados': certNums.join('; '),
      });
    });

    totalProyectoCertificado += entCertSum;
    totalProyectoCobrado += entCobradoSum;
  });

  const wb = XLSX.utils.book_new();

  // Hoja 1: Actividades (Estructura principal 100% igual a la imagen)
  const wsActividades = XLSX.utils.json_to_sheet(actividadesRows);
  wsActividades['!cols'] = [
    { wch: 14 }, // Empresa
    { wch: 16 }, // ID/Codigo
    { wch: 38 }, // Descripcion
    { wch: 16 }, // Categoria
    { wch: 14 }, // Valor Total
    { wch: 20 }, // Fecha Base (Inicio)
    { wch: 18 }, // Tipo Distribucion
    { wch: 14 }, // Porcentaje B
    { wch: 14 }, // Porcentaje 0
    { wch: 24 }, // Porcentaje Revision Final
    { wch: 14 }, // Dias Revision
    { wch: 16 }, // Intervalo Cert
    { wch: 20 }, // Fecha Fin Proyecto
    { wch: 18 }, // Orden de Compra
    { wch: 16 }, // Incluir en Curva
    { wch: 8 },  // CHO
    { wch: 30 }, // Observaciones
  ];
  XLSX.utils.book_append_sheet(wb, wsActividades, 'Actividades');

  // Hoja 2: Detalle de Hitos y Certificaciones
  const wsHitos = XLSX.utils.json_to_sheet(hitosDetalleRows);
  wsHitos['!cols'] = [
    { wch: 16 }, // ID/Codigo
    { wch: 36 }, // Descripcion Actividad
    { wch: 14 }, // Empresa
    { wch: 20 }, // Hito
    { wch: 18 }, // Porcentaje Hito (%)
    { wch: 18 }, // Monto Hito (USD)
    { wch: 18 }, // Fecha Planificada
    { wch: 22 }, // Total Certificado (USD)
    { wch: 20 }, // Total Cobrado (USD)
    { wch: 20 }, // Saldo Pendiente (USD)
    { wch: 22 }, // Estado
    { wch: 30 }, // Certificados
  ];
  XLSX.utils.book_append_sheet(wb, wsHitos, 'Detalle_Hitos_y_Certificaciones');

  // Hoja 3: Carátula Financiera
  const saldoTotalProyecto = Math.max(0, totalProyectoOC - totalProyectoCertificado);
  const pctGlobal = totalProyectoOC > 0 ? ((totalProyectoCertificado / totalProyectoOC) * 100).toFixed(2) + '%' : '0%';
  const pctCobradoGlobal = totalProyectoOC > 0 ? ((totalProyectoCobrado / totalProyectoOC) * 100).toFixed(2) + '%' : '0%';

  const summaryFinanciero = [
    { 'Concepto': 'Proyecto', 'Valor': proyecto.nombre },
    { 'Concepto': 'Total de Entregables / Actividades', 'Valor': proyecto.entregables.length },
    { 'Concepto': 'Monto Total Contratado / OC (USD)', 'Valor': totalProyectoOC },
    { 'Concepto': 'Total Real Certificado (USD)', 'Valor': totalProyectoCertificado },
    { 'Concepto': 'Total Efectivamente Cobrado (USD)', 'Valor': totalProyectoCobrado },
    { 'Concepto': 'Saldo Pendiente por Certificar (USD)', 'Valor': saldoTotalProyecto },
    { 'Concepto': 'Porcentaje de Avance Certificado', 'Valor': pctGlobal },
    { 'Concepto': 'Porcentaje de Cobro en Caja', 'Valor': pctCobradoGlobal },
    { 'Concepto': 'Empresas Asignadas', 'Valor': proyecto.empresas.map((e) => e.nombre).join(', ') },
    { 'Concepto': 'Fecha de Generación del Informe', 'Valor': new Date().toLocaleDateString('es-AR') },
  ];

  const wsFin = XLSX.utils.json_to_sheet(summaryFinanciero);
  wsFin['!cols'] = [{ wch: 36 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsFin, 'Caratula_Financiera');

  // Descarga del archivo
  const safeName = (proyecto.nombre || 'proyecto').replace(/[^a-zA-Z0-9_-]/g, '_');
  const exportFile = fileName || `control_proyectos_${safeName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, exportFile);
}

/**
 * Descarga plantilla Excel idéntica a la imagen enviada por el usuario
 * Con los dos ejemplos exactos:
 * 1) B1.0001.01 - visita a sitio (estándar 60 / 30 / 10)
 * 2) B1.0002.01 - Escaneo Laser (pago_unico 0 / 0 / 100)
 */
export function downloadExcelTemplate(proyecto: Proyecto) {
  const empNombre = proyecto.empresas[0]?.nombre || 'Taging';

  const templateRows = [
    // Fila 1 (de la imagen del usuario):
    {
      'Empresa': empNombre,
      'ID/Codigo': 'B1.0001.01',
      'Descripcion': 'visita a sitio',
      'Categoria': 'Ingenieria',
      'Valor Total': 5184,
      'Fecha Base (Inicio)': '05/06/2026',
      'Tipo Distribucion': 'estandar',
      'Porcentaje B': 60,
      'Porcentaje 0': 30,
      'Porcentaje Revision Final': 10,
      'Dias Revision': 21,
      'Intervalo Cert': 15,
      'Fecha Fin Proyecto': '31/12/2026',
      'Orden de Compra': '4501465872',
      'Incluir en Curva': 'si',
      'CHO': 'no',
      'Observaciones': '',
    },
    // Fila 2 (de la imagen del usuario):
    {
      'Empresa': empNombre,
      'ID/Codigo': 'B1.0002.01',
      'Descripcion': 'Escaneo Laser',
      'Categoria': 'Ingenieria',
      'Valor Total': 12000,
      'Fecha Base (Inicio)': '12/07/2026',
      'Tipo Distribucion': 'pago_unico',
      'Porcentaje B': 0,
      'Porcentaje 0': 0,
      'Porcentaje Revision Final': 100,
      'Dias Revision': 21,
      'Intervalo Cert': 15,
      'Fecha Fin Proyecto': '',
      'Orden de Compra': '',
      'Incluir en Curva': 'si',
      'CHO': 'no',
      'Observaciones': '',
    },
  ];

  const wb = XLSX.utils.book_new();

  // Hoja 1: Actividades
  const ws = XLSX.utils.json_to_sheet(templateRows);
  ws['!cols'] = [
    { wch: 14 }, // Empresa
    { wch: 16 }, // ID/Codigo
    { wch: 30 }, // Descripcion
    { wch: 16 }, // Categoria
    { wch: 14 }, // Valor Total
    { wch: 20 }, // Fecha Base (Inicio)
    { wch: 18 }, // Tipo Distribucion
    { wch: 14 }, // Porcentaje B
    { wch: 14 }, // Porcentaje 0
    { wch: 24 }, // Porcentaje Revision Final
    { wch: 14 }, // Dias Revision
    { wch: 16 }, // Intervalo Cert
    { wch: 20 }, // Fecha Fin Proyecto
    { wch: 18 }, // Orden de Compra
    { wch: 16 }, // Incluir en Curva
    { wch: 8 },  // CHO
    { wch: 24 }, // Observaciones
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Actividades');

  // Hoja 2: Guía de Uso Rápida
  const guia = [
    {
      'Columna': 'Empresa',
      'Descripción': 'Nombre de la empresa asignada (ej: Taging).',
    },
    {
      'Columna': 'ID/Codigo',
      'Descripción': 'Código único de la actividad (ej: B1.0001.01).',
    },
    {
      'Columna': 'Descripcion',
      'Descripción': 'Nombre o descripción de la tarea o entregable.',
    },
    {
      'Columna': 'Categoria',
      'Descripción': 'Especialidad (ej: Ingenieria, Civil, Mecanica, etc.).',
    },
    {
      'Columna': 'Valor Total',
      'Descripción': 'Monto contractual total de la actividad.',
    },
    {
      'Columna': 'Fecha Base (Inicio)',
      'Descripción': 'Fecha de inicio en formato DD/MM/AAAA (ej: 05/06/2026) o AAAA-MM-DD.',
    },
    {
      'Columna': 'Tipo Distribucion',
      'Descripción': 'estandar (genera hitos B, 0 y final automáticamente) o pago_unico (un solo hito 100%).',
    },
    {
      'Columna': 'Porcentaje B / 0 / Final',
      'Descripción': 'Porcentajes para cada hito (ej: 60, 30 y 10 para estándar, o 0, 0 y 100 para pago único).',
    },
    {
      'Columna': 'Dias Revision / Intervalo',
      'Descripción': 'Días entre hitos (por defecto 21 días de revisión y 15 de intervalo).',
    },
    {
      'Columna': 'Fecha Fin Proyecto',
      'Descripción': 'Fecha del hito final para distribución estándar.',
    },
    {
      'Columna': 'Incluir en Curva / CHO',
      'Descripción': 'Escribir "si" o "no".',
    },
  ];

  const wsGuia = XLSX.utils.json_to_sheet(guia);
  wsGuia['!cols'] = [{ wch: 26 }, { wch: 75 }];
  XLSX.utils.book_append_sheet(wb, wsGuia, 'Guia_Columnas');

  XLSX.writeFile(wb, `plantilla_carga_actividades_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Procesa la planilla Excel subida por el usuario:
 * Detecta la estructura por actividad (formato de la imagen: 1 fila = 1 actividad)
 * Y calcula automáticamente los hitos en base a "Tipo Distribucion" y los porcentajes (ej: 60/30/10 o pago_unico 100%)
 */
export async function parseExcelData(file: File, proyecto: Proyecto): Promise<ParsedBulkImportResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  // Buscar la primera hoja de datos (ignorar guías o instrucciones)
  const sheetName = workbook.SheetNames.find((n) => {
    const lower = n.toLowerCase();
    return !lower.includes('guia') && !lower.includes('instruccion') && !lower.includes('financier');
  }) || workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error('El archivo Excel no contiene hojas de datos.');
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('La planilla Excel seleccionada no contiene filas de datos.');
  }

  const parsedRows: ParsedExcelRow[] = [];
  const errors: string[] = [];

  const empNameToId = new Map<string, string>();
  proyecto.empresas.forEach((e) => {
    empNameToId.set(e.nombre.toLowerCase().trim(), e.id);
  });
  const defaultEmpresaId = proyecto.empresas[0]?.id || 'emp_taging';

  const existingMap = new Map<string, Entregable>();
  proyecto.entregables.forEach((e) => existingMap.set(e.codigo.toLowerCase().trim(), e));

  const groupedEntregables: Entregable[] = [];
  let newCount = 0;
  let updatedCount = 0;
  let totalImportValue = 0;

  rawRows.forEach((row, idx) => {
    const map = new Map<string, any>();
    Object.keys(row).forEach((k) => {
      map.set(normalizeKey(k), row[k]);
    });

    const getVal = (...aliases: string[]) => {
      for (const alias of aliases) {
        const norm = normalizeKey(alias);
        if (map.has(norm) && map.get(norm) !== '') {
          return map.get(norm);
        }
      }
      return '';
    };

    // Lectura de campos según los encabezados de la imagen
    const codigo = String(getVal('idcodigo', 'codigo', 'identregable', 'id', 'cod', 'actividad')).trim();
    const descripcion = String(getVal('descripcion', 'nombre', 'detalle', 'titulo')).trim();
    const empresaVal = String(getVal('empresa', 'empresanombre', 'cliente', 'contratista')).trim();
    const categoria = String(getVal('categoria', 'disciplina', 'especialidad', 'tipo')).trim() || 'Ingenieria';
    
    const valorTotalRaw = getVal('valortotal', 'total', 'monto', 'presupuesto', 'importe', 'precio');
    const valorTotal = typeof valorTotalRaw === 'number'
      ? valorTotalRaw
      : parseFloat(String(valorTotalRaw).replace(/[^0-9.-]/g, '')) || 0;

    const fechaBaseRaw = getVal('fechabaseinicio', 'fechabase', 'fechainicio', 'inicio');
    const fechaBase = parseFlexibleExcelDate(fechaBaseRaw) || '2026-06-01';

    const tipoDistribucionRaw = String(getVal('tipodistribucion', 'distribucion', 'tipo')).toLowerCase().trim();
    
    // Porcentajes de hitos
    const pctBRaw = getVal('porcentajeb', 'porcentajebase', 'emisionb', 'pctb');
    const pct0Raw = getVal('porcentaje0', 'emision0', 'pct0');
    const pctFinRaw = getVal('porcentajerevisionfinal', 'porcentajefinal', 'porcentajerestante', 'cierre', 'pctfin');

    const pctB = pctBRaw !== '' ? Number(pctBRaw) : undefined;
    const pct0 = pct0Raw !== '' ? Number(pct0Raw) : undefined;
    const pctFin = pctFinRaw !== '' ? Number(pctFinRaw) : undefined;

    const diasRevisionRaw = getVal('diasrevision', 'revision', 'diasrev');
    const diasRevision = diasRevisionRaw !== '' ? Number(diasRevisionRaw) : 21;

    const intervaloCertRaw = getVal('intervalocert', 'intervalo', 'diasintervalo');
    const intervaloCert = intervaloCertRaw !== '' ? Number(intervaloCertRaw) : 15;

    const fechaFinProyectoRaw = getVal('fechafinproyecto', 'fechafin', 'fin');
    const fechaFinProyecto = parseFlexibleExcelDate(fechaFinProyectoRaw) || '2026-12-31';

    const ordenCompra = String(getVal('ordendecompra', 'ordencompra', 'oc', 'po', 'numoc')).trim();

    const incluirCurvaRaw = String(getVal('incluirencurva', 'incluirencurvas', 'curva', 'curvas')).toLowerCase().trim();
    const incluirCurva = !(incluirCurvaRaw === 'no' || incluirCurvaRaw === 'false' || incluirCurvaRaw === '0');

    const esCHORaw = String(getVal('cho', 'escho', 'adicional')).toLowerCase().trim();
    const esCHO = esCHORaw === 'si' || esCHORaw === 'true' || esCHORaw === '1' || esCHORaw === 'yes';

    const observaciones = String(getVal('observaciones', 'notas', 'comentarios')).trim();

    // Validaciones básicas de la fila
    const rowErrors: string[] = [];
    if (!codigo) rowErrors.push('Falta el Código de actividad.');
    if (!descripcion) rowErrors.push('Falta la Descripción de la actividad.');
    if (valorTotal <= 0) rowErrors.push('El Valor Total debe ser mayor a 0.');

    const isValid = rowErrors.length === 0;

    // Determinar si es pago único
    const isPagoUnico =
      tipoDistribucionRaw === 'pago_unico' ||
      tipoDistribucionRaw === 'pagounico' ||
      tipoDistribucionRaw === 'unico' ||
      (pctFin === 100 && (pctB === 0 || pctB === undefined) && (pct0 === 0 || pct0 === undefined));

    const tipoDistribucionFinal = isPagoUnico ? 'pago_unico' : 'estandar';

    // Generación automática de Hitos tal como lo hace el modal interno de la app
    let hitos: Hito[] = [];
    const existing = existingMap.get(codigo.toLowerCase().trim());

    if (isPagoUnico) {
      hitos = [
        {
          id: existing?.hitos?.[0]?.id || `hito_${Date.now()}_pu_${idx}`,
          nombre: 'Pago único',
          porcentaje: 100,
          reglaFecha: 'pago_unico',
          diasAdicionales: 0,
          fechaManual: fechaBase,
          certificados: existing?.hitos?.[0]?.certificados || [],
        },
      ];
    } else {
      const pB = pctB !== undefined ? pctB : 60;
      const p0 = pct0 !== undefined ? pct0 : 30;
      const pFin = pctFin !== undefined ? pctFin : 10;

      const dateB = addDays(fechaBase, diasRevision);
      const date0 = addDays(dateB, intervaloCert);
      const dateFin = fechaFinProyecto;

      hitos = [
        {
          id: existing?.hitos?.[0]?.id || `hito_${Date.now()}_b_${idx}`,
          nombre: 'Emisión B',
          porcentaje: pB,
          reglaFecha: 'emision_b',
          diasAdicionales: diasRevision,
          fechaManual: dateB,
          certificados: existing?.hitos?.[0]?.certificados || [],
        },
        {
          id: existing?.hitos?.[1]?.id || `hito_${Date.now()}_0_${idx}`,
          nombre: 'Emisión 0',
          porcentaje: p0,
          reglaFecha: 'emision_0',
          diasAdicionales: intervaloCert,
          fechaManual: date0,
          certificados: existing?.hitos?.[1]?.certificados || [],
        },
        {
          id: existing?.hitos?.[2]?.id || `hito_${Date.now()}_fin_${idx}`,
          nombre: 'Restante Final',
          porcentaje: pFin,
          reglaFecha: 'cierre',
          diasAdicionales: 0,
          fechaManual: dateFin,
          certificados: existing?.hitos?.[2]?.certificados || [],
        },
      ];
    }

    // Determinar ID de empresa
    let empresaId = defaultEmpresaId;
    if (empresaVal) {
      const match = empNameToId.get(empresaVal.toLowerCase().trim());
      if (match) empresaId = match;
    }

    const deliverable: Entregable = {
      id: existing?.id || `ent_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      empresaId: existing?.empresaId || empresaId,
      codigo,
      descripcion,
      categoria: categoria || existing?.categoria || 'Ingenieria',
      ordenCompra: ordenCompra || existing?.ordenCompra || '',
      valorTotal,
      fechaBase,
      tipoDistribucion: tipoDistribucionFinal,
      porcentajes: {
        emisionB: isPagoUnico ? 0 : (pctB ?? 60),
        emision0: isPagoUnico ? 0 : (pct0 ?? 30),
        restante: isPagoUnico ? 100 : (pctFin ?? 10),
      },
      diasRevision,
      intervaloCert,
      fechaFinProyecto,
      hitos,
      incluirCurva,
      esCHO,
      observaciones: observaciones || existing?.observaciones || '',
    };

    parsedRows.push({
      codigo: codigo || `SIN_CODIGO_${idx + 1}`,
      descripcion: descripcion || `Sin descripción ${idx + 1}`,
      empresaNombre: empresaVal || proyecto.empresas[0]?.nombre || 'Taging',
      categoria,
      ordenCompra,
      valorTotal,
      fechaBase,
      tipoDistribucion: tipoDistribucionFinal,
      porcentajeB: pctB,
      porcentaje0: pct0,
      porcentajeRevisionFinal: pctFin,
      diasRevision,
      intervaloCert,
      fechaFinProyecto,
      incluirCurva,
      esCHO,
      observaciones,
      hitoNombre: isPagoUnico ? 'Pago único (100%)' : `3 Hitos (${pctB ?? 60}% / ${pct0 ?? 30}% / ${pctFin ?? 10}%)`,
      hitoPorcentaje: 100,
      fechaPrevista: fechaBase,
      reglaFecha: tipoDistribucionFinal,
      isValid,
      errors: rowErrors,
    });

    if (isValid) {
      groupedEntregables.push(deliverable);
      totalImportValue += valorTotal;
      if (existing) {
        updatedCount++;
      } else {
        newCount++;
      }
    }
  });

  return {
    rows: parsedRows,
    groupedEntregables,
    totalRows: parsedRows.length,
    validRows: parsedRows.filter((r) => r.isValid).length,
    newDeliverablesCount: newCount,
    updatedDeliverablesCount: updatedCount,
    totalValue: totalImportValue,
    errors,
  };
}
