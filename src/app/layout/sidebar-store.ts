import { create } from 'zustand'

interface SidebarDrawerState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useSidebarDrawerStore = create<SidebarDrawerState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
