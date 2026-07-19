'use client';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock } from 'lucide-react';

interface ShopDetailsHeaderProps {
  shop: {
    name: string;
    description: string;
    coverImage: string;
    logo?: string;
    rating: number;
    tags: string[];
  };
  dict: any;
  lang: string;
}

export default function ShopDetailsHeader({ shop, dict, lang }: ShopDetailsHeaderProps) {
  const isAr = lang === 'ar';

  return (
    <div className="container mx-auto px-4 md:px-8 mt-8 mb-12">
      <div className={`bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12 flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-12 ${isAr ? 'md:flex-row-reverse' : ''}`}>
        
        {/* Logo (Optional) */}
        {shop.logo ? (
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border border-gray-100 shadow-sm overflow-hidden bg-white flex-shrink-0">
            <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border border-gray-100 shadow-sm bg-gradient-to-br from-[#1a365d] to-[#2b4c7e] flex items-center justify-center flex-shrink-0">
            <span className="text-6xl text-white font-extrabold">{shop.name.charAt(0)}</span>
          </div>
        )}

        {/* Shop Info */}
        <div className={`flex-1 w-full ${isAr ? 'text-center md:text-right' : 'text-center md:text-left'}`}>
          
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 ${isAr ? 'md:flex-row-reverse' : ''}`}>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#1a365d]">
              {shop.name}
            </h1>
            
            <div className={`flex items-center justify-center gap-2 bg-yellow-50 px-5 py-2.5 rounded-2xl border border-yellow-100 ${isAr ? 'flex-row-reverse' : ''}`}>
              <Star className="w-6 h-6 fill-[#eab308] text-[#eab308]" />
              <span className="font-extrabold text-xl text-[#846b2b]">{shop.rating}</span>
            </div>
          </div>

          <p className="text-gray-600 text-lg mb-8 max-w-3xl font-medium leading-relaxed">
            {shop.description}
          </p>

          <div className={`flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold text-gray-600 ${isAr ? 'md:justify-end' : 'md:justify-start'}`}>
            <div className={`flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
              <MapPin className="w-5 h-5 text-[#1a365d]" />
              <span>{isAr ? 'غزة، فلسطين' : 'Gaza, Palestine'}</span>
            </div>
            <div className={`flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
              <Clock className="w-5 h-5 text-[#1a365d]" />
              <span>{isAr ? 'مفتوح الآن (٠٩:٠٠ - ٢٣:٠٠)' : 'Open Now (09:00 - 23:00)'}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
