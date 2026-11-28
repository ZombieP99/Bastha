import { create } from 'zustand';
import api from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { useAuthStore } from './useAuthStore';

export type Family = 'order' | 'alert' | 'offer' | 'announcement' | 'account';
export interface NotificationItem {
    _id: string;
    type: Family;
    event: string;
    title: string;
    titleAr: string;
    body: string;
    bodyAr: string;
    readAt: string | null;
    createdAt: string;
    link?: { order?: string; shop?: string; product?: string; listing?: string; offer?: string };
}
export function destination(item: NotificationItem, seller: boolean) {
    const link = item.link || {};
    const id = (value?: string) => value && /^[a-f\d]{24}$/i.test(value) ? value : undefined;
    const shop = id(link.shop), product = id(link.product), order = id(link.order);
    if (item.type === 'order' && order) return (seller ? '/seller/orders' : '/orders') + '?id=' + order;
    if (['price_drop','back_in_stock'].includes(item.event)) return product ? '/products/' + product : '/cart';
    if (item.event === 'new_review' && shop) return '/shops/' + shop + '?tab=reviews#reviews';
    if (item.type === 'offer') return product ? '/products/' + product : shop ? '/shops/' + shop + '#offers' : undefined;
    if (item.type === 'account') return '/seller/dashboard' + (shop ? '?shop=' + shop : '?tab=catalog');
}

interface State {
    notifications: NotificationItem[];
    previewLoading: boolean;
    unreadCount: number;
    revision: number;
    error: string | null;
    refreshCount(): Promise<void>;
    fetchNotifications(): Promise<void>;
    markAsRead(id: string): Promise<void>;
    markAllAsRead(): Promise<void>;
    deleteNotification(id: string): Promise<void>;
    clearAll(): Promise<void>;
}
let countRequest = 0, previewRequest = 0;
export const useNotificationStore = create<State>((set, get) => {
    async function mutate(method: 'patch'|'delete', path: string, id?: string) {
        const token = useAuthStore.getState().token;
        if (!token) throw new Error('Please log in');
        try { await api[method](path); }
        catch (error) {
            if (!id || (error as {response?:{status:number}})?.response?.status !== 404) throw error;
        }
        if (token !== useAuthStore.getState().token) return;
        set(state => ({revision: state.revision + 1}));
        await Promise.all([get().refreshCount(),get().fetchNotifications()]);
    }
    return {
        notifications: [], previewLoading: false, unreadCount: 0, revision: 0, error: null,
        refreshCount: async () => {
            const request = ++countRequest, token = useAuthStore.getState().token;
            if (!token) return;
            try {
                const {data} = await api.get('/notifications/unread-count');
                if (token === useAuthStore.getState().token && request === countRequest) set({unreadCount:data.count});
            } catch { /* Keep the last count until the next visible poll. */ }
        },
        fetchNotifications: async () => {
            const request = ++previewRequest, token = useAuthStore.getState().token;
            if (!token) return;
            set({previewLoading: true, error: null});
            try {
                const {data} = await api.get('/notifications',{params:{limit:5}});
                if (token === useAuthStore.getState().token && request === previewRequest) set({notifications:data.notifications,previewLoading:false,error:null});
            } catch (error) {
                if (token === useAuthStore.getState().token && request === previewRequest) set({previewLoading:false,error:errorMessage(error)});
            }
        },
        markAsRead: id => mutate('patch','/notifications/'+id+'/read',id),
        markAllAsRead: () => mutate('patch','/notifications/read-all'),
        deleteNotification: id => mutate('delete','/notifications/'+id,id),
        clearAll: () => mutate('delete','/notifications'),
    };
});
useAuthStore.subscribe((s,p) => {
    if (s.token !== p.token) useNotificationStore.setState({notifications:[],previewLoading:false,unreadCount:0,error:null,revision:0});
});
