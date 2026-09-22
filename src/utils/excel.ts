import * as XLSX from 'xlsx';
import { Proyecto, Entregable, Hito, Empresa } from '../types';
import { getEntregableValorEfectivo, getHitoPlannedDate, normalizeDate, addDays } from './calculations';

export interface ColumnMapping {
  codigo: string;
  descripcion: string;
  unidad?: string;
  cantidad?: string;
  precioUnitario?: string;
  valorTotal?: string;
  categoria?: string;
  fechaBase?: string;
  fechaFinProyecto?: string;
  tipoDistribucion?: string;
  porcentajeB?: string;
  porcentaje0?: string;
  porcentajeRevisionFinal?: string;
  diasRevision?: string;
  intervaloCert?: string;
  ordenCompra?: string;
  incluirCurva?: string;
  esCHO?: string;
  empresaNombre?: string;
  observaciones?: string;
}

export interface ParsedExcelRow {
  codigo: string;
  descripcion: string;
  unidad?: string;
  cantidad?: number;
  precioUnitario?: number;
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
  mappingUsed?: ColumnMapping;
}

export interface WorkbookAnalysis {
  workbook: XLSX.WorkBook;
  sheetNames: string[];
  activeSheet: string;
  headers: string[];
  rawRows: Record<string, any>[];
  suggestedMapping: ColumnMapping;
}

/**
 * Normaliza nombres de columna para emparejar flexiblemente
 */
export function normalizeKey(key: string): string {
  return String(key || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Convierte diferentes formatos de fecha a AAAA-MM-DD
 */
export function parseFlexibleExcelDate(rawVal: any): string {
  if (!rawVal) return '';

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

  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      let day = parts[0].trim().padStart(2, '0');
      let month = parts[1].trim().padStart(2, '0');
      let year = parts[2].trim();
      if (year.length === 2) year = `20${year}`;
      if (parseInt(month, 10) > 12 && parseInt(day, 10) <= 12) {
        const tmp = day;
        day = month;
        month = tmp;
      }
      return `${year}-${month}-${day}`;
    }
  }

  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return str;
      } else if (parts[2].length === 4) {
        const day = parts[0].trim().padStart(2, '0');
        const month = parts[1].trim().padStart(2, '0');
        const year = parts[2].trim();
        return `${year}-${month}-${day}`;
      }
    }
  }

  return normalizeDate(str) || '';
}

function formatExcelDisplayDate(isoDate: string | undefined): string {
  if (!isoDate) return '';
  const norm = normalizeDate(isoDate);
  if (!norm) return '';
  const [y, m, d] = norm.split('-');
  return `${d}/${m}/${y}`;
}

const FIELD_ALIASES: Record<keyof ColumnMapping, string[]> = {
  codigo: ['idcodigo', 'codigo', 'cod', 'identregable', 'item', 'rubro', 'id', 'wbs', 'nro', 'actividad'],
  descripcion: ['descripcion', 'detalle', 'concepto', 'nombre', 'tarea', 'titulo', 'actividad', 'denominacion'],
  unidad: ['unidad', 'unid', 'un', 'u', 'medida', 'ud', 'um', 'unit'],
  cantidad: ['cantidad', 'cant', 'metrado', 'computo', 'volumen', 'unidades', 'cantidades', 'qty'],
  precioUnitario: ['preciounitario', 'pu', 'punitario', 'precio', 'costounitario', 'cu', 'tarifa', 'valorunitario', 'punit'],
  valorTotal: ['valortotal', 'total', 'monto', 'presupuesto', 'importe', 'subtotal', 'preciototal', 'montototal'],
  categoria: ['categoria', 'rubro', 'disciplina', 'especialidad', 'tipo', 'fase', 'etapa', 'seccion'],
  fechaBase: ['fechabaseinicio', 'fechabase', 'fechainicio', 'inicio', 'fecha', 'start', 'fechacomienzo'],
  fechaFinProyecto: ['fechafinproyecto', 'fechafin', 'fin', 'termino', 'finalizacion', 'end', 'fechatermino'],
  tipoDistribucion: ['tipodistribucion', 'distribucion', 'tipohitos', 'tipo', 'esquema'],
  porcentajeB: ['porcentajeb', 'porcentajebase', 'emisionb', 'pctb'],
  porcentaje0: ['porcentaje0', 'emision0', 'pct0'],
  porcentajeRevisionFinal: ['porcentajerevisionfinal', 'porcentajefinal', 'porcentajerestante', 'cierre', 'pctfin'],
  diasRevision: ['diasrevision', 'revision', 'diasrev'],
  intervaloCert: ['intervalocert', 'intervalo', 'diasintervalo'],
  ordenCompra: ['ordendecompra', 'ordencompra', 'oc', 'po', 'numoc', 'contrato'],
  incluirCurva: ['incluirencurva', 'curva', 'curvas', 'graficar'],
  esCHO: ['cho', 'escho', 'adicional', 'cambiodealcance'],
  empresaNombre: ['empresa', 'empresanombre', 'cliente', 'contratista', 'subcontratista'],
  observaciones: ['observaciones', 'notas', 'comentarios', 'observacion', 'comentario'],
};

/**
 * Encuentra el mejor encabezado coincidente de la lista
 */
export function findBestHeader(headers: string[], field: keyof ColumnMapping): string {
  const aliases = FIELD_ALIASES[field] || [];
  for (const alias of aliases) {
    const found = headers.find((h) => normalizeKey(h) === alias);
    if (found) return found;
  }
  for (const alias of aliases) {
    const found = headers.find((h) => normalizeKey(h).includes(alias));
    if (found) return found;
  }
  return '';
}

/**
 * Genera el mapeo sugerido de columnas analizando los encabezados
 */
export function detectSuggestedMapping(headers: string[]): ColumnMapping {
  return {
    codigo: findBestHeader(headers, 'codigo') || headers[0] || '',
    descripcion: findBestHeader(headers, 'descripcion') || headers[1] || '',
    unidad: findBestHeader(headers, 'unidad'),
    cantidad: findBestHeader(headers, 'cantidad'),
    precioUnitario: findBestHeader(headers, 'precioUnitario'),
    valorTotal: findBestHeader(headers, 'valorTotal'),
    categoria: findBestHeader(headers, 'categoria'),
    fechaBase: findBestHeader(headers, 'fechaBase'),
    fechaFinProyecto: findBestHeader(headers, 'fechaFinProyecto'),
    tipoDistribucion: findBestHeader(headers, 'tipoDistribucion'),
    porcentajeB: findBestHeader(headers, 'porcentajeB'),
    porcentaje0: findBestHeader(headers, 'porcentaje0'),
    porcentajeRevisionFinal: findBestHeader(headers, 'porcentajeRevisionFinal'),
    diasRevision: findBestHeader(headers, 'diasRevision'),
    intervaloCert: findBestHeader(headers, 'intervaloCert'),
    ordenCompra: findBestHeader(headers, 'ordenCompra'),
    incluirCurva: findBestHeader(headers, 'incluirCurva'),
    esCHO: findBestHeader(headers, 'esCHO'),
    empresaNombre: findBestHeader(headers, 'empresaNombre'),
    observaciones: findBestHeader(headers, 'observaciones'),
  };
}

/**
 * Lee el archivo Excel y devuelve las hojas, datos brutos y mapeo sugerido
 */
export async function analyzeExcelWorkbook(file: File, selectedSheet?: string): Promise<WorkbookAnalysis> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('El archivo Excel no contiene hojas de datos.');
  }

  const sheetNames = workbook.SheetNames;
  let activeSheet = selectedSheet;
  if (!activeSheet || !sheetNames.includes(activeSheet)) {
    activeSheet = sheetNames.find((n) => {
      const lower = n.toLowerCase();
      return !lower.includes('guia') && !lower.includes('instruccion') && !lower.includes('financier');
    }) || sheetNames[0];
  }

  const worksheet = workbook.Sheets[activeSheet];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  // Obtener encabezados
  const headers: string[] = [];
  if (rawRows.length > 0) {
    Object.keys(rawRows[0]).forEach((k) => {
      if (k && !headers.includes(k)) headers.push(k);
    });
  }

  const suggestedMapping = detectSuggestedMapping(headers);

  return {
    workbook,
    sheetNames,
    activeSheet,
    headers,
    rawRows,
    suggestedMapping,
  };
}

/**
 * Parsea las filas aplicando el mapeo de columnas explícito o inferido
 */
export function parseExcelWithMapping(
  rawRows: Record<string, any>[],
  mapping: ColumnMapping,
  proyecto: Proyecto
): ParsedBulkImportResult {
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
    const getValue = (headerName?: string): any => {
      if (!headerName || !row) return '';
      return row[headerName] !== undefined ? row[headerName] : '';
    };

    const codigo = String(getValue(mapping.codigo) || '').trim();
    const descripcion = String(getValue(mapping.descripcion) || '').trim();
    const unidad = String(getValue(mapping.unidad) || '').trim();

    // Cantidad
    const cantRaw = getValue(mapping.cantidad);
    const cantidad = cantRaw !== ''
      ? (typeof cantRaw === 'number' ? cantRaw : parseFloat(String(cantRaw).replace(/[^0-9.-]/g, '')) || 0)
      : undefined;

    // Precio Unitario
    const puRaw = getValue(mapping.precioUnitario);
    const precioUnitario = puRaw !== ''
      ? (typeof puRaw === 'number' ? puRaw : parseFloat(String(puRaw).replace(/[^0-9.-]/g, '')) || 0)
      : undefined;

    // Valor Total: si viene mapeado se toma, sino si hay cantidad y precioUnitario se calcula automáticamente
    const vtRaw = getValue(mapping.valorTotal);
    let valorTotal = vtRaw !== ''
      ? (typeof vtRaw === 'number' ? vtRaw : parseFloat(String(vtRaw).replace(/[^0-9.-]/g, '')) || 0)
      : 0;

    if (valorTotal === 0 && cantidad && precioUnitario) {
      valorTotal = Math.round(cantidad * precioUnitario * 100) / 100;
    }

    const empresaVal = String(getValue(mapping.empresaNombre) || '').trim();
    const categoria = String(getValue(mapping.categoria) || '').trim() || 'Ingeniería / Obras';

    const fechaBaseRaw = getValue(mapping.fechaBase);
    const fechaBase = parseFlexibleExcelDate(fechaBaseRaw) || '2026-06-01';

    const tipoDistribucionRaw = String(getValue(mapping.tipoDistribucion) || '').toLowerCase().trim();

    const pctBRaw = getValue(mapping.porcentajeB);
    const pct0Raw = getValue(mapping.porcentaje0);
    const pctFinRaw = getValue(mapping.porcentajeRevisionFinal);

    const pctB = pctBRaw !== '' ? Number(pctBRaw) : undefined;
    const pct0 = pct0Raw !== '' ? Number(pct0Raw) : undefined;
    const pctFin = pctFinRaw !== '' ? Number(pctFinRaw) : undefined;

    const diasRevisionRaw = getValue(mapping.diasRevision);
    const diasRevision = diasRevisionRaw !== '' ? Number(diasRevisionRaw) : 21;

    const intervaloCertRaw = getValue(mapping.intervaloCert);
    const intervaloCert = intervaloCertRaw !== '' ? Number(intervaloCertRaw) : 15;

    const fechaFinProyectoRaw = getValue(mapping.fechaFinProyecto);
    const fechaFinProyecto = parseFlexibleExcelDate(fechaFinProyectoRaw) || '2026-12-31';

    const ordenCompra = String(getValue(mapping.ordenCompra) || '').trim();

    const incluirCurvaRaw = String(getValue(mapping.incluirCurva) || '').toLowerCase().trim();
    const incluirCurva = !(incluirCurvaRaw === 'no' || incluirCurvaRaw === 'false' || incluirCurvaRaw === '0');

    const esCHORaw = String(getValue(mapping.esCHO) || '').toLowerCase().trim();
    const esCHO = esCHORaw === 'si' || esCHORaw === 'true' || esCHORaw === '1' || esCHORaw === 'yes';

    const observaciones = String(getValue(mapping.observaciones) || '').trim();

    // Validaciones
    const rowErrors: string[] = [];
    if (!codigo) rowErrors.push('Falta el Código / Ítem.');
    if (!descripcion) rowErrors.push('Falta la Descripción.');
    if (valorTotal <= 0) rowErrors.push('El Valor Total debe ser mayor a 0 (o ingresar Cantidad y P.U.).');

    const isValid = rowErrors.length === 0;

    const isPagoUnico =
      tipoDistribucionRaw === 'pago_unico' ||
      tipoDistribucionRaw === 'pagounico' ||
      tipoDistribucionRaw === 'unico' ||
      (pctFin === 100 && (pctB === 0 || pctB === undefined) && (pct0 === 0 || pct0 === undefined));

    const tipoDistribucionFinal = isPagoUnico ? 'pago_unico' : 'estandar';

    let hitos: Hito[] = [];
    const existing = existingMap.get(codigo.toLowerCase().trim());

    if (isPagoUnico) {
      hitos = [
        {
          id: existing?.hitos?.[0]?.id || `hito_${Date.now()}_pu_${idx}`,
          nombre: 'Pago único (100%)',
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
      categoria: categoria || existing?.categoria || 'Ingeniería / Obras',
      ordenCompra: ordenCompra || existing?.ordenCompra || '',
      valorTotal,
      unidad: unidad || existing?.unidad || '',
      cantidad: cantidad !== undefined ? cantidad : existing?.cantidad,
      precioUnitario: precioUnitario !== undefined ? precioUnitario : existing?.precioUnitario,
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
      unidad,
      cantidad,
      precioUnitario,
      empresaNombre: empresaVal || proyecto.empresas[0]?.nombre || 'VEL',
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
    mappingUsed: mapping,
  };
}

/**
 * Función compatible directa
 */
export async function parseExcelData(file: File, proyecto: Proyecto): Promise<ParsedBulkImportResult> {
  const analysis = await analyzeExcelWorkbook(file);
  return parseExcelWithMapping(analysis.rawRows, analysis.suggestedMapping, proyecto);
}

/**
 * Exporta el proyecto completo a Excel con Cómputo y Presupuesto, Cronograma e Hitos
 */
export function exportProjectToExcel(proyecto: Proyecto, fileName?: string) {
  const empMap = new Map<string, string>();
  proyecto.empresas.forEach((e) => empMap.set(e.id, e.nombre));

  let totalProyectoOC = 0;
  let totalProyectoCertificado = 0;
  let totalProyectoCobrado = 0;

  // Hoja 1: Cómputo y Presupuesto de Obra
  const computoRows: any[] = [];
  // Hoja 2: Cronograma y Actividades
  const actividadesRows: any[] = [];
  // Hoja 3: Detalle de Hitos y Certificaciones
  const hitosDetalleRows: any[] = [];

  proyecto.entregables.forEach((ent, idx) => {
    const valorEfectivo = getEntregableValorEfectivo(ent, proyecto);
    totalProyectoOC += valorEfectivo;

    let entCertSum = 0;
    let entCobradoSum = 0;
    (ent.hitos || []).forEach((h) => {
      (h.certificados || []).forEach((c) => {
        const imp = Number(c.importe) || 0;
        entCertSum += imp;
        if (c.estado === 'Cobrado') entCobradoSum += imp;
      });
    });

    const empNombre = ent.empresaId
      ? empMap.get(ent.empresaId) || ent.empresaId
      : proyecto.empresas[0]?.nombre || 'VEL';

    const avancePct = valorEfectivo > 0 ? (entCertSum / valorEfectivo) * 100 : 0;
    const saldoPendiente = Math.max(0, valorEfectivo - entCertSum);

    // Hoja 1: Cómputo y Presupuesto
    computoRows.push({
      'Item': idx + 1,
      'Código / Rubro': ent.codigo,
      'Descripción del Trabajo': ent.descripcion,
      'Categoría / Especialidad': ent.categoria || 'Ingeniería / Obras',
      'Unidad': ent.unidad || 'gl',
      'Cantidad': ent.cantidad ?? 1,
      'Precio Unitario ($)': ent.precioUnitario ?? valorEfectivo,
      'Monto Contratado Total ($)': valorEfectivo,
      'Avance Certificado ($)': entCertSum,
      '% Avance Físico': `${avancePct.toFixed(1)}%`,
      'Saldo por Certificar ($)': saldoPendiente,
      'Orden de Compra': ent.ordenCompra || '',
      'Contratista / Empresa': empNombre,
    });

    // Hoja 2: Cronograma y Actividades
    const isPagoUnico = ent.tipoDistribucion === 'pago_unico' || (ent.hitos && ent.hitos.length === 1);
    const tipoDist = isPagoUnico ? 'pago_unico' : (ent.tipoDistribucion || 'estandar');

    actividadesRows.push({
      'Empresa': empNombre,
      'ID/Codigo': ent.codigo,
      'Descripcion': ent.descripcion,
      'Categoria': ent.categoria || 'Ingeniería / Obras',
      'Valor Total': valorEfectivo,
      'Fecha Base (Inicio)': formatExcelDisplayDate(ent.fechaBase) || '01/06/2026',
      'Tipo Distribucion': tipoDist,
      'Porcentaje B': ent.porcentajes?.emisionB ?? (isPagoUnico ? 0 : 60),
      'Porcentaje 0': ent.porcentajes?.emision0 ?? (isPagoUnico ? 0 : 30),
      'Porcentaje Revision Final': ent.porcentajes?.restante ?? (isPagoUnico ? 100 : 10),
      'Dias Revision': ent.diasRevision ?? 21,
      'Intervalo Cert': ent.intervaloCert ?? 15,
      'Fecha Fin Proyecto': formatExcelDisplayDate(ent.fechaFinProyecto) || '31/12/2026',
      'Orden de Compra': ent.ordenCompra || '',
      'Incluir en Curva': ent.incluirCurva !== false ? 'si' : 'no',
      'CHO': ent.esCHO ? 'si' : 'no',
      'Observaciones': ent.observaciones || '',
    });

    // Hoja 3: Detalle de Hitos
    (ent.hitos || []).forEach((h) => {
      const valorHito = (valorEfectivo * (Number(h.porcentaje) || 0)) / 100;
      let certSumHito = 0;
      let cobradoSumHito = 0;
      const certNums: string[] = [];

      (h.certificados || []).forEach((c) => {
        const imp = Number(c.importe) || 0;
        certSumHito += imp;
        if (c.estado === 'Cobrado') cobradoSumHito += imp;
        if (c.numero) certNums.push(`N° ${c.numero} ($${imp.toLocaleString()})`);
      });

      const pendienteHito = Math.max(0, valorHito - certSumHito);
      const fechaPlanned = getHitoPlannedDate(ent, h) || h.fechaManual || '';

      let estadoHito = 'Sin certificar';
      if (certSumHito >= valorHito - 1 && certSumHito > 0) {
        estadoHito = cobradoSumHito >= valorHito - 1 ? 'Cobrado' : 'Certificado 100%';
      } else if (certSumHito > 0) {
        estadoHito = 'Parcialmente Certificado';
      }

      hitosDetalleRows.push({
        'ID/Codigo': ent.codigo,
        'Descripcion Actividad': ent.descripcion,
        'Empresa': empNombre,
        'Hito': h.nombre,
        'Porcentaje Hito (%)': Number(h.porcentaje) || 0,
        'Monto Hito ($)': Math.round(valorHito * 100) / 100,
        'Fecha Planificada': formatExcelDisplayDate(fechaPlanned),
        'Total Certificado ($)': Math.round(certSumHito * 100) / 100,
        'Total Cobrado ($)': Math.round(cobradoSumHito * 100) / 100,
        'Saldo Pendiente ($)': Math.round(pendienteHito * 100) / 100,
        'Estado': estadoHito,
        'Certificados': certNums.join('; '),
      });
    });

    totalProyectoCertificado += entCertSum;
    totalProyectoCobrado += entCobradoSum;
  });

  const wb = XLSX.utils.book_new();

  // Hoja 1: Cómputo y Presupuesto
  const wsComputo = XLSX.utils.json_to_sheet(computoRows);
  wsComputo['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 38 },
    { wch: 22 },
    { wch: 8 },
    { wch: 12 },
    { wch: 18 },
    { wch: 22 },
    { wch: 20 },
    { wch: 14 },
    { wch: 20 },
    { wch: 16 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsComputo, 'Computo_y_Presupuesto');

  // Hoja 2: Cronograma y Actividades
  const wsActividades = XLSX.utils.json_to_sheet(actividadesRows);
  wsActividades['!cols'] = [
    { wch: 14 },
    { wch: 16 },
    { wch: 36 },
    { wch: 16 },
    { wch: 14 },
    { wch: 20 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 24 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
    { wch: 18 },
    { wch: 16 },
    { wch: 8 },
    { wch: 28 },
  ];
  XLSX.utils.book_append_sheet(wb, wsActividades, 'Cronograma_y_Actividades');

  // Hoja 3: Detalle de Hitos
  const wsHitos = XLSX.utils.json_to_sheet(hitosDetalleRows);
  wsHitos['!cols'] = [
    { wch: 16 },
    { wch: 36 },
    { wch: 14 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsHitos, 'Detalle_Hitos');

  // Hoja 4: Carátula Financiera
  const saldoTotalProyecto = Math.max(0, totalProyectoOC - totalProyectoCertificado);
  const pctGlobal = totalProyectoOC > 0 ? ((totalProyectoCertificado / totalProyectoOC) * 100).toFixed(2) + '%' : '0%';
  const pctCobradoGlobal = totalProyectoOC > 0 ? ((totalProyectoCobrado / totalProyectoOC) * 100).toFixed(2) + '%' : '0%';

  const summaryFinanciero = [
    { 'Concepto': 'Proyecto', 'Valor': proyecto.nombre },
    { 'Concepto': 'Total de Entregables / Rubros', 'Valor': proyecto.entregables.length },
    { 'Concepto': 'Monto Total Contratado / Presupuesto ($)', 'Valor': totalProyectoOC },
    { 'Concepto': 'Total Real Certificado ($)', 'Valor': totalProyectoCertificado },
    { 'Concepto': 'Total Cobrado ($)', 'Valor': totalProyectoCobrado },
    { 'Concepto': 'Saldo Pendiente por Certificar ($)', 'Valor': saldoTotalProyecto },
    { 'Concepto': 'Porcentaje de Avance Certificado', 'Valor': pctGlobal },
    { 'Concepto': 'Porcentaje de Cobro en Caja', 'Valor': pctCobradoGlobal },
    { 'Concepto': 'Empresas Asignadas', 'Valor': proyecto.empresas.map((e) => e.nombre).join(', ') },
    { 'Concepto': 'Fecha de Generación del Informe', 'Valor': new Date().toLocaleDateString('es-AR') },
  ];

  const wsFin = XLSX.utils.json_to_sheet(summaryFinanciero);
  wsFin['!cols'] = [{ wch: 36 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsFin, 'Caratula_Financiera');

  const safeName = (proyecto.nombre || 'proyecto').replace(/[^a-zA-Z0-9_-]/g, '_');
  const exportFile = fileName || `control_obra_${safeName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, exportFile);
}

/**
 * Descarga plantilla completa para Cómputo y Presupuesto o Cronograma
 */
export function downloadExcelTemplate(proyecto: Proyecto) {
  const empNombre = proyecto.empresas[0]?.nombre || 'VEL';

  const templateRows = [
    {
      'Item': '1.01',
      'Código': 'OB-001',
      'Descripción': 'Hormigón elaborado H-21 para platea y bases',
      'Categoría': 'Estructuras',
      'Unidad': 'm3',
      'Cantidad': 85.5,
      'Precio Unitario': 185.00,
      'Valor Total': 15817.50,
      'Fecha Base (Inicio)': '05/06/2026',
      'Tipo Distribucion': 'estandar',
      'Porcentaje B': 60,
      'Porcentaje 0': 30,
      'Porcentaje Revision Final': 10,
      'Dias Revision': 21,
      'Intervalo Cert': 15,
      'Fecha Fin Proyecto': '31/12/2026',
      'Orden de Compra': 'OC-450146',
      'Incluir en Curva': 'si',
      'CHO': 'no',
      'Empresa': empNombre,
      'Observaciones': 'Incluye bombeo y ensayos de probetas',
    },
    {
      'Item': '1.02',
      'Código': 'OB-002',
      'Descripción': 'Mampostería de ladrillo cerámico hueco 18x18x33',
      'Categoría': 'Albañilería',
      'Unidad': 'm2',
      'Cantidad': 340.0,
      'Precio Unitario': 32.50,
      'Valor Total': 11050.00,
      'Fecha Base (Inicio)': '20/06/2026',
      'Tipo Distribucion': 'estandar',
      'Porcentaje B': 60,
      'Porcentaje 0': 30,
      'Porcentaje Revision Final': 10,
      'Dias Revision': 21,
      'Intervalo Cert': 15,
      'Fecha Fin Proyecto': '31/12/2026',
      'Orden de Compra': 'OC-450146',
      'Incluir en Curva': 'si',
      'CHO': 'no',
      'Empresa': empNombre,
      'Observaciones': '',
    },
    {
      'Item': '1.03',
      'Código': 'OB-003',
      'Descripción': 'Servicio de Escaneo Láser y Nube de Puntos 3D',
      'Categoría': 'Ingeniería',
      'Unidad': 'gl',
      'Cantidad': 1,
      'Precio Unitario': 8400.00,
      'Valor Total': 8400.00,
      'Fecha Base (Inicio)': '12/07/2026',
      'Tipo Distribucion': 'pago_unico',
      'Porcentaje B': 0,
      'Porcentaje 0': 0,
      'Porcentaje Revision Final': 100,
      'Dias Revision': 21,
      'Intervalo Cert': 15,
      'Fecha Fin Proyecto': '',
      'Orden de Compra': 'OC-450180',
      'Incluir en Curva': 'si',
      'CHO': 'no',
      'Empresa': empNombre,
      'Observaciones': 'Entrega final única',
    },
  ];

  const wb = XLSX.utils.book_new();

  const ws = XLSX.utils.json_to_sheet(templateRows);
  ws['!cols'] = [
    { wch: 8 },
    { wch: 14 },
    { wch: 42 },
    { wch: 18 },
    { wch: 8 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 22 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 8 },
    { wch: 14 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Presupuesto_y_Actividades');

  const guia = [
    {
      'Columna': 'Código / Item',
      'Obligatorio': 'Sí',
      'Descripción': 'Identificador único del rubro o entregable (ej: OB-001, B1.0001.01).',
    },
    {
      'Columna': 'Descripción',
      'Obligatorio': 'Sí',
      'Descripción': 'Nombre de la tarea, ítem de obra o servicio.',
    },
    {
      'Columna': 'Unidad',
      'Obligatorio': 'Opcional',
      'Descripción': 'Unidad de medida (m3, m2, ml, kg, un, gl, etc.).',
    },
    {
      'Columna': 'Cantidad / Cómputo',
      'Obligatorio': 'Opcional',
      'Descripción': 'Metrado o cómputo métrico proyectado en la obra.',
    },
    {
      'Columna': 'Precio Unitario',
      'Obligatorio': 'Opcional',
      'Descripción': 'Precio unitario contratado ($). Si se ingresa junto con Cantidad, calcula el Valor Total.',
    },
    {
      'Columna': 'Valor Total',
      'Obligatorio': 'Sí*',
      'Descripción': 'Monto total contratado. *Si se deja vacío pero hay Cantidad y P.U., se calcula automáticamente.',
    },
    {
      'Columna': 'Fecha Base (Inicio)',
      'Obligatorio': 'Opcional',
      'Descripción': 'Fecha de comienzo en formato DD/MM/AAAA o AAAA-MM-DD.',
    },
    {
      'Columna': 'Tipo Distribución',
      'Obligatorio': 'Opcional',
      'Descripción': 'estandar (3 hitos) o pago_unico (1 hito 100%).',
    },
  ];

  const wsGuia = XLSX.utils.json_to_sheet(guia);
  wsGuia['!cols'] = [{ wch: 24 }, { wch: 14 }, { wch: 75 }];
  XLSX.utils.book_append_sheet(wb, wsGuia, 'Guia_Columnas');

  XLSX.writeFile(wb, `plantilla_presupuesto_obra_${new Date().toISOString().split('T')[0]}.xlsx`);
}
