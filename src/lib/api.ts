import { API_BASE_URL } from '@/lib/config';
import { useAuthStore } from '@/store/useAuthStore';
import { Category, Product, Shop } from '@/types';
import axios from 'axios';
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Read token from Zustand persist storage (key: 'bastah-auth-storage')
// Zustand stores { state: { token: "..." }, version: 0 } in localStorage.
// We parse it here to avoid a circular import with useAuthStore.
function getStoredToken(): string | null {
    if (typeof window === 'undefined')
        return null;
    try {
        const raw = localStorage.getItem('bastah-auth-storage');
        if (!raw)
            return null;
        const parsed = JSON.parse(raw) as {
            state?: {
                token?: string;
            };
        };
        return typeof parsed?.state?.token === 'string' ? parsed.state.token : null;
    }
    catch {
        return null;
    }
}
api.interceptors.request.use((config) => {
    const token = typeof window === 'undefined' ? null : useAuthStore.getState().token || getStoredToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// Categories
export const getCategories = async (): Promise<Category[]> => {
    const { data } = await api.get('/categories');
    return data.categories || [];
};
// Shops
export const getShops = async (): Promise<Shop[]> => {
    const { data } = await api.get('/shops');
    return data.shops || [];
};
export const getTopShops = async (limit: number = 10): Promise<Shop[]> => {
    const { data } = await api.get(`/shops/top?limit=${limit}`);
    return data.shops || [];
};
export const getShopById = async (id: string): Promise<Shop> => {
    const { data } = await api.get(`/shops/${id}`);
    return data.shop;
};
export const getShopProducts = async (shopId: string) => {
    const { data } = await api.get(`/shops/${shopId}/products`);
    return (data.listings || []) as (import('@/types').Listing & {
        product: Product;
    })[];
};
// Products
export const getProducts = async (page: number = 1, limit: number = 20) => {
    const { data } = await api.get(`/products?page=${page}&limit=${limit}`);
    return data as {
        products: Product[];
        page: number;
        limit: number;
        total: number;
    };
};
export const getFeaturedProducts = async (limit: number = 10): Promise<Product[]> => {
    const { data } = await api.get(`/products/featured?limit=${limit}`);
    return data.products || [];
};
export const getNewProducts = async (page: number = 1, limit: number = 20) => {
    const { data } = await api.get(`/products/new?page=${page}&limit=${limit}`);
    return data as {
        products: Product[];
        page: number;
        limit: number;
        total: number;
    };
};
export const searchProducts = async (query: string, category?: string, sort?: string, page: number = 1, limit: number = 20) => {
    const params = new URLSearchParams();
    if (query)
        params.append('q', query);
    if (category)
        params.append('category', category);
    if (sort)
        params.append('sort', sort);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const { data } = await api.get(`/products/search?${params.toString()}`);
    return data as {
        products: Product[];
        page: number;
        limit: number;
        total: number;
    };
};
export const getProductListings = async (productId: string) => {
    const { data } = await api.get(`/products/${productId}/listings`);
    return data as { product: Product; listings: import('@/types').Listing[] };
};
// Notifications API
export const getNotificationsApi = async () => {
    const { data } = await api.get('/notifications');
    return data.notifications || data || [];
};
export const markNotificationReadApi = async (id: string) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
};
export const markAllNotificationsReadApi = async () => {
    const { data } = await api.put('/notifications/read-all');
    return data;
};
export const deleteNotificationApi = async (id: string) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
};
export default api;
api.interceptors.response.use(response => response, error => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
        const token = useAuthStore.getState().token;
        if (token && error.config?.headers?.Authorization === 'Bearer ' + token)
            useAuthStore.getState().logout();
    }
    return Promise.reject(error);
});
