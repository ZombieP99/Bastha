'use client';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import ShopCard, { Shop } from './ShopCard';

export default function ShopGrid({ dict, lang }: { dict: any; lang: string }) {
  const isAr = lang === 'ar';

  const shops: Shop[] = [
    {
      id: 1,
      name: isAr ? 'بيت المخبوزات' : 'Bakery House',
      description: isAr ? 'مخبوزات طازجة يومياً' : 'Freshly baked goods daily',
      coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=200&auto=format&fit=crop',
      rating: 4.7,
      tags: [dict?.shopsPage?.categories?.restaurants, dict?.shopsPage?.categories?.sweets]
    },
    {
      id: 2,
      name: isAr ? 'نبع الطبيعة' : 'Nature Spring',
      description: isAr ? 'عناية بالبشرة طبيعية' : 'Natural skincare products',
      coverImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800&auto=format&fit=crop',
      logo: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=200&auto=format&fit=crop',
      rating: 4.5,
      tags: [dict?.shopsPage?.categories?.beauty, dict?.shopsPage?.categories?.organic]
    },
    {
      id: 3,
      name: isAr ? 'تراث الجلود' : 'Leather Heritage',
      description: isAr ? 'صناعة يدوية فاخرة' : 'Luxury handmade leather goods',
      coverImage: 'https://images.unsplash.com/photo-1548863227-3af567fc3b27?q=80&w=800&auto=format&fit=crop',
      logo: 'https://images.unsplash.com/photo-1590845947698-8924d7409b56?q=80&w=200&auto=format&fit=crop',
      rating: 4.9,
      tags: [dict?.shopsPage?.categories?.fashion, dict?.shopsPage?.categories?.leather]
    },
    {
      id: 4,
      name: isAr ? 'زمرد للمجوهرات' : 'Emerald Jewelry',
      description: isAr ? 'أناقة وأحجار كريمة' : 'Elegance and precious stones',
      coverImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
      logo: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=200&auto=format&fit=crop',
      rating: 4.8,
      tags: [dict?.shopsPage?.categories?.jewelry, dict?.shopsPage?.categories?.gifts]
    },
    {
      id: 5,
      name: isAr ? 'نشاط ورياضة' : 'Active & Sports',
      description: isAr ? 'ملابس رياضية وأدوات' : 'Sportswear and equipment',
      coverImage: 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?q=80&w=800&auto=format&fit=crop',
      logo: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?q=80&w=200&auto=format&fit=crop',
      rating: 4.4,
      tags: [dict?.shopsPage?.categories?.fashion, dict?.shopsPage?.categories?.sports]
    },
    {
      id: 6,
      name: isAr ? 'عالم التقنية' : 'Tech Oasis',
      description: isAr ? 'أحدث الأجهزة الذكية' : 'Latest smart devices',
      coverImage: 'https://images.unsplash.com/photo-1531297172867-4d6537f05218?q=80&w=800&auto=format&fit=crop',
      logo: 'https://images.unsplash.com/photo-1550009158-9ebf6d250400?q=80&w=200&auto=format&fit=crop',
      rating: 4.6,
      tags: [dict?.categories?.items?.electronics]
    },
    {
      id: 7,
      name: isAr ? 'واحة القارئ' : 'Readers Oasis',
      description: isAr ? 'كتب وروايات متنوعة' : 'Books and diverse novels',
      coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop',
      logo: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=200&auto=format&fit=crop',
      rating: 4.9,
      tags: [dict?.categories?.items?.toys]
    },
    {
      id: 8,
      name: isAr ? 'ألعاب الفرح' : 'Joy Toys',
      description: isAr ? 'ألعاب أطفال آمنة' : 'Safe kids toys',
      coverImage: 'https://images.unsplash.com/photo-1558066160-58c9735d4872?q=80&w=800&auto=format&fit=crop',
      logo: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=200&auto=format&fit=crop',
      rating: 4.8,
      tags: [dict?.categories?.items?.toys, dict?.shopsPage?.categories?.gifts]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <section className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      
      {/* Header and Filter */}
      <div className={`flex flex-col md:flex-row items-center justify-between gap-4 mb-10 ${isAr ? 'md:flex-row-reverse' : ''}`}>
        <h2 className="text-3xl font-extrabold text-[#1a365d]">
          {dict?.shopsPage?.title}
        </h2>
        
        {/* Dropdown visual */}
        <div className="relative">
          <button className="flex items-center gap-2 bg-[#f0f4f8] text-[#1a365d] px-5 py-2.5 rounded-xl font-bold border border-transparent hover:border-gray-200 transition-colors">
            {dict?.shopsPage?.filters?.newest}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} dict={dict} lang={lang} />
        ))}
      </motion.div>
      
    </section>
  );
}
