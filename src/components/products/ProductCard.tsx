'use client';
import { useMounted } from '@/hooks/useMounted';
import { useWishlistStore } from '@/store/useWishlistStore';
import type { Product } from '@/types';
import { Heart,ShoppingCart,Sparkles } from 'lucide-react';
import ProductImage from './ProductImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product, lang, isNew = false }: { product: Product, lang: string, isNew?: boolean }) {
  const isAr = lang === 'ar';

  const mounted = useMounted();
  const toggleWishlistStore = useWishlistStore(state => state.toggleWishlist);
  const wishlistItems = useWishlistStore(state => state.items);
  const isWishlisted = mounted ? wishlistItems.some(item => item._id === product._id) : false;

  const router = useRouter();


  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlistStore(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/${lang}/products/${product._id}`);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 group relative border border-gray-100 flex flex-col h-full">
      {isNew && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-[#1a365d] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {isAr ? 'جديد' : 'New'}
          </span>
        </div>
      )}

      {/* Like Button */}
      <button aria-label={isAr?'المفضلة':'Wishlist'} aria-pressed={isWishlisted}
        onClick={toggleWishlist}
        className={`absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all shadow-sm ${
          isWishlisted ? 'text-red-500 bg-red-50 border border-red-100' : 'text-gray-400 hover:text-red-500 hover:bg-white'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
      </button>

      {/* Image */}
      <Link href={`/${lang}/products/${product._id}`}>
        <div className="aspect-square rounded-xl overflow-hidden mb-4 relative bg-gray-50">
          <ProductImage
            product={product}
            alt={isAr ? product.nameAr : product.name}
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1">
        <div className="text-xs font-bold text-[#2b4c7e] mb-2 bg-[#eaf1f8] inline-block px-2 py-1 rounded-md self-start">
          {typeof product.category === 'object' && product.category !== null ? (isAr ? product.category.nameAr : product.category.name) : 'Category'}
        </div>

        <Link href={`/${lang}/products/${product._id}`}>
          <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#1a365d] transition-colors h-10">
            {isAr ? product.nameAr : product.name}
          </h3>
        </Link>


        <div className="pt-4 border-t border-gray-100 mt-auto">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 rounded-xl bg-[#1a365d] flex items-center justify-center gap-2 px-4 text-white font-bold hover:bg-[#2b4c7e] hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md group/btn overflow-hidden text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isAr ? 'عرض العروض' : 'View Offers'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
