import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

// Matches the backend "populated cart shape"
export interface CartListing {
  _id: string;
  price: number;
  inStock: boolean;
  shop: { _id: string; name: string; area: string; phone: string };
  product: { _id: string; name: string; nameAr: string; imageUrl: string; unit: string };
}

export interface CartItem {
  listing: CartListing;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (listingId: string, quantity?: number) => Promise<void>;
  removeItem: (listingId: string) => Promise<void>;
  updateQuantity: (listingId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://bastah-backend.onrender.com/api',
});

// Interceptor to attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchCart: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      set({ items: [], isLoading: false });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/cart');
      set({ items: res.data.cart.items || [], isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch cart', err);
      // In case of 401 or 404, we just treat it as empty
      set({ items: [], isLoading: false, error: err.response?.data?.error || 'Failed to fetch cart' });
    }
  },

  addItem: async (listingId: string, quantity = 1) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw new Error('You must be logged in to add to cart');
    }

    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/cart/items', { listing: listingId, quantity });
      set({ items: res.data.cart.items || [], isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.error || 'Failed to add item' });
      throw err;
    }
  },

  removeItem: async (listingId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.delete(`/cart/items/${listingId}`);
      set({ items: res.data.cart.items || [], isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.error || 'Failed to remove item' });
    }
  },

  updateQuantity: async (listingId: string, quantity: number) => {
    if (quantity < 1) return;
    set({ isLoading: true, error: null });
    try {
      const res = await api.patch(`/cart/items/${listingId}`, { quantity });
      set({ items: res.data.cart.items || [], isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.error || 'Failed to update quantity' });
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.delete('/cart');
      set({ items: res.data.cart.items || [], isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.error || 'Failed to clear cart' });
    }
  },

  getTotalItems: () => get().items.length,
  getTotalPrice: () => get().items.reduce((total, item) => total + (item.listing.price * item.quantity), 0),
}));
