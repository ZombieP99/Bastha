import type { Product } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';

type Session = ReturnType<typeof useAuthStore.getState>;
function owner(session: Session) {
    if (!session.token) return 'guest';
    const id = session.user?.id || session.user?._id;
    return session.isAuthenticated && id ? 'user-' + id : undefined;
}

interface WishlistState {
    items: Product[];
    lists: Record<string, Product[]>;
    toggleWishlist(product: Product): void;
    isInWishlist(id: string): boolean;
    clearWishlist(): void;
}

// Older installations stored only the active session's items.
const initialToken = useAuthStore.getState().token;
let previousItems: Product[] | undefined;
export const useWishlistStore = create<WishlistState>()(persist((set, get) => {
    function save(items: Product[]) {
        const key = owner(useAuthStore.getState());
        if (key) set(state => ({items, lists: {...state.lists, [key]:items}}));
    }
    return {
        items: [], lists: {},
        toggleWishlist(product) {
            const items = get().items;
            save(items.some(item => item._id === product._id)
                ? items.filter(item => item._id !== product._id) : [...items, product]);
        },
        isInWishlist: id => get().items.some(item => item._id === id),
        clearWishlist: () => save([])
    };
}, {
    name: 'bastah-wishlist-storage',
    partialize: state => ({lists:state.lists}),
    merge: (persisted,current) => {
        const stored = persisted as {lists?: Record<string,Product[]>; items?: Product[]} | undefined;
        const lists = {...stored?.lists};
        const key = owner(useAuthStore.getState());
        if (!stored?.lists && Array.isArray(stored?.items)) {
            if (key) lists[key] = stored.items;
            else previousItems = stored.items;
        }
        return {...current, lists, items:key ? lists[key] || [] : []};
    }
}));

useAuthStore.subscribe((session, previous) => {
    const key = owner(session);
    if (session.token !== initialToken) previousItems = undefined;
    if (key === owner(previous)) return;
    const lists = useWishlistStore.getState().lists;
    const items = key ? lists[key] || previousItems || [] : [];
    previousItems = undefined;
    useWishlistStore.setState({items, lists: key ? {...lists, [key]:items} : lists});
});
