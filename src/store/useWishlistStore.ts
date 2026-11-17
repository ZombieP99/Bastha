import { Product } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (product) => {
        const currentItems = get().items;
        const exists = currentItems.some(item => item._id === product._id);
        
        if (exists) {
          set({ items: currentItems.filter(item => item._id !== product._id) });
        } else {
          set({ items: [...currentItems, product] });
        }
      },
      isInWishlist: (productId) => get().items.some(item => item._id === productId),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'bastah-wishlist-storage',
    }
  )
);

useAuthStore.subscribe((state,previous)=>{if(state.token!==previous.token)useWishlistStore.getState().clearWishlist();});
