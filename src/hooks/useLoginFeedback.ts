'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function useLoginFeedback() {
    const until = useAuthStore(state => state.retryUntil);
    useEffect(() => {
        const message = sessionStorage.getItem('bastah-session-message');
        if (message) {
            sessionStorage.removeItem('bastah-session-message');
            useAuthStore.setState({ error: message });
        }
    }, []);
    useEffect(() => {
        if (!until) return;
        const timer = setTimeout(() => useAuthStore.setState({ retryUntil: 0, error: null }), Math.max(0, until - Date.now()));
        return () => clearTimeout(timer);
    }, [until]);
    return Boolean(until);
}
