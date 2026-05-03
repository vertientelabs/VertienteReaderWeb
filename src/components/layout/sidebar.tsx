'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  NAVIGATION_HOME,
  NAVIGATION_GROUPS,
  APP_NAME,
  type NavItem,
  type NavGroup,
} from '@/lib/constants';
import { useAuth } from '@/lib/hooks/use-auth';
import { useSidebar } from '@/lib/hooks/use-sidebar';
import GlassTooltip from '@/components/ui/glass-tooltip';

// Los grupos arrancan colapsados en cada ingreso. El estado solo
// dura mientras la sesion del navegador este viva; al recargar o
// volver a entrar, todos vuelven a colapsarse.

export default function Sidebar() {
  const { open, close, collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.usertype;

  // Estado de expansion por grupo. Arranca todo en false (colapsado)
  // en cada ingreso, sin persistir entre recargas.
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAVIGATION_GROUPS.forEach((g) => {
      initial[g.id] = false;
    });
    return initial;
  });

  const toggleGroup = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filterItems = (items: readonly NavItem[]) =>
    items.filter((i) => userRole && i.roles.includes(userRole));

  const filteredGroups: { group: NavGroup; items: readonly NavItem[] }[] = NAVIGATION_GROUPS
    .map((g) => ({ group: g, items: filterItems(g.items) }))
    .filter(({ items }) => items.length > 0);

  const homeVisible =
    userRole && NAVIGATION_HOME.roles.includes(userRole) ? NAVIGATION_HOME : null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const groupHasActive = (items: readonly NavItem[]) =>
    items.some((i) => isActive(i.href));

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[280px]';
  const isIconOnly = collapsed && !open;

  const renderItem = (item: NavItem, indent = false) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    const showLabel = !collapsed || open;

    const linkContent = (
      <Link
        key={item.href}
        href={item.href}
        onClick={close}
        className={`
          flex items-center gap-3 ${indent && showLabel ? 'pl-9 pr-3' : 'px-3'} py-2.5 rounded-xl
          transition-all duration-200
          group relative
          ${active
            ? 'bg-[#0A84FF]/12 text-[#0A84FF]'
            : 'text-[var(--text-secondary)] hover:bg-white/40 dark:hover:bg-white/[0.06] hover:text-[var(--text-primary)]'
          }
        `}
      >
        <Icon
          className="h-5 w-5 flex-shrink-0 transition-colors"
          style={{ color: active ? '#0A84FF' : item.color }}
        />
        <AnimatePresence>
          {showLabel && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        {active && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0A84FF] rounded-r-full"
          />
        )}
      </Link>
    );

    if (isIconOnly) {
      return (
        <GlassTooltip key={item.href} content={item.label} position="right">
          {linkContent}
        </GlassTooltip>
      );
    }
    return linkContent;
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed left-0 top-0 h-full z-50
          bg-white/60 dark:bg-[#1a1a1a]/60
          backdrop-blur-2xl
          border-r border-black/[0.08] dark:border-white/[0.06]
          transition-all duration-300 ease-in-out
          flex flex-col
          ${sidebarWidth}
          max-lg:-translate-x-full max-lg:w-[280px]
          ${open ? 'max-lg:translate-x-0' : ''}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-black/[0.06] dark:border-white/10">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl overflow-hidden">
            <Image src="/assets/logo.png" alt="Vertiente Reader" width={36} height={36} className="w-full h-full object-contain" priority />
          </div>
          <AnimatePresence>
            {(!collapsed || open) && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-[var(--text-primary)] whitespace-nowrap overflow-hidden"
              >
                {APP_NAME}
              </motion.span>
            )}
          </AnimatePresence>

          <button
            onClick={close}
            className="ml-auto p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {/* Home (siempre arriba) */}
          {homeVisible && renderItem(homeVisible)}

          {/* Grupos */}
          {filteredGroups.map(({ group, items }) => {
            const GroupIcon = group.icon;
            const isOpen = isIconOnly ? true : expanded[group.id] === true;
            const hasActive = groupHasActive(items);

            // Modo icon-only: sin headers de grupo, solo items con divider sutil entre grupos.
            if (isIconOnly) {
              return (
                <div key={group.id} className="space-y-1 pt-2 first:pt-0">
                  <div className="flex items-center justify-center py-1">
                    <GlassTooltip content={group.label} position="right">
                      <div
                        className="flex items-center justify-center w-9 h-6 rounded-md text-[var(--text-tertiary)]"
                        aria-label={group.label}
                      >
                        <GroupIcon className="h-3.5 w-3.5" style={{ color: group.color }} />
                      </div>
                    </GlassTooltip>
                  </div>
                  {items.map((it) => renderItem(it))}
                </div>
              );
            }

            return (
              <div key={group.id} className="pt-2 first:pt-0">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-xl
                    text-xs font-semibold uppercase tracking-wide
                    transition-all duration-200
                    ${hasActive
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }
                    hover:bg-white/40 dark:hover:bg-white/[0.04]
                  `}
                  aria-expanded={isOpen}
                  aria-controls={`nav-group-${group.id}`}
                >
                  <GroupIcon
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: group.color }}
                  />
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`nav-group-${group.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 pt-1">
                        {items.map((it) => renderItem(it, true))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle - desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-12 border-t border-black/[0.06] dark:border-white/10 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>
    </>
  );
}
