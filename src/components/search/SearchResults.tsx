'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, ShoppingCart, ChevronDown, Heart, Store, Package } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ShopCard from '../shops/ShopCard';

export default function SearchResults({ dict, lang }: { dict: any, lang: string }) {
  const isAr = lang === 'ar';
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [sortBy, setSortBy] = useState('newest');

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  
  // Layout State
  const [isFilterVisible, setIsFilterVisible] = useState(true);

  // Mock Products Data
  const products = [
    { id: '1', title: isAr ? 'سماعة رأس لاسلكية عازلة للضوضاء' : 'Noise Cancelling Wireless Headphones', price: 240, rating: 4.8, category: 'electronics', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop' },
    { id: '2', title: isAr ? 'مجموعة العناية بالبشرة العضوية' : 'Organic Skincare Set', price: 180, rating: 4.9, category: 'health', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop' },
    { id: '3', title: isAr ? 'ساعة كلاسيكية فاخرة' : 'Luxury Classic Watch', price: 550, rating: 4.7, category: 'fashion', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop' },
    { id: '4', title: isAr ? 'مساعد منزلي ذكي' : 'Smart Home Assistant', price: 399, rating: 4.6, category: 'electronics', image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=800&auto=format&fit=crop' },
    { id: '5', title: isAr ? 'حقيبة ظهر جلدية بتصميم بسيط' : 'Minimalist Leather Backpack', price: 320, rating: 5.0, category: 'fashion', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop' },
    { id: '6', title: isAr ? 'طقم تحضير قهوة سيراميك' : 'Ceramic Coffee Pour-over Set', price: 150, rating: 4.8, category: 'home', image: 'https://images.unsplash.com/photo-1495474472205-51f750c07c1b?q=80&w=800&auto=format&fit=crop' },
  ];

  const shops = [
    {
      id: 1, name: isAr ? 'مخبز اليازجي' : 'Al-Yazji Bakery', description: isAr ? 'مخبوزات وكعك محلي طازج' : 'Fresh local baked goods and cakes',
      coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      logo: '', rating: 4.8, tags: []
    },
    {
      id: 2, name: isAr ? 'أزياء سمر' : 'Samar Fashion', description: isAr ? 'أحدث صيحات الموضة النسائية' : 'Latest women fashion trends',
      coverImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop',
      logo: '', rating: 4.6, tags: []
    },
    {
      id: 3, name: isAr ? 'مجوهرات الشرفا' : 'Al-Shorafa Jewelry', description: isAr ? 'أرقى المصوغات الذهبية والماس' : 'Finest gold and diamond jewelry',
      coverImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
      logo: '', rating: 4.9, tags: []
    },
    {
      id: 4, name: isAr ? 'تقنية الرائد' : 'Al-Raed Tech', description: isAr ? 'أجهزة ذكية وإلكترونيات حديثة' : 'Smart devices and modern electronics',
      coverImage: 'https://images.unsplash.com/photo-1531297172867-4d6537f05218?q=80&w=800&auto=format&fit=crop',
      logo: '', rating: 4.7, tags: []
    }
  ];

  const filteredShops = shops.filter(s => {
    if (q) {
      const searchTerms = q.toLowerCase().trim().split(' ');
      const text = (s.name + ' ' + s.description).toLowerCase();
      return searchTerms.some(term => text.includes(term));
    }
    return false;
  });

  const filteredProducts = products.filter(p => {
    // 1. Search Query
    if (q) {
      const searchTerms = q.toLowerCase().trim().split(' ');
      const title = p.title.toLowerCase();
      // Match if title contains any of the search words
      const matchesSearch = searchTerms.some(term => title.includes(term));
      if (!matchesSearch) return false;
    }

    // 2. URL Category Param
    if (categoryParam && p.category.toLowerCase() !== categoryParam.toLowerCase()) return false;

    // 3. Sidebar Categories
    if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;

    // 4. Price
    if (minPrice && p.price < Number(minPrice)) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;

    // 5. Rating
    if (selectedRating !== null) {
      if (p.rating < selectedRating) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'priceDesc') return b.price - a.price;
    return 0; // newest
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };


  const clearFilters = () => {
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setSelectedRating(null);
  };

  const FILTER_CATEGORIES = [
    { label: isAr ? 'إلكترونيات' : 'Electronics', value: 'electronics' },
    { label: isAr ? 'أزياء' : 'Fashion', value: 'fashion' },
    { label: isAr ? 'صحة وجمال' : 'Health & Beauty', value: 'health' },
    { label: isAr ? 'المنزل' : 'Home', value: 'home' }
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16">
      {/* Header Area - Only visible when searching or filtering by URL category */}
      {(q || categoryParam) && (
        <div className="bg-white border-b border-gray-100 py-8 mb-8">
          <div className="container mx-auto px-4 md:px-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a365d] mb-2">
              {q 
                ? `${isAr ? 'نتائج البحث عن' : 'Search results for'} "${q}"` 
                : `${isAr ? 'قسم' : 'Category'}: ${categoryParam}`}
            </h1>
            <p className="text-gray-500">
              {filteredProducts.length} {isAr ? 'منتج متوفر' : 'Products available'}
            </p>
          </div>
        </div>
      )}

      <div className={`container mx-auto px-4 md:px-8 flex flex-col lg:flex-row gap-8 ${(q || categoryParam) ? '' : 'pt-12'}`}>
        
        {/* Sidebar Filters */}
        <AnimatePresence initial={false}>
          {isFilterVisible && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:flex-shrink-0 overflow-hidden"
            >
              <div className="w-full lg:w-[280px] bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24 mb-8 lg:mb-0">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h2 className="font-bold text-[#1a365d] flex items-center gap-2">
                <Filter className="w-5 h-5" />
                {dict.search?.filters || 'Filters'}
              </h2>
              <button onClick={clearFilters} className="text-xs text-[#6a9bc3] font-bold hover:underline">
                {dict.search?.clearFilters || 'Clear All'}
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3">{dict.search?.categories || 'Categories'}</h3>
              <div className="space-y-2">
                {FILTER_CATEGORIES.map((cat) => (
                  <label key={cat.value} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(cat.value)}
                      onChange={() => toggleCategory(cat.value)}
                      className="w-4 h-4 rounded text-[#1a365d] focus:ring-[#1a365d] border-gray-300" 
                    />
                    <span className="text-gray-600 text-sm">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3">{dict.search?.priceRange || 'Price Range'}</h3>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder={isAr ? 'الحد الأدنى' : 'Min'} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a365d]" 
                />
                <span className="text-gray-400">-</span>
                <input 
                  type="number" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder={isAr ? 'الحد الأقصى' : 'Max'} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a365d]" 
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3">{dict.search?.rating || 'Rating'}</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rate) => (
                  <label key={rate} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="rating"
                      checked={selectedRating === rate}
                      onChange={() => setSelectedRating(rate)}
                      className="w-4 h-4 text-[#1a365d] focus:ring-[#1a365d] border-gray-300" 
                    />
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < rate ? 'text-[#eab308] fill-[#eab308]' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {rate} {isAr ? 'نجوم' : 'Stars'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        <div className="w-full flex-1 min-w-0">
          
          {/* Top Sort Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center justify-between">
            <button 
              onClick={() => setIsFilterVisible(!isFilterVisible)} 
              className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${isFilterVisible ? 'bg-[#1a365d] text-white shadow-md' : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-600'}`}
              title={isFilterVisible ? (isAr ? 'إخفاء الفلتر' : 'Hide Filters') : (isAr ? 'إظهار الفلتر' : 'Show Filters')}
            >
              <Filter className="w-5 h-5" />
            </button>
            <div className="relative group">
              <button className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition shadow-sm">
                {dict.search?.sort || 'Sort by'}
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className={`absolute top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 ${isAr ? 'left-0' : 'right-0'}`}>
                <div className="p-2 flex flex-col gap-1">
                  <button onClick={() => setSortBy('newest')} className={`text-${isAr ? 'right' : 'left'} px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition ${sortBy === 'newest' ? 'font-bold text-[#1a365d]' : 'text-gray-600'}`}>{dict.search?.sortNewest || 'Newest'}</button>
                  <button onClick={() => setSortBy('priceAsc')} className={`text-${isAr ? 'right' : 'left'} px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition ${sortBy === 'priceAsc' ? 'font-bold text-[#1a365d]' : 'text-gray-600'}`}>{dict.search?.sortPriceLowHigh || 'Price: Low to High'}</button>
                  <button onClick={() => setSortBy('priceDesc')} className={`text-${isAr ? 'right' : 'left'} px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition ${sortBy === 'priceDesc' ? 'font-bold text-[#1a365d]' : 'text-gray-600'}`}>{dict.search?.sortPriceHighLow || 'Price: High to Low'}</button>
                </div>
              </div>
            </div>
          </div>

          {/* No Results found at all */}
          {filteredProducts.length === 0 && filteredShops.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 flex flex-col items-center justify-center">
              <Search className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">{isAr ? 'لم يتم العثور على أي نتائج' : 'No results found'}</h3>
              <p className="text-gray-500">{isAr ? 'حاول البحث بكلمات مختلفة أو إزالة بعض الفلاتر' : 'Try searching with different keywords or removing some filters'}</p>
              <button onClick={clearFilters} className="mt-6 px-6 py-2 bg-[#e1eaf5] text-[#1a365d] rounded-lg font-bold hover:bg-[#d0deef] transition">
                {dict.search?.clearFilters || 'Clear Filters'}
              </button>
            </div>
          ) : (
            <>
              {/* Shops Grid */}
              {filteredShops.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-[#1a365d] mb-6 flex items-center gap-2">
                    <Store className="w-6 h-6" />
                    {isAr ? 'المتاجر المطابقة' : 'Matching Shops'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {filteredShops.map(shop => (
                      <ShopCard key={shop.id} shop={shop as any} dict={dict} lang={lang} />
                    ))}
                  </div>
                </div>
              )}

              {/* Products Grid */}
              {filteredProducts.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1a365d] mb-6 flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    {isAr ? 'المنتجات المطابقة' : 'Matching Products'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <Link href={`/${lang}/products/${product.id}`} key={product.id}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col h-full cursor-pointer relative top-0 hover:-top-2">
                          <div className="relative aspect-square overflow-hidden bg-gray-100">
                            <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <button className={`absolute top-3 ${isAr ? 'right-3' : 'left-3'} w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors z-10`} onClick={(e) => e.preventDefault()}>
                              <Heart className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 leading-snug group-hover:text-[#1a365d] transition-colors">{product.title}</h3>
                            <div className="flex items-center gap-1 mb-4 mt-auto">
                              <Star className="w-4 h-4 text-[#eab308] fill-[#eab308]" />
                              <span className="text-sm font-bold text-gray-700">{product.rating}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
                              <div className="font-extrabold text-[#1a365d] text-lg">
                                {lang === 'en' ? dict.common?.currency || '$' : ''} {product.price} {lang === 'ar' ? dict.common?.currency || 'ر.س' : ''}
                              </div>
                              <div className="w-9 h-9 rounded-full bg-[#e1eaf5] text-[#1a365d] flex items-center justify-center group-hover:bg-[#1a365d] group-hover:text-white transition-colors">
                                <ShoppingCart className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
