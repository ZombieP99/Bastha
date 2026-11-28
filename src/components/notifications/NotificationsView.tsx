'use client';
import AccountGate from '@/components/auth/AccountGate';
import api from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { useAuthStore } from '@/store/useAuthStore';
import { destination, useNotificationStore, type Family, type NotificationItem } from '@/store/useNotificationStore';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const labels = {
  all: ['الكل', 'All'], order: ['الطلبات', 'Orders'], alert: ['التنبيهات', 'Alerts'],
  offer: ['العروض', 'Offers'], announcement: ['الإعلانات', 'Announcements'], account: ['الحساب', 'Account']
};
type Filter = keyof typeof labels;

function relative(date: string, lang: string, now: number) {
  const minutes = Math.floor((now - Date.parse(date)) / 60000);
  if (!Number.isFinite(minutes)) return '';
  const format = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  if (minutes < 1) return format.format(0, 'second');
  if (minutes < 60) return format.format(-minutes, 'minute');
  if (minutes < 1440) return format.format(-Math.floor(minutes / 60), 'hour');
  return format.format(-Math.floor(minutes / 1440), 'day');
}

function run(action: Promise<void>) {
  void action.catch(error => toast.error(errorMessage(error)));
}

export default function NotificationsView({ lang }: { lang: string }) {
  const { token, user } = useAuthStore();
  return <AccountGate lang={lang}>{user?.role === 'admin'
    ? <p className="p-10 text-center">{lang === 'ar' ? 'لا توجد إشعارات لحساب الإدارة.' : 'Admin accounts do not receive notifications.'}</p>
    : <Inbox key={token} lang={lang} seller={user?.role === 'seller'}/>}</AccountGate>;
}

function Inbox({ lang, seller }: { lang: string; seller: boolean }) {
  const ar = lang === 'ar';
  const [filter, setFilter] = useState<Filter>('all');
  const [unread, setUnread] = useState(false);
  const { revision, unreadCount, markAllAsRead, clearAll } = useNotificationStore();
  const tabs: Filter[] = seller ? ['all','order','alert','announcement','account'] : ['all','order','alert','offer','announcement'];
  return <main className="mx-auto max-w-4xl px-4 py-10 text-[#1a365d]" dir={ar ? 'rtl' : 'ltr'}>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="flex items-center gap-3 text-3xl font-bold"><Bell/>{ar ? 'مركز الإشعارات' : 'Notifications'}</h1>
      <div className="flex gap-4 text-sm">
        <button disabled={!unreadCount} className="flex items-center gap-1 disabled:opacity-40" onClick={() => run(markAllAsRead())}><CheckCheck size={16}/>{ar ? 'قراءة الكل' : 'Mark all read'}</button>
        <button className="text-red-700" onClick={() => {
          if (window.confirm(ar ? 'حذف جميع الإشعارات من كل التبويبات؟ لا يمكن التراجع عن الحذف.' : 'Delete all notifications across all tabs? This cannot be undone.')) run(clearAll());
        }}>{ar ? 'حذف الكل' : 'Clear all'}</button>
      </div>
    </div>
    <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
      {tabs.map(tab => <button key={tab} aria-pressed={filter === tab} onClick={() => setFilter(tab)}
        className={'rounded-full px-4 py-2 text-sm font-bold ' + (filter === tab ? 'bg-[#1a365d] text-white' : 'bg-slate-100')}>{labels[tab][ar ? 0 : 1]}</button>)}
      <label className="ms-auto flex items-center gap-2 text-sm"><input type="checkbox" checked={unread} onChange={e => setUnread(e.target.checked)}/>{ar ? 'غير المقروء فقط' : 'Unread only'}</label>
    </div>
    <Items key={[filter,unread,revision].join('-')} lang={lang} seller={seller} type={filter === 'all' ? undefined : filter} unread={unread}/>
  </main>;
}

function Items({ lang, seller, type, unread }: { lang: string; seller: boolean; type?: Family; unread: boolean }) {
  const ar = lang === 'ar', router = useRouter();
  const { markAsRead, deleteNotification } = useNotificationStore();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1), [loaded, setLoaded] = useState(0), [total, setTotal] = useState(0);
  const [attempt, setAttempt] = useState(0), [error, setError] = useState('');
  const [now, setNow] = useState(Date.now);
  const more = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    api.get<{notifications: NotificationItem[]; total: number}>('/notifications', {
      params: { page, limit: 20, type, unread: unread || undefined }, signal: controller.signal
    }).then(({data}) => {
      if (controller.signal.aborted) return;
      setItems(previous => [...new Map([...previous,...data.notifications].map(item => [item._id,item])).values()]);
      setLoaded(page);
      setTotal(data.total);
    }).catch(e => { if (!controller.signal.aborted) setError(errorMessage(e)); });
    return () => controller.abort();
  }, [page,type,unread,attempt]);
  const canLoad = loaded === page && page * 20 < total && !error;
  useEffect(() => {
    if (!canLoad || !more.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setPage(loaded + 1); });
    observer.observe(more.current);
    return () => observer.disconnect();
  }, [canLoad,loaded]);
  return <section className="space-y-2">
    {items.map(item => <article key={item._id} className={'flex items-center gap-3 rounded-xl border p-4 ' + (item.readAt ? 'border-slate-200 bg-white' : 'border-blue-100 bg-blue-50/60')}>
      <button className="min-w-0 flex-1 text-start" onClick={() => {
        if (!item.readAt) run(markAsRead(item._id));
        const path = destination(item,seller);
        if (path) router.push('/' + lang + path);
      }}>
        <div className="flex items-center gap-2">{!item.readAt && <span aria-label={ar ? 'غير مقروء' : 'Unread'} className="size-2 shrink-0 rounded-full bg-blue-700"/>}
          <span className={item.readAt ? 'font-medium' : 'font-bold'}>{ar ? item.titleAr || item.title : item.title}</span>
        </div>
        <p className="my-1 whitespace-pre-line break-words text-sm text-slate-700">{ar ? item.bodyAr || item.body : item.body}</p>
        <time dateTime={item.createdAt} className="text-xs text-slate-500">{relative(item.createdAt,lang,now)}</time>
      </button>
      <button aria-label={ar ? 'حذف الإشعار' : 'Delete notification'} className="rounded-lg p-2 hover:bg-red-50 hover:text-red-700" onClick={() => run(deleteNotification(item._id))}><Trash2 size={18}/></button>
    </article>)}
    {error ? <div role="alert" className="py-4">{error} <button className="underline" onClick={() => {setError('');setAttempt(n => n+1);}}>{ar ? 'إعادة المحاولة' : 'Retry'}</button></div>
      : loaded !== page ? <p role="status" className="py-8 text-center">{ar ? 'جارٍ تحميل الإشعارات…' : 'Loading notifications…'}</p>
      : !items.length ? <p className="py-12 text-center">{ar ? 'لا توجد إشعارات هنا حاليًا.' : 'No notifications here yet.'}</p> : null}
    {canLoad && <button ref={more} className="mx-auto block p-3 underline" onClick={() => setPage(loaded + 1)}>{ar ? 'تحميل المزيد' : 'Load more'}</button>}
  </section>;
}

