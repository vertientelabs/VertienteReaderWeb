'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className = '', label, error, icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-xl border border-black/[0.12] dark:border-white/10
              bg-white/50 dark:bg-white/5
              backdrop-blur-sm
              px-4 py-2.5 text-sm
              text-[var(--text-primary)]
              placeholder:text-[var(--text-tertiary)]
              outline-none
              transition-all duration-200
              focus:border-[#0A84FF]/50 focus:bg-white/70 dark:focus:bg-white/10
              focus:ring-2 focus:ring-[#0A84FF]/20
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-[#FF453A]/50 focus:border-[#FF453A]/50 focus:ring-[#FF453A]/20' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[#FF453A]">{error}</p>}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
export default GlassInput;
