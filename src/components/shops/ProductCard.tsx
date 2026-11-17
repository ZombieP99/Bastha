'use client';
import { useMounted } from '@/hooks/useMounted';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import type { Product as CatalogProduct } from '@/types';
import type { Dictionary } from '@/types/dictionary';
import { motion } from 'framer-motion';
import { Heart,ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export interface Product {
  id: string;
  listingId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  inStock: boolean;
  category: string;
  original: CatalogProduct;
}

interface ProductCardProps {
  product: Product;
  dict: Dictionary;
  lang: string;
}

export default function ProductCard({ product, dict, lang }: ProductCardProps) {
  const isAr = lang === 'ar';

  const mounted=useMounted();
  const storedLike = useWishlistStore(s=>s.items.some(item=>item._id===product.id));
  const isLiked=mounted && storedLike;
  const toggleWishlist = useWishlistStore(s=>s.toggleWishlist);
  const [adding, setAdding] = useState(false);
  const router = useRouter();
  const { addItem } = useCartStore();
  const { token } = useAuthStore();

  const handleCardClick = () => {
    router.push(`/${lang}/products/${product.id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!token) {
      toast.error(isAr ? 'يرجى تسجيل الدخول أولاً' : 'Please log in first');
      router.push(`/${lang}/auth?mode=login`);
      return;
    }

    if (!product.inStock) return;

    setAdding(true);
    try {
      await addItem(product.listingId, 1);
      toast.success(isAr ? 'تمت الإضافة إلى السلة ✓' : 'Added to cart ✓');
    } catch {
      toast.error(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'Error, please try again');
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group relative cursor-pointer"
      role="link" tabIndex={0} onKeyDown={e=>{if(e.target===e.currentTarget && e.key==='Enter')handleCardClick();}}
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image 
          src={product.image} 
          alt={product.name} 
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        
        {/* Like Button */}
        <button aria-label={isAr?'المفضلة':'Wishlist'} aria-pressed={isLiked}
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleWishlist(product.original); }}
          className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} z-10 p-2.5 rounded-full backdrop-blur-md transition-all ${
            isLiked ? 'bg-red-50 text-red-500' : 'bg-white/80 text-gray-500 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Stock Badge */}
        {!product.inStock && (
          <div className="absolute top-4 left-4 right-4 text-center">
            <span className="bg-red-500 text-white font-bold px-4 py-1.5 rounded-full text-sm shadow-md">
              {dict?.shopsPage?.shopDetails?.outOfStock}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-5 flex flex-col flex-1 ${isAr ? 'text-right' : 'text-left'}`}>
        <div className="text-xs font-bold text-gray-400 mb-2 tracking-wider uppercase">
          {product.category}
        </div>
        
        <h3 className="font-extrabold text-lg text-[#1a365d] mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Price & Action */}
        <div className={`flex items-center justify-between mt-auto pt-4 border-t border-gray-50 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="flex flex-col">
            <span className="text-sm text-gray-400 font-medium">{dict?.shopsPage?.shopDetails?.price}</span>
            <span className="text-xl font-extrabold text-[#1a365d]">
              {product.price} <span className="text-sm">₪</span>
            </span>
          </div>

          <motion.button 
            onClick={handleAddToCart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!product.inStock || adding}
            className={`p-3 rounded-xl flex items-center justify-center transition-colors shadow-sm ${
              product.inStock && !adding
                ? 'bg-[#1a365d] text-white hover:bg-blue-700' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={dict?.shopsPage?.shopDetails?.addToCart}
          >
            <ShoppingCart className={`w-5 h-5 ${adding ? 'animate-pulse' : ''}`} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
