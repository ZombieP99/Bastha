import { Check, CircleX } from 'lucide-react';
import { orderStatus, orderSteps } from '@/lib/orders';
import type { Order } from '@/types';

export default function OrderTracking({ order, ar }: { order: Order; ar: boolean }) {
    const delivery = order.deliveryMethod === 'delivery';
    const steps = orderSteps(delivery);
    const current = steps.indexOf(order.status);
    const labels: Record<string, string> = {
        pending: ar ? 'بانتظار القبول' : 'Awaiting acceptance',
        accepted: ar ? 'قُبل الطلب' : 'Accepted',
        ready: delivery ? (ar ? 'جاهز للتوصيل' : 'Ready for delivery') : (ar ? 'جاهز للاستلام' : 'Ready for pickup'),
        delivering: ar ? 'في الطريق' : 'Out for delivery',
        completed: ar ? 'مكتمل' : 'Completed',
    };
    return <section aria-label={ar ? 'تتبّع الطلب' : 'Order tracking'} className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-7">
        <h3 className="font-bold">{ar ? 'تتبّع الطلب' : 'Order tracking'}</h3>
        <p role="status" className={current >= 0 ? 'sr-only' : 'mt-3 flex items-center gap-2 text-sm font-medium'}>
            {order.status === 'cancelled' && <CircleX size={17} className="text-red-700" aria-hidden/>}
            {order.status === 'cancelled' ? (ar ? 'أُلغي الطلب وتوقّف تتبّعه.' : 'This order was cancelled. Tracking has ended.')
                : (ar ? 'الحالة الحالية: ' : 'Current status: ') + (labels[order.status] || orderStatus(order.status, ar))}
        </p>
        {current >= 0 && <ol className="mt-4 flex flex-col sm:flex-row">
            {steps.map((step, i) => <li key={step} aria-current={i === current ? 'step' : undefined}
                className="relative flex items-center gap-3 pb-4 last:pb-0 sm:flex-1 sm:flex-col sm:gap-2 sm:pb-0 sm:text-center">
                {i < steps.length - 1 && <span aria-hidden className={'absolute start-3 top-5 h-full w-0.5 sm:start-1/2 sm:top-3 sm:h-0.5 sm:w-full ' + (i < current ? 'bg-emerald-600' : 'bg-slate-200')}/>}
                <span aria-hidden className={'relative grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold ' +
                    (i < current ? 'border-emerald-600 bg-emerald-600 text-white' : i === current ? 'border-[#193658] bg-[#193658] text-white ring-4 ring-blue-100' : 'border-slate-300 bg-white text-slate-500')}>
                    {i < current ? <Check size={14}/> : (i + 1).toLocaleString(ar ? 'ar' : 'en')}
                </span>
                <span className={'relative text-sm ' + (i === current ? 'font-bold' : 'text-slate-600')}>{labels[step]}</span>
            </li>)}
        </ol>}
    </section>;
}
