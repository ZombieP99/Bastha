'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingCart, ShoppingBag, Globe, X, Tag, Sparkles, Flame, Laptop, Heart, Dumbbell, Home, Shirt, Baby, Store, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar({ dict, lang }: { dict: any, lang: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      router.push(`/${lang}/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleLanguage = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    const newPathname = pathname.replace(`/${lang}`, `/${newLang}`);
    router.push(newPathname || `/${newLang}`);
  };

  const isActive = (path: string) => {
    if (path === `/${lang}`) {
      return pathname === `/${lang}`;
    }
    // Simple check to avoid highlighting home when on /shops
    return pathname.startsWith(path);
  };

  const getLinkClass = (path: string) => {
    return isActive(path)
      ? "text-[#1a365d] border-b-2 border-[#1a365d] pb-1 font-bold"
      : "hover:text-[#1a365d] transition pb-1 border-b-2 border-transparent hover:border-[#1a365d]";
  };

  const searchSuggestions = [
    // Products
    { name: lang === 'ar' ? 'سماعة رأس لاسلكية' : 'Wireless Headphones', type: 'product' },
    { name: lang === 'ar' ? 'مجموعة العناية بالبشرة' : 'Skincare Set', type: 'product' },
    { name: lang === 'ar' ? 'ساعة كلاسيكية فاخرة' : 'Luxury Classic Watch', type: 'product' },
    { name: lang === 'ar' ? 'مساعد منزلي ذكي' : 'Smart Home Assistant', type: 'product' },
    // Shops
    { name: lang === 'ar' ? 'مخبز اليازجي' : 'Al-Yazji Bakery', type: 'shop' },
    { name: lang === 'ar' ? 'أزياء سمر' : 'Samar Fashion', type: 'shop' },
    { name: lang === 'ar' ? 'مجوهرات الشرفا' : 'Al-Shorafa Jewelry', type: 'shop' },
    { name: lang === 'ar' ? 'تقنية الرائد' : 'Al-Raed Tech', type: 'shop' },
  ].filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));

  return (
    <>
      {/* Backdrop for Advanced Search */}
      {isSearchFocused && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSearchFocused(false)}
        />
      )}

      <header className="w-full bg-white shadow-sm sticky top-0 z-50 relative">
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

          <div className="hidden md:block flex-1 max-w-2xl relative z-50">
            <form onSubmit={handleSearch} className="relative group flex items-center w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder={dict.common.searchPlaceholder}
                className={`w-full bg-[#f0f4f8] text-sm rounded-full py-3 px-12 outline-none border border-transparent focus:bg-white focus:shadow-md focus:border-[#1a365d] transition-all`}
              />
              <button type="submit" className={`absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'right-4' : 'left-4'}`}>
                <Search className={`w-5 h-5 transition-colors ${isSearchFocused ? 'text-[#1a365d]' : 'text-gray-400 group-focus-within:text-[#1a365d]'}`} />
              </button>
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className={`absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'left-4' : 'right-4'}`}
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                </button>
              )}
            </form>

            {/* Advanced Search Dropdown */}
            {isSearchFocused && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`absolute top-full mt-3 w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 ${lang === 'ar' ? 'text-right right-0' : 'text-left left-0'}`}
              >
                {searchQuery.trim() ? (
                  /* Auto-complete suggestions */
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-4">{lang === 'ar' ? 'مقترحات البحث' : 'Search Suggestions'}</h3>
                    {searchSuggestions.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {searchSuggestions.map((suggestion, idx) => (
                          <button 
                            key={idx}
                            onClick={() => {
                              setSearchQuery(suggestion.name);
                              router.push(`/${lang}/search?q=${encodeURIComponent(suggestion.name)}`);
                              setIsSearchFocused(false);
                            }}
                            className={`flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 p-3 px-4 rounded-xl transition-colors w-full ${lang === 'ar' ? 'flex-row text-right' : 'flex-row text-left'}`}
                          >
                            <span className="font-bold text-[#1a365d]">{suggestion.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              suggestion.type === 'shop' 
                                ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                                : 'bg-orange-50 text-orange-600 border-orange-100'
                            }`}>
                              {suggestion.type === 'shop' ? (lang === 'ar' ? 'متجر' : 'Shop') : (lang === 'ar' ? 'منتج' : 'Product')}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                       <p className="text-gray-500 text-sm">{lang === 'ar' ? 'لا يوجد مقترحات لـ' : 'No suggestions for'} "{searchQuery}"</p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Trending */}
                    <div className="mb-8">
                  <h3 className="font-bold text-gray-800 text-lg mb-4">{lang === 'ar' ? 'الرائج الآن' : 'Trending now'}</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      lang === 'ar' ? 'واقي شمس' : 'Sunscreen',
                      lang === 'ar' ? 'عطور صيفية' : 'Summer Perfumes',
                      lang === 'ar' ? 'مكملات غذائية' : 'Supplements',
                      lang === 'ar' ? 'ساعات ذكية' : 'Smart Watches',
                      lang === 'ar' ? 'ديكورات منزلية' : 'Home Decor'
                    ].map((term, idx) => (
                      <button 
                        key={idx}
                        onClick={() => {
                          setSearchQuery(term);
                          router.push(`/${lang}/search?q=${encodeURIComponent(term)}`);
                          setIsSearchFocused(false);
                        }}
                        className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-bold transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Browse */}
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-4">{lang === 'ar' ? 'تصفح الأقسام' : 'Browse Categories'}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { name: lang === 'ar' ? 'عروض وخصومات' : 'Sales & Offers', icon: <Tag className="w-5 h-5 text-blue-500" /> },
                      { name: lang === 'ar' ? 'وصل حديثاً' : 'New Arrivals', icon: <Sparkles className="w-5 h-5 text-purple-500" /> },
                      { name: lang === 'ar' ? 'الأكثر مبيعاً' : 'Best Sellers', icon: <Flame className="w-5 h-5 text-orange-500" /> },
                      { name: lang === 'ar' ? 'إلكترونيات' : 'Electronics', icon: <Laptop className="w-5 h-5 text-gray-700" /> },
                      { name: lang === 'ar' ? 'الصحة والجمال' : 'Health & Beauty', icon: <Heart className="w-5 h-5 text-pink-500" /> },
                      { name: lang === 'ar' ? 'الرياضة' : 'Sports', icon: <Dumbbell className="w-5 h-5 text-green-600" /> },
                      { name: lang === 'ar' ? 'المنزل' : 'Home', icon: <Home className="w-5 h-5 text-teal-600" /> },
                      { name: lang === 'ar' ? 'أزياء' : 'Fashion', icon: <Shirt className="w-5 h-5 text-indigo-500" /> },
                      { name: lang === 'ar' ? 'ألعاب أطفال' : 'Baby & Toys', icon: <Baby className="w-5 h-5 text-yellow-600" /> },
                    ].map((cat, idx) => (
                      <button 
                        key={idx}
                        onClick={() => {
                          setIsSearchFocused(false);
                          router.push(`/${lang}/search?category=${encodeURIComponent(cat.name)}`);
                        }}
                        className={`flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 p-3.5 rounded-2xl transition-colors ${lang === 'ar' ? 'text-right flex-row' : 'text-left flex-row'}`}
                      >
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100">{cat.icon}</span>
                        <span className="font-bold text-sm text-gray-700">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Left side: Auth & Cart */}
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#1a365d] px-3 py-1.5 rounded-full font-bold text-xs transition"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'English' : 'عربي'}
          </button>
          
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
            <Link href={`/${lang}/auth?mode=login`} className="text-[#1a365d] hover:text-blue-700 transition">
              {dict.common.login}
            </Link>
            <Link href={`/${lang}/auth?mode=signup`}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-[#2b4c7e] text-white px-5 py-2.5 rounded-lg hover:bg-[#1a365d] transition cursor-pointer">
                {dict.common.register}
              </motion.div>
            </Link>
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
            <Link href={`/${lang}`} className={getLinkClass(`/${lang}`)}>{dict.nav.home}</Link>
            <Link href={`/${lang}/search`} className={getLinkClass(`/${lang}/search`)}>{lang === 'ar' ? 'المنتجات' : 'Products'}</Link>
            <Link href={`/${lang}/shops`} className={getLinkClass(`/${lang}/shops`)}>{dict.nav.featuredStores}</Link>
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
    </>
  );
}
