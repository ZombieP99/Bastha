'use client';

import AccountSecurity from '@/components/auth/AccountSecurity';
import AccountGate from '@/components/auth/AccountGate';
import api from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { useAuthStore } from '@/store/useAuthStore';
import type { User } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState, type FormEvent } from 'react';

export default function CustomerSettings({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params);
    const ar = lang === 'ar';
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    async function saveProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving || !user) return;
        const fields = new FormData(event.currentTarget);
        const name = String(fields.get('name') ?? '').trim();
        const phone = String(fields.get('phone') ?? '').trim();
        setError('');
        setSaved(false);
        if (!name || !phone) {
            setError(ar ? 'أدخل الاسم ورقم الهاتف.' : 'Enter your name and phone number.');
            return;
        }
        const changes = { ...(name !== user.name && { name }), ...(phone !== user.phone && { phone }) };
        if (!Object.keys(changes).length) return;
        const token = useAuthStore.getState().token;
        setSaving(true);
        try {
            const { data } = await api.patch<{ user: User }>('/auth/me', changes);
            if (useAuthStore.getState().token === token) {
                useAuthStore.setState({ user: data.user });
                setSaved(true);
            }
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setSaving(false);
        }
    }

    return <AccountGate lang={lang} customer>
        <div className="bg-[#f0f4f8] px-4 py-8 sm:py-12">
            <section aria-labelledby="customer-settings-title" className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <header className="bg-gradient-to-br from-[#1a365d] to-[#2b4c7e] px-6 py-7 text-white sm:px-8">
                    <h1 id="customer-settings-title" className="text-2xl font-bold">{ar ? 'إعدادات الحساب' : 'Account settings'}</h1>
                    <p className="mt-2 text-blue-100">{user?.name}</p>
                </header>
                {user && <form onSubmit={saveProfile} className="space-y-4 px-6 py-6 sm:px-8">
                    <h2 className="text-lg font-bold text-[#1a365d]">{ar ? 'بيانات الحساب' : 'Account details'}</h2>
                    <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm">{ar ? 'الاسم' : 'Name'}<input name="name" autoComplete="name" required maxLength={100} defaultValue={user.name} className="mt-1 block w-full rounded-xl border border-slate-200 bg-[#f7f9fc] px-3 py-2.5"/></label>
                        <label className="text-sm">{ar ? 'رقم الهاتف' : 'Phone number'}<input name="phone" type="tel" autoComplete="tel" required maxLength={20} defaultValue={user.phone} className="mt-1 block w-full rounded-xl border border-slate-200 bg-[#f7f9fc] px-3 py-2.5"/></label>
                        <label className="text-sm sm:col-span-2">{ar ? 'البريد الإلكتروني' : 'Email address'}<input type="email" readOnly value={user.email} className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-slate-600"/></label>
                    </fieldset>
                    {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
                    {saved && <p role="status" className="text-sm text-emerald-800">{ar ? 'تم حفظ بيانات الحساب.' : 'Account details saved.'}</p>}
                    <button disabled={saving} className="rounded-xl bg-[#1a365d] px-4 py-2.5 text-sm font-bold text-white">{saving ? (ar ? 'جارٍ الحفظ…' : 'Saving…') : (ar ? 'حفظ التغييرات' : 'Save changes')}</button>
                </form>}
                <AccountSecurity ar={ar} saving={saving}/>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-5 sm:px-8">
                    <Link href={'/' + lang + '/profile'} className="text-sm font-bold text-[#1a365d] underline underline-offset-4">{ar ? 'العودة إلى حسابي' : 'Back to profile'}</Link>
                    <button type="button" onClick={() => { logout(); router.replace('/' + lang + '/auth?mode=login'); }} className="min-h-11 rounded-xl bg-red-50 px-4 text-sm font-bold text-red-800 transition-colors hover:bg-red-100">
                        {ar ? 'تسجيل الخروج' : 'Sign out'}
                    </button>
                </div>
            </section>
        </div>
    </AccountGate>;
}
