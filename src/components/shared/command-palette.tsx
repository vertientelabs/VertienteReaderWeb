'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Command,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
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
  UserCog,
  Settings,
  Shield,
  AlertTriangle,
  User,
  X,
} from 'lucide-react';
import { getDocs, query, where, limit } from 'firebase/firestore';
import { clientesCol, medidoresCol, usersCol } from '@/lib/firebase/collections';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface ResultItem {
  id: string;
  label: string;
  href: string;
  category: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: ResultItem[] = [
  { id: 'nav-dashboard', label: 'Dashboard', href: '/', category: 'Navegacion', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'nav-clientes', label: 'Clientes', href: '/clientes', category: 'Navegacion', icon: <Users className="h-4 w-4" /> },
  { id: 'nav-medidores', label: 'Medidores', href: '/medidores', category: 'Navegacion', icon: <Gauge className="h-4 w-4" /> },
  { id: 'nav-zonas', label: 'Zonas', href: '/zonas', category: 'Navegacion', icon: <MapPin className="h-4 w-4" /> },
  { id: 'nav-rutas', label: 'Rutas', href: '/rutas', category: 'Navegacion', icon: <Route className="h-4 w-4" /> },
  { id: 'nav-asignaciones', label: 'Asignaciones', href: '/asignaciones', category: 'Navegacion', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'nav-lecturas', label: 'Lecturas', href: '/lecturas', category: 'Navegacion', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'nav-analytics', label: 'Analytics', href: '/lecturas/dashboard', category: 'Navegacion', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'nav-exportar', label: 'Exportar', href: '/integracion/exportar', category: 'Navegacion', icon: <Download className="h-4 w-4" /> },
  { id: 'nav-reportes', label: 'Reportes', href: '/reportes', category: 'Navegacion', icon: <FileText className="h-4 w-4" /> },
  { id: 'nav-usuarios', label: 'Usuarios', href: '/usuarios', category: 'Navegacion', icon: <UserCog className="h-4 w-4" /> },
  { id: 'nav-configuracion', label: 'Configuracion', href: '/configuracion', category: 'Navegacion', icon: <Settings className="h-4 w-4" /> },
  { id: 'nav-auditoria', label: 'Auditoria', href: '/auditoria', category: 'Navegacion', icon: <Shield className="h-4 w-4" /> },
  { id: 'nav-incidencias', label: 'Incidencias', href: '/incidencias', category: 'Navegacion', icon: <AlertTriangle className="h-4 w-4" /> },
];

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [dynamicResults, setDynamicResults] = useState<ResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  // Filter static nav items
  const filteredNav = searchQuery
    ? NAV_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : NAV_ITEMS;

  // All results combined
  const allResults = [...filteredNav, ...dynamicResults];

  // Global keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!open) {
          // The parent controls open state; we rely on onClose toggle
          // This is handled by the parent, but we can trigger via a custom event
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setDynamicResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Dynamic Firestore search
  useEffect(() => {
    if (searchQuery.length < 3) {
      setDynamicResults([]);
      return;
    }

    const searchTerm = searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1).toLowerCase();
    let cancelled = false;

    const doSearch = async () => {
      setIsSearching(true);
      const results: ResultItem[] = [];

      try {
        // Search clientes by nombreCompleto
        const clientesSnap = await getDocs(
          query(
            clientesCol,
            where('nombreCompleto', '>=', searchTerm),
            where('nombreCompleto', '<=', searchTerm + '\uf8ff'),
            limit(5)
          )
        );
        if (!cancelled) {
          clientesSnap.forEach((doc) => {
            const data = doc.data();
            results.push({
              id: `cliente-${doc.id}`,
              label: data.nombreCompleto || 'Sin nombre',
              href: `/clientes/${doc.id}`,
              category: 'Clientes',
              icon: <Users className="h-4 w-4" />,
            });
          });
        }

        // Search medidores by numeroMedidor
        const medidoresSnap = await getDocs(
          query(
            medidoresCol,
            where('numeroMedidor', '>=', searchQuery.toUpperCase()),
            where('numeroMedidor', '<=', searchQuery.toUpperCase() + '\uf8ff'),
            limit(5)
          )
        );
        if (!cancelled) {
          medidoresSnap.forEach((doc) => {
            const data = doc.data();
            results.push({
              id: `medidor-${doc.id}`,
              label: data.numeroMedidor || 'Sin numero',
              href: `/medidores/${doc.id}`,
              category: 'Medidores',
              icon: <Gauge className="h-4 w-4" />,
            });
          });
        }

        // Search users by nombre
        const usersSnap = await getDocs(
          query(
            usersCol,
            where('nombre', '>=', searchTerm),
            where('nombre', '<=', searchTerm + '\uf8ff'),
            limit(5)
          )
        );
        if (!cancelled) {
          usersSnap.forEach((doc) => {
            const data = doc.data();
            results.push({
              id: `user-${doc.id}`,
              label: `${data.nombre || ''} ${data.apellidos || ''}`.trim() || 'Sin nombre',
              href: `/usuarios/${doc.id}`,
              category: 'Usuarios',
              icon: <User className="h-4 w-4" />,
            });
          });
        }
      } catch (err) {
        console.error('Command palette search error:', err);
      }

      if (!cancelled) {
        setDynamicResults(results);
        setIsSearching(false);
      }
    };

    const timer = setTimeout(doSearch, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredNav.length, dynamicResults.length]);

  // Keyboard navigation inside palette
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % allResults.length);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allResults.length) % allResults.length);
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const selected = allResults[selectedIndex];
        if (selected) {
          router.push(selected.href);
          onClose();
        }
        return;
      }
    },
    [allResults, selectedIndex, router, onClose]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Group results by category
  const grouped = allResults.reduce<Record<string, ResultItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categoryOrder = ['Navegacion', 'Clientes', 'Medidores', 'Lecturas', 'Usuarios'];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-xl bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 dark:border-white/5">
              <Search className="h-5 w-5 text-[var(--text-tertiary)] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar paginas, clientes, medidores..."
                className="flex-1 bg-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4 text-[var(--text-tertiary)]" />
                </button>
              )}
              <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-[var(--text-tertiary)] bg-white/30 dark:bg-white/10 px-1.5 py-0.5 rounded">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
              {allResults.length === 0 && !isSearching && (
                <div className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
                  No se encontraron resultados
                </div>
              )}

              {isSearching && (
                <div className="px-4 py-3 text-center text-sm text-[var(--text-tertiary)]">
                  Buscando...
                </div>
              )}

              {categoryOrder.map((category) => {
                const items = grouped[category];
                if (!items || items.length === 0) return null;

                return (
                  <div key={category}>
                    <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      {category === 'Navegacion' ? 'Navegacion' : category}
                    </div>
                    {items.map((item) => {
                      const globalIndex = allResults.indexOf(item);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <button
                          key={item.id}
                          data-index={globalIndex}
                          onClick={() => {
                            router.push(item.href);
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`
                            w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                            ${
                              isSelected
                                ? 'bg-[#0A84FF]/10 text-[#0A84FF]'
                                : 'text-[var(--text-secondary)] hover:bg-white/30 dark:hover:bg-white/10'
                            }
                          `}
                        >
                          <span className={isSelected ? 'text-[#0A84FF]' : 'text-[var(--text-tertiary)]'}>
                            {item.icon}
                          </span>
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {isSelected && (
                            <CornerDownLeft className="h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/10 dark:border-white/5 text-[10px] text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1">
                <ArrowUp className="h-3 w-3" />
                <ArrowDown className="h-3 w-3" />
                navegar
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" />
                seleccionar
              </span>
              <span className="flex items-center gap-1">
                <Command className="h-3 w-3" />K abrir/cerrar
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
