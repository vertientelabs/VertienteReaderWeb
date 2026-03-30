/**
 * Tests unitarios: src/lib/utils/permissions.ts
 * Módulo: RBAC - Control de Acceso Basado en Roles
 */
import { hasPermission, canAccessModule } from '@/lib/utils/permissions';
import type { UserRole } from '@/lib/types';

describe('permissions - RBAC', () => {
  // ============================
  // hasPermission
  // ============================
  describe('hasPermission', () => {
    // Root tiene acceso total
    describe('root', () => {
      it('puede crear clientes', () => {
        expect(hasPermission('root', 'clientes', 'create')).toBe(true);
      });
      it('puede eliminar clientes', () => {
        expect(hasPermission('root', 'clientes', 'delete')).toBe(true);
      });
      it('puede gestionar usuarios', () => {
        expect(hasPermission('root', 'usuarios', 'create')).toBe(true);
        expect(hasPermission('root', 'usuarios', 'delete')).toBe(true);
      });
      it('puede acceder a configuración', () => {
        expect(hasPermission('root', 'configuracion', 'update')).toBe(true);
      });
      it('puede ver auditoría', () => {
        expect(hasPermission('root', 'auditoria', 'read')).toBe(true);
      });
    });

    // Administrador
    describe('administrador', () => {
      it('CRUD completo en clientes', () => {
        expect(hasPermission('administrador', 'clientes', 'create')).toBe(true);
        expect(hasPermission('administrador', 'clientes', 'read')).toBe(true);
        expect(hasPermission('administrador', 'clientes', 'update')).toBe(true);
        expect(hasPermission('administrador', 'clientes', 'delete')).toBe(true);
      });
      it('puede crear usuarios pero NO eliminar', () => {
        expect(hasPermission('administrador', 'usuarios', 'create')).toBe(true);
        expect(hasPermission('administrador', 'usuarios', 'read')).toBe(true);
        expect(hasPermission('administrador', 'usuarios', 'update')).toBe(true);
        expect(hasPermission('administrador', 'usuarios', 'delete')).toBe(false);
      });
      it('puede ver auditoría', () => {
        expect(hasPermission('administrador', 'auditoria', 'read')).toBe(true);
      });
    });

    // Supervisor
    describe('supervisor', () => {
      it('puede leer y actualizar clientes, pero NO crear ni eliminar', () => {
        expect(hasPermission('supervisor', 'clientes', 'read')).toBe(true);
        expect(hasPermission('supervisor', 'clientes', 'update')).toBe(true);
        expect(hasPermission('supervisor', 'clientes', 'create')).toBe(false);
        expect(hasPermission('supervisor', 'clientes', 'delete')).toBe(false);
      });
      it('NO puede gestionar usuarios', () => {
        expect(hasPermission('supervisor', 'usuarios', 'read')).toBe(false);
      });
      it('puede gestionar asignaciones', () => {
        expect(hasPermission('supervisor', 'asignaciones', 'create')).toBe(true);
        expect(hasPermission('supervisor', 'asignaciones', 'read')).toBe(true);
      });
      it('NO puede acceder a configuración', () => {
        expect(hasPermission('supervisor', 'configuracion', 'read')).toBe(false);
      });
      it('NO puede ver auditoría', () => {
        expect(hasPermission('supervisor', 'auditoria', 'read')).toBe(false);
      });
    });

    // Operario
    describe('operario', () => {
      it('NO puede acceder a clientes', () => {
        expect(hasPermission('operario', 'clientes', 'read')).toBe(false);
      });
      it('puede crear y leer lecturas', () => {
        expect(hasPermission('operario', 'lecturas', 'create')).toBe(true);
        expect(hasPermission('operario', 'lecturas', 'read')).toBe(true);
      });
      it('NO puede actualizar ni eliminar lecturas', () => {
        expect(hasPermission('operario', 'lecturas', 'update')).toBe(false);
        expect(hasPermission('operario', 'lecturas', 'delete')).toBe(false);
      });
      it('puede ver reportes propios', () => {
        expect(hasPermission('operario', 'reportes', 'read')).toBe(true);
      });
    });

    // Lector
    describe('lector', () => {
      it('solo lectura en clientes', () => {
        expect(hasPermission('lector', 'clientes', 'read')).toBe(true);
        expect(hasPermission('lector', 'clientes', 'create')).toBe(false);
        expect(hasPermission('lector', 'clientes', 'update')).toBe(false);
      });
      it('solo lectura en lecturas', () => {
        expect(hasPermission('lector', 'lecturas', 'read')).toBe(true);
        expect(hasPermission('lector', 'lecturas', 'create')).toBe(false);
      });
      it('NO puede acceder a asignaciones', () => {
        expect(hasPermission('lector', 'asignaciones', 'read')).toBe(false);
      });
    });

    // Edge cases
    describe('edge cases', () => {
      it('módulo inexistente retorna false', () => {
        expect(hasPermission('root', 'modulo_falso', 'read')).toBe(false);
      });
      it('permiso para rol sin acceso retorna false', () => {
        expect(hasPermission('operario', 'configuracion', 'read')).toBe(false);
      });
    });
  });

  // ============================
  // canAccessModule
  // ============================
  describe('canAccessModule', () => {
    it('root accede a todos los módulos definidos', () => {
      const modules = ['clientes', 'medidores', 'usuarios', 'rutas', 'zonas', 'asignaciones', 'lecturas', 'reportes', 'configuracion', 'auditoria', 'integracion'];
      modules.forEach(m => {
        expect(canAccessModule('root', m)).toBe(true);
      });
    });

    it('operario NO accede a clientes, medidores, usuarios, zonas, rutas, asignaciones, configuracion, auditoria, integracion', () => {
      ['clientes', 'medidores', 'usuarios', 'zonas', 'rutas', 'asignaciones', 'configuracion', 'auditoria', 'integracion'].forEach(m => {
        expect(canAccessModule('operario', m)).toBe(false);
      });
    });

    it('operario SÍ accede a lecturas y reportes', () => {
      expect(canAccessModule('operario', 'lecturas')).toBe(true);
      expect(canAccessModule('operario', 'reportes')).toBe(true);
    });

    it('módulo inexistente retorna false para cualquier rol', () => {
      const roles: UserRole[] = ['root', 'administrador', 'supervisor', 'operario', 'lector'];
      roles.forEach(role => {
        expect(canAccessModule(role, 'modulo_inexistente')).toBe(false);
      });
    });
  });
});
