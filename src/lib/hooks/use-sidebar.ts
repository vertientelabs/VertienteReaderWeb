'use client';

import { create } from 'zustand';

interface SidebarState {
  open: boolean;
  collapsed: boolean;
  toggle: () => void;
  close: () => void;
  setCollapsed: (val: boolean) => void;
}

export const useSidebar = create<SidebarState>((set) => ({
  open: false,
  collapsed: false,
  toggle: () => set((s) => ({ open: !s.open })),
  close: () => set({ open: false }),
  setCollapsed: (val) => set({ collapsed: val }),
}));
