import { Timestamp } from 'firebase/firestore';
import type {
  UserRole,
  EstadoClienteType,
  EstadoMedidorType,
  EstadoLecturaType,
  TipoMedidorType,
  TipoDocumentoType,
  TipoLecturaType,
  AnomaliaType,
  EstadoValidacionType,
  EstadoAsignacionType,
  EstadoPeriodoType,
  TipoEmpresaType,
  TipoAnomaliaIAType,
  SeveridadAnomaliaType,
  EstadoAnomaliaIAType,
  RecomendacionRiesgoType,
} from './enums';

// ============================================
// UBIGEO
// ============================================

export interface Departamento {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface Provincia {
  id: string;
  nombre: string;
  departamentoId: string;
  activo: boolean;
}

export interface Distrito {
  id: string;
  nombre: string;
  provinciaId: string;
  departamentoId: string;
  activo: boolean;
}

// ============================================
// ZONA
// ============================================

export interface Zona {
  id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  departamentoId: string;
  provinciaId: string;
  distritoId: string;
  limites?: { lat: number; lng: number }[];
  companiId?: string;
  activo: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// CLIENTE
// ============================================

export interface Cliente {
  id: string;
  tipoDocumento: TipoDocumentoType;
  numeroDocumento: string;
  nombreCompleto: string;
  telefono?: string;
  email?: string;
  direccion: string;
  departamentoId: string;
  provinciaId: string;
  distritoId: string;
  zonaId: string;
  referencia?: string;
  latitud: number;
  longitud: number;
  estado: EstadoClienteType;
  companiId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// ============================================
// MEDIDOR
// ============================================

export interface Medidor {
  id: string;
  numeroMedidor: string;
  marca?: string;
  modelo?: string;
  tipo: TipoMedidorType;
  diametro?: string;
  clienteId: string;
  zonaId: string;
  direccionInstalacion: string;
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
  latitud: number;
  longitud: number;
  estado: EstadoMedidorType;
  fechaInstalacion?: Timestamp;
  lecturaInstalacion?: number;
  lecturaAnterior: number;
  lecturaActual?: number;
  estadoLectura: EstadoLecturaType;
  companiId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// ============================================
// RUTA
// ============================================

export interface Ruta {
  id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  zonasIds: string[];
  totalMedidores: number;
  companiId: string;
  activo: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// ============================================
// ASIGNACION
// ============================================

export interface Asignacion {
  id: string;
  operarioId: string;
  rutaId: string;
  periodo: string;
  fechaAsignacion: Timestamp;
  fechaInicio: Timestamp;
  fechaFin: Timestamp;
  estado: EstadoAsignacionType;
  totalMedidores: number;
  medidoresLeidos: number;
  porcentajeAvance: number;
  asignadoPor: string;
  companiId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// LECTURA (existente en app móvil)
// ============================================

export interface Lectura {
  id: string;
  medidorId: string;
  operarioId: string;
  valorLectura: number;
  fotoUrl?: string;
  fechaHora: Timestamp;
  latitudCaptura: number;
  longitudCaptura: number;
}

// ============================================
// LECTURA EXTENDIDA (web)
// ============================================

export interface LecturaExtendida extends Lectura {
  clienteId: string;
  zonaId: string;
  rutaId: string;
  asignacionId: string;
  consumo: number;
  observaciones?: string;
  tipoLectura: TipoLecturaType;
  anomalia?: AnomaliaType;
  validadaPor?: string;
  fechaValidacion?: Timestamp;
  estadoValidacion: EstadoValidacionType;
}

// ============================================
// USUARIO EXTENDIDO
// ============================================

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  telefono?: string;
  direccion?: string;
  usertype: UserRole;
  permisos?: string[];
  companiId: string;
  companiCli?: string;
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
  activo: boolean;
  ultimoAcceso?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  avatarUrl?: string;
}

// ============================================
// COLECCIONES EXISTENTES (app móvil)
// ============================================

export interface ClienteMedidor {
  id: string;
  nombreCliente: string;
  direccion: string;
  latitud: number;
  longitud: number;
  numeroMedidor: string;
  estado: 'pendiente' | 'leido';
  lecturaAnterior: number;
  lecturaActual?: number;
}

export interface Operario {
  id: string;
  nombre: string;
  rutasAsignadas: string[];
}

export interface Company {
  id: string;
  razonsocial: string;
  ruc: string;
  direccion: string;
  departamentoId: string;
  provinciaId: string;
  distritoId: string;
  tipoEmpresa: TipoEmpresaType;
  empresaClienteId?: string;
  companiCli?: string;
  consumoPromedioAlerta?: number;
  consumoMinimoAlerta?: number;
  diasLimiteLectura?: number;
  formatoExportacion?: 'CSV' | 'JSON' | 'XML';
  zonaHoraria?: string;
  moneda?: string;
  activo: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// ============================================
// PERIODO
// ============================================

export interface Periodo {
  id: string;
  nombre: string;
  fechaInicio: Timestamp;
  fechaFin: Timestamp;
  fechaLimiteLectura: Timestamp;
  estado: EstadoPeriodoType;
  companiId: string;
  createdAt: Timestamp;
}

// ============================================
// AUDITORIA
// ============================================

export interface AuditoriaLog {
  id: string;
  userId: string;
  accion: string;
  entidad: string;
  entidadId: string;
  datosAnteriores?: Record<string, unknown>;
  datosNuevos?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  timestamp: Timestamp;
}

// ============================================
// INCIDENCIA
// ============================================

export interface Incidencia {
  id: string;
  lecturaId?: string;
  medidorId: string;
  operarioId: string;
  tipo: 'acceso_denegado' | 'medidor_danado' | 'fuga_agua' | 'medidor_no_encontrado' | 'zona_peligrosa' | 'otro';
  descripcion: string;
  fotoUrl?: string;
  latitud?: number;
  longitud?: number;
  estado: 'abierta' | 'en_proceso' | 'resuelta' | 'cerrada';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  resolucion?: string;
  resueltaPor?: string;
  fechaResolucion?: Timestamp;
  companiId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// CONFIGURACION
// ============================================

export interface Configuracion {
  id: string;
  companiId: string;
  consumoPromedioAlerta: number;
  consumoMinimoAlerta: number;
  diasLimiteLectura: number;
  formatoExportacion: 'CSV' | 'JSON' | 'XML';
  zonaHoraria: string;
  moneda: string;
}

// ============================================
// ANALYTICS - ANOMALIAS IA
// ============================================

export interface AnalyticsAnomalia {
  id: string;
  lecturaId: string;
  medidorId: string;
  clienteId: string;
  zonaId: string;
  rutaId?: string;
  tipoAnomalia: TipoAnomaliaIAType;
  severidad: SeveridadAnomaliaType;
  scoreConfiabilidad: number;
  consumoActual: number;
  consumoEsperado: number;
  desviacionPorcentual: number;
  descripcion: string;
  recomendacion: string;
  estado: EstadoAnomaliaIAType;
  revisadoPor?: string;
  fechaRevision?: Timestamp;
  resolucion?: string;
  companiId: string;
  periodo: string;
  createdAt: Timestamp;
}

// ============================================
// ANALYTICS - KPIs DIARIOS
// ============================================

export interface ZonaKpi {
  zonaNombre: string;
  totalMedidores: number;
  medidoresLeidos: number;
  consumoTotal: number;
  anomalias: number;
  anfEstimado?: number;
}

export interface OperarioKpi {
  nombre: string;
  lecturasRealizadas: number;
  anomaliasDetectadas: number;
  tiempoPromedio?: number;
}

export interface AnalyticsKpi {
  id: string;
  companiId: string;
  fecha: string;
  periodo: string;
  aguaProducida?: number;
  aguaFacturada: number;
  anf: number;
  totalMedidores: number;
  medidoresLeidos: number;
  porcentajeLectura: number;
  lecturasConAnomalia: number;
  lecturasValidadas: number;
  zonaKpis: Record<string, ZonaKpi>;
  operarioKpis: Record<string, OperarioKpi>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// ANALYTICS - PREDICCION DE CONSUMO
// ============================================

export interface PrediccionConsumo {
  id: string;
  medidorId: string;
  clienteId: string;
  zonaId: string;
  periodo: string;
  consumoPredicho: number;
  consumoReal?: number;
  rangoMinimo: number;
  rangoMaximo: number;
  confianza: number;
  metodo: 'promedio_movil' | 'tendencia_lineal' | 'estacional' | 'mixto';
  factores: {
    promedioHistorico: number;
    tendencia: number;
    factorEstacional: number;
    factorZona: number;
  };
  desviacionReal?: number;
  companiId: string;
  createdAt: Timestamp;
}

// ============================================
// ANALYTICS - SCORE DE RIESGO
// ============================================

export interface ScoreRiesgo {
  id: string;
  medidorId: string;
  clienteId: string;
  zonaId: string;
  scoreFraude: number;
  scoreFuga: number;
  scoreMedidorDeteriorado: number;
  scoreGeneral: number;
  factores: string[];
  recomendacion: RecomendacionRiesgoType;
  ultimaActualizacion: Timestamp;
  companiId: string;
}

// ============================================
// CONFIGURACION IA
// ============================================

export interface ConfiguracionIA {
  id: string;
  companiId: string;
  umbrales: {
    consumoAlto: number;
    consumoBajo: number;
    consumoCero: number;
    variacionEstacional: number;
    scoreRiesgoAlto: number;
    scoreRiesgoCritico: number;
  };
  pesos: {
    fraude: number;
    fuga: number;
    medidorDeteriorado: number;
  };
  alertas: {
    emailHabilitado: boolean;
    pushHabilitado: boolean;
    destinatarios: string[];
    frecuencia: 'inmediata' | 'diaria' | 'semanal';
  };
  updatedAt: Timestamp;
  updatedBy: string;
}
