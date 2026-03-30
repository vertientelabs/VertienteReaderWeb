'use client';

import { useState, useCallback } from 'react';
import { X, Bell, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type NotificationType = 'success' | 'danger' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
}

const TYPE_COLORS: Record<NotificationType, string> = {
  success: '#30D158',
  danger: '#FF453A',
  warning: '#FF9F0A',
  info: '#0A84FF',
};

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'success', title: 'Ruta completada', description: 'Ruta 03 completada por Juan Pérez', time: 'Hace 5 min' },
  { id: '2', type: 'danger', title: 'Anomalía crítica', description: 'Consumo excesivo detectado en Med. 00892', time: 'Hace 15 min' },
  { id: '3', type: 'warning', title: 'Lectura pendiente', description: '23 medidores sin lectura en Zona Norte', time: 'Hace 30 min' },
  { id: '4', type: 'info', title: 'Exportación lista', description: 'El archivo CSV del periodo 2026-03 está listo', time: 'Hace 1 hora' },
  { id: '5', type: 'success', title: 'Validación masiva', description: '45 lecturas validadas en Zona Sur', time: 'Hace 2 horas' },
  { id: '6', type: 'danger', title: 'Incidencia reportada', description: 'Medidor dañado reportado en Calle Los Olivos', time: 'Hace 3 horas' },
  { id: '7', type: 'warning', title: 'Periodo por cerrar', description: 'Quedan 4 días para el cierre del periodo', time: 'Hace 5 horas' },
  { id: '8', type: 'info', title: 'Nuevo operario', description: 'Carlos Mendoza ha sido registrado en el sistema', time: 'Ayer' },
];

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds(new Set(DEMO_NOTIFICATIONS.map((n) => n.id)));
  }, []);

  const unreadNotifications = DEMO_NOTIFICATIONS.filter((n) => !readIds.has(n.id));
  const displayedNotifications = filter === 'all' ? DEMO_NOTIFICATIONS : unreadNotifications;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-80 sm:w-96 z-50 flex flex-col bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-2xl border-l border-white/20 dark:border-white/10 shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Notificaciones</h2>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-[#0A84FF] hover:bg-[#0A84FF]/10 rounded-lg transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  Marcar todo como leído
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-white/30 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-5 py-3">
              {(['all', 'unread'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filter === tab
                      ? 'bg-[#0A84FF]/15 text-[#0A84FF]'
                      : 'text-[var(--text-tertiary)] hover:bg-white/30 dark:hover:bg-white/10'
                  }`}
                >
                  {tab === 'all' ? 'Todas' : `No leídas (${unreadNotifications.length})`}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {displayedNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)] gap-3">
                  <Bell className="h-10 w-10 opacity-40" />
                  <p className="text-sm">No hay notificaciones sin leer</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-1">
                  {displayedNotifications.map((notification) => {
                    const isUnread = !readIds.has(notification.id);
                    return (
                      <li
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`flex items-start gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                          isUnread
                            ? 'bg-white/50 dark:bg-white/5'
                            : 'hover:bg-white/30 dark:hover:bg-white/5'
                        }`}
                      >
                        {/* Color dot */}
                        <span
                          className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: TYPE_COLORS[notification.type] }}
                        />
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
                            {notification.title}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)] mt-0.5 leading-snug">
                            {notification.description}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)] mt-1 opacity-70">
                            {notification.time}
                          </p>
                        </div>
                        {/* Unread indicator */}
                        {isUnread && (
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-[#0A84FF] shrink-0" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
