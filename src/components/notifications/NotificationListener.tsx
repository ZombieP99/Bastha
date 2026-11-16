'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import axios from 'axios';

export default function NotificationListener() {
  const { isAuthenticated, token } = useAuthStore();
  const { fetchNotifications, addNotification } = useNotificationStore();
  const eventSourceRef = useRef<EventSource | null>(null);
  const previousOrdersStatusRef = useRef<Map<string, string>>(new Map());

  // 1. Initial Fetch on Mount or Auth Change
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchNotifications();
    }
  }, [isAuthenticated, token, fetchNotifications]);

  // 2. Real-time Connection: Server-Sent Events (SSE) or WebSockets
  useEffect(() => {
    if (!isAuthenticated || !token || typeof window === 'undefined') return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bastah-backend.onrender.com/api';
    
    // Try opening SSE channel if backend provides streaming
    try {
      const sseUrl = `${apiUrl}/notifications/stream?token=${encodeURIComponent(token)}`;
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.title) {
            addNotification({
              id: data._id || data.id || `notif-${Date.now()}`,
              type: data.type || 'system',
              title: data.title,
              message: data.message || '',
              createdAt: data.createdAt || new Date().toISOString(),
              read: false,
              link: data.link || (data.orderId ? '/orders' : undefined),
              data: data.data
            });
          }
        } catch (e) {
          console.error('Error parsing notification event', e);
        }
      };

      es.onerror = () => {
        // Close if not supported on server
        es.close();
      };
    } catch {
      // SSE not configured on backend, fallback to polling
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isAuthenticated, token, addNotification]);

  // 3. Fallback Periodic Polling + Order Status Diffing
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const pollInterval = setInterval(() => {
      fetchNotifications();
      checkForOrderUpdates();
    }, 30000); // Poll every 30s

    // Also poll when user refocuses window
    const handleFocus = () => {
      fetchNotifications();
      checkForOrderUpdates();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, token, fetchNotifications]);

  // Helper to detect real-time order status changes
  const checkForOrderUpdates = async () => {
    if (!token) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bastah-backend.onrender.com/api';
      const res = await axios.get(`${apiUrl}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orders = res.data.orders || [];

      orders.forEach((order: any) => {
        const orderId = order._id;
        const currentStatus = order.status;
        const prevStatus = previousOrdersStatusRef.current.get(orderId);

        if (prevStatus && prevStatus !== currentStatus) {
          // Status changed! Trigger real notification
          let title = `تحديث الطلب #${orderId.slice(-5)}`;
          let message = `تغيرت حالة طلبك إلى: ${currentStatus}`;

          if (currentStatus === 'accepted') {
            title = 'تم قبول طلبك من المتجر';
            message = 'بدأ المتجر بتجهيز طلبك وسيتم تسليمه للمندوب قريباً.';
          } else if (currentStatus === 'delivering') {
            title = 'طلبك في الطريق مع المندوب';
            message = 'خرج طلبك مع مندوب التوصيل، جهّز المبلغ نقداً للاستلام.';
          } else if (currentStatus === 'completed') {
            title = 'تم تسليم الطلب بنجاح';
            message = 'شكراً لتسوقك عبر بسطة! نأمل أن تكون راضياً عن تجربتك.';
          } else if (currentStatus === 'cancelled') {
            title = 'تم إلغاء الطلب';
            message = 'تم إلغاء هذا الطلب من قِبل المتجر أو الإدارة.';
          }

          addNotification({
            id: `order-update-${orderId}-${currentStatus}-${Date.now()}`,
            type: 'order',
            title,
            message,
            createdAt: new Date().toISOString(),
            read: false,
            link: '/orders'
          });
        }

        previousOrdersStatusRef.current.set(orderId, currentStatus);
      });
    } catch {
      // Ignore background diff errors
    }
  };

  return null; // Headless component
}
