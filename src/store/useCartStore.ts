import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

export interface CartItem {
  id: string; // usually product._id
  product: Product;
  quantity: number;
  price: number; // Mock price until listings API is fully used in ProductCard
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, price?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, price = 50) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.id === product._id);
        
        if (existingItem) {
          set({
            items: currentItems.map(item => 
              item.id === product._id 
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          set({ items: [...currentItems, { id: product._id, product, quantity, price }] });
        }
      },
      removeItem: (productId) => set({
        items: get().items.filter(item => item.id !== productId)
      }),
      updateQuantity: (productId, quantity) => set({
        items: get().items.map(item => 
          item.id === productId 
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
      }),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
    }),
    {
      name: 'bastah-cart-storage',
    }
  )
);
