'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  clientes: 'Clientes',
  medidores: 'Medidores',
  usuarios: 'Usuarios',
  zonas: 'Zonas',
  rutas: 'Rutas',
  asignaciones: 'Asignaciones',
  lecturas: 'Lecturas',
  dashboard: 'Dashboard Analítico',
  integracion: 'Integración',
  exportar: 'Exportar',
  historial: 'Historial',
  reportes: 'Reportes',
  configuracion: 'Configuración',
  auditoria: 'Auditoría',
  incidencias: 'Incidencias',
  nuevo: 'Nuevo',
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment;
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1.5 text-xs sm:text-sm mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap">
      <Link
        href="/"
        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
          {crumb.isLast ? (
            <span className="font-medium text-[var(--text-primary)]">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
