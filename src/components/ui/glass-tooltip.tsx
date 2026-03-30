'use client';

import { useState, ReactNode } from 'react';

interface GlassTooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const positionStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export default function GlassTooltip({ content, children, position = 'top' }: GlassTooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div
          className={`
            absolute z-50 ${positionStyles[position]}
            px-3 py-1.5 text-xs font-medium
            bg-[#1d1d1f]/90 text-white
            rounded-lg backdrop-blur-sm
            whitespace-nowrap
            animate-fade-in
            pointer-events-none
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
}
