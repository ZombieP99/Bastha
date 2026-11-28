import { API_BASE_URL } from '@/lib/config';
import { errorMessage } from '@/lib/errors';
import type { User } from '@/types';
import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface Credentials {
    email: string;
    password: string;
}
type Registration = Credentials & { name: string; phone: string };
type SellerRegistration = Registration & {
    shop: { name: string; phone?: string; area?: string; address?: string; description?: string; category?: string };
};
interface AuthState {
    retryUntil: number;
    registerSeller: (data: SellerRegistration) => Promise<string>;
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (data: Credentials, portal?: 'customer' | 'seller' | 'admin') => Promise<void>;
    register: (data: Credentials & {
        name: string;
        phone: string;
    }) => Promise<void>;
    logout: () => void;
    loadUser: () => Promise<void>;
    clearError: () => void;
}
const auth = axios.create({ baseURL: API_BASE_URL, timeout: 20000 });
function loginErrorMessage(error: unknown) {
    const ar = typeof window !== 'undefined' && window.location?.pathname.startsWith('/ar/');
    if (axios.isAxiosError(error)) {
        const code = error.response?.data?.code;
        if (code === 'wrong_portal') return ar ? 'استخدم بوابة الدخول الخاصة بنوع حسابك.' : 'Use the sign-in page for your account type.';
        if (code === 'too_many_attempts' || code === 'too_many_requests') {
            const seconds = Number(error.response?.headers?.['retry-after']) || 900;
            return ar ? 'محاولات كثيرة. أعد المحاولة بعد ' + Math.ceil(seconds / 60) + ' دقيقة.' : 'Try again in ' + Math.ceil(seconds / 60) + ' minutes.';
        }
    }
    return errorMessage(error);
}
let generation = 0;
export const useAuthStore = create<AuthState>()(persist((set, get) => ({
    retryUntil: 0, token: null, user: null, isAuthenticated: false, isLoading: true, error: null,
    clearError: () => set({ error: null }),
    login: async (credentials, portal = 'customer') => {
        const attempt = ++generation;
        set({ token: null, user: null, isAuthenticated: false, isLoading: true, error: null });
        try {
            const { data } = await auth.post<{
                token: string;
                user: User;
            }>(portal === 'customer' ? '/auth/login' : '/auth/' + portal + '/login', credentials);
            if (attempt !== generation)
                throw new Error('Session changed');
            if (!data.token)
                throw new Error('Invalid login response');
            if (!data.user || data.user.role !== portal)
                throw new Error('Invalid login response');
            set({ token: data.token, user: data.user, isAuthenticated: true, isLoading: false });
        }
        catch (error) {
            if (attempt === generation)
                set({ error: loginErrorMessage(error), isLoading: false,
                    retryUntil: axios.isAxiosError(error) && error.response?.status === 429
                        ? Date.now() + (Number(error.response.headers?.['retry-after']) || 900) * 1000 : 0 });
            throw error;
        }
    },
    register: async (payload) => {
        const attempt = ++generation;
        set({ isLoading: true, error: null });
        try {
            const { data } = await auth.post<{ token: string; user: User }>('/auth/register', payload);
            if (attempt !== generation)
                throw new Error('Session changed');
            if (!data.token || data.user?.role !== 'customer')
                throw new Error('Invalid registration response');
            set({ token: data.token, user: data.user, isAuthenticated: true, isLoading: false });
        }
        catch (error) {
            if (attempt === generation)
                set({ isLoading: false, error: errorMessage(error) });
            throw error;
        }
    },
    registerSeller: async (payload) => {
        const attempt = ++generation;
        set({ isLoading: true, error: null });
        try {
            const { data } = await auth.post<{ token: string; user: User; shop: { _id: string } }>(
                '/auth/seller/register', payload
            );
            if (attempt !== generation)
                throw new Error('Session changed');
            if (!data.token || data.user?.role !== 'seller' || !data.shop?._id)
                throw new Error('Invalid registration response');
            set({ token: data.token, user: data.user, isAuthenticated: true, isLoading: false });
            return data.shop._id;
        } catch (error) {
            if (attempt === generation)
                set({ isLoading: false, error: errorMessage(error) });
            throw error;
        }
    },
    logout: () => { generation++; set({ token: null, user: null, isAuthenticated: false, isLoading: false, error: null }); },
    loadUser: async () => {
        const token = get().token;
        const attempt = generation;
        if (!token) {
            set({ isLoading: false });
            return;
        }
        set({ isLoading: true, error: null });
        try {
            const { data } = await auth.get<{
                user: User;
            }>('/auth/me', { headers: { Authorization: 'Bearer ' + token } });
            if (get().token !== token || attempt !== generation)
                return;
            if (!data.user)
                throw new Error('Invalid account response');
            set({ user: data.user, isAuthenticated: true, isLoading: false });
        }
        catch (error) {
            if (get().token !== token || attempt !== generation)
                return;
            if (axios.isAxiosError(error) && ([401, 404].includes(error.response?.status ?? 0) || error.response?.data?.code === 'account_suspended'))
                get().logout();
            set({ isLoading: false, error: errorMessage(error, 'تعذر تحميل الحساب، أعد المحاولة / Unable to load account, please retry') });
        }
    }
}), { name: 'bastah-auth-storage', partialize: state => ({ token: state.token }) }));


