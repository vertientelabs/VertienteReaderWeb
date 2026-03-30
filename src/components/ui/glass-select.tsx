'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface GlassSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ className = '', label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full rounded-xl border border-black/[0.12] dark:border-white/10
            bg-white/50 dark:bg-white/5
            backdrop-blur-sm
            px-4 py-2.5 text-sm
            text-[var(--text-primary)]
            outline-none
            transition-all duration-200
            focus:border-[#0A84FF]/50 focus:bg-white/70 dark:focus:bg-white/10
            focus:ring-2 focus:ring-[#0A84FF]/20
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none
            bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236e6e73%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')]
            bg-no-repeat bg-[right_12px_center]
            ${error ? 'border-[#FF453A]/50' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-[#FF453A]">{error}</p>}
      </div>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';
export default GlassSelect;
