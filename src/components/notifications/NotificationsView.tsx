'use client';
import { useMounted } from '@/hooks/useMounted';
import type { Dictionary } from '@/types/dictionary';

import { errorMessage } from '@/lib/errors';
import { useAuthStore } from '@/store/useAuthStore';
import { NotificationItem,useNotificationStore } from '@/store/useNotificationStore';
import { AnimatePresence,motion } from 'framer-motion';
import {
ArrowLeft,
ArrowRight,
Bell,
BellRing,
Check,
CheckCheck,
Clock,
PackageCheck,
ShieldCheck,
Sparkles,
Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useEffect,useMemo,useState } from 'react';
import toast from 'react-hot-toast';

interface NotificationsViewProps {
  dict: Dictionary;
  lang: string;
}

export default function NotificationsView({ dict, lang }: NotificationsViewProps) {
  const isAr = lang === 'ar';
  const t = dict?.notifications || {};

  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll, fetchNotifications } = useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'order' | 'offer' | 'system' | 'unread'>('all');
  const mounted = useMounted();

  useEffect(() => {

    fetchNotifications();
  }, [fetchNotifications]);

  const [now,setNow]=useState(0);
  useEffect(()=>{const tick=()=>setNow(Date.now());const timer=setInterval(tick,60000);queueMicrotask(tick);return()=>clearInterval(timer);},[]);
  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return isAr ? 'الآن' : 'Just now';
    const diffMs = now - new Date(isoString).getTime();
    if (isNaN(diffMs)) return isAr ? 'مؤخراً' : 'Recently';
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return isAr ? 'الآن' : 'Just now';
    if (diffMinutes < 60) return isAr ? `منذ ${diffMinutes} دقيقة` : `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return isAr ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return isAr ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
  };

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(item => {
      if (filter === 'unread') return !item.read;
      if (filter === 'all') return true;
      return item.type === filter;
    });
  }, [notifications, filter]);

  const handleMarkAllRead = async () => {
    try { await markAllAsRead(); } catch (error) { toast.error(errorMessage(error)); return; }
    toast.success(isAr ? 'تم تعليم جميع الإشعارات كمقروءة' : 'All marked as read');
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    if (confirm(isAr ? 'هل أنت متأكد من مسح جميع الإشعارات؟' : 'Are you sure you want to clear all notifications?')) {
      try { await clearAll(); } catch (error) { toast.error(errorMessage(error)); return; }
      toast.success(isAr ? 'تم مسح الإشعارات' : 'Notifications cleared');
    }
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-[#1a365d] flex items-center justify-center shrink-0 shadow-inner">
            <PackageCheck className="w-6 h-6" strokeWidth={1.8} />
          </div>
        );
      case 'offer':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
            <Sparkles className="w-6 h-6" strokeWidth={1.8} />
          </div>
        );
      case 'system':
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldCheck className="w-6 h-6" strokeWidth={1.8} />
          </div>
        );
    }
  };

  const authenticated = useAuthStore(state => state.isAuthenticated);
  const notificationError = useNotificationStore(state => state.error);
  if (mounted && !authenticated) return <div className="p-12 text-center"><Link href={`/${lang}/auth`}>{isAr ? 'سجل الدخول لعرض الإشعارات' : 'Log in to view notifications'}</Link></div>;
  if (mounted && notificationError) return <div role="alert" className="p-12 text-center"><p>{notificationError}</p><button onClick={()=>fetchNotifications()}>{isAr?'إعادة المحاولة' : 'Retry'}</button></div>;
  if (!mounted) {
    return <div className="bg-[#f8fafc] min-h-screen pt-12 pb-24" />;
  }

  return (
    <div className="bg-gradient-to-b from-[#eaf1f8]/60 via-[#f8fafc] to-[#f8fafc] min-h-screen pt-12 pb-24 selection:bg-[#1a365d] selection:text-white">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-gray-200/80 shadow-sm mb-3">
              <BellRing className="w-4 h-4 text-[#1a365d]" strokeWidth={2} />
              <span className="text-xs font-bold text-[#1a365d]">
                {unreadCount > 0 
                  ? (isAr ? `${unreadCount} إشعار جديد` : `${unreadCount} unread`) 
                  : (isAr ? 'لا توجد إشعارات جديدة' : 'All caught up')}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#1a365d] tracking-tight">
              {t.pageTitle || (isAr ? 'مركز الإشعارات' : 'Notification Center')}
            </h1>
            <p className="text-gray-500 text-sm md:text-base font-medium mt-1">
              {t.pageSubtitle || (isAr ? 'تابع تحديثات طلباتك وعروض المتاجر المحلية لحظة بلحظة.' : 'Track your order updates and exclusive store deals.')}
            </p>
          </div>

          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex items-center gap-2.5 self-start md:self-auto">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-[#1a365d] border border-gray-200/90 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95"
                >
                  <CheckCheck className="w-4 h-4 text-[#1a365d]" />
                  <span>{t.markAllRead || (isAr ? 'تحديد الكل كمقروء' : 'Mark all read')}</span>
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 border border-gray-200/90 hover:border-red-200 px-3 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm active:scale-95"
                title={t.clearAll || (isAr ? 'مسح الكل' : 'Clear all')}
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t.clearAll || (isAr ? 'مسح الكل' : 'Clear all')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {[
            { id: 'all', label: t.all || (isAr ? 'الكل' : 'All'), count: notifications.length },
            { id: 'order', label: t.orders || (isAr ? 'الطلبات' : 'Orders'), count: notifications.filter(n => n.type === 'order').length },
            { id: 'offer', label: t.offers || (isAr ? 'العروض' : 'Offers'), count: notifications.filter(n => n.type === 'offer').length },
            { id: 'unread', label: t.unreadOnly || (isAr ? 'غير مقروءة' : 'Unread'), count: unreadCount },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-[#1a365d] text-white shadow-md shadow-[#1a365d]/15'
                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/80 shadow-sm'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                filter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-[0_4px_24px_rgba(26,54,93,0.03)]">
            <div className="w-16 h-16 rounded-3xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-[#1a365d] mb-2">
              {t.emptyTitle || (isAr ? 'لا توجد إشعارات حالياً' : 'No notifications yet')}
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
              {t.emptyDesc || (isAr ? 'سنقوم بإشعارك عند حدوث أي جديد بخصوص طلباتك أو عند توفر عروض وتخفيضات مميزة.' : 'We will notify you about updates on your orders and new deals.')}
            </p>
            <Link href={`/${lang}/products`}>
              <button className="bg-[#1a365d] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#2b4c7e] transition-all shadow-md">
                {isAr ? 'تصفح أحدث المنتجات' : 'Browse Products'}
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            <AnimatePresence>
              {filteredNotifications.map((item) => {
                const title = item.title;
                const message = item.message;
                const timeAgo = formatRelativeTime(item.createdAt);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: isAr ? 50 : -50 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => {
                      if (!item.read) void markAsRead(item.id).catch(error=>toast.error(errorMessage(error)));
                    }}
                    className={`group relative bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(26,54,93,0.06)] hover:-translate-y-0.5 cursor-pointer ${
                      !item.read
                        ? 'border-[#1a365d]/20 bg-[#f8fbff]/70'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      {getNotificationIcon(item.type)}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-base sm:text-lg font-black tracking-tight ${
                              !item.read ? 'text-[#1a365d]' : 'text-gray-800'
                            }`}>
                              {title}
                            </h4>
                            {!item.read && (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#1a365d] ring-4 ring-[#1a365d]/20 shrink-0" title={t.unreadBadge || 'New'} />
                            )}
                          </div>

                          {/* Time Ago */}
                          <div className="flex items-center gap-1 text-xs text-gray-400 font-medium whitespace-nowrap shrink-0">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{timeAgo}</span>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-3">
                          {message}
                        </p>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          {item.link ? (
                            <Link 
                              href={`/${lang}${item.link}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#1a365d] hover:text-blue-700 transition-colors group/link"
                            >
                              <span>{isAr ? 'عرض التفاصيل' : 'View Details'}</span>
                              {isAr ? (
                                <ArrowLeft className="w-4 h-4 group-hover/link:-translate-x-1 transition-transform" />
                              ) : (
                                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                              )}
                            </Link>
                          ) : <div />}

                          <div className="flex items-center gap-2">
                            {!item.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void markAsRead(item.id).catch(error=>toast.error(errorMessage(error)));
                                }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-[#1a365d] hover:bg-gray-100 transition-colors text-xs font-bold inline-flex items-center gap-1"
                                title={t.markAsRead || 'Mark as read'}
                              >
                                <Check className="w-4 h-4" />
                                <span className="hidden sm:inline">{t.markAsRead || (isAr ? 'تمت القراءة' : 'Read')}</span>
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void deleteNotification(item.id).catch(error=>toast.error(errorMessage(error)));
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title={t.delete || 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
