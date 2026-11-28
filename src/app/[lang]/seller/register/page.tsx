'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { getCategories } from '@/lib/api';
import type { Category } from '@/types';
import { Store } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState, type FormEvent } from 'react';

export default function SellerRegister({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params);
    const ar = lang === 'ar';
    const router = useRouter();
    const register = useAuthStore(s => s.registerSeller);
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false);

    useEffect(() => {
        let active = true;
        getCategories().then(items => { if (active) setCategories(items); }).catch(() => {});
        return () => { active = false; };
    }, []);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (pending) return;
        const form = new FormData(event.currentTarget);
        const value = (key: string) => String(form.get(key) ?? '').trim();
        const password = String(form.get('password') ?? '');
        if (!value('name') || !value('phone') || !value('shopName') || new TextEncoder().encode(password).length > 72) {
            setError(ar ? 'أكمل الحقول المطلوبة وتأكد أن كلمة المرور لا تتجاوز 72 بايت.' : 'Complete the required fields and keep the password within 72 bytes.');
            return;
        }
        setError('');
        setPending(true);
        try {
            const shopId = await register({
                name: value('name'), email: value('email').toLowerCase(), phone: value('phone'), password,
                shop: {
                    name: value('shopName'), phone: value('shopPhone') || undefined,
                    area: value('area') || undefined, address: value('address') || undefined,
                    description: value('description') || undefined, category: value('category') || undefined,
                },
            });
            router.replace('/' + lang + '/seller/dashboard?shop=' + encodeURIComponent(shopId));
        } catch {
            setError(useAuthStore.getState().error || (ar ? 'تعذر إنشاء الحساب.' : 'Could not create the account.'));
            setPending(false);
        }
    }

    const input = 'mt-1.5 block w-full rounded-xl border border-slate-200 bg-[#f7f9fc] px-3.5 py-2.5 text-slate-900 transition-colors focus:border-[#1a365d] focus:bg-white';
    function field(name: string, label: string, maxLength: number, required = false, type = 'text', autoComplete?: string) {
        return <label className="text-sm font-medium">{label}<input className={input} name={name} maxLength={maxLength} required={required} type={type} autoComplete={autoComplete} minLength={type === 'password' ? 6 : undefined}/></label>;
    }

    return <div className="bg-[#f0f4f8] px-4 py-6 text-[#1a365d] sm:px-6 sm:py-10">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-[#dce4ee] bg-white shadow-[0_18px_60px_-36px_rgba(26,54,93,0.55)] lg:grid-cols-[1fr_2fr]">
            <header className="relative isolate flex flex-col justify-center overflow-hidden bg-gradient-to-br from-[#1a365d] to-[#2b4c7e] px-5 py-6 text-white sm:px-8 lg:px-9">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                  <div className="absolute -top-24 -end-20 size-72 rounded-full border border-white/15 shadow-[0_0_0_24px_rgba(255,255,255,0.05),0_0_0_48px_rgba(255,255,255,0.03)]" />
                  <div className="absolute -bottom-10 -start-10 size-52 rounded-full bg-[radial-gradient(circle,rgba(228,203,146,0.45)_1px,transparent_1.5px)] bg-[length:12px_12px] [mask-image:radial-gradient(ellipse,black_10%,transparent_70%)]" />
                  <div className="absolute bottom-10 end-10 size-2 rotate-45 rounded-[1px] bg-[#e4cb92]/50" />
                </div>
                <Store aria-hidden="true" strokeWidth={1.5} className="mb-4 size-10 rounded-xl bg-white/10 p-2.5 text-[#e4cb92]"/>
                <h1 className="text-2xl font-extrabold leading-tight lg:text-4xl">{ar ? 'إنشاء حساب تاجر' : 'Create a seller account'}</h1>
                <p className="mt-3 text-sm leading-6 text-blue-100">{ar ? 'أنشئ حسابك ومتجرك الأول في خطوة واحدة.' : 'Create your account and first shop in one step.'}</p>
            </header>
            <div className="min-w-0 px-5 py-6 sm:p-8">
            <form onSubmit={submit} aria-busy={pending} className="space-y-6">
                <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
                    <legend className="mb-3 text-lg font-bold">{ar ? 'بيانات الحساب' : 'Account details'}</legend>
                    {field('name', ar ? 'الاسم' : 'Name', 100, true, 'text', 'name')}
                    {field('email', ar ? 'البريد الإلكتروني' : 'Email', 254, true, 'email', 'email')}
                    {field('phone', ar ? 'الهاتف' : 'Phone', 20, true, 'tel', 'tel')}
                    {field('password', ar ? 'كلمة المرور (6 أحرف على الأقل)' : 'Password (at least 6 characters)', 72, true, 'password', 'new-password')}
                </fieldset>
                <fieldset disabled={pending} className="grid gap-4 border-t border-slate-200 pt-3 sm:grid-cols-2">
                    <legend className="pe-3 text-lg font-bold">{ar ? 'بيانات المتجر' : 'Shop details'}</legend>
                    {field('shopName', ar ? 'اسم المتجر' : 'Shop name', 100, true)}
                    {field('shopPhone', ar ? 'هاتف المتجر (اختياري)' : 'Shop phone (optional)', 20, false, 'tel')}
                    {field('area', ar ? 'المنطقة (اختياري)' : 'Area (optional)', 100)}
                    {field('address', ar ? 'العنوان (اختياري)' : 'Address (optional)', 200)}
                    {categories.length > 0 && <label className="text-sm font-medium">{ar ? 'التصنيف (اختياري)' : 'Category (optional)'}<select name="category" className={input}><option value="">{ar ? 'بدون تصنيف' : 'No category'}</option>{categories.map(category => <option key={category._id} value={category._id}>{ar ? category.nameAr : category.name}</option>)}</select></label>}
                    <label className="text-sm font-medium sm:col-span-2">{ar ? 'وصف المتجر (اختياري)' : 'Shop description (optional)'}<textarea name="description" rows={3} maxLength={1000} className={input}/></label>
                </fieldset>
                {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
                <div className="flex flex-col items-center gap-4 border-t border-slate-100 pt-5 sm:flex-row">
                    <button disabled={pending} className="w-full rounded-xl bg-[#1a365d] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#254b77] sm:w-auto">{pending ? (ar ? 'جارٍ إنشاء الحساب…' : 'Creating account…') : (ar ? 'إنشاء الحساب والمتجر' : 'Create account and shop')}</button>
                    <Link href={'/' + lang + '/seller/login'} className="text-sm font-medium underline">{ar ? 'لدي حساب تاجر' : 'I have a seller account'}</Link>
                </div>
            </form>
            </div>
        </div>
    </div>;
}
