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
    <div className="relative mb-12">
      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full relative rounded-3xl overflow-hidden shadow-sm">
        <img 
          src={shop.coverImage} 
          alt={shop.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 md:px-8">
        <div className={`relative -mt-20 md:-mt-24 z-10 flex flex-col md:flex-row items-start md:items-end gap-6 ${isAr ? 'md:flex-row-reverse' : ''}`}>
          
          {/* Logo (Optional) */}
          {shop.logo ? (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-[#f0f4f8] shadow-xl overflow-hidden bg-white flex-shrink-0">
              <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-[#f0f4f8] shadow-xl bg-gradient-to-br from-[#1a365d] to-[#2b4c7e] flex items-center justify-center flex-shrink-0">
              <span className="text-5xl text-white font-extrabold">{shop.name.charAt(0)}</span>
            </div>
          )}

          {/* Shop Info */}
          <div className={`flex-1 w-full bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl mt-4 md:mt-0 border border-white/20 ${isAr ? 'text-right' : 'text-left'}`}>
            
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3 ${isAr ? 'md:flex-row-reverse' : ''}`}>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a365d]">
                {shop.name}
              </h1>
              
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl shadow-sm border border-gray-100 self-start md:self-auto">
                <span className="font-bold text-lg text-[#1a365d]">{shop.rating}</span>
                <Star className="w-5 h-5 fill-[#eab308] text-[#eab308]" />
              </div>
            </div>

            <p className="text-gray-600 text-lg mb-6 max-w-2xl font-medium leading-relaxed">
              {shop.description}
            </p>

            <div className={`flex flex-wrap items-center gap-4 text-sm font-bold text-gray-500 ${isAr ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                <MapPin className="w-4 h-4 text-[#1a365d]" />
                <span>Riyadh, SA</span>
              </div>
              <div className={`flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
                <Clock className="w-4 h-4 text-[#1a365d]" />
                <span>Open Now (09:00 - 23:00)</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
