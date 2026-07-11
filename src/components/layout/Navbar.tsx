'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingCart, ShoppingBag, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar({ dict, lang }: { dict: any, lang: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const toggleLanguage = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    const newPathname = pathname.replace(`/${lang}`, `/${newLang}`);
    router.push(newPathname || `/${newLang}`);
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* Top Header */}
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Right side: Logo & Search */}
        <div className="flex items-center gap-8 flex-1">
          <Link href={`/${lang}`} className="flex items-center gap-2">
            <motion.div whileHover={{ rotate: 10 }} whileTap={{ scale: 0.9 }}>
              <ShoppingBag className="w-6 h-6 text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-[#1a365d]">
              {lang === 'ar' ? 'بسطة' : 'Bastha'}
            </h1>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl relative group">
            <input
              type="text"
              placeholder={dict.common.searchPlaceholder}
              className={`w-full bg-[#f0f4f8] text-sm rounded-full py-2.5 px-4 outline-none border border-transparent focus:border-[#1a365d] transition-colors ${lang === 'ar' ? 'pr-10' : 'pl-10'}`}
            />
            <Search className={`w-4 h-4 text-gray-500 absolute top-1/2 -translate-y-1/2 group-focus-within:text-[#1a365d] transition-colors ${lang === 'ar' ? 'left-4' : 'right-4'}`} />
          </div>
        </div>

        {/* Left side: Auth & Cart */}
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-[#1a365d] hover:text-blue-700 font-medium text-sm transition"
          >
            <Globe className="w-4 h-4" />
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
          
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
            <Link href="#" className="text-[#1a365d] hover:text-blue-700 transition">
              {dict.common.login}
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="#" className="bg-[#2b4c7e] text-white px-5 py-2.5 rounded-lg hover:bg-[#1a365d] transition">
                {dict.common.register}
              </Link>
            </motion.div>
          </div>
          
          <Link href="#" className="relative flex items-center group">
            <motion.div whileHover={{ scale: 1.1 }}>
              <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-[#1a365d] transition-colors" />
            </motion.div>
            <span className="absolute -top-2 -right-2 bg-[#a38024] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              3
            </span>
          </Link>
        </div>
      </div>

      {/* Bottom Nav (Categories) */}
      <div className="bg-[#f8fafc] border-t border-gray-100 hidden md:block">
        <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between text-sm font-semibold">
          <nav className="flex items-center gap-6 text-gray-600">
            <Link href={`/${lang}`} className="text-[#1a365d] border-b-2 border-[#1a365d] pb-1">{dict.nav.home}</Link>
            <Link href={`/${lang}#categories`} className="hover:text-[#1a365d] transition pb-1 border-b-2 border-transparent hover:border-[#1a365d]">{dict.nav.categories}</Link>
            <Link href={`/${lang}/shops`} className="hover:text-[#1a365d] transition pb-1 border-b-2 border-transparent hover:border-[#1a365d]">{dict.nav.featuredStores}</Link>
            <Link href={`/${lang}#offers`} className="hover:text-[#1a365d] transition pb-1 border-b-2 border-transparent hover:border-[#1a365d]">{dict.nav.bestOffers}</Link>
            <Link href={`/${lang}#new`} className="hover:text-[#1a365d] transition pb-1 border-b-2 border-transparent hover:border-[#1a365d]">{dict.nav.newArrivals}</Link>
            <Link href={`/${lang}#bestsellers`} className="hover:text-[#1a365d] transition pb-1 border-b-2 border-transparent hover:border-[#1a365d]">{dict.nav.bestSellers}</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="w-px h-5 bg-gray-300"></div>
            <Link href="#" className="text-[#846b2b] hover:text-[#a38024] font-bold flex items-center gap-2 group">
              <span className="group-hover:-translate-y-0.5 transition-transform">{dict.nav.sellWithUs}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
