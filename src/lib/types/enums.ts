export const UserRoles = {
  ROOT: 'root',
  ADMINISTRADOR: 'administrador',
  SUPERVISOR: 'supervisor',
  OPERARIO: 'operario',
  LECTOR: 'lector',
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

export const EstadoCliente = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  SUSPENDIDO: 'suspendido',
} as const;

export type EstadoClienteType = (typeof EstadoCliente)[keyof typeof EstadoCliente];

export const EstadoMedidor = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  DANADO: 'dañado',
  RETIRADO: 'retirado',
  POR_INSTALAR: 'por_instalar',
} as const;

export type EstadoMedidorType = (typeof EstadoMedidor)[keyof typeof EstadoMedidor];

export const EstadoLectura = {
  PENDIENTE: 'pendiente',
  LEIDO: 'leido',
} as const;

export type EstadoLecturaType = (typeof EstadoLectura)[keyof typeof EstadoLectura];

export const TipoMedidor = {
  MECANICO: 'mecanico',
  DIGITAL: 'digital',
  INTELIGENTE: 'inteligente',
} as const;

export type TipoMedidorType = (typeof TipoMedidor)[keyof typeof TipoMedidor];

export const TipoDocumento = {
  DNI: 'DNI',
  RUC: 'RUC',
  CE: 'CE',
  PASAPORTE: 'PASAPORTE',
} as const;

export type TipoDocumentoType = (typeof TipoDocumento)[keyof typeof TipoDocumento];

export const TipoLectura = {
  NORMAL: 'normal',
  ESTIMADA: 'estimada',
  PROMEDIO: 'promedio',
  VERIFICACION: 'verificacion',
} as const;

export type TipoLecturaType = (typeof TipoLectura)[keyof typeof TipoLectura];

export const Anomalia = {
  CONSUMO_ALTO: 'consumo_alto',
  CONSUMO_BAJO: 'consumo_bajo',
  MEDIDOR_PARADO: 'medidor_parado',
  RETROCESO: 'retroceso',
  NINGUNA: 'ninguna',
} as const;

export type AnomaliaType = (typeof Anomalia)[keyof typeof Anomalia];

export const EstadoValidacion = {
  PENDIENTE: 'pendiente',
  VALIDADA: 'validada',
  RECHAZADA: 'rechazada',
  OBSERVADA: 'observada',
} as const;

export type EstadoValidacionType = (typeof EstadoValidacion)[keyof typeof EstadoValidacion];

export const EstadoAsignacion = {
  ACTIVA: 'activa',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada',
} as const;

export type EstadoAsignacionType = (typeof EstadoAsignacion)[keyof typeof EstadoAsignacion];

export const TipoEmpresa = {
  CLI: 'CLI',
  PRO: 'PRO',
} as const;

export type TipoEmpresaType = (typeof TipoEmpresa)[keyof typeof TipoEmpresa];

export const EstadoPeriodo = {
  PLANIFICADO: 'planificado',
  EN_CURSO: 'en_curso',
  CERRADO: 'cerrado',
  FACTURADO: 'facturado',
} as const;

export type EstadoPeriodoType = (typeof EstadoPeriodo)[keyof typeof EstadoPeriodo];

// ============================================
// ANALYTICS / IA
// ============================================

export const TipoAnomaliaIA = {
  CONSUMO_ALTO: 'consumo_alto',
  CONSUMO_BAJO: 'consumo_bajo',
  CONSUMO_CERO: 'consumo_cero',
  RETROCESO: 'retroceso',
  PATRON_ATIPICO: 'patron_atipico',
  VARIACION_ESTACIONAL: 'variacion_estacional',
} as const;

export type TipoAnomaliaIAType = (typeof TipoAnomaliaIA)[keyof typeof TipoAnomaliaIA];

export const SeveridadAnomalia = {
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta',
  CRITICA: 'critica',
} as const;

export type SeveridadAnomaliaType = (typeof SeveridadAnomalia)[keyof typeof SeveridadAnomalia];

export const EstadoAnomaliaIA = {
  DETECTADA: 'detectada',
  EN_REVISION: 'en_revision',
  CONFIRMADA: 'confirmada',
  DESCARTADA: 'descartada',
  RESUELTA: 'resuelta',
} as const;

export type EstadoAnomaliaIAType = (typeof EstadoAnomaliaIA)[keyof typeof EstadoAnomaliaIA];

export const RecomendacionRiesgo = {
  NINGUNA: 'ninguna',
  MONITOREAR: 'monitorear',
  INSPECCION: 'inspeccion',
  CAMBIO_MEDIDOR: 'cambio_medidor',
  CORTE: 'corte',
} as const;

export type RecomendacionRiesgoType = (typeof RecomendacionRiesgo)[keyof typeof RecomendacionRiesgo];
