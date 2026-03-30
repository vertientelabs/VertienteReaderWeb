'use client';

import { Toaster } from 'sonner';

export default function NotificationCenter() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className:
          'bg-white/80 dark:bg-[#2a2a2a]/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl shadow-lg',
        duration: 4000,
      }}
    />
  );
}
