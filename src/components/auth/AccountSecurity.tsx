'use client';

import api from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { useAuthStore } from '@/store/useAuthStore';
import type { User } from '@/types';
import { useState, type FormEvent } from 'react';

export default function AccountSecurity({ ar, saving }: { ar: boolean; saving: boolean }) {
    const user = useAuthStore(s => s.user);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const input = 'mt-1 block w-full rounded-xl border border-slate-200 p-3';
    const [passwordBusy, setPasswordBusy] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSaved, setPasswordSaved] = useState(false);
    async function changePassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving || passwordBusy) return;
        const form = event.currentTarget;
        const fields = new FormData(form);
        const newPassword = String(fields.get('newPassword') || '');
        setPasswordSaved(false);
        setPasswordError('');
        if (new TextEncoder().encode(newPassword).length > 72) {
            setPasswordError(ar ? 'الحد الأقصى لكلمة المرور 72 بايت.' : 'The password must fit within 72 bytes.');
            return;
        }
        const token = useAuthStore.getState().token;
        setPasswordBusy(true);
        try {
            const { data } = await api.patch<{ token: string; user: User }>('/auth/me/password', {
                currentPassword: fields.get('currentPassword'), newPassword,
            });
            if (useAuthStore.getState().token !== token) return;
            useAuthStore.setState({ token: data.token, user: data.user });
            form.reset();
            setPasswordSaved(true);
        } catch (failure) {
            setPasswordError(errorMessage(failure));
        } finally {
            setPasswordBusy(false);
        }
    }


    async function changePreference(key: 'offers' | 'alerts', checked: boolean) {
        const token = useAuthStore.getState().token;
        setPending(true);
        setError('');
        try {
            const { data } = await api.patch<{user: User}>('/auth/me', {notificationPrefs:{[key]:checked}});
            if (token === useAuthStore.getState().token) useAuthStore.setState({user:data.user});
        } catch (e) { setError(errorMessage(e)); }
        finally { setPending(false); }
    }
    return <section className="border-t border-slate-100">
      {user && user.role !== 'admin' && <fieldset disabled={pending || saving || passwordBusy} className="space-y-2 px-6 py-4">
        <legend className="font-bold">{ar ? 'تفضيلات الإشعارات' : 'Notification preferences'}</legend>
        {user.role === 'customer' && <label className="block"><input type="checkbox" checked={user.notificationPrefs?.offers ?? true} onChange={e=>void changePreference('offers',e.target.checked)}/> {ar ? 'عروض المتاجر التي طلبت منها' : 'Offers from shops I ordered from'}</label>}
        <label className="block"><input type="checkbox" checked={user.notificationPrefs?.alerts ?? true} onChange={e=>void changePreference('alerts',e.target.checked)}/> {user.role === 'seller' ? (ar ? 'تقييمات متاجري الجديدة' : 'New shop reviews') : (ar ? 'تنبيهات السعر والتوفر في سلتي' : 'Price and stock alerts for my cart')}</label>
        <p className="text-sm text-slate-600">{ar ? 'ستصلك دائمًا إشعارات الطلبات والإعلانات والحساب.' : 'Order, announcement and account notices are always sent.'}</p>
        {error && <p role="alert">{error}</p>}
      </fieldset>}
                <details className="border-t border-slate-100 px-6 py-4 sm:px-8">
                    <summary className="cursor-pointer font-bold text-[#1a365d]">{ar ? 'تغيير كلمة المرور' : 'Change password'}</summary>
                    <form onSubmit={changePassword} className="mt-4 space-y-4 text-sm">
                        <label className="block">{ar ? 'كلمة المرور الحالية' : 'Current password'}<input required name="currentPassword" type="password" autoComplete="current-password" className={input}/></label>
                        <label className="block">{ar ? 'كلمة المرور الجديدة (6 أحرف على الأقل)' : 'New password (at least 6 characters)'}<input required minLength={6} name="newPassword" type="password" autoComplete="new-password" className={input}/></label>
                        <p className="text-xs text-slate-600">{ar ? 'بعد الحفظ، ستحتاج إلى تسجيل الدخول مجددًا على أجهزتك الأخرى.' : 'After saving, sign in again on your other devices.'}</p>
                        {passwordError && <p role="alert" className="text-red-800">{passwordError}</p>}
                        {passwordSaved && <p role="status" className="text-emerald-800">{ar ? 'تم تغيير كلمة المرور.' : 'Password changed.'}</p>}
                        <button disabled={saving || passwordBusy || pending} className="rounded-xl border px-4 py-2.5 font-bold">{ar ? 'حفظ كلمة المرور' : 'Save password'}</button>
                    </form>
                </details>
    </section>;
}
