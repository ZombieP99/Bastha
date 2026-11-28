import axios from 'axios';

export function checkoutRecovery(error: unknown) {
    if (!axios.isAxiosError<{code?: string}>(error)) return 'none';
    const response = error.response;
    if (!response || response.status >= 500) return 'check-orders';
    const code = response.data?.code;
    if ((response.status === 400 && code === 'cart_empty') || (response.status === 409 && code === 'cart_changed')) return code;
    if (response.status === 409) return 'refresh-cart';
    if (response.status === 400) return 'review-input';
    return 'none';
}

export function orderStatusConflict(error: unknown) {
    return axios.isAxiosError(error) && error.response?.status === 409;
}

export const orderStatus = (status: string, ar: boolean) => ar ? ({ pending: 'قيد الانتظار', accepted: 'تم القبول', ready: 'جاهز', delivering: 'جاري التوصيل', completed: 'مكتمل', cancelled: 'ملغي' } as Record<string, string>)[status] || status : status;
export function nextStatuses(status: string, delivery: boolean): string[] {
    switch (status) {
        case 'pending': return ['accepted', 'cancelled'];
        case 'accepted': return ['ready', 'cancelled'];
        case 'ready': return [delivery ? 'delivering' : 'completed', 'cancelled'];
        case 'delivering': return ['completed', 'cancelled'];
        default: return [];
    }
}

export function orderSteps(delivery: boolean): string[] {
    return delivery ? ['pending', 'accepted', 'ready', 'delivering', 'completed'] : ['pending', 'accepted', 'ready', 'completed'];
}
