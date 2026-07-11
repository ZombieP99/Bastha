'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Store, Clock, Star, Flame } from 'lucide-react';
import ShopCard, { Shop } from './ShopCard';
import ShopFilters from './ShopFilters';
import SkeletonShopCard from './SkeletonShopCard';
import Pagination from '../ui/Pagination';

type SortOption = 'newest' | 'topRated' | 'popular';

export default function ShopGrid({ dict, lang }: { dict: any; lang: string }) {
  const isAr = lang === 'ar';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(dict?.shopsPage?.allCategories || 'All');
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simulate Network Loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, sortOrder]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory, sortOrder]);

  // Realistic Dummy Data
  const shops: Shop[] = [
    {
      id: 1, name: isAr ? 'مخبز اليازجي' : 'Al-Yazji Bakery', description: isAr ? 'مخبوزات وكعك محلي طازج' : 'Fresh local baked goods and cakes',
      coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      logo: '',
      rating: 4.8, tags: [dict?.shopsPage?.categories?.restaurants, dict?.shopsPage?.categories?.sweets]
    },
    {
      id: 2, name: isAr ? 'أزياء سمر' : 'Samar Fashion', description: isAr ? 'أحدث صيحات الموضة النسائية' : 'Latest women fashion trends',
      coverImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop',
      logo: '',
      rating: 4.6, tags: [dict?.shopsPage?.categories?.fashion]
    },
    {
      id: 3, name: isAr ? 'مجوهرات الشرفا' : 'Al-Shorafa Jewelry', description: isAr ? 'أرقى المصوغات الذهبية والماس' : 'Finest gold and diamond jewelry',
      coverImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
      logo: '',
      rating: 4.9, tags: [dict?.shopsPage?.categories?.jewelry, dict?.shopsPage?.categories?.gifts]
    },
    {
      id: 4, name: isAr ? 'تقنية الرائد' : 'Al-Raed Tech', description: isAr ? 'أجهزة ذكية وإلكترونيات حديثة' : 'Smart devices and modern electronics',
      coverImage: 'https://images.unsplash.com/photo-1531297172867-4d6537f05218?q=80&w=800&auto=format&fit=crop',
      logo: '',
      rating: 4.7, tags: [dict?.categories?.items?.electronics]
    },
    {
      id: 5, name: isAr ? 'حلويات العمدة' : 'Al-Omda Sweets', description: isAr ? 'حلويات شرقية وغربية فاخرة' : 'Premium eastern and western sweets',
      coverImage: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=800&auto=format&fit=crop',
      logo: '',
      rating: 4.8, tags: [dict?.shopsPage?.categories?.sweets]
    },
    {
      id: 6, name: isAr ? 'عطارة الشام' : 'Al-Sham Herbs', description: isAr ? 'أعشاب طبيعية وزيوت عضوية' : 'Natural herbs and organic oils',
      coverImage: 'https://images.unsplash.com/photo-1611077544346-646e7f827a5e?q=80&w=800&auto=format&fit=crop',
      logo: '',
      rating: 4.5, tags: [dict?.shopsPage?.categories?.organic, dict?.shopsPage?.categories?.beauty]
    },
    {
      id: 7, name: isAr ? 'مطعم البيك' : 'Al-Baik Restaurant', description: isAr ? 'أشهى المأكولات والوجبات السريعة' : 'Delicious fast food meals',
      coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
      logo: '',
      rating: 4.6, tags: [dict?.shopsPage?.categories?.restaurants]
    },
    {
      id: 8, name: isAr ? 'حقائب الأناقة' : 'Elegance Bags', description: isAr ? 'حقائب جلدية أصلية' : 'Authentic leather bags',
      coverImage: 'https://images.unsplash.com/photo-1548863227-3af567fc3b27?q=80&w=800&auto=format&fit=crop',
      logo: '',
      rating: 4.4, tags: [dict?.shopsPage?.categories?.fashion, dict?.shopsPage?.categories?.leather]
    },
    {
      id: 9, name: isAr ? 'الرياضي الأول' : 'First Athlete', description: isAr ? 'مستلزمات رياضية احترافية' : 'Professional sports equipment',
      coverImage: 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?q=80&w=800&auto=format&fit=crop',
      logo: '',
      rating: 4.7, tags: [dict?.shopsPage?.categories?.sports]
    },
    {
      id: 10, name: isAr ? 'عالم الأطفال' : 'Kids World', description: isAr ? 'ألعاب آمنة وتطويرية للأطفال' : 'Safe and developmental kids toys',
      coverImage: 'https://images.unsplash.com/photo-1558066160-58c9735d4872?q=80&w=800&auto=format&fit=crop',
      logo: '',
      rating: 4.8, tags: [dict?.categories?.items?.toys, dict?.shopsPage?.categories?.gifts]
    },
    {
      id: 11, name: isAr ? 'مكتبة اقرأ' : 'Iqra Library', description: isAr ? 'أحدث الكتب والروايات العالمية' : 'Latest books and international novels',
      coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop',
      logo: '',
      rating: 4.9, tags: [dict?.categories?.items?.toys] // Books can fall under this or gifts
    },
    {
      id: 12, name: isAr ? 'لمسة جمال' : 'Beauty Touch', description: isAr ? 'مستحضرات تجميل أصلية' : 'Original cosmetics',
      coverImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop',
      logo: '',
      rating: 4.3, tags: [dict?.shopsPage?.categories?.beauty]
    }
  ];

  // Derive filtered and sorted shops
  const processedShops = useMemo(() => {
    let result = shops.filter((shop) => {
      // Search match
      const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            shop.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category match
      const isAllCategories = activeCategory === dict?.shopsPage?.allCategories || !activeCategory;
      const matchesCategory = isAllCategories || shop.tags.includes(activeCategory);

      return matchesSearch && matchesCategory;
    });

    // Sort
    result.sort((a, b) => {
      if (sortOrder === 'topRated') return b.rating - a.rating;
      if (sortOrder === 'popular') return (b.rating * 10) - (a.rating * 10); // Mock popularity
      return b.id - a.id; // Newest (highest ID first)
    });

    return result;
  }, [shops, searchQuery, activeCategory, sortOrder, dict]);

  // Pagination Logic
  const totalPages = Math.ceil(processedShops.length / itemsPerPage);
  const currentShops = processedShops.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const getSortLabel = (option: SortOption) => {
    if (option === 'newest') return dict?.shopsPage?.filters?.newest;
    if (option === 'topRated') return dict?.shopsPage?.filters?.topRated;
    return dict?.shopsPage?.filters?.popular;
  };

  const getSortIcon = (option: SortOption) => {
    if (option === 'newest') return <Clock className="w-4 h-4" />;
    if (option === 'topRated') return <Star className="w-4 h-4" />;
    return <Flame className="w-4 h-4" />;
  };

  return (
    <section className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      
      {/* Title & Dropdown Header */}
      <div className={`flex flex-col md:flex-row items-center justify-between gap-4 mb-8 ${isAr ? 'md:flex-row-reverse' : ''}`}>
        <h2 className="text-3xl font-extrabold text-[#1a365d]">
          {dict?.shopsPage?.title}
        </h2>
        
        {/* Sorting Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2 bg-[#f0f4f8] text-[#1a365d] px-5 py-2.5 rounded-xl font-bold border border-transparent hover:border-gray-200 transition-colors ${isAr ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
              {getSortIcon(sortOrder)}
              <span>{getSortLabel(sortOrder)}</span>
            </div>
            <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={`absolute z-30 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden ${isAr ? 'left-0' : 'right-0'}`}
              >
                <div className="py-2 flex flex-col">
                  {(['newest', 'topRated', 'popular'] as SortOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortOrder(option);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-5 py-3 text-sm font-bold transition-colors flex items-center gap-3 ${
                        isAr ? 'flex-row-reverse text-right' : 'flex-row text-left'
                      } ${sortOrder === option ? 'bg-[#1a365d]/5 text-[#1a365d]' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {getSortIcon(option)}
                      <span>{getSortLabel(option)}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

      {/* Grid Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonShopCard key={i} lang={lang} />
          ))}
        </div>
      ) : currentShops.length > 0 ? (
        <>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[400px]"
          >
            {currentShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} dict={dict} lang={lang} />
            ))}
          </motion.div>
          
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
            lang={lang} 
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 min-h-[400px]">
          <Store className="w-16 h-16 mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-[#1a365d] mb-2">{dict?.shopsPage?.noResults}</h3>
        </div>
      )}
      
    </section>
  );
}
