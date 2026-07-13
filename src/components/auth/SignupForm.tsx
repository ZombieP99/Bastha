'use client';
import { useState } from 'react';
import { Mail, Lock, User, Store } from 'lucide-react';
import { motion } from 'framer-motion';

interface SignupFormProps {
  dict: any;
  isAr: boolean;
}

export default function SignupForm({ dict, isAr }: SignupFormProps) {
  const [accountType, setAccountType] = useState<'customer' | 'merchant'>('customer');

  return (
    <div className="w-full">
      <div className={`mb-4 ${isAr ? 'text-right' : 'text-left'}`}>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {dict?.auth?.accountType}
        </label>
        <div className={`flex gap-3 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
          <button
            onClick={() => setAccountType('customer')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
              accountType === 'customer'
                ? 'border-[#1a365d] bg-[#1a365d]/5 text-[#1a365d]'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-bold">{dict?.auth?.customer}</span>
          </button>
          
          <button
            onClick={() => setAccountType('merchant')}
            className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${
              accountType === 'merchant'
                ? 'border-[#1a365d] bg-[#1a365d]/5 text-[#1a365d]'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="font-bold">{dict?.auth?.merchant}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-bold text-gray-700 mb-1 ${isAr ? 'text-right' : 'text-left'}`}>
            {dict?.auth?.fullName}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={dict?.auth?.fullNamePlaceholder}
              className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a365d] focus:border-transparent outline-none transition-all ${isAr ? 'pr-12 text-right' : 'pl-12 text-left'}`}
            />
            <User className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-bold text-gray-700 mb-1 ${isAr ? 'text-right' : 'text-left'}`}>
            {dict?.auth?.email}
          </label>
          <div className="relative">
            <input
              type="email"
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
              type="password"
              placeholder={dict?.auth?.passwordPlaceholder}
              className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a365d] focus:border-transparent outline-none transition-all ${isAr ? 'pr-12 text-right' : 'pl-12 text-left'}`}
            />
            <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isAr ? 'right-4' : 'left-4'}`} />
          </div>
        </div>
      </div>

      <div className={`mt-4 flex items-center gap-2 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
        <input type="checkbox" id="terms" className="w-4 h-4 rounded border-gray-300 text-[#1a365d] focus:ring-[#1a365d]" />
        <label htmlFor="terms" className="text-sm font-medium text-gray-600 cursor-pointer">
          {dict?.auth?.terms}
        </label>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 bg-[#6a9bc3] hover:bg-[#5a8bb3] text-white py-3 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
      >
        {dict?.auth?.createAccount}
      </motion.button>
    </div>
  );
}
