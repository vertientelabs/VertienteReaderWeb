'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export interface RecentActivityItem {
  href: string;
  label: string;
  visitedAt: number;
}

const STORAGE_PREFIX = 'vrw:recent:';
const MAX_ITEMS = 8;

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/clientes': 'Clientes',
  '/medidores': 'Medidores',
  '/zonas': 'Zonas',
  '/rutas': 'Rutas',
  '/rutas/optimizar': 'Optimizar Rutas',
  '/asignaciones': 'Asignaciones',
  '/asignaciones/sugerencias': 'Sugerencias de Asignaciones',
  '/lecturas': 'Lecturas',
  '/lecturas/dashboard': 'Dashboard Analitico',
  '/integracion/exportar': 'Exportar',
  '/reportes': 'Reportes',
  '/usuarios': 'Usuarios',
  '/empresas': 'Empresas',
  '/configuracion': 'Configuracion',
  '/configuracion/ia': 'Configuracion IA',
  '/configuracion/seed': 'Generador de Datos',
  '/auditoria': 'Auditoria',
  '/incidencias': 'Incidencias',
  '/anomalias': 'Anomalias IA',
  '/predicciones': 'Predicciones',
  '/riesgos': 'Riesgos',
  '/dashboard-anf': 'Panel ANF',
  '/dashboard-operativo': 'Panel Operativo',
  '/dashboard-ejecutivo': 'Panel Ejecutivo',
};

function deriveLabel(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return 'Home';
  const base = '/' + segments[0];
  const baseLabel = ROUTE_LABELS[base] ?? segments[0];
  if (segments.length === 1) return baseLabel;
  const last = segments[segments.length - 1];
  if (last === 'nuevo') return `${baseLabel} - Nuevo`;
  if (/^[a-zA-Z0-9_-]{12,}$/.test(last)) return `${baseLabel} - Detalle`;
  return `${baseLabel} - ${last}`;
}

function readStorage(userId: string | undefined): RecentActivityItem[] {
  if (!userId || typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + userId);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is RecentActivityItem =>
        i && typeof i.href === 'string' && typeof i.label === 'string' && typeof i.visitedAt === 'number'
    );
  } catch {
    return [];
  }
}

function writeStorage(userId: string, items: RecentActivityItem[]) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(items));
  } catch {
    /* quota exceeded or disabled — ignore */
  }
}

export function useRecentActivity(userId: string | undefined) {
  const [items, setItems] = useState<RecentActivityItem[]>([]);

  useEffect(() => {
    setItems(readStorage(userId));
  }, [userId]);

  const record = useCallback(
    (href: string, label?: string) => {
      if (!userId) return;
      if (href === '/' || href === '/login') return;
      const finalLabel = label ?? deriveLabel(href);
      const next: RecentActivityItem = { href, label: finalLabel, visitedAt: Date.now() };
      const current = readStorage(userId).filter((i) => i.href !== href);
      const updated = [next, ...current].slice(0, MAX_ITEMS);
      writeStorage(userId, updated);
      setItems(updated);
    },
    [userId]
  );

  const clear = useCallback(() => {
    if (!userId) return;
    writeStorage(userId, []);
    setItems([]);
  }, [userId]);

  return { items, record, clear };
}

export function useTrackPageVisit(userId: string | undefined) {
  const pathname = usePathname();
  const { record } = useRecentActivity(userId);

  useEffect(() => {
    if (!userId || !pathname) return;
    record(pathname);
  }, [pathname, userId, record]);
}
