'use client';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useEffect } from 'react';
export default function NotificationListener() {
    const {token,isAuthenticated,user} = useAuthStore();
    useEffect(() => {
        if (!token || !isAuthenticated || user?.role === 'admin') return;
        let timer: ReturnType<typeof setInterval>;
        const refresh = () => void useNotificationStore.getState().refreshCount();
        function visibility() {
            clearInterval(timer);
            if (document.visibilityState === 'visible') { refresh(); timer=setInterval(refresh,45000); }
        }
        visibility();
        document.addEventListener('visibilitychange',visibility);
        return () => {clearInterval(timer);document.removeEventListener('visibilitychange',visibility);};
    },[token,isAuthenticated,user?.role]);
    return null;
}
