'use client';
import { useLoginFeedback } from '@/hooks/useLoginFeedback';

import { useAuthStore } from '@/store/useAuthStore';
import { Loader2,Lock,Mail,Store } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use,useEffect,useState } from 'react';

export default function SellerLoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang as 'en' | 'ar';
  const isAr = lang === 'ar';
  const router = useRouter();
  const waiting = useLoginFeedback();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, isLoading, error, clearError, user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'seller' || user.role === 'admin') {
        router.push(`/${lang}/seller/dashboard`);
      }
    }
  }, [isAuthenticated, user, router, lang, isAr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    try {
      await login({ email, password }, 'seller');
    } catch {
      // Error handled by store
    }
  };

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-[#f7f9fc] py-3 ps-11 pe-3 text-slate-900 transition-colors focus:border-[#1a365d] focus:bg-white';
  const message = localError || error || (isAuthenticated && user?.role === 'customer'
    ? (isAr ? 'هذا الحساب ليس حساب تاجر' : 'This account is not a seller account')
    : '');

  return (
    <div className="bg-[#eef3f8] px-4 py-8 sm:px-6 sm:py-14">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-[#1a365d]/10 shadow-[0_20px_55px_-40px_rgba(26,54,93,0.5)] md:grid-cols-[3fr_2fr]">
        <div className="min-w-0 px-6 py-8 text-[#1a365d] sm:px-12 sm:py-10">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold leading-tight">{isAr ? 'تسجيل دخول التاجر' : 'Seller sign-in'}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{isAr ? 'ادخل إلى لوحة البائع لإدارة عروض متجرك وطلباته.' : 'Sign in to manage your shop’s offers and orders.'}</p>
          </header>
          <form onSubmit={handleSubmit} aria-busy={isLoading} className="space-y-4">
            {message && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{message}</p>}
            <div>
              <label htmlFor="seller-email" className="mb-1.5 block text-sm font-medium">{isAr ? 'البريد الإلكتروني' : 'Email address'}</label>
              <div className="relative">
                <Mail aria-hidden="true" className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <input id="seller-email" name="email" autoComplete="username" type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="seller-password" className="mb-1.5 block text-sm font-medium">{isAr ? 'كلمة المرور' : 'Password'}</label>
              <div className="relative">
                <Lock aria-hidden="true" className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <input id="seller-password" name="password" autoComplete="current-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
              </div>
            </div>
            <Link href={'/' + lang + '/support'} className="inline-block text-sm font-medium underline underline-offset-4">
              {isAr ? 'نسيت كلمة المرور؟ تواصل مع الدعم' : 'Forgot your password? Contact support'}
            </Link>
            <button type="submit" disabled={isLoading || waiting} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1a365d] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#254b77]">
              {isLoading && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
              {isLoading ? (isAr ? 'جارٍ تسجيل الدخول…' : 'Signing in…') : (isAr ? 'دخول لوحة البائع' : 'Sign in to seller dashboard')}
            </button>
          </form>
          <div className="mt-5 border-t border-slate-200 pt-4 text-sm">
            <Link href={'/' + lang + '/auth?mode=login'} className="text-slate-600 hover:underline">{isAr ? 'دخول الزبائن' : 'Customer sign-in'}</Link>
          </div>
        </div>
        <aside className="relative isolate flex flex-col items-start justify-center overflow-hidden bg-gradient-to-br from-[#1a365d] to-[#2b4c7e] px-6 py-8 text-white sm:px-10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-24 -end-20 size-72 rounded-full border border-white/15 shadow-[0_0_0_24px_rgba(255,255,255,0.05),0_0_0_48px_rgba(255,255,255,0.03)]" />
            <div className="absolute -bottom-10 -start-10 size-52 rounded-full bg-[radial-gradient(circle,rgba(228,203,146,0.45)_1px,transparent_1.5px)] bg-[length:12px_12px] [mask-image:radial-gradient(ellipse,black_10%,transparent_70%)]" />
            <div className="absolute bottom-10 end-10 size-2 rotate-45 rounded-[1px] bg-[#e4cb92]/50" />
          </div>
          <Store aria-hidden="true" strokeWidth={1.5} className="mb-4 size-11 rounded-xl bg-white/10 p-2.5 text-[#e4cb92]" />
          <h2 className="text-2xl font-bold">{isAr ? 'ابدأ البيع مع بسطة' : 'Start selling on Bastah'}</h2>
          <p className="mt-2 text-sm leading-6 text-blue-100">{isAr ? 'سجّل حساب تاجر وأضف متجرك الأول في خطوة واحدة.' : 'Create a seller account and add your first shop in one step.'}</p>
          <Link href={'/' + lang + '/seller/register'} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-white px-4 text-sm font-bold text-[#1a365d] transition-colors hover:bg-blue-50">
            {isAr ? 'إنشاء حساب تاجر' : 'Create a seller account'}
          </Link>
        </aside>
      </div>
    </div>
  );
}
