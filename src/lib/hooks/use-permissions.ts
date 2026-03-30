'use client';

import { useRole } from './use-auth';
import { hasPermission, canAccessModule } from '../utils/permissions';

export function usePermission(module: string, permission: 'create' | 'read' | 'update' | 'delete'): boolean {
  const role = useRole();
  if (!role) return false;
  return hasPermission(role, module, permission);
}

export function useCanAccess(module: string): boolean {
  const role = useRole();
  if (!role) return false;
  return canAccessModule(role, module);
}
