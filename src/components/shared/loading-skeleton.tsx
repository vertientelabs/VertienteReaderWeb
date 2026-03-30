'use client';

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.18] bg-white/40 dark:bg-[#1e1e1e]/40 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 bg-white/30 dark:bg-white/10 rounded" />
        <div className="h-8 w-8 bg-white/30 dark:bg-white/10 rounded-lg" />
      </div>
      <div className="h-8 w-20 bg-white/30 dark:bg-white/10 rounded mb-2" />
      <div className="h-3 w-32 bg-white/20 dark:bg-white/5 rounded" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.18] bg-white/40 dark:bg-[#1e1e1e]/40 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="h-5 w-48 bg-white/30 dark:bg-white/10 rounded animate-pulse" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-white/5 animate-pulse">
          <div className="h-4 w-8 bg-white/20 dark:bg-white/5 rounded" />
          <div className="h-4 flex-1 bg-white/20 dark:bg-white/5 rounded" />
          <div className="h-4 w-24 bg-white/20 dark:bg-white/5 rounded" />
          <div className="h-4 w-16 bg-white/20 dark:bg-white/5 rounded" />
        </div>
      ))}
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-gradient)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#30D158] animate-pulse flex items-center justify-center">
          <svg className="w-6 h-6 text-white animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
          </svg>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">Cargando...</p>
      </div>
    </div>
  );
}
