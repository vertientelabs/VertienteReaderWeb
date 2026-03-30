'use client';

interface GlassChipProps {
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  default: 'bg-white/40 dark:bg-white/10 text-[var(--text-secondary)]',
  primary: 'bg-[#0A84FF]/12 text-[#0A84FF]',
  success: 'bg-[#30D158]/12 text-[#30D158]',
  warning: 'bg-[#FF9F0A]/12 text-[#FF9F0A]',
  danger: 'bg-[#FF453A]/12 text-[#FF453A]',
  purple: 'bg-[#BF5AF2]/12 text-[#BF5AF2]',
};

export default function GlassChip({ label, variant = 'default', size = 'sm', className = '' }: GlassChipProps) {
  const sizeStyles = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        border border-white/10 backdrop-blur-sm
        ${variantStyles[variant]}
        ${sizeStyles}
        ${className}
      `}
    >
      {label}
    </span>
  );
}
