import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppState {
  sidebarOpen: boolean;
  currentView: string;
  // Navigation state
  breadcrumbs: Array<{ label: string; href?: string }>;
  // Theme preferences
  compactMode: boolean;
  tableRowsPerPage: number;
  // UI state
  fullscreenMode: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
    read: boolean;
    date: Date;
  }>;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCurrentView: (view: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => void;
  setCompactMode: (compact: boolean) => void;
  setTableRowsPerPage: (rowsPerPage: number) => void;
  toggleFullscreenMode: () => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'date' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      currentView: 'dashboard',
      breadcrumbs: [{ label: 'Dashboard' }],
      compactMode: false,
      tableRowsPerPage: 10,
      fullscreenMode: false,
      notifications: [],
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setCurrentView: (view) => set({ currentView: view }),
      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
      setCompactMode: (compact) => set({ compactMode: compact }),
      setTableRowsPerPage: (rowsPerPage) => set({ tableRowsPerPage: rowsPerPage }),
      toggleFullscreenMode: () => set((state) => ({ fullscreenMode: !state.fullscreenMode })),
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            id: Math.random().toString(36).substring(2, 9),
            ...notification,
            read: false,
            date: new Date(),
          },
          ...state.notifications,
        ].slice(0, 100), // Limit to 100 notifications
      })),
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
      })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'fluxori-app-state',
      partialize: (state) => ({
        compactMode: state.compactMode,
        tableRowsPerPage: state.tableRowsPerPage,
      }),
    }
  )
);

export default useAppStore;