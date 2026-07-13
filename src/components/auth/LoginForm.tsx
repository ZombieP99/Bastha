'use client';
import { Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginFormProps {
  dict: any;
  isAr: boolean;
}

export default function LoginForm({ dict, isAr }: LoginFormProps) {
  return (
    <div className="w-full">
      <div className="space-y-4">
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
          <div className={`mt-2 ${isAr ? 'text-left' : 'text-right'}`}>
            <a href="#" className="text-sm font-bold text-[#1a365d] hover:underline">
              {dict?.auth?.forgotPassword}
            </a>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 bg-gradient-to-r from-[#1a365d] to-[#2b4c7e] text-white py-3 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
      >
        {dict?.auth?.login}
      </motion.button>
    </div>
  );
}
