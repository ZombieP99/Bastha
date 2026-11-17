import api from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { create } from 'zustand';
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


function availableItems(items: CartItem[]): CartItem[] {
 return items.filter(item=>item.listing && item.listing.product && item.listing.shop);
}
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
    
    if (get().isLoading) throw new Error('Please wait for the current cart update');
    const requestToken = useAuthStore.getState().token;
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/cart');
      if (useAuthStore.getState().token !== requestToken) return;
      set({ items: availableItems(res.data.cart.items || []), isLoading: false });
    } catch (err: unknown) {
      if (useAuthStore.getState().token !== requestToken) return;
      console.error('Failed to fetch cart', err);
      // In case of 401 or 404, we just treat it as empty
      set({ items: [], isLoading: false, error: errorMessage(err, 'Failed to fetch cart') });
    }
  },

  addItem: async (listingId: string, quantity = 1) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw new Error('You must be logged in to add to cart');
    }

    if (get().isLoading) throw new Error('Please wait for the current cart update');
    const requestToken = useAuthStore.getState().token;
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/cart/items', { listing: listingId, quantity });
      if (useAuthStore.getState().token !== requestToken) return;
      set({ items: availableItems(res.data.cart.items || []), isLoading: false });
    } catch (err: unknown) {
      if (useAuthStore.getState().token !== requestToken) return;
      set({ isLoading: false, error: errorMessage(err, 'Failed to add item') });
      throw err;
    }
  },

  removeItem: async (listingId: string) => {
    if (get().isLoading) throw new Error('Please wait for the current cart update');
    const requestToken = useAuthStore.getState().token;
    set({ isLoading: true, error: null });
    try {
      const res = await api.delete(`/cart/items/${listingId}`);
      if (useAuthStore.getState().token !== requestToken) return;
      set({ items: availableItems(res.data.cart.items || []), isLoading: false });
    } catch (err: unknown) {
      if (useAuthStore.getState().token !== requestToken) return;
      set({ isLoading: false, error: errorMessage(err, 'Failed to remove item') });
    }
  },

  updateQuantity: async (listingId: string, quantity: number) => {
    if (quantity < 1) return;
    if (get().isLoading) throw new Error('Please wait for the current cart update');
    const requestToken = useAuthStore.getState().token;
    set({ isLoading: true, error: null });
    try {
      const res = await api.patch(`/cart/items/${listingId}`, { quantity });
      if (useAuthStore.getState().token !== requestToken) return;
      set({ items: availableItems(res.data.cart.items || []), isLoading: false });
    } catch (err: unknown) {
      if (useAuthStore.getState().token !== requestToken) return;
      set({ isLoading: false, error: errorMessage(err, 'Failed to update quantity') });
    }
  },

  clearCart: async () => {
    if (get().isLoading) throw new Error('Please wait for the current cart update');
    const requestToken = useAuthStore.getState().token;
    set({ isLoading: true, error: null });
    try {
      const res = await api.delete('/cart');
      if (useAuthStore.getState().token !== requestToken) return;
      set({ items: availableItems(res.data.cart.items || []), isLoading: false });
    } catch (err: unknown) {
      if (useAuthStore.getState().token !== requestToken) return;
      set({ isLoading: false, error: errorMessage(err, 'Failed to clear cart') });
    }
  },

  getTotalItems: () => get().items.reduce((sum,item)=>sum+item.quantity,0),
  getTotalPrice: () => get().items.reduce((total, item) => total + (item.listing.price * item.quantity), 0),
}));

useAuthStore.subscribe((state, previous) => {
  if (state.token !== previous.token) useCartStore.setState({ items: [], error: null, isLoading: false });
});
