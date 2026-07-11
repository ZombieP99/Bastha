'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Hero({ dict, lang }: { dict: any, lang: string }) {
  return (
    <section className="container mx-auto px-4 md:px-8 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-[2rem] overflow-hidden min-h-[500px] flex items-center bg-[#e2e8f0]"
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=2070&auto=format&fit=crop")' }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-white/80 via-white/40 to-transparent z-10 md:hidden"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-[#e2e8f0]/90 via-[#e2e8f0]/40 to-transparent z-10 hidden md:block"></div>
        
        {/* Content */}
        <div className="relative z-20 max-w-2xl px-8 md:px-16 py-12 text-[#1a365d]">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-block bg-[#846b2b] text-white px-4 py-1.5 rounded-full text-sm font-bold mb-6"
          >
            {dict.hero.badge}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-[#1a365d]"
          >
            {dict.hero.title1}<br />{dict.hero.title2}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-lg md:text-xl text-[#1a365d] mb-10 font-medium"
          >
            {dict.hero.subtitle}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-wrap items-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href={`/${lang}/shops`} className="bg-[#eab308] hover:bg-[#dca500] text-[#1a365d] font-extrabold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-yellow-500/20 inline-block">
                {dict.hero.shopNow}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href={`/${lang}/shops`} className="bg-[#8b9bb4]/40 hover:bg-[#8b9bb4]/60 backdrop-blur-md text-[#1a365d] md:text-white font-bold px-8 py-4 rounded-xl transition-colors inline-block">
                {dict.hero.discoverMore}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
