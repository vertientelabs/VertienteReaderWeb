'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'flat';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className = '', variant = 'default', hover = true, padding = 'md', children, ...props }, ref) => {
    const base =
      'rounded-2xl border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl transition-all duration-250';

    const variants = {
      default: 'bg-white/72 dark:bg-[#1e1e1e]/72 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
      elevated: 'bg-white/85 dark:bg-[#1e1e1e]/85 shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]',
      flat: 'bg-white/50 dark:bg-[#1e1e1e]/50 shadow-none',
    };

    const hoverClass = hover
      ? 'hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]'
      : '';

    return (
      <div
        ref={ref}
        className={`${base} ${variants[variant]} ${hoverClass} ${paddingMap[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
export default GlassCard;
