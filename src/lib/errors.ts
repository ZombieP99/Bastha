import axios from 'axios';

type Message = readonly [ar: string, en: string];
const messages: Record<string, Message> = {
    wrong_portal: ['استخدم صفحة الدخول الخاصة بنوع حسابك.', 'Use the sign-in page for your account type.'],
    account_suspended: ['حسابك موقوف. تواصل مع الدعم.', 'Your account is suspended. Contact support.'],
    too_many_attempts: ['محاولات دخول كثيرة. حاول بعد 15 دقيقة.', 'Too many sign-in attempts. Try again in 15 minutes.'],
    too_many_requests: ['طلبات كثيرة. حاول بعد 15 دقيقة.', 'Too many requests. Try again in 15 minutes.'],
    shop_locked: ['أغلقت الإدارة هذا المتجر. تواصل مع الدعم.', 'This shop was locked by an administrator. Contact support.'],
    product_shared: ['هذا المنتج مشترك بين متاجر. تواصل مع الإدارة لتعديله.', 'This product is shared. Contact an administrator to edit it.'],
    offer_limit_reached: ['يمكن نشر عرض واحد لكل متجر يوميًا.', 'Each shop can publish one promotion per day.'],
    cart_empty: ['السلة فارغة. راجع آخر طلباتك.', 'Your cart is empty. Check your latest orders.'],
    cart_changed: ['تغيّرت السلة. راجع آخر طلباتك قبل إعادة الشراء.', 'Your cart changed. Check your latest orders before trying again.'],
    item_unavailable: ['أحد المنتجات لم يعد متاحًا. راجع السلة.', 'An item is no longer available. Review your cart.'],
    out_of_stock: ['نفدت كمية أحد المنتجات. أزله من السلة للمتابعة.', 'An item is out of stock. Remove it to continue.'],
    shop_closed: ['أحد المتاجر مغلق. أزل منتجاته للمتابعة.', 'A shop is closed. Remove its items to continue.'],
    no_delivery_to_area: ['اختر منطقة توصيل أخرى أو الاستلام من المتجر.', 'Choose another delivery area or switch to pickup.'],
    order_changed: ['تغيّرت حالة الطلب. راجع حالته الحالية.', 'The order changed. Review its current status.'],
};

const statusMessages: Record<number, Message> = {
    400: ['راجع البيانات المدخلة وحاول مجددًا.', 'Check your entries and try again.'],
    401: ['سجّل الدخول للمتابعة.', 'Sign in to continue.'],
    403: ['لا تملك صلاحية تنفيذ هذا الإجراء.', 'You do not have permission for this action.'],
    404: ['العنصر المطلوب غير متاح.', 'The requested item is unavailable.'],
    409: ['تغيّرت البيانات. حدّث الصفحة وراجعها.', 'The data changed. Refresh and review it.'],
    429: ['طلبات كثيرة. حاول لاحقًا.', 'Too many requests. Try again later.'],
};

export function errorMessage(error: unknown, fallback?: string): string {
    const ar = typeof window !== 'undefined' && window.location?.pathname?.startsWith('/ar');
    if (axios.isAxiosError<{code?: string}>(error)) {
        const status = error.response?.status;
        const code = error.response?.data?.code;
        const message = (code && Object.prototype.hasOwnProperty.call(messages, code) && messages[code]) || (status && statusMessages[status]);
        if (message) return message[ar ? 0 : 1];
        if (!status) return ar ? 'تعذر الاتصال بالخادم. تحقق من الاتصال وحاول مجددًا.' : 'Unable to reach the server. Check your connection and retry.';
        return ar ? 'تعذر إتمام العملية. حاول مجددًا.' : 'Request failed. Please try again.';
    }
    return error instanceof Error ? error.message : fallback || (ar ? 'تعذر إتمام العملية.' : 'Request failed.');
}
