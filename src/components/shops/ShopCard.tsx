'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Shop } from '@/types';
import { MapPin, CheckCircle2 } from 'lucide-react';

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
      <Link href={`/${lang}/shops/${shop._id}`} className="flex flex-col h-full cursor-pointer">
      {/* Cover Image & Rating */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <Image 
          src={shop.logoUrl || 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&q=80'} 
          alt={shop.name} 
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Rating Badge - Always top left based on design */}
        <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-xl font-bold text-sm text-[#1a365d] shadow-sm flex items-center gap-1 z-10">
          {shop.ratingAvg?.toFixed(1) || '0.0'} <span className="text-[#eab308] text-base leading-none">★</span>
        </div>
        
        {shop.isVerified && (
          <div className={`absolute top-4 ${isAr ? 'right-4' : 'right-4'} bg-green-500 text-white p-1.5 rounded-full shadow-sm z-10`} title={isAr ? 'متجر موثق' : 'Verified Shop'}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 relative z-20">
        <div className={`flex flex-col gap-2 mb-4 ${isAr ? 'text-right' : 'text-left'}`}>
           <h3 className="font-extrabold text-xl text-[#1a365d] mb-1">{shop.name}</h3>
           <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{shop.description || (isAr ? 'لا يوجد وصف متاح' : 'No description available')}</p>
        </div>

        {/* Tags / Info */}
        <div className={`flex flex-wrap gap-2 mb-6 ${isAr ? 'justify-end' : 'justify-start'}`}>
          {shop.area && (
            <span className="flex items-center gap-1 bg-[#f0f4f8] text-[#4a5568] text-xs font-bold px-3 py-1.5 rounded-full border border-gray-100">
              <MapPin className="w-3 h-3" />
              {shop.area}
            </span>
          )}
          {typeof shop.category === 'object' && shop.category !== null && (
             <span className="bg-[#e1eaf5] text-[#2b4c7e] text-xs font-bold px-3 py-1.5 rounded-full">
               {isAr ? shop.category.nameAr : shop.category.name}
             </span>
          )}
        </div>

        {/* Visit Button */}
        <div className="mt-auto pt-4 border-t border-gray-50">
          <div className="w-full bg-[#2b4c7e] text-center text-white font-bold py-3.5 rounded-xl group-hover:bg-[#1a365d] transition-colors shadow-sm">
            {dict?.shopsPage?.visitShop || (isAr ? 'زيارة المتجر' : 'Visit Shop')}
          </div>
        </div>
      </div>
      </Link>
    </motion.div>
  );
}
