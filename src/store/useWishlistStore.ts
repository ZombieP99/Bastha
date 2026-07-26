import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

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
