/**
 * Tests unitarios: src/lib/constants.ts
 * Módulo: Constantes de la aplicación
 */
import { APP_NAME, APP_DESCRIPTION, NAVIGATION_ITEMS, ITEMS_PER_PAGE, ANOMALY_THRESHOLDS } from '@/lib/constants';

describe('constants', () => {
  describe('APP_NAME y APP_DESCRIPTION', () => {
    it('APP_NAME está definido', () => {
      expect(APP_NAME).toBe('Vertiente Reader');
    });

    it('APP_DESCRIPTION está definido', () => {
      expect(APP_DESCRIPTION).toBeTruthy();
      expect(typeof APP_DESCRIPTION).toBe('string');
    });
  });

  describe('NAVIGATION_ITEMS', () => {
    it('tiene al menos 10 items de navegación', () => {
      expect(NAVIGATION_ITEMS.length).toBeGreaterThanOrEqual(10);
    });

    it('cada item tiene label, href, icon y roles', () => {
      NAVIGATION_ITEMS.forEach(item => {
        expect(item.label).toBeTruthy();
        expect(item.href).toBeTruthy();
        expect(item.icon).toBeDefined();
        expect(item.roles).toBeDefined();
        expect(item.roles.length).toBeGreaterThan(0);
      });
    });

    it('Home es accesible por todos los roles', () => {
      const home = NAVIGATION_ITEMS.find(i => i.label === 'Home');
      expect(home).toBeDefined();
      expect(home!.roles).toContain('root');
      expect(home!.roles).toContain('administrador');
      expect(home!.roles).toContain('supervisor');
      expect(home!.roles).toContain('operario');
      expect(home!.roles).toContain('lector');
    });

    it('Usuarios solo accesible por root y administrador', () => {
      const usuarios = NAVIGATION_ITEMS.find(i => i.label === 'Usuarios');
      expect(usuarios).toBeDefined();
      expect(usuarios!.roles).toContain('root');
      expect(usuarios!.roles).toContain('administrador');
      expect(usuarios!.roles).not.toContain('supervisor');
      expect(usuarios!.roles).not.toContain('operario');
      expect(usuarios!.roles).not.toContain('lector');
    });

    it('Auditoria solo accesible por root y administrador', () => {
      const auditoria = NAVIGATION_ITEMS.find(i => i.label === 'Auditoria');
      expect(auditoria).toBeDefined();
      expect(auditoria!.roles).toContain('root');
      expect(auditoria!.roles).toContain('administrador');
      expect(auditoria!.roles).not.toContain('supervisor');
    });

    it('Lecturas accesible por todos los roles', () => {
      const lecturas = NAVIGATION_ITEMS.find(i => i.label === 'Lecturas');
      expect(lecturas).toBeDefined();
      expect(lecturas!.roles.length).toBe(5);
    });

    it('todas las rutas empiezan con /', () => {
      NAVIGATION_ITEMS.forEach(item => {
        expect(item.href.startsWith('/')).toBe(true);
      });
    });
  });

  describe('ITEMS_PER_PAGE', () => {
    it('es un número positivo', () => {
      expect(ITEMS_PER_PAGE).toBeGreaterThan(0);
      expect(typeof ITEMS_PER_PAGE).toBe('number');
    });
  });

  describe('ANOMALY_THRESHOLDS', () => {
    it('CONSUMO_ALTO_PORCENTAJE es 200', () => {
      expect(ANOMALY_THRESHOLDS.CONSUMO_ALTO_PORCENTAJE).toBe(200);
    });

    it('CONSUMO_BAJO_PORCENTAJE es 20', () => {
      expect(ANOMALY_THRESHOLDS.CONSUMO_BAJO_PORCENTAJE).toBe(20);
    });

    it('PERIODOS_MEDIDOR_PARADO es 2', () => {
      expect(ANOMALY_THRESHOLDS.PERIODOS_MEDIDOR_PARADO).toBe(2);
    });

    it('umbrales son coherentes (bajo < alto)', () => {
      expect(ANOMALY_THRESHOLDS.CONSUMO_BAJO_PORCENTAJE).toBeLessThan(ANOMALY_THRESHOLDS.CONSUMO_ALTO_PORCENTAJE);
    });
  });
});
