import { deleteNotificationApi, getNotificationsApi, markAllNotificationsReadApi, markNotificationReadApi } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
export interface NotificationItem {
    id: string;
    type: 'order' | 'offer' | 'system';
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
    link?: string;
}
interface RawNotification extends Partial<NotificationItem> {
    _id?: string;
    titleAr?: string;
    messageAr?: string;
    isRead?: boolean;
    orderId?: string;
}
interface State {
    notifications: NotificationItem[];
    isLoading: boolean;
    isRinging: boolean;
    error: string | null;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
}
export const useNotificationStore = create<State>((set, get) => {
    const mutate = async (request: () => Promise<unknown>, update: (items: NotificationItem[]) => NotificationItem[]) => {
        const token = useAuthStore.getState().token;
        if (!token)
            throw new Error('Please log in');
        try {
            await request();
            if (useAuthStore.getState().token === token)
                set(s => ({ notifications: update(s.notifications), error: null }));
        }
        catch (error) {
            if (useAuthStore.getState().token === token)
                set({ error: errorMessage(error) });
            throw error;
        }
    };
    return {
        notifications: [], isLoading: false, isRinging: false, error: null,
        fetchNotifications: async () => {
            const token = useAuthStore.getState().token;
            if (!token || !useAuthStore.getState().isAuthenticated || get().isLoading)
                return;
            set({ isLoading: true });
            try {
                const raw: RawNotification[] = await getNotificationsApi();
                if (useAuthStore.getState().token !== token)
                    return;
                if (!Array.isArray(raw))
                    throw new Error('Invalid notifications response');
                set({ notifications: raw.filter(n => n._id || n.id).map(n => ({ id: (n._id || n.id)!, type: n.type || 'system', title: n.title || n.titleAr || '', message: n.message || n.messageAr || '', createdAt: n.createdAt || '', read: n.read ?? n.isRead ?? false, link: n.link?.startsWith('/') && !n.link.startsWith('//') ? n.link : n.orderId ? '/orders' : undefined })), isLoading: false, error: null });
            }
            catch (error) {
                if (useAuthStore.getState().token === token)
                    set({ isLoading: false, error: errorMessage(error) });
            }
        },
        markAsRead: id => mutate(() => markNotificationReadApi(id), items => items.map(n => n.id === id ? { ...n, read: true } : n)),
        markAllAsRead: () => mutate(markAllNotificationsReadApi, items => items.map(n => ({ ...n, read: true }))),
        deleteNotification: id => mutate(() => deleteNotificationApi(id), items => items.filter(n => n.id !== id)),
        clearAll: async () => { for (const n of [...get().notifications])
            await get().deleteNotification(n.id); }
    };
});
useAuthStore.subscribe((s, p) => { if (s.token !== p.token)
    useNotificationStore.setState({ notifications: [], error: null, isLoading: false, isRinging: false }); });
