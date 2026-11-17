'use client';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useEffect } from 'react';
export default function NotificationListener() {
 const { token, isAuthenticated } = useAuthStore();
 const fetchNotifications = useNotificationStore(s => s.fetchNotifications);
 useEffect(() => {
  if (!token || !isAuthenticated) return;
  const refresh = () => { if (document.visibilityState === 'visible') void fetchNotifications(); };
  refresh(); const timer = setInterval(refresh, 30000);
  window.addEventListener('focus', refresh);
  return () => { clearInterval(timer); window.removeEventListener('focus', refresh); };
 }, [token, isAuthenticated, fetchNotifications]);
 return null;
}
