'use client';

import GlassModal from '@/components/ui/glass-modal';
import GlassButton from '@/components/ui/glass-button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message = '¿Está seguro de realizar esta acción?',
  confirmLabel = 'Confirmar',
  variant = 'danger',
  loading,
}: ConfirmDialogProps) {
  return (
    <GlassModal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-[#FF453A]/12' : 'bg-[#0A84FF]/12'}`}>
          <AlertTriangle className={`h-6 w-6 ${variant === 'danger' ? 'text-[#FF453A]' : 'text-[#0A84FF]'}`} />
        </div>
        <p className="text-sm text-[var(--text-secondary)]">{message}</p>
        <div className="flex gap-3 w-full">
          <GlassButton variant="secondary" className="flex-1" onClick={onClose}>
            Cancelar
          </GlassButton>
          <GlassButton variant={variant === 'danger' ? 'danger' : 'primary'} className="flex-1" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
}
