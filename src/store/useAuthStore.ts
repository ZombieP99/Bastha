import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bastah-backend.onrender.com/api';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(`${API_URL}/auth/login`, credentials);
          const token = res.data.token;
          
          set({ token, isAuthenticated: true });
          // Optionally attach token to headers globally here or in an interceptor
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          await get().loadUser();
          
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Login failed',
            isLoading: false,
            isAuthenticated: false
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // Register does not return a token in our API, so we might need to login after
          const res = await axios.post(`${API_URL}/auth/register`, userData);
          const user = res.data.user;
          // Auto login after register
          await get().login({ email: userData.email, password: userData.password });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Registration failed',
            isLoading: false
          });
          throw error;
        }
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        delete axios.defaults.headers.common['Authorization'];
      },

      loadUser: async () => {
        const token = get().token;
        if (!token) return;

        try {
          // Ensure token is attached
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get(`${API_URL}/auth/me`);
          set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("Failed to load user:", error);
          get().logout();
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'bastah-auth-storage',
      partialize: (state) => ({ token: state.token }), // Only persist token
    }
  )
);
