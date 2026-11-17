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
interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (data: Credentials) => Promise<void>;
    register: (data: Credentials & {
        name: string;
        phone: string;
    }) => Promise<void>;
    logout: () => void;
    loadUser: () => Promise<void>;
    clearError: () => void;
}
const auth = axios.create({ baseURL: API_BASE_URL, timeout: 20000 });
let generation = 0;
export const useAuthStore = create<AuthState>()(persist((set, get) => ({
    token: null, user: null, isAuthenticated: false, isLoading: true, error: null,
    clearError: () => set({ error: null }),
    login: async (credentials) => {
        const attempt = ++generation;
        set({ token: null, user: null, isAuthenticated: false, isLoading: true, error: null });
        try {
            const { data } = await auth.post<{
                token: string;
            }>('/auth/login', credentials);
            if (attempt !== generation)
                throw new Error('Session changed');
            if (!data.token)
                throw new Error('Invalid login response');
            set({ token: data.token });
            await get().loadUser();
            if (attempt !== generation || !get().isAuthenticated)
                throw new Error(get().error || 'Login failed');
        }
        catch (error) {
            if (attempt === generation)
                set({ error: errorMessage(error), isLoading: false });
            throw error;
        }
    },
    register: async (data) => {
        set({ isLoading: true, error: null });
        try {
            await auth.post('/auth/register', data);
            await get().login({ email: data.email, password: data.password });
        }
        catch (error) {
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
            if (axios.isAxiosError(error) && [401, 404].includes(error.response?.status ?? 0))
                get().logout();
            set({ isLoading: false, error: errorMessage(error, 'تعذر تحميل الحساب، أعد المحاولة / Unable to load account, please retry') });
        }
    }
}), { name: 'bastah-auth-storage', partialize: state => ({ token: state.token }) }));
