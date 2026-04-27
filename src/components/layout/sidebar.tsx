'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAVIGATION_ITEMS, APP_NAME } from '@/lib/constants';
import { useAuth } from '@/lib/hooks/use-auth';
import { useSidebar } from '@/lib/hooks/use-sidebar';
import GlassTooltip from '@/components/ui/glass-tooltip';

export default function Sidebar() {
  const { open, close, collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.usertype;

  const filteredNav = NAVIGATION_ITEMS.filter(
    (item) => userRole && (item.roles as readonly string[]).includes(userRole)
  );

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[280px]';

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
          ${/* Mobile: hidden by default, slide in when open */''}
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

          {/* Mobile close button */}
          <button
            onClick={close}
            className="ml-auto p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNav.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const showLabel = !collapsed || open;

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
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

            if (collapsed && !open) {
              return (
                <GlassTooltip key={item.href} content={item.label} position="right">
                  {linkContent}
                </GlassTooltip>
              );
            }

            return linkContent;
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
