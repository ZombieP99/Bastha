'use client';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShopFiltersProps {
  dict: any;
  lang: string;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeCategory: string;
  setActiveCategory: (val: string) => void;
}

export default function ShopFilters({
  dict,
  lang,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
}: ShopFiltersProps) {
  const isAr = lang === 'ar';
  
  // Extract categories from dictionary
  const rawCategories = dict?.shopsPage?.categories || {};
  const allCategory = dict?.shopsPage?.allCategories || 'All';
  const categories = Object.values(rawCategories) as string[];

  return (
    <div className="flex flex-col gap-6 mb-10">
      
      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto w-full group">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={dict?.shopsPage?.searchPlaceholder}
          className={`w-full bg-white shadow-sm border border-gray-100 rounded-2xl py-4 px-6 text-gray-700 outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] transition-all ${
            isAr ? 'pr-12 text-right' : 'pl-12 text-left'
          }`}
        />
        <Search 
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1a365d] transition-colors ${
            isAr ? 'right-5' : 'left-5'
          }`} 
        />
      </div>

      {/* Category Pills */}
      <div className={`flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x justify-start md:justify-center ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Distinctive All Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveCategory(allCategory)}
          className={`snap-center whitespace-nowrap px-6 py-2.5 rounded-2xl font-extrabold text-sm transition-all shadow-sm border-2 ${
            (activeCategory === allCategory || !activeCategory)
              ? 'bg-gradient-to-r from-[#1a365d] to-[#2b4c7e] text-white border-transparent' 
              : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-200'
          }`}
        >
          {allCategory}
        </motion.button>

        {/* Separator Divider */}
        <div className="w-px h-8 bg-gray-200 mx-1 flex-shrink-0 rounded-full"></div>

        {/* Other Categories */}
        {categories.map((category, idx) => {
          const isActive = activeCategory === category;
          return (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category)}
              className={`snap-center whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm border ${
                isActive 
                  ? 'bg-[#1a365d] text-white border-transparent' 
                  : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 border-gray-100'
              }`}
            >
              {category}
            </motion.button>
          );
        })}
      </div>
      
    </div>
  );
}
