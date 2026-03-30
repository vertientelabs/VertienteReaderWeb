'use client';

import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon,
  title = 'Sin resultados',
  description = 'No se encontraron datos para mostrar.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-white/30 dark:bg-white/5 flex items-center justify-center mb-4">
        {icon || <Inbox className="h-8 w-8 text-[var(--text-tertiary)]" />}
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-tertiary)] text-center max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}
