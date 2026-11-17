'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import { ArrowRight,Loader2,Lock,Mail,Store } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use,useEffect,useState } from 'react';

export default function SellerLoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang as 'en' | 'ar';
  const isAr = lang === 'ar';
  const router = useRouter();

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
      await login({ email, password });
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="min-h-screen bg-[#1a365d] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-[#1a365d]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a365d]">
            {isAr ? 'تسجيل دخول التجار' : 'Seller Login'}
          </h1>
          <p className="text-gray-500 font-medium text-center mt-2">
            {isAr ? 'أدخل بيانات متجرك للدخول إلى لوحة التحكم' : 'Enter your store credentials to access the dashboard'}
          </p>
        </div>

        {(error || localError || (isAuthenticated && user?.role === 'customer')) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center font-bold">
            {localError || error || (isAr ? 'هذا الحساب ليس حساب تاجر' : 'This account is not a seller account')}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="seller-email" className={`block text-sm font-bold text-gray-700 mb-1 ${isAr ? 'text-right' : 'text-left'}`}>
              {isAr ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative">
              <input id="seller-email" required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAr ? 'البريد الإلكتروني' : 'Email Address'}
                className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a365d] focus:border-transparent outline-none transition-all ${isAr ? 'pr-12 text-right' : 'pl-12 text-left'}`}
              />
              <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} />
            </div>
          </div>

          <div>
            <label htmlFor="seller-password" className={`block text-sm font-bold text-gray-700 mb-1 ${isAr ? 'text-right' : 'text-left'}`}>
              {isAr ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <input id="seller-password" required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isAr ? 'كلمة المرور' : 'Password'}
                className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a365d] focus:border-transparent outline-none transition-all ${isAr ? 'pr-12 text-right' : 'pl-12 text-left'}`}
              />
              <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} />
            </div>
            <div className={`mt-2 ${isAr ? 'text-left' : 'text-right'}`}>
              <span className="text-sm font-bold text-[#1a365d] hover:underline" title="غير متاح حالياً / Not available yet">
                {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
               — {isAr ? 'قريباً' : 'Coming soon'}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-8 bg-[#1a365d] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#2b4c7e] transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isAr ? 'دخول للوحة التحكم' : 'Login to Dashboard'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href={`/${lang}/auth`} className="text-gray-500 font-medium hover:text-[#1a365d] transition-colors text-sm flex items-center justify-center gap-2">
            {isAr ? (
              <><ArrowRight className="w-4 h-4" /> لست تاجراً؟ دخول الزبائن</>
            ) : (
              <><ArrowRight className="w-4 h-4 rotate-180" /> Not a seller? Customer Login</>
            )}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
