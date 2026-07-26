'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ShoppingCart, ChevronDown, Heart, Store, Package, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ShopCard from '../shops/ShopCard';
import { searchProducts, getShops, getCategories } from '@/lib/api';
import { Product, Shop, Category } from '@/types';
import ProductCard from '@/components/products/ProductCard';

export default function SearchResults({ dict, lang }: { dict: any, lang: string }) {
  const isAr = lang === 'ar';
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [sortBy, setSortBy] = useState('newest');

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Layout State
  const [isFilterVisible, setIsFilterVisible] = useState(true);

  // API Data
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const prevQRef = useRef(q);

  useEffect(() => {
    if (q !== prevQRef.current) {
      // Clear filters when initiating a new search query
      setSelectedCategories(categoryParam ? [categoryParam] : []);
      prevQRef.current = q;
    } else if (categoryParam && !selectedCategories.includes(categoryParam)) {
      // Ensure category is selected if passed via URL
      setSelectedCategories([categoryParam]);
    }
  }, [q, categoryParam]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      // Only search products with text query and selected categories
      // We pass the first selected category if any (API only supports one category param right now)
      searchProducts(q, selectedCategories[0] || undefined),
      getShops(),
      getCategories()
    ]).then(([productsData, shopsData, categoriesData]) => {
      setProducts(productsData.products);
      setShops(shopsData);
      setCategories(categoriesData);
    }).catch(console.error).finally(() => setLoading(false));
  }, [q, selectedCategories, sortBy]);

  const filteredShops = shops.filter(s => {
    if (q) {
      const searchTerms = q.toLowerCase().trim().split(' ');
      const text = (s.name + ' ' + (s.description || '')).toLowerCase();
      return searchTerms.some(term => text.includes(term));
    }
    return false;
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
  };

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
              {products.length} {isAr ? 'منتج متوفر' : 'Products available'}
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
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(cat._id)}
                      onChange={() => toggleCategory(cat._id)}
                      className="w-4 h-4 rounded text-[#1a365d] focus:ring-[#1a365d] border-gray-300" 
                    />
                    <span className="text-gray-600 text-sm">{isAr ? cat.nameAr : cat.name}</span>
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
          {products.length === 0 && filteredShops.length === 0 ? (
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
                      <ShopCard key={shop._id} shop={shop as any} dict={dict} lang={lang} />
                    ))}
                  </div>
                </div>
              )}

              {/* Products Grid */}
              {products.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1a365d] mb-6 flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    {isAr ? 'المنتجات المطابقة' : 'Matching Products'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div key={product._id}>
                        <ProductCard product={product as any} lang={lang} />
                      </div>
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
