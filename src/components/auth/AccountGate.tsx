'use client';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
export default function AccountGate({ children, lang, seller = false, customer = false }: {
    children: React.ReactNode;
    lang: string;
    seller?: boolean;
    customer?: boolean;
}) {
    const { token, user, isLoading, isAuthenticated, error, loadUser, logout } = useAuthStore();
    const ar = lang === 'ar';
    if (isLoading)
        return <p role="status" className="p-12">{ar ? 'جاري تحميل الحساب…' : 'Loading account…'}</p>;
    if (token && error && !isAuthenticated)
        return <div role="alert" className="p-12"><p>{error}</p><button onClick={() => loadUser()}>{ar ? 'إعادة المحاولة' : 'Retry'}</button><button className="mx-4" onClick={logout}>{ar ? 'تسجيل الخروج' : 'Log out'}</button></div>;
    if (!isAuthenticated)
        return <div className="p-12"><Link href={'/' + lang + (seller ? '/seller/login' : '/auth')}>{ar ? 'يرجى تسجيل الدخول' : 'Please log in'}</Link></div>;
    if (customer && user?.role !== 'customer') {
        const portal = user?.role === 'seller' ? '/seller/profile' : '/admin/dashboard';
        return <div className="p-12"><p>{ar ? 'هذه الصفحة لحساب الزبون.' : 'This page requires a customer account.'}</p><Link className="underline" href={'/'+lang+portal}>{ar ? 'العودة إلى حسابي' : 'Go to my account'}</Link></div>;
    }
    if (seller && user?.role !== 'seller' && user?.role !== 'admin')
        return <p role="alert" className="p-12">{ar ? 'هذه الصفحة للتجار فقط' : 'This page is for sellers'}</p>;
    return children;
}
