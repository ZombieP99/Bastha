'use client';

import { use, useEffect, useState } from 'react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';

export default function WishlistPage({ params }: { params: Promise<any> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang as 'en' | 'ar';
  const isAr = lang === 'ar';

  const [mounted, setMounted] = useState(false);
  const { items } = useWishlistStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#f8fafc] pt-20" />;

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-12 pb-20">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-extrabold text-[#1a365d]">
            {isAr ? 'قائمة الرغبات' : 'Wishlist'}
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-red-200" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {isAr ? 'قائمة رغباتك فارغة' : 'Your wishlist is empty'}
            </h2>
            <p className="text-gray-500 mb-8 max-w-md">
              {isAr 
                ? 'يبدو أنك لم تضف أي منتجات إلى قائمة رغباتك بعد. تصفح المنتجات وأضف ما يعجبك.' 
                : 'Looks like you haven\'t added any products to your wishlist yet. Browse products and add what you like.'}
            </p>
            <Link href={`/${lang}/products`}>
              <button className="bg-[#1a365d] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2b4c7e] transition-colors shadow-md">
                {isAr ? 'تصفح المنتجات' : 'Browse Products'}
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {items.map((product) => (
              <ProductCard key={product._id} product={product} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
