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

export default function SellerProfile({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params);
    const ar = lang === 'ar';
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logout);
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const joined = user?.createdAt && new Date(user.createdAt);

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

    return <AccountGate lang={lang} seller>
        <div className="bg-[#f0f4f8] px-4 py-8 sm:py-12">
            <section aria-labelledby="seller-profile-title" className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-[1fr_2fr]">
                <div aria-hidden="true" className="relative min-h-24 overflow-hidden bg-[#182f4c] md:row-span-3">
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 480" preserveAspectRatio="xMidYMid slice" fill="none" focusable="false">
                        <defs>
                            <pattern id="seller-embroidery" width="48" height="48" patternUnits="userSpaceOnUse">
                                <path d="M24 0 48 24 24 48 0 24Z M24 8 40 24 24 40 8 24Z" stroke="#82a4aa" strokeOpacity=".38"/>
                                <path d="m24 15 3 6 6 3-6 3-3 6-3-6-6-3 6-3Z" fill="#c9ae78"/>
                                <path d="m0 0 5 5m38 38 5 5m0-48-5 5M5 43l-5 5" stroke="#c9ae78" strokeOpacity=".7"/>
                            </pattern>
                        </defs>
                        <rect width="300" height="480" fill="url(#seller-embroidery)" />
                    </svg>
                </div>
                {user && <form onSubmit={saveProfile} className="space-y-4 px-6 py-6 sm:px-8">
                    <h1 id="seller-profile-title" className="text-xl font-bold text-[#1a365d]">{ar ? 'حساب التاجر' : 'Seller account'}</h1>
                    {joined && Number.isFinite(joined.getTime()) && <p className="text-xs text-slate-600">{ar ? 'تاريخ الانضمام' : 'Joined'} · {joined.toLocaleDateString(lang, {timeZone:'Asia/Gaza', dateStyle:'medium'})}</p>}
                    <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm">{ar ? 'الاسم' : 'Name'}<input name="name" autoComplete="name" required maxLength={100} defaultValue={user.name} className="mt-1 block w-full rounded-xl border border-slate-200 bg-[#f7f9fc] px-3 py-2.5"/></label>
                        <label className="text-sm">{ar ? 'رقم الهاتف' : 'Phone number'}<input name="phone" type="tel" autoComplete="tel" required maxLength={20} defaultValue={user.phone} className="mt-1 block w-full rounded-xl border border-slate-200 bg-[#f7f9fc] px-3 py-2.5"/></label>
                        <label className="text-sm sm:col-span-2">{ar ? 'البريد الإلكتروني' : 'Email address'}<input type="email" readOnly value={user.email} className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-slate-600"/></label>
                    </fieldset>
                    <p className="text-xs text-slate-600">{ar ? 'لتغيير البريد الإلكتروني، ' : 'To change your email, '}<Link className="underline" href={'/' + lang + '/support'}>{ar ? 'تواصل مع دعم بسطة' : 'contact Bastah support'}</Link>.</p>
                    {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
                    {saved && <p role="status" className="text-sm text-emerald-800">{ar ? 'تم حفظ بيانات الحساب.' : 'Account details saved.'}</p>}
                    <button disabled={saving} className="rounded-xl bg-[#1a365d] px-4 py-2.5 text-sm font-bold text-white">{saving ? (ar ? 'جارٍ الحفظ…' : 'Saving…') : (ar ? 'حفظ التغييرات' : 'Save changes')}</button>
                </form>}
                <AccountSecurity ar={ar} saving={saving}/>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-5 sm:px-8">
                    <Link href={'/' + lang + '/seller/dashboard'} className="text-sm font-bold text-[#1a365d] underline underline-offset-4">{ar ? 'لوحة البائع' : 'Seller dashboard'}</Link>
                    <button type="button" onClick={() => { logout(); router.replace('/' + lang + '/seller/login'); }} className="min-h-11 rounded-xl bg-red-50 px-4 text-sm font-bold text-red-800 transition-colors hover:bg-red-100">
                        {ar ? 'تسجيل الخروج' : 'Sign out'}
                    </button>
                </div>
            </section>
        </div>
    </AccountGate>;
}
