'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export interface Shop {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  logo: string;
  rating: number;
  tags: string[];
}

export default function ShopCard({ shop, dict, lang }: { shop: Shop; dict: any; lang: string }) {
  const isAr = lang === 'ar';

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
      }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full group"
    >
      {/* Cover Image & Rating */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={shop.coverImage} 
          alt={shop.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Rating Badge - Always top left based on design */}
        <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-xl font-bold text-sm text-[#1a365d] shadow-sm flex items-center gap-1 z-10">
          {shop.rating} <span className="text-[#eab308] text-base leading-none">★</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 relative z-20">
        <div className={`flex flex-col gap-2 mb-4 ${isAr ? 'text-right' : 'text-left'}`}>
           <h3 className="font-extrabold text-xl text-[#1a365d] mb-1">{shop.name}</h3>
           <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{shop.description}</p>
        </div>

        {/* Tags */}
        <div className={`flex flex-wrap gap-2 mb-8 ${isAr ? 'justify-end' : 'justify-start'}`}>
          {shop.tags.map((tag, idx) => (
            <span key={idx} className="bg-[#e1eaf5] text-[#2b4c7e] text-xs font-bold px-3 py-1.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Visit Button */}
        <div className="mt-auto pt-4 border-t border-gray-50">
          <Link href="#" className="block w-full">
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              className="w-full bg-[#2b4c7e] text-white font-bold py-3.5 rounded-xl hover:bg-[#1a365d] transition-colors shadow-sm"
            >
              {dict?.shopsPage?.visitShop}
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
