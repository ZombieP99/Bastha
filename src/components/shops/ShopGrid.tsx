'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Store } from 'lucide-react';
import ShopCard, { Shop } from './ShopCard';
import ShopFilters from './ShopFilters';

export default function ShopGrid({ dict, lang }: { dict: any; lang: string }) {
  const isAr = lang === 'ar';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(dict?.shopsPage?.allCategories || 'All');

  const shops: Shop[] = [
    {
      id: 1,
      name: isAr ? 'بيت المخبوزات' : 'Bakery House',
      description: isAr ? 'مخبوزات طازجة يومياً' : 'Freshly baked goods daily',
      coverImage: 'https://picsum.photos/seed/bakery/800/600',
      logo: 'https://picsum.photos/seed/bakerylogo/200/200',
      rating: 4.7,
      tags: [dict?.shopsPage?.categories?.restaurants, dict?.shopsPage?.categories?.sweets]
    },
    {
      id: 2,
      name: isAr ? 'نبع الطبيعة' : 'Nature Spring',
      description: isAr ? 'عناية بالبشرة طبيعية' : 'Natural skincare products',
      coverImage: 'https://picsum.photos/seed/nature/800/600',
      logo: 'https://picsum.photos/seed/naturelogo/200/200',
      rating: 4.5,
      tags: [dict?.shopsPage?.categories?.beauty, dict?.shopsPage?.categories?.organic]
    },
    {
      id: 3,
      name: isAr ? 'تراث الجلود' : 'Leather Heritage',
      description: isAr ? 'صناعة يدوية فاخرة' : 'Luxury handmade leather goods',
      coverImage: 'https://picsum.photos/seed/leather/800/600',
      logo: 'https://picsum.photos/seed/leatherlogo/200/200',
      rating: 4.9,
      tags: [dict?.shopsPage?.categories?.fashion, dict?.shopsPage?.categories?.leather]
    },
    {
      id: 4,
      name: isAr ? 'زمرد للمجوهرات' : 'Emerald Jewelry',
      description: isAr ? 'أناقة وأحجار كريمة' : 'Elegance and precious stones',
      coverImage: 'https://picsum.photos/seed/jewelry/800/600',
      logo: 'https://picsum.photos/seed/jewelrylogo/200/200',
      rating: 4.8,
      tags: [dict?.shopsPage?.categories?.jewelry, dict?.shopsPage?.categories?.gifts]
    },
    {
      id: 5,
      name: isAr ? 'نشاط ورياضة' : 'Active & Sports',
      description: isAr ? 'ملابس رياضية وأدوات' : 'Sportswear and equipment',
      coverImage: 'https://picsum.photos/seed/sports/800/600',
      logo: 'https://picsum.photos/seed/sportslogo/200/200',
      rating: 4.4,
      tags: [dict?.shopsPage?.categories?.fashion, dict?.shopsPage?.categories?.sports]
    },
    {
      id: 6,
      name: isAr ? 'عالم التقنية' : 'Tech Oasis',
      description: isAr ? 'أحدث الأجهزة الذكية' : 'Latest smart devices',
      coverImage: 'https://picsum.photos/seed/tech/800/600',
      logo: 'https://picsum.photos/seed/techlogo/200/200',
      rating: 4.6,
      tags: [dict?.categories?.items?.electronics]
    },
    {
      id: 7,
      name: isAr ? 'واحة القارئ' : 'Readers Oasis',
      description: isAr ? 'كتب وروايات متنوعة' : 'Books and diverse novels',
      coverImage: 'https://picsum.photos/seed/books/800/600',
      logo: 'https://picsum.photos/seed/bookslogo/200/200',
      rating: 4.9,
      tags: [dict?.categories?.items?.toys]
    },
    {
      id: 8,
      name: isAr ? 'ألعاب الفرح' : 'Joy Toys',
      description: isAr ? 'ألعاب أطفال آمنة' : 'Safe kids toys',
      coverImage: 'https://picsum.photos/seed/toys/800/600',
      logo: 'https://picsum.photos/seed/toyslogo/200/200',
      rating: 4.8,
      tags: [dict?.categories?.items?.toys, dict?.shopsPage?.categories?.gifts]
    }
  ];

  // Derive filtered shops
  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      // Search match
      const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            shop.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category match
      const isAllCategories = activeCategory === dict?.shopsPage?.allCategories || !activeCategory;
      const matchesCategory = isAllCategories || shop.tags.includes(activeCategory);

      return matchesSearch && matchesCategory;
    });
  }, [shops, searchQuery, activeCategory, dict]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <section className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      
      {/* Title & Dropdown Header */}
      <div className={`flex flex-col md:flex-row items-center justify-between gap-4 mb-8 ${isAr ? 'md:flex-row-reverse' : ''}`}>
        <h2 className="text-3xl font-extrabold text-[#1a365d]">
          {dict?.shopsPage?.title}
        </h2>
        
        {/* Dropdown visual */}
        <div className="relative">
          <button className="flex items-center gap-2 bg-[#f0f4f8] text-[#1a365d] px-5 py-2.5 rounded-xl font-bold border border-transparent hover:border-gray-200 transition-colors">
            {dict?.shopsPage?.filters?.newest}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Category Filters */}
      <ShopFilters 
        dict={dict} 
        lang={lang} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* Grid */}
      {filteredShops.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filteredShops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} dict={dict} lang={lang} />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Store className="w-16 h-16 mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-[#1a365d] mb-2">{dict?.shopsPage?.noResults}</h3>
        </div>
      )}
      
    </section>
  );
}
