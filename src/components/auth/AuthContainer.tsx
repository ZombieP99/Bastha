'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, HeadphonesIcon } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import SocialLogin from './SocialLogin';

interface AuthContainerProps {
  dict: any;
  lang: string;
  initialMode?: 'login' | 'signup';
}

export default function AuthContainer({ dict, lang, initialMode = 'login' }: AuthContainerProps) {
  const isAr = lang === 'ar';
  const [isLogin, setIsLogin] = useState(initialMode === 'login');

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  // We will use Framer Motion's layout animations to swap the panels simply by changing the flex direction
  const flexDir = isLogin ? (isAr ? 'md:flex-row-reverse' : 'md:flex-row') : (isAr ? 'md:flex-row' : 'md:flex-row-reverse');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1a365d]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#6a9bc3]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <motion.div 
        layout
        className={`relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col min-h-[700px] ${flexDir}`}
      >
        {/* Blue Info Panel */}
        <motion.div 
          layout
          className="w-full md:w-[40%] bg-gradient-to-b from-[#1a365d] to-[#2b4c7e] p-8 md:p-12 flex flex-col justify-center text-white relative z-10"
        >
          {/* Decorative shapes inside blue panel */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-tr-full pointer-events-none"></div>

          <motion.div layout="position" className={`relative z-10 ${isAr ? 'text-right' : 'text-left'}`}>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              {dict?.auth?.sideTitle}
            </h2>
            <p className="text-lg text-white/80 font-medium leading-relaxed mb-12">
              {dict?.auth?.sideDesc}
            </p>

            <div className="space-y-6">
              <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-lg">{dict?.auth?.feature1}</span>
              </div>
              
              <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-lg">{dict?.auth?.feature2}</span>
              </div>

              <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <HeadphonesIcon className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-lg">{dict?.auth?.feature3}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* White Form Panel */}
        <motion.div 
          layout
          className="w-full md:w-[60%] p-8 md:p-12 flex flex-col justify-center bg-white relative z-0"
        >
          <motion.div layout="position" className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className={`mb-8 ${isAr ? 'text-right' : 'text-left'}`}>
              <h2 className="text-3xl font-extrabold text-[#1a365d] mb-2">
                {isLogin ? dict?.auth?.welcomeBack : dict?.auth?.joinUs}
              </h2>
              <p className="text-gray-500 font-medium">
                {isLogin ? dict?.auth?.welcomeBackDesc : dict?.auth?.joinUsDesc}
              </p>
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {isLogin ? (
                  <LoginForm dict={dict} isAr={isAr} />
                ) : (
                  <SignupForm dict={dict} isAr={isAr} />
                )}
              </motion.div>
            </AnimatePresence>

            <SocialLogin dict={dict} />

            {/* Toggle Button */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 font-medium">
                {isLogin ? dict?.auth?.noAccount : dict?.auth?.alreadyHaveAccount}{' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#1a365d] font-bold hover:underline"
                >
                  {isLogin ? dict?.auth?.signup : dict?.auth?.login}
                </button>
              </p>
            </div>

          </motion.div>
        </motion.div>

      </motion.div>
    </div>
  );
}
