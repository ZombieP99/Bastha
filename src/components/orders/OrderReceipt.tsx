'use client';

import { Banknote, Package, Phone, Store, Truck } from 'lucide-react';
import { nextStatuses, orderStatus } from '@/lib/orders';
import type { Order } from '@/types';
import OrderTracking from './OrderTracking';

const actionLabels: Record<string, [string, string]> = {
    accepted: ['قبول الطلب', 'Accept order'],
    ready: ['تأكيد الجاهزية', 'Mark ready'],
    delivering: ['بدء التوصيل', 'Start delivery'],
    completed: ['تأكيد الاستلام', 'Mark completed'],
    cancelled: ['إلغاء الطلب', 'Cancel order'],
};

export default function OrderReceipt({ order, lang, seller, busy, onChange }: {
    order: Order;
    lang: string;
    seller: boolean;
    busy: boolean;
    onChange: (id: string, status: string) => void;
}) {
    const ar = lang === 'ar';
    const delivery = order.deliveryMethod === 'delivery';
    const actions = seller ? nextStatuses(order.status, delivery) : order.status === 'pending' ? ['cancelled'] : [];
    const area = order.deliveryAddress?.area;
    const money = new Intl.NumberFormat(ar ? 'ar-PS' : 'en', {
        style: 'currency', currency: 'ILS', minimumFractionDigits: 0, maximumFractionDigits: 2,
    });
    const statusColor = order.status === 'cancelled' ? 'bg-red-50 text-red-800' :
        order.status === 'completed' ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800';
    const DeliveryIcon = delivery ? Truck : Store;

    return <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-[#193658] shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
                <span className="rounded-xl bg-[#edf2f7] p-3"><Store size={22} aria-hidden/></span>
                <div className="min-w-0">
                    <h2 className="break-words text-xl font-bold">{order.shop?.name || (ar ? 'طلب المتجر' : 'Store order')}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-slate-600">
                        <span>{ar ? 'رقم الطلب' : 'Order'} <bdi dir="ltr" className="font-bold">{order._id.slice(-8)}</bdi></span>
                        <span aria-hidden>·</span>
                        <time dateTime={order.createdAt}>{new Date(order.createdAt).toLocaleString(lang,{dateStyle:'medium',timeStyle:'short'})}</time>
                    </p>
                </div>
            </div>
            <strong className={'rounded-full px-3 py-1.5 text-sm '+statusColor}>{orderStatus(order.status, ar)}</strong>
        </header>
        {!seller && <OrderTracking order={order} ar={ar}/>}
        <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[minmax(0,3fr)_minmax(15rem,2fr)]">
            <section className="min-w-0">
                <h3 className="mb-3 flex items-center gap-2 font-bold"><Package size={18} aria-hidden/>{ar ? 'المنتجات المطلوبة' : 'Items ordered'}</h3>
                <ul className="divide-y divide-slate-100">{order.items.map((item,index)=>
                    <li key={index} className="flex items-start justify-between gap-3 py-3">
                        <div className="min-w-0"><p className="break-words font-bold">{ar ? item.productNameAr || item.productName : item.productName}</p>
                            <p className="mt-1 text-sm text-slate-600">{ar ? 'الكمية' : 'Quantity'} {item.quantity} × <bdi>{money.format(item.priceAtOrder)}</bdi></p></div>
                        <bdi className="shrink-0 tabular-nums">{money.format(item.priceAtOrder * item.quantity)}</bdi>
                    </li>)}</ul>
                <div className="mt-4 border-t border-slate-200 pt-4">
                    <h3 className="flex items-center gap-2 font-bold"><DeliveryIcon size={18} aria-hidden/>{delivery ? (ar?'توصيل إلى العنوان':'Delivery') : (ar?'استلام من المتجر':'Store pickup')}</h3>
                    {delivery && order.deliveryAddress && <p className="mt-2 break-words">{[ar ? area?.nameAr || area?.name : area?.name, order.deliveryAddress.details].filter(Boolean).join(' · ')}</p>}
                    {order.contactPhone && <p className="mt-2 text-sm text-slate-600">{ar?'هاتف التواصل':'Contact number'} · <bdi dir="ltr">{order.contactPhone}</bdi></p>}
                    {order.note && <p className="mt-2 whitespace-pre-wrap break-words text-sm">{ar?'ملاحظة الطلب':'Order note'} · {order.note}</p>}
                </div>
            </section>
            <section className="self-start rounded-2xl bg-[#f4f7fa] p-5">
                <h3 className="mb-4 flex items-center gap-2 font-bold"><Banknote size={19} aria-hidden/>{ar?'ملخص المبلغ':'Order summary'}</h3>
                <dl className="space-y-2 text-sm tabular-nums">
                    <div className="flex justify-between gap-3"><dt>{ar?'قيمة المنتجات':'Subtotal'}</dt><dd><bdi>{money.format(order.subtotal)}</bdi></dd></div>
                    {order.deliveryFee != null && <div className="flex justify-between gap-3"><dt>{ar?'رسوم التوصيل':'Delivery fee'}</dt><dd><bdi>{money.format(order.deliveryFee)}</bdi></dd></div>}
                    <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-slate-200 pt-3 font-bold"><dt>{ar?'الإجمالي':'Total'}</dt><dd className="text-2xl"><bdi>{money.format(order.total)}</bdi></dd></div>
                </dl>
            </section>
        </div>
        {(order.shop?.phone || actions.length>0) && <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 sm:px-7">
            {order.shop?.phone && <a className="inline-flex items-center gap-2 rounded-lg py-2 text-sm font-bold hover:underline" href={'tel:'+order.shop.phone}><Phone size={16} aria-hidden/>{ar?'اتصل بالمتجر':'Call store'}</a>}
            <div className="ms-auto flex flex-wrap gap-2">{actions.map(status=><button key={status} disabled={busy} onClick={()=>onChange(order._id,status)}
                className={'rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-50 '+(status==='cancelled'?'border-red-100 text-red-700 hover:bg-red-50':'border-[#193658] bg-[#193658] text-white')}>{actionLabels[status][ar?0:1]}</button>)}</div>
        </footer>}
    </article>;
}
