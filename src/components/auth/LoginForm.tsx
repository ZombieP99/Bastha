'use client';
import { afterCustomerLogin } from '@/lib/shopping-login';
import { useLoginFeedback } from '@/hooks/useLoginFeedback';
import { useAuthStore } from '@/store/useAuthStore';
import type { Dictionary } from '@/types/dictionary';
import { motion } from 'framer-motion';
import { Loader2,Lock,Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface LoginFormProps {
  dict: Dictionary;
  isAr: boolean;
  lang: string;
}

export default function LoginForm({ dict, isAr, lang }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();
  const waiting = useLoginFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password });
      router.replace(afterCustomerLogin(lang, window.location.search));
    } catch {
      // Error is handled by store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-bold">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label htmlFor="login-email" className={`block text-sm font-bold text-gray-700 mb-1 ${isAr ? 'text-right' : 'text-left'}`}>
            {isAr ? 'البريد الإلكتروني' : 'Email'}
          </label>
          <div className="relative">
            <input id="login-email" required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isAr ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email'}
              className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a365d] focus:border-transparent outline-none transition-all ${isAr ? 'pr-12 text-right' : 'pl-12 text-left'}`}
            />
            <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className={`block text-sm font-bold text-gray-700 mb-1 ${isAr ? 'text-right' : 'text-left'}`}>
            {dict?.auth?.password}
          </label>
          <div className="relative">
            <input id="login-password" required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={dict?.auth?.passwordPlaceholder}
              className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a365d] focus:border-transparent outline-none transition-all ${isAr ? 'pr-12 text-right' : 'pl-12 text-left'}`}
            />
            <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} />
          </div>
          <div className={`mt-2 ${isAr ? 'text-left' : 'text-right'}`}>
            <span className="text-sm font-bold text-[#1a365d] hover:underline" title="غير متاح حالياً / Not available yet">
              {dict?.auth?.forgotPassword}
             — {isAr ? 'قريباً' : 'Coming soon'}</span>
          </div>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={isLoading || waiting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 bg-gradient-to-r from-[#1a365d] to-[#2b4c7e] text-white py-3 rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {dict?.auth?.login}
      </motion.button>
    </form>
  );
}
