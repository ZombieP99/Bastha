'use client';
import AccountGate from '@/components/auth/AccountGate';
import api from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { nextStatuses, orderStatus, orderStatusConflict } from '@/lib/orders';
import { useAuthStore } from '@/store/useAuthStore';
import type { Order } from '@/types';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import OrderReceipt from './OrderReceipt';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
export default function OrdersView({ lang, ids, shop, seller = false }: {
    lang: string;
    ids?: string;
    shop?: string;
    seller?: boolean;
}) {
    const token = useAuthStore(s => s.token);
    return <AccountGate lang={lang} seller={seller} customer={!seller}><OrderList key={[token,shop,ids].join(':')} shop={shop} lang={lang} ids={ids} seller={seller}/></AccountGate>;
}
function OrderList({ lang, ids, shop, seller }: {
    lang: string;
    ids?: string;
    shop?: string;
    seller: boolean;
}) {
    const ar = lang === 'ar', token = useAuthStore(s => s.token);
    const [page, setPage] = useState(1), [version, setVersion] = useState(0), [busy, setBusy] = useState('');
    const [state, setState] = useState<{
        orders: Order[];
        total: number;
        loading: boolean;
        error: string;
    }>({ orders: [], total: 0, loading: true, error: '' });
    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        let timer: ReturnType<typeof setTimeout> | undefined;
        let tracking = !!ids && !seller;
        let fetching = false;
        function schedule() {
            clearTimeout(timer);
            if (active && tracking && document.visibilityState === 'visible')
                timer = setTimeout(load, 30000);
        }
        function visibilityChanged() {
            clearTimeout(timer);
            if (tracking && document.visibilityState === 'visible') void load();
        }
        const load = async () => {
            if (fetching) return;
            fetching = true;
            try {
                let orders: Order[], total: number;
                if (ids !== undefined) {
                    const list = [...new Set(ids.split(',').filter(Boolean))];
                    if (!list.length || list.length > 20 || list.some(id => !/^[a-f0-9]{24}$/i.test(id)))
                        throw new Error(ar ? 'رابط الطلب غير صالح' : 'Invalid order link');
                    const result = await Promise.all(list.map(id => api.get<{
                        order: Order;
                    }>('/orders/' + id, {signal: controller.signal})));
                    orders = result.map(r => r.data.order);
                    total = orders.length;
                }
                else {
                    const { data } = await api.get<{
                        orders: Order[];
                        total: number;
                    }>(seller ? '/orders/incoming' : '/orders', { signal: controller.signal, params: { page, limit: 20, shop: seller ? shop : undefined } });
                    orders = data.orders;
                    total = data.total;
                }
                tracking = tracking && orders.some(order => nextStatuses(order.status, order.deliveryMethod === 'delivery').length > 0);
                if (active)
                    setState({ orders, total, loading: false, error: '' });
            }
            catch (error) {
                if (!active) return;
                const status = axios.isAxiosError(error) ? error.response?.status : undefined;
                const retryable = axios.isAxiosError(error) && (!status || status >= 500 || status === 429);
                tracking = tracking && retryable;
                setState(previous => ({
                    orders: tracking ? previous.orders : [], total: tracking ? previous.total : 0,
                    loading: false, error: errorMessage(error),
                }));
            } finally {
                fetching = false;
                schedule();
            }
        };
        void load();
        if (tracking) document.addEventListener('visibilitychange', visibilityChanged);
        return () => {
            active = false;
            clearTimeout(timer);
            controller.abort();
            document.removeEventListener('visibilitychange', visibilityChanged);
        };
    }, [ids, page, shop, seller, token, version, ar]);
    const refresh = () => { setState(s => ({ ...s, loading: true, error: '' })); setVersion(v => v + 1); };
    const change = async (id: string, status: string) => {
        if (!confirm(ar ? 'تأكيد تغيير حالة الطلب؟' : 'Confirm order status change?'))
            return;
        setBusy(id);
        try {
            await api.patch('/orders/' + id + '/status', { status });
            refresh();
        }
        catch (error) {
            if (orderStatusConflict(error)) {
                toast(ar ? 'تغيّرت حالة الطلب. راجع الحالة الحالية قبل اتخاذ إجراء آخر.' : 'This order changed. Review its current status before taking another action.');
                if (ids !== undefined) {
                    setState(s => ({ ...s, orders: [], loading: true, error: '' }));
                    setVersion(v => v + 1);
                } else {
                    try {
                        const { data } = await api.get<{ order: Order }>('/orders/' + id);
                        setState(s => ({ ...s, orders: s.orders.map(order => order._id === id ? data.order : order), error: '' }));
                    } catch (failure) {
                        setState(s => ({ ...s, orders: s.orders.filter(order => order._id !== id), error: errorMessage(failure) }));
                    }
                }
            } else {
                setState(s => ({ ...s, error: errorMessage(error) }));
            }
        }
        finally {
            setBusy('');
        }
    };
    if (ids !== undefined) {
        return <main className="mx-auto max-w-4xl px-4 py-6 text-[#193658] sm:py-9">
            <Link className="inline-block pb-3 text-sm font-medium text-slate-600 hover:underline" href={'/'+lang+(seller?'/seller/orders':'/orders')}>{ar?'عرض جميع الطلبات':'View all orders'}</Link>
            <div className="mb-5 flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold sm:text-3xl">{ar?'تفاصيل الطلب':'Order details'}</h1>
                <button disabled={state.loading || !!busy} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold disabled:opacity-50" onClick={refresh}>
                    <RefreshCw size={15} aria-hidden/>{ar?'تحديث':'Refresh'}
                </button>
            </div>
            {state.error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-800">{state.error}{state.orders.length > 0 && <span className="block">{ar?'تظهر آخر حالة مؤكدة. اضغط تحديث للتحقق منها.':'Showing the last confirmed status. Refresh to check again.'}</span>}</p>}
            {state.loading ? <p role="status" className="p-5">{ar?'جارٍ تحميل الطلب…':'Loading order…'}</p> :
                <div className="space-y-4">{state.orders.map(order=><OrderReceipt key={order._id} order={order} lang={lang} seller={seller} busy={!!busy} onChange={change}/>)}</div>}
        </main>;
    }
    return <div className="container mx-auto max-w-5xl px-4 py-10"><h1 className="text-3xl font-bold mb-6">{ar ? 'الطلبات' : 'Orders'}</h1>
 <button className="mb-5 underline" onClick={refresh}>{ar ? 'تحديث' : 'Refresh'}</button>
 {state.error && <p role="alert" className="bg-red-50 p-4 rounded-xl mb-6">{state.error}</p>}
 {state.loading ? <p role="status">{ar ? 'جاري التحميل…' : 'Loading…'}</p> : <>
 {!state.orders.length && !state.error && <p>{ar ? 'لا توجد طلبات' : 'No orders'}</p>}
 <div className="space-y-6">{state.orders.map(order => <article key={order._id} className="bg-white border rounded-2xl p-6">
 <div className="flex flex-wrap justify-between gap-4 mb-5"><h2 className="font-bold">{order.shop?.name} — {order._id.slice(-8)}</h2><strong>{orderStatus(order.status, ar)}</strong></div>
 <p>{new Date(order.createdAt).toLocaleString(ar ? 'ar' : 'en')}</p>
 <p>{order.deliveryMethod === 'delivery' ? (ar ? 'توصيل' : 'Delivery') : (ar ? 'استلام من المتجر' : 'Pickup')}</p>
 {order.deliveryAddress && <p>{ar ? order.deliveryAddress.area?.nameAr : order.deliveryAddress.area?.name} {order.deliveryAddress.details}</p>}
 {order.contactPhone && <p dir="ltr">{order.contactPhone}</p>}{order.note && <p>{order.note}</p>}
 <ul className="my-5 space-y-3">{order.items.map((item, index) => <li key={index} className="flex justify-between gap-3"><span>{ar ? item.productNameAr : item.productName} × {item.quantity}</span><span>{(item.priceAtOrder * item.quantity).toFixed(2)} ₪</span></li>)}</ul>
 <p>{ar ? 'التوصيل' : 'Delivery'}: {order.deliveryFee || 0} ₪</p><p className="text-xl font-bold mt-3">{ar ? 'الإجمالي' : 'Total'}: {order.total} ₪</p>
 <div className="flex flex-wrap gap-4 mt-5"><Link className="underline" href={'/' + lang + (seller ? '/seller/orders?id=' : '/orders?id=') + order._id}>{seller ? (ar ? 'التفاصيل' : 'Details') : (ar ? 'تتبّع الطلب' : 'Track order')}</Link>{order.shop?.phone && <a className="underline" href={'tel:' + order.shop.phone}>{ar ? 'اتصل بالمتجر' : 'Call shop'}</a>}
 {(seller ? nextStatuses(order.status, order.deliveryMethod === 'delivery') : order.status === 'pending' ? ['cancelled'] : []).map(status => <button key={status} disabled={!!busy} className="border rounded-lg px-3 py-2" onClick={() => change(order._id, status)}>{orderStatus(status, ar)}</button>)}</div>
 </article>)}</div>
 {!ids && state.total > 20 && <nav className="flex justify-center gap-6 mt-8"><button disabled={page <= 1} onClick={() => { setState(s => ({ ...s, loading: true })); setPage(p => p - 1); }}>{ar ? 'السابق' : 'Previous'}</button><span>{page} / {Math.ceil(state.total / 20)}</span><button disabled={page >= Math.ceil(state.total / 20)} onClick={() => { setState(s => ({ ...s, loading: true })); setPage(p => p + 1); }}>{ar ? 'التالي' : 'Next'}</button></nav>}
 </>}</div>;
}
