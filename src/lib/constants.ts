import {
  LayoutDashboard,
  Users,
  Gauge,
  MapPin,
  Route,
  ClipboardList,
  BookOpen,
  BarChart3,
  Download,
  FileText,
  Settings,
  Shield,
  AlertTriangle,
  Building2,
} from 'lucide-react';

export const APP_NAME = 'Vertiente Reader';
export const APP_DESCRIPTION = 'Sistema de Gestión de Lectura de Medidores de Agua';

export const NAVIGATION_ITEMS = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['root', 'administrador', 'supervisor', 'operario', 'lector'],
  },
  {
    label: 'Clientes',
    href: '/clientes',
    icon: Users,
    roles: ['root', 'administrador', 'supervisor', 'lector'],
  },
  {
    label: 'Medidores',
    href: '/medidores',
    icon: Gauge,
    roles: ['root', 'administrador', 'supervisor', 'lector'],
  },
  {
    label: 'Zonas',
    href: '/zonas',
    icon: MapPin,
    roles: ['root', 'administrador', 'supervisor', 'lector'],
  },
  {
    label: 'Rutas',
    href: '/rutas',
    icon: Route,
    roles: ['root', 'administrador', 'supervisor', 'lector'],
  },
  {
    label: 'Asignaciones',
    href: '/asignaciones',
    icon: ClipboardList,
    roles: ['root', 'administrador', 'supervisor'],
  },
  {
    label: 'Lecturas',
    href: '/lecturas',
    icon: BookOpen,
    roles: ['root', 'administrador', 'supervisor', 'operario', 'lector'],
  },
  {
    label: 'Dashboards',
    href: '/lecturas/dashboard',
    icon: BarChart3,
    roles: ['root', 'administrador', 'supervisor'],
  },
  {
    label: 'Exportar',
    href: '/integracion/exportar',
    icon: Download,
    roles: ['root', 'administrador', 'supervisor'],
  },
  {
    label: 'Reportes',
    href: '/reportes',
    icon: FileText,
    roles: ['root', 'administrador', 'supervisor', 'operario', 'lector'],
  },
  {
    label: 'Usuarios',
    href: '/usuarios',
    icon: Users,
    roles: ['root', 'administrador'],
  },
  {
    label: 'Empresas',
    href: '/empresas',
    icon: Building2,
    roles: ['root', 'administrador'],
  },
  {
    label: 'Configuracion',
    href: '/configuracion',
    icon: Settings,
    roles: ['root', 'administrador'],
  },
  {
    label: 'Auditoria',
    href: '/auditoria',
    icon: Shield,
    roles: ['root', 'administrador'],
  },
  {
    label: 'Incidencias',
    href: '/incidencias',
    icon: AlertTriangle,
    roles: ['root', 'administrador', 'supervisor'],
  },
] as const;

export const ITEMS_PER_PAGE = 20;

export const ANOMALY_THRESHOLDS = {
  CONSUMO_ALTO_PORCENTAJE: 200,
  CONSUMO_BAJO_PORCENTAJE: 20,
  PERIODOS_MEDIDOR_PARADO: 2,
};
