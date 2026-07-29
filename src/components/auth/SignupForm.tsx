'use client';
import { useState } from 'react';
import { Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

interface SignupFormProps {
  dict: any;
  isAr: boolean;
  lang: string;
}

export default function SignupForm({ dict, isAr, lang }: SignupFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [terms, setTerms] = useState(false);
  const { register, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terms) {
      alert(isAr ? 'يجب الموافقة على الشروط والأحكام' : 'You must agree to the terms');
      return;
    }
    clearError();
    try {
      await register(formData);
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
            {dict?.auth?.fullName}
          </label>
          <div className="relative">
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder={dict?.auth?.fullNamePlaceholder}
              className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a365d] focus:border-transparent outline-none transition-all ${isAr ? 'pr-12 text-right' : 'pl-12 text-left'}`}
            />
            <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-bold text-gray-700 mb-1 ${isAr ? 'text-right' : 'text-left'}`}>
            {isAr ? 'رقم الهاتف' : 'Phone'}
          </label>
          <div className="relative">
            <input
              required
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="05X XXX XXXX"
              className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a365d] focus:border-transparent outline-none transition-all text-left dir-ltr ${isAr ? 'pr-12' : 'pl-12'}`}
            />
            <Phone className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-bold text-gray-700 mb-1 ${isAr ? 'text-right' : 'text-left'}`}>
            {dict?.auth?.email}
          </label>
          <div className="relative">
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder={dict?.auth?.emailPlaceholder}
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
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder={dict?.auth?.passwordPlaceholder}
              className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a365d] focus:border-transparent outline-none transition-all ${isAr ? 'pr-12 text-right' : 'pl-12 text-left'}`}
            />
            <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} />
          </div>
        </div>
      </div>

      <div className={`mt-4 flex items-center gap-2 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
        <input 
          type="checkbox" 
          id="terms" 
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-[#1a365d] focus:ring-[#1a365d]" 
        />
        <label htmlFor="terms" className="text-sm font-medium text-gray-600 cursor-pointer">
          {dict?.auth?.terms}
        </label>
      </div>

      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 bg-gradient-to-r from-[#1a365d] to-[#2b4c7e] text-white py-3 rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {dict?.auth?.signup}
      </motion.button>
    </form>
  );
}
