'use client';
import { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  dict: any;
  isAr: boolean;
  lang: string;
}

export default function LoginForm({ dict, isAr, lang }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password });
      router.push(`/${lang}`);
    } catch (err) {
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
          <label className={`block text-sm font-bold text-gray-700 mb-1 ${isAr ? 'text-right' : 'text-left'}`}>
            {isAr ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email or Phone'}
          </label>
          <div className="relative">
            <input
              required
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isAr ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email or Phone'}
              className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a365d] focus:border-transparent outline-none transition-all ${isAr ? 'pr-12 text-right' : 'pl-12 text-left'}`}
            />
            <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-bold text-gray-700 mb-1 ${isAr ? 'text-right' : 'text-left'}`}>
            {dict?.auth?.password}
          </label>
          <div className="relative">
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={dict?.auth?.passwordPlaceholder}
              className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a365d] focus:border-transparent outline-none transition-all ${isAr ? 'pr-12 text-right' : 'pl-12 text-left'}`}
            />
            <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} />
          </div>
          <div className={`mt-2 ${isAr ? 'text-left' : 'text-right'}`}>
            <a href="#" className="text-sm font-bold text-[#1a365d] hover:underline">
              {dict?.auth?.forgotPassword}
            </a>
          </div>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={isLoading}
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
