export interface Certificado {
  id: string;
  grupo?: string;
  nombre: string;
  numero: string;
  ordenCompra?: string;
  fechaPresentacion: string;
  fechaAprobacion: string;
  fechaCobro: string;
  importe: number;
  tipo: string;
  estado: 'Cobrado' | 'Aprobado' | 'Presentado' | 'Pendiente' | string;
  observaciones?: string;
}

export interface Hito {
  id: string;
  nombre: string;
  porcentaje: number;
  reglaFecha: 'pago_unico' | 'emision_b' | 'emision_0' | 'cierre' | string;
  diasAdicionales: number;
  fechaManual?: string;
  certificados: Certificado[];
}

export interface PorcentajesDistribucion {
  emisionB: number;
  emision0: number;
  restante: number;
}

export interface Entregable {
  id: string;
  empresaId: string;
  codigo: string;
  descripcion: string;
  categoria: string;
  valorTotal: number;
  fechaBase: string;
  tipoDistribucion: 'pago_unico' | 'estandar' | string;
  porcentajes: PorcentajesDistribucion;
  intervaloCert: number;
  diasRevision: number;
  fechaFinProyecto: string;
  hitos: Hito[];
  incluirCurva: boolean;
  esCHO: boolean;
  ordenCompra?: string;
  observaciones?: string;
  empresa?: string;
  unidad?: string;
  cantidad?: number;
  precioUnitario?: number;
}

export interface Empresa {
  id: string;
  nombre: string;
  color: string;
}

export interface GastoActividad {
  id: string;
  nombre: string;
  monto: number;
  modo: string;
  pesos: Record<string, number>;
}

export interface ProyectoConfig {
  tolerancia?: number;
  [key: string]: any;
}

export interface Proyecto {
  id: string;
  nombre: string;
  empresas: Empresa[];
  entregables: Entregable[];
  fechasCorte: Record<string, string[]>;
  gastosDivididos?: Record<string, number[]>;
  config?: ProyectoConfig;
  gastosActividad?: Record<string, GastoActividad[]>;
}

export interface AppData {
  proyectos: Proyecto[];
  proyectoActual: string;
  tema?: string;
}

export interface FiltrosState {
  empresa: string;
  idEntregable: string;
  descripcion: string;
  categoria: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
  conSaldoPendiente: boolean;
  vencidos: boolean;
  completamenteCertificados: boolean;
}

export interface AlertaItem {
  id: string;
  tipo: 'vencido' | 'cobro_pendiente' | 'sin_oc' | 'desvio';
  titulo: string;
  descripcion: string;
  entregableId: string;
  codigoEntregable: string;
  hitoId?: string;
  hitoNombre?: string;
  severidad: 'alta' | 'media' | 'baja';
  fecha?: string;
  monto?: number;
}

export interface ConciliacionItem {
  entregableId: string;
  codigo: string;
  descripcion: string;
  categoria: string;
  ordenCompra: string;
  presupuesto: number;
  montoOC: number;
  montoCertificado: number;
  montoCobrado: number;
  saldoPendiente: number;
  porcentajeAvance: number;
  estadoConciliacion: 'ok' | 'diferencia_oc' | 'excedido' | 'pendiente';
}

export interface VencimientoItem {
  id: string;
  entregableId: string;
  codigo: string;
  descripcion: string;
  hitoNombre: string;
  fechaVencimiento: string;
  monto: number;
  tipo: 'hito' | 'certificado';
  diasRestantes: number;
  estado: string;
}

export interface ProyeccionPeriodo {
  periodo: string;
  fecha: string;
  montoPlanificado: number;
  montoAcumulado: number;
  hitosCount: number;
}
