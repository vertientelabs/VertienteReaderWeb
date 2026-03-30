'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, LogOut, User, Moon, Sun, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/hooks/use-auth';
import { getInitials } from '@/lib/utils/formatters';
import CommandPalette from '@/components/shared/command-palette';
import NotificationPanel from '@/components/shared/notification-panel';

export default function Topbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Global Ctrl+K / Cmd+K to open palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (<>
    <header className="h-16 border-b border-black/[0.06] dark:border-white/10 bg-white/40 dark:bg-[#1a1a1a]/40 backdrop-blur-xl flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Buscar... (Ctrl+K)"
            readOnly
            onClick={() => setShowPalette(true)}
            className="
              w-full pl-10 pr-4 py-2 text-sm cursor-pointer
              bg-white/40 dark:bg-white/5
              border border-black/[0.08] dark:border-white/10
              rounded-xl backdrop-blur-sm
              text-[var(--text-primary)]
              placeholder:text-[var(--text-tertiary)]
              outline-none focus:border-[#0A84FF]/50 focus:ring-2 focus:ring-[#0A84FF]/20
              transition-all duration-200
            "
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-tertiary)] bg-white/30 dark:bg-white/10 px-1.5 py-0.5 rounded">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => setShowNotifications(true)}
          className="relative p-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF453A] rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative ml-2">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A84FF] to-[#BF5AF2] flex items-center justify-center text-white text-xs font-bold">
              {user ? getInitials(user.nombre, user.apellidos) : '?'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-[var(--text-primary)] leading-tight">
                {user?.nombre || 'Usuario'}
              </p>
              <p className="text-[10px] text-[var(--text-tertiary)] capitalize">
                {user?.usertype || 'Sin rol'}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 z-50 bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-2xl border border-black/[0.08] dark:border-white/10 rounded-xl shadow-lg overflow-hidden animate-scale-in">
                <button
                  onClick={() => { setShowUserMenu(false); router.push('/perfil'); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Mi Perfil
                </button>
                <hr className="border-black/[0.06] dark:border-white/10" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#FF453A] hover:bg-[#FF453A]/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>

    <CommandPalette open={showPalette} onClose={() => setShowPalette(false)} />
    <NotificationPanel open={showNotifications} onClose={() => setShowNotifications(false)} />
  </>
  );
}
