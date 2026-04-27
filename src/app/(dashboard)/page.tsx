'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Clock,
  Sparkles,
  Building2,
  HardHat,
  Pickaxe,
  Droplets,
  History,
} from 'lucide-react';
import GlassCard from '@/components/ui/glass-card';
import GlassChip from '@/components/ui/glass-chip';
import GlassButton from '@/components/ui/glass-button';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRecentActivity } from '@/lib/hooks/use-recent-activity';
import { NAVIGATION_ITEMS } from '@/lib/constants';
import type { UserRole } from '@/lib/types';

const QUICK_ACTIONS_BY_ROLE: Record<UserRole, string[]> = {
  root: [
    '/lecturas',
    '/asignaciones',
    '/dashboard-ejecutivo',
    '/dashboard-anf',
    '/anomalias',
    '/usuarios',
    '/empresas',
    '/configuracion',
  ],
  administrador: [
    '/lecturas',
    '/asignaciones',
    '/dashboard-ejecutivo',
    '/dashboard-anf',
    '/anomalias',
    '/usuarios',
    '/incidencias',
    '/reportes',
  ],
  supervisor: [
    '/lecturas',
    '/asignaciones',
    '/dashboard-anf',
    '/dashboard-operativo',
    '/anomalias',
    '/incidencias',
    '/rutas',
    '/reportes',
  ],
  operario: ['/lecturas', '/reportes'],
  lector: ['/lecturas', '/clientes', '/medidores', '/reportes'],
};

const ROLE_LABEL: Record<UserRole, string> = {
  root: 'Root',
  administrador: 'Administrador',
  supervisor: 'Supervisor',
  operario: 'Operario',
  lector: 'Lector',
};

const ROLE_INTRO: Record<UserRole, string> = {
  root: 'Acceso total al sistema. Aqui tienes los modulos mas usados y tu actividad reciente.',
  administrador: 'Gestiona usuarios, empresas y monitorea indicadores ejecutivos desde aqui.',
  supervisor: 'Supervisa operaciones, asignaciones y anomalias desde tu pagina de inicio.',
  operario: 'Continua donde lo dejaste y accede rapido a tus lecturas y reportes.',
  lector: 'Accesos directos a clientes, medidores y registro de lecturas.',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function timeAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'hace unos segundos';
  const min = Math.floor(sec / 60);
  if (min < 60) return `hace ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `hace ${hr} h`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `hace ${days} d`;
  return new Date(ts).toLocaleDateString();
}

export default function HomePage() {
  const { user } = useAuth();
  const role = user?.usertype;
  const { items: recent } = useRecentActivity(user?.id);

  const quickActions = useMemo(() => {
    if (!role) return [];
    const hrefs = QUICK_ACTIONS_BY_ROLE[role] ?? [];
    return hrefs
      .map((href) => NAVIGATION_ITEMS.find((n) => n.href === href))
      .filter((n): n is (typeof NAVIGATION_ITEMS)[number] => Boolean(n))
      .filter((n) => role && (n.roles as readonly string[]).includes(role));
  }, [role]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome banner */}
      <motion.div initial="hidden" animate="show" variants={container}>
        <motion.div variants={item}>
          <GlassCard hover={false} padding="lg" className="relative overflow-hidden">
            <div
              aria-hidden
              className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20 blur-3xl"
              style={{ background: 'radial-gradient(circle, #0A84FF 0%, transparent 70%)' }}
            />
            <div
              aria-hidden
              className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full opacity-15 blur-3xl"
              style={{ background: 'radial-gradient(circle, #BF5AF2 0%, transparent 70%)' }}
            />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#0A84FF]" />
                <span className="text-xs font-medium text-[var(--text-tertiary)]">
                  Pagina de inicio
                </span>
                {role && (
                  <GlassChip
                    label={ROLE_LABEL[role]}
                    variant="primary"
                    className="ml-1"
                  />
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                {greeting}, {user?.nombre || 'Usuario'}
              </h1>
              <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
                {role ? ROLE_INTRO[role] : 'Bienvenido a Vertiente Reader.'}
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Quick actions */}
      <motion.div initial="hidden" animate="show" variants={container} className="space-y-3">
        <motion.div variants={item} className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Accesos directos
          </h2>
          <span className="text-xs text-[var(--text-tertiary)]">
            Personalizado para tu rol
          </span>
        </motion.div>

        {quickActions.length === 0 ? (
          <motion.div variants={item}>
            <GlassCard hover={false} padding="md">
              <p className="text-sm text-[var(--text-tertiary)]">
                No hay accesos directos disponibles para tu rol.
              </p>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.div key={action.href} variants={item}>
                  <Link href={action.href} className="block h-full">
                    <GlassCard padding="md" className="h-full group cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-xl"
                          style={{
                            backgroundColor: `${action.color}1F`,
                            color: action.color,
                          }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {action.label}
                      </p>
                    </GlassCard>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Recent activity + Vertiente Labs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent activity */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={item}
          className="lg:col-span-2"
        >
          <GlassCard hover={false} padding="md" className="h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[#0A84FF]" />
                <h3 className="font-semibold text-[var(--text-primary)]">
                  Continua donde lo dejaste
                </h3>
              </div>
              <span className="text-xs text-[var(--text-tertiary)]">
                Ultimas paginas visitadas
              </span>
            </div>

            {recent.length === 0 ? (
              <div className="py-8 flex flex-col items-center text-center gap-2">
                <Clock className="h-6 w-6 text-[var(--text-tertiary)]" />
                <p className="text-sm text-[var(--text-secondary)]">
                  Aun no hay actividad reciente.
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  A medida que navegues por la aplicacion veras aqui tus
                  ultimas pantallas.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                {recent.map((entry) => (
                  <li key={entry.href}>
                    <Link
                      href={entry.href}
                      className="flex items-center gap-3 py-2.5 group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0A84FF] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[#0A84FF] transition-colors">
                          {entry.label}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)] truncate">
                          {entry.href}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">
                        {timeAgo(entry.visitedAt)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </motion.div>

        {/* Vertiente Labs commercial reference */}
        <motion.div initial="hidden" animate="show" variants={item}>
          <GlassCard
            variant="elevated"
            hover={false}
            padding="lg"
            className="h-full relative overflow-hidden"
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.07]"
              style={{
                background:
                  'linear-gradient(135deg, #0A84FF 0%, #30D158 50%, #FF9F0A 100%)',
              }}
            />
            <div className="relative flex flex-col h-full">
              <div className="mb-4 inline-flex rounded-xl overflow-hidden bg-[#0a0a0a] px-3 py-2 self-start">
                <Image
                  src="/assets/logo_vertientelabs.png"
                  alt="Vertiente Labs"
                  width={160}
                  height={36}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </div>

              <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug">
                Vertiente Reader es parte de la suite Vertiente Labs
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                Desarrollamos software especializado para el control y gestion
                de operaciones en empresas de servicios publicos, construccion
                y mineria.
              </p>

              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Droplets className="h-3.5 w-3.5 text-[#0A84FF] flex-shrink-0" />
                  Servicios publicos: agua, energia, saneamiento
                </li>
                <li className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <HardHat className="h-3.5 w-3.5 text-[#FF9F0A] flex-shrink-0" />
                  Construccion: avance, valorizaciones, control de obra
                </li>
                <li className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Pickaxe className="h-3.5 w-3.5 text-[#BF5AF2] flex-shrink-0" />
                  Mineria: produccion, seguridad, trazabilidad
                </li>
              </ul>

              <div className="mt-auto pt-4">
                <a
                  href="https://vertientelabs.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block"
                >
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    icon={<Building2 className="h-4 w-4" />}
                  >
                    Conoce Vertiente Labs
                  </GlassButton>
                </a>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
