/**
 * Tests unitarios: src/lib/types/enums.ts
 * Módulo: Enumeraciones del sistema
 */
import {
  UserRoles,
  EstadoCliente,
  EstadoMedidor,
  EstadoLectura,
  TipoMedidor,
  TipoDocumento,
  TipoLectura,
  Anomalia,
  EstadoValidacion,
  EstadoAsignacion,
  EstadoPeriodo,
} from '@/lib/types/enums';

describe('Enums', () => {
  describe('UserRoles', () => {
    it('tiene los 5 roles del sistema', () => {
      expect(Object.keys(UserRoles)).toHaveLength(5);
      expect(UserRoles.ROOT).toBe('root');
      expect(UserRoles.ADMINISTRADOR).toBe('administrador');
      expect(UserRoles.SUPERVISOR).toBe('supervisor');
      expect(UserRoles.OPERARIO).toBe('operario');
      expect(UserRoles.LECTOR).toBe('lector');
    });
  });

  describe('EstadoCliente', () => {
    it('tiene los 3 estados de cliente', () => {
      expect(Object.keys(EstadoCliente)).toHaveLength(3);
      expect(EstadoCliente.ACTIVO).toBe('activo');
      expect(EstadoCliente.INACTIVO).toBe('inactivo');
      expect(EstadoCliente.SUSPENDIDO).toBe('suspendido');
    });
  });

  describe('EstadoMedidor', () => {
    it('tiene los 5 estados de medidor', () => {
      expect(Object.keys(EstadoMedidor)).toHaveLength(5);
      expect(EstadoMedidor.ACTIVO).toBe('activo');
      expect(EstadoMedidor.INACTIVO).toBe('inactivo');
      expect(EstadoMedidor.DANADO).toBe('dañado');
      expect(EstadoMedidor.RETIRADO).toBe('retirado');
      expect(EstadoMedidor.POR_INSTALAR).toBe('por_instalar');
    });
  });

  describe('EstadoLectura', () => {
    it('tiene pendiente y leido', () => {
      expect(EstadoLectura.PENDIENTE).toBe('pendiente');
      expect(EstadoLectura.LEIDO).toBe('leido');
    });
  });

  describe('TipoMedidor', () => {
    it('tiene los 3 tipos', () => {
      expect(TipoMedidor.MECANICO).toBe('mecanico');
      expect(TipoMedidor.DIGITAL).toBe('digital');
      expect(TipoMedidor.INTELIGENTE).toBe('inteligente');
    });
  });

  describe('TipoDocumento', () => {
    it('tiene los 4 tipos de documento', () => {
      expect(TipoDocumento.DNI).toBe('DNI');
      expect(TipoDocumento.RUC).toBe('RUC');
      expect(TipoDocumento.CE).toBe('CE');
      expect(TipoDocumento.PASAPORTE).toBe('PASAPORTE');
    });
  });

  describe('TipoLectura', () => {
    it('tiene los 4 tipos de lectura', () => {
      expect(TipoLectura.NORMAL).toBe('normal');
      expect(TipoLectura.ESTIMADA).toBe('estimada');
      expect(TipoLectura.PROMEDIO).toBe('promedio');
      expect(TipoLectura.VERIFICACION).toBe('verificacion');
    });
  });

  describe('Anomalia', () => {
    it('tiene los 5 tipos de anomalía', () => {
      expect(Object.keys(Anomalia)).toHaveLength(5);
      expect(Anomalia.CONSUMO_ALTO).toBe('consumo_alto');
      expect(Anomalia.CONSUMO_BAJO).toBe('consumo_bajo');
      expect(Anomalia.MEDIDOR_PARADO).toBe('medidor_parado');
      expect(Anomalia.RETROCESO).toBe('retroceso');
      expect(Anomalia.NINGUNA).toBe('ninguna');
    });
  });

  describe('EstadoValidacion', () => {
    it('tiene los 4 estados de validación', () => {
      expect(EstadoValidacion.PENDIENTE).toBe('pendiente');
      expect(EstadoValidacion.VALIDADA).toBe('validada');
      expect(EstadoValidacion.RECHAZADA).toBe('rechazada');
      expect(EstadoValidacion.OBSERVADA).toBe('observada');
    });
  });

  describe('EstadoAsignacion', () => {
    it('tiene los 3 estados de asignación', () => {
      expect(EstadoAsignacion.ACTIVA).toBe('activa');
      expect(EstadoAsignacion.COMPLETADA).toBe('completada');
      expect(EstadoAsignacion.CANCELADA).toBe('cancelada');
    });
  });

  describe('EstadoPeriodo', () => {
    it('tiene los 4 estados de periodo', () => {
      expect(EstadoPeriodo.PLANIFICADO).toBe('planificado');
      expect(EstadoPeriodo.EN_CURSO).toBe('en_curso');
      expect(EstadoPeriodo.CERRADO).toBe('cerrado');
      expect(EstadoPeriodo.FACTURADO).toBe('facturado');
    });
  });
});
