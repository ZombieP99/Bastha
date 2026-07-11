'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function ShopsHeader({ dict, lang }: { dict: any; lang: string }) {
  const isAr = lang === 'ar';

  return (
    <section className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Large Main Banner (Right/First depending on RTL) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 relative rounded-3xl overflow-hidden min-h-[400px] flex items-end group"
        >
          <img 
            src="https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=1200&auto=format&fit=crop" 
            alt="Perfume Store" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a365d]/90 via-[#1a365d]/40 to-transparent"></div>
          
          <div className="relative z-10 p-8 md:p-12 w-full text-white">
            <div className={`flex flex-col ${isAr ? 'items-end text-right' : 'items-start text-left'}`}>
               <span className="bg-[#eab308] text-[#1a365d] font-bold px-4 py-1.5 rounded-full text-sm mb-4 inline-block shadow-sm">
                 {dict?.shopsPage?.bestSeller}
               </span>
               <h2 className="text-4xl md:text-5xl font-extrabold mb-3">
                 {isAr ? 'عبير الورد' : 'Rose Bloom'}
               </h2>
               <p className="text-white/80 text-lg md:text-xl font-medium mb-8 max-w-lg">
                 {isAr ? 'أرقى العطور المستوحاة من الطبيعة الخلابة' : 'The finest perfumes inspired by stunning nature'}
               </p>
               
               <Link href="#">
                 <motion.button 
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
                 >
                   {dict?.shopsPage?.visitShop}
                   {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                 </motion.button>
               </Link>
            </div>
          </div>
        </motion.div>

        {/* Two smaller banners stacked (Left/Second depending on RTL) */}
        <div className="flex flex-col gap-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 relative rounded-3xl overflow-hidden min-h-[190px] flex items-end group"
          >
            <img 
              src="https://images.unsplash.com/photo-1542340916-38297071c312?q=80&w=800&auto=format&fit=crop" 
              alt="Home Decor" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className={`relative z-10 p-6 w-full text-white ${isAr ? 'text-right' : 'text-left'}`}>
               <h3 className="text-2xl font-bold mb-1">{isAr ? 'لمسات دافئة' : 'Warm Touches'}</h3>
               <p className="text-white/70 text-sm mb-3">{isAr ? 'ديكورات منزلية بأسلوب حديث' : 'Modern style home decor'}</p>
               <Link href="#" className="inline-flex items-center gap-1 text-[#eab308] font-bold text-sm hover:text-yellow-400 group/link">
                 {dict?.shopsPage?.discoverMore}
                 {isAr ? <ArrowLeft className="w-4 h-4 group-hover/link:-translate-x-1 transition-transform" /> : <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />}
               </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex-1 relative rounded-3xl overflow-hidden min-h-[190px] flex items-end group"
          >
            <img 
              src="https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=800&auto=format&fit=crop" 
              alt="Watches" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a365d]/90 to-transparent"></div>
            <div className={`relative z-10 p-6 w-full text-white ${isAr ? 'text-right' : 'text-left'}`}>
               <h3 className="text-2xl font-bold mb-1">{isAr ? 'وقت وفن' : 'Time & Art'}</h3>
               <p className="text-white/70 text-sm mb-3">{isAr ? 'تشكيلة واسعة من الساعات الفاخرة' : 'A wide selection of luxury watches'}</p>
               <Link href="#" className="inline-flex items-center gap-1 text-[#eab308] font-bold text-sm hover:text-yellow-400 group/link">
                 {dict?.shopsPage?.discoverMore}
                 {isAr ? <ArrowLeft className="w-4 h-4 group-hover/link:-translate-x-1 transition-transform" /> : <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />}
               </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
