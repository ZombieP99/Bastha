import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { 
  getNotificationsApi, 
  markNotificationReadApi, 
  markAllNotificationsReadApi, 
  deleteNotificationApi 
} from '@/lib/api';

export interface NotificationItem {
  id: string;
  type: 'order' | 'offer' | 'system';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
  data?: Record<string, unknown>;
}

interface NotificationState {
  notifications: NotificationItem[];
  isLoading: boolean;
  isRinging: boolean;
  lastFetched: number | null;
  
  // Real Connection & Fetching
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: NotificationItem) => void;
  
  // Interactions & Backend Sync
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  
  // UI Helpers
  triggerBellRing: () => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [], // Zero fake data — populated exclusively via Backend or live connection
      isLoading: false,
      isRinging: false,
      lastFetched: null,

      triggerBellRing: () => {
        set({ isRinging: true });
        setTimeout(() => set({ isRinging: false }), 2000);
      },

      fetchNotifications: async () => {
        try {
          set({ isLoading: true });
          const raw = await getNotificationsApi();
          
          const incoming: NotificationItem[] = Array.isArray(raw) 
            ? raw.map((item: any) => ({
                id: item._id || item.id || `notif-${Date.now()}-${Math.random()}`,
                type: item.type || 'system',
                title: item.title || item.titleAr || 'إشعار جديد',
                message: item.message || item.messageAr || '',
                createdAt: item.createdAt || new Date().toISOString(),
                read: Boolean(item.read || item.isRead),
                link: item.link || (item.orderId ? `/orders` : undefined),
                data: item.data || item.metadata
              }))
            : [];

          const current = get().notifications;
          const currentIds = new Set(current.map(n => n.id));

          // Check if there are newly arrived unread notifications
          const brandNewUnread = incoming.filter(n => !n.read && !currentIds.has(n.id));

          if (brandNewUnread.length > 0) {
            get().triggerBellRing();
            // Show toast for the latest one
            const latest = brandNewUnread[0];
            toast(latest.title, {
              icon: latest.type === 'order' ? '📦' : latest.type === 'offer' ? '✨' : '🔔',
              duration: 4000
            });
          }

          set({ 
            notifications: incoming, 
            lastFetched: Date.now(), 
            isLoading: false 
          });
        } catch (error) {
          // If backend doesn't implement /notifications yet, fail silently without crashing
          set({ isLoading: false });
        }
      },

      addNotification: (item: NotificationItem) => {
        set((state) => ({
          notifications: [item, ...state.notifications]
        }));
        get().triggerBellRing();
        toast(item.title, {
          icon: item.type === 'order' ? '📦' : item.type === 'offer' ? '✨' : '🔔',
          duration: 4000
        });
      },

      markAsRead: async (id: string) => {
        // Optimistic UI update
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
        }));

        // Send API request to backend
        try {
          await markNotificationReadApi(id);
        } catch (err) {
          console.warn('Backend mark-as-read sync skipped or not implemented yet', err);
        }
      },

      markAllAsRead: async () => {
        // Optimistic UI update
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true }))
        }));

        // Send API request to backend
        try {
          await markAllNotificationsReadApi();
        } catch (err) {
          console.warn('Backend mark-all-read sync skipped or not implemented yet', err);
        }
      },

      deleteNotification: async (id: string) => {
        // Optimistic UI update
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id)
        }));

        // Send API request to backend
        try {
          await deleteNotificationApi(id);
        } catch (err) {
          console.warn('Backend delete notification sync skipped or not implemented yet', err);
        }
      },

      clearAll: async () => {
        set({ notifications: [] });
        try {
          await markAllNotificationsReadApi();
        } catch (err) {
          console.warn('Backend clear all sync skipped', err);
        }
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      }
    }),
    {
      name: 'bastah-notifications-storage',
      partialize: (state) => ({ notifications: state.notifications })
    }
  )
);
