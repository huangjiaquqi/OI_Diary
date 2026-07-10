import { useUIStore } from '@/stores/uiStore';

export function useSidebar() {
  const uiStore = useUIStore();

  return {
    isOpen: uiStore.sidebarOpen,
    open: uiStore.openSidebar,
    close: uiStore.closeSidebar,
    toggle: uiStore.toggleSidebar,
  };
}