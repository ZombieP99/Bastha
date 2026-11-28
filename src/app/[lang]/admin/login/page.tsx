'use client';
import { useLoginFeedback } from '@/hooks/useLoginFeedback';

import { useAuthStore } from '@/store/useAuthStore';
import { Loader2,Lock,Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use,useEffect,useState } from 'react';

export default function AdminLoginPage({ params }: { params: Promise<{ lang: string }> }) {
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
      if (user.role === 'admin') {
        router.push(`/${lang}/admin/dashboard`);
      }
    }
  }, [isAuthenticated, user, router, lang, isAr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    try {
      await login({ email, password }, 'admin');
    } catch {
      // Error handled by store
    }
  };

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-[#f7f9fc] py-3 ps-11 pe-3 text-slate-900 transition-colors focus:border-[#1a365d] focus:bg-white';
  const message = localError || error || (isAuthenticated && user?.role === 'customer'
    ? (isAr ? 'هذا الحساب ليس حساب إدارة' : 'This account is not an admin account')
    : '');

  return (
    <div className="bg-[#eef3f8] px-4 py-8 sm:px-6 sm:py-14">
      <div className="mx-auto grid max-w-lg overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-[#1a365d]/10 shadow-[0_20px_55px_-40px_rgba(26,54,93,0.5)] ">
        <div className="min-w-0 px-6 py-8 text-[#1a365d] sm:px-12 sm:py-10">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold leading-tight">{isAr ? 'دخول الإدارة' : 'Admin sign-in'}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{isAr ? 'أدخل بيانات حساب الإدارة لإدارة مستخدمي المنصة.' : 'Sign in to manage marketplace accounts.'}</p>
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
              {isLoading ? (isAr ? 'جارٍ تسجيل الدخول…' : 'Signing in…') : (isAr ? 'دخول لوحة الإدارة' : 'Sign in to admin dashboard')}
            </button>
          </form>
          <div className="mt-5 border-t border-slate-200 pt-4 text-sm">
            <Link href={'/' + lang + '/auth?mode=login'} className="text-slate-600 hover:underline">{isAr ? 'دخول الزبائن' : 'Customer sign-in'}</Link>
          </div>
        </div>
        
      </div>
    </div>
  );
}
