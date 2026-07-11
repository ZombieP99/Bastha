'use client';
import Link from 'next/link';
import { Globe, Share2, AtSign, CreditCard, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer({ dict, lang }: { dict: any, lang?: string }) {
  const isAr = lang === 'ar' || !lang;

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          <div className="flex flex-col">
            <h2 className="text-2xl font-extrabold text-[#1a365d] mb-4">
              {isAr ? 'بسطة' : 'Bastha'}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {dict?.footer?.description}
            </p>
            <div className="flex items-center gap-3">
              <motion.a whileHover={{ scale: 1.1, rotate: 10 }} href="#" className="w-9 h-9 rounded-full bg-[#e1eaf5] text-[#1a365d] flex items-center justify-center hover:bg-[#1a365d] hover:text-white transition-colors">
                <Globe className="w-4 h-4" />
              </motion.a>
              <motion.a whileHover={{ scale: 1.1, rotate: 10 }} href="#" className="w-9 h-9 rounded-full bg-[#e1eaf5] text-[#1a365d] flex items-center justify-center hover:bg-[#1a365d] hover:text-white transition-colors">
                <Share2 className="w-4 h-4" />
              </motion.a>
              <motion.a whileHover={{ scale: 1.1, rotate: 10 }} href="#" className="w-9 h-9 rounded-full bg-[#e1eaf5] text-[#1a365d] flex items-center justify-center hover:bg-[#1a365d] hover:text-white transition-colors">
                <AtSign className="w-4 h-4" />
              </motion.a>
            </div>
          </div>

          <div>
            <h3 className="text-[#1a365d] font-bold mb-6">{dict?.footer?.quickLinks?.title}</h3>
            <ul className="flex flex-col gap-3 text-sm text-gray-500">
              <li><Link href={`/${lang}#about`} className="hover:text-[#1a365d] hover:translate-x-1 transition-all inline-block">{dict?.footer?.quickLinks?.about}</Link></li>
              <li><Link href={`/${lang}#contact`} className="hover:text-[#1a365d] hover:translate-x-1 transition-all inline-block">{dict?.footer?.quickLinks?.contact}</Link></li>
              <li><Link href={`/${lang}/shops`} className="hover:text-[#1a365d] hover:translate-x-1 transition-all inline-block">{dict?.footer?.quickLinks?.stores}</Link></li>
              <li><Link href={`/${lang}#offers`} className="hover:text-[#1a365d] hover:translate-x-1 transition-all inline-block">{dict?.footer?.quickLinks?.offers}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#1a365d] font-bold mb-6">{dict?.footer?.legal?.title}</h3>
            <ul className="flex flex-col gap-3 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-[#1a365d] hover:translate-x-1 transition-all inline-block">{dict?.footer?.legal?.privacy}</Link></li>
              <li><Link href="#" className="hover:text-[#1a365d] hover:translate-x-1 transition-all inline-block">{dict?.footer?.legal?.terms}</Link></li>
              <li><Link href="#" className="hover:text-[#1a365d] hover:translate-x-1 transition-all inline-block">{dict?.footer?.legal?.help}</Link></li>
              <li><Link href="#" className="hover:text-[#1a365d] hover:translate-x-1 transition-all inline-block">{dict?.footer?.legal?.faq}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#1a365d] font-bold mb-6">{dict?.footer?.newsletter?.title}</h3>
            <p className="text-gray-500 text-sm mb-4">
              {dict?.footer?.newsletter?.subtitle}
            </p>
            <div className="flex items-center group">
              <input 
                type="email" 
                placeholder={dict?.footer?.newsletter?.placeholder} 
                className={`w-full bg-[#eef3f9] text-sm py-3 px-4 outline-none border border-transparent focus:border-[#1a365d] transition-colors ${isAr ? 'rounded-r-lg' : 'rounded-l-lg'}`}
              />
              <button className={`bg-[#2b4c7e] text-white py-3 px-4 hover:bg-[#1a365d] transition-colors flex items-center justify-center ${isAr ? 'rounded-l-lg' : 'rounded-r-lg'}`}>
                {isAr ? <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4">
          <p>{dict?.footer?.copyright}</p>
          <div className="flex items-center gap-4 text-gray-400">
            <CreditCard className="w-5 h-5 hover:text-gray-600 transition-colors" />
            <Wallet className="w-5 h-5 hover:text-gray-600 transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
}
