import type { UserRole } from '../types';

type Permission = 'create' | 'read' | 'update' | 'delete';

type ModulePermissions = {
  [module: string]: {
    [role in UserRole]?: Permission[];
  };
};

const PERMISSIONS: ModulePermissions = {
  clientes: {
    root: ['create', 'read', 'update', 'delete'],
    administrador: ['create', 'read', 'update', 'delete'],
    supervisor: ['read', 'update'],
    lector: ['read'],
  },
  medidores: {
    root: ['create', 'read', 'update', 'delete'],
    administrador: ['create', 'read', 'update', 'delete'],
    supervisor: ['read', 'update'],
    lector: ['read'],
  },
  usuarios: {
    root: ['create', 'read', 'update', 'delete'],
    administrador: ['create', 'read', 'update'],
  },
  rutas: {
    root: ['create', 'read', 'update', 'delete'],
    administrador: ['create', 'read', 'update', 'delete'],
    supervisor: ['read'],
    lector: ['read'],
  },
  zonas: {
    root: ['create', 'read', 'update', 'delete'],
    administrador: ['create', 'read', 'update', 'delete'],
    supervisor: ['read'],
    lector: ['read'],
  },
  asignaciones: {
    root: ['create', 'read', 'update', 'delete'],
    administrador: ['create', 'read', 'update', 'delete'],
    supervisor: ['create', 'read', 'update'],
  },
  lecturas: {
    root: ['create', 'read', 'update', 'delete'],
    administrador: ['create', 'read', 'update', 'delete'],
    supervisor: ['create', 'read', 'update'],
    operario: ['create', 'read'],
    lector: ['read'],
  },
  reportes: {
    root: ['read'],
    administrador: ['read'],
    supervisor: ['read'],
    operario: ['read'],
    lector: ['read'],
  },
  configuracion: {
    root: ['create', 'read', 'update', 'delete'],
    administrador: ['create', 'read', 'update'],
  },
  auditoria: {
    root: ['read'],
    administrador: ['read'],
  },
  integracion: {
    root: ['create', 'read'],
    administrador: ['create', 'read'],
    supervisor: ['create', 'read'],
  },
};

export function hasPermission(role: UserRole, module: string, permission: Permission): boolean {
  const modulePerms = PERMISSIONS[module];
  if (!modulePerms) return false;
  const rolePerms = modulePerms[role];
  if (!rolePerms) return false;
  return rolePerms.includes(permission);
}

export function canAccessModule(role: UserRole, module: string): boolean {
  const modulePerms = PERMISSIONS[module];
  if (!modulePerms) return false;
  return !!modulePerms[role];
}
