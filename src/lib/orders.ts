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
