'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-xl border backdrop-blur-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#0A84FF] text-white border-[#0A84FF]/30 hover:bg-[#0A84FF]/90 hover:shadow-[0_4px_20px_rgba(10,132,255,0.4)]',
      secondary:
        'bg-white/60 dark:bg-white/10 text-[#1a1a1c] dark:text-[#f5f5f7] border-black/[0.10] dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/20',
      danger:
        'bg-[#FF453A] text-white border-[#FF453A]/30 hover:bg-[#FF453A]/90 hover:shadow-[0_4px_20px_rgba(255,69,58,0.4)]',
      ghost:
        'bg-transparent text-[var(--text-secondary)] border-transparent hover:bg-black/[0.06] dark:hover:bg-white/10',
      success:
        'bg-[#30D158] text-white border-[#30D158]/30 hover:bg-[#30D158]/90 hover:shadow-[0_4px_20px_rgba(48,209,88,0.4)]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
export default GlassButton;
