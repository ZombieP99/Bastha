'use client';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  inStock: boolean;
  category: string;
}

interface ProductCardProps {
  product: Product;
  dict: any;
  lang: string;
}

export default function ProductCard({ product, dict, lang }: ProductCardProps) {
  const isAr = lang === 'ar';
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/${lang}/products/${product.id}`} className="flex flex-col h-full cursor-pointer">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Like Button */}
        <button 
          onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
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
              {product.price} <span className="text-sm">{dict?.shopsPage?.shopDetails?.currency}</span>
            </span>
          </div>

          <motion.button 
            onClick={(e) => e.preventDefault()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!product.inStock}
            className={`p-3 rounded-xl flex items-center justify-center transition-colors shadow-sm ${
              product.inStock 
                ? 'bg-[#1a365d] text-white hover:bg-blue-700' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={dict?.shopsPage?.shopDetails?.addToCart}
          >
            <ShoppingCart className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
      </Link>
    </motion.div>
  );
}
