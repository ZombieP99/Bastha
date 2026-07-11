'use client';
import { Heart, ShoppingCart, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrendingProducts({ dict, lang }: { dict: any, lang: string }) {
  const products = [
    {
      id: 1,
      title: dict.lang === 'en' ? 'Noise Cancelling Wireless Headphones' : 'سماعة رأس لاسلكية عازلة للضوضاء',
      category: dict.categories.items.electronics,
      price: 240,
      rating: 4.8,
      reviews: 120,
      image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop',
      badge: { text: dict.trending.discount, type: 'discount' }
    },
    {
      id: 2,
      title: dict.lang === 'en' ? 'Organic Skincare Set' : 'مجموعة العناية بالبشرة العضوية',
      category: dict.categories.items.health,
      price: 180,
      rating: 4.9,
      reviews: 85,
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop',
      badge: null
    },
    {
      id: 3,
      title: dict.lang === 'en' ? 'Luxury Classic Watch' : 'ساعة كلاسيكية فاخرة',
      category: dict.categories.items.fashion,
      price: 550,
      rating: 4.7,
      reviews: 56,
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop',
      badge: { text: dict.trending.new, type: 'new' }
    },
    {
      id: 4,
      title: dict.lang === 'en' ? 'Smart Home Assistant - 5th Gen' : 'مساعد منزلي ذكي - الجيل الخامس',
      category: dict.lang === 'en' ? 'Smart Home' : 'منزل ذكي',
      price: 399,
      rating: 4.6,
      reviews: 230,
      image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=800&auto=format&fit=crop',
      badge: null
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <section className="container mx-auto px-4 md:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1a365d] mb-2">{dict.trending.title}</h2>
          <p className="text-gray-500">{dict.trending.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#1a365d] hover:text-white hover:border-[#1a365d] transition-colors">
            {lang === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#1a365d] hover:text-white hover:border-[#1a365d] transition-colors">
            {lang === 'ar' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {products.map((product) => (
          <motion.div key={product.id} variants={itemVariants} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group border border-gray-100 flex flex-col h-full">
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              <button className={`absolute top-3 ${lang === 'ar' ? 'right-3' : 'left-3'} w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition-colors`}>
                <Heart className="w-4 h-4" />
              </button>
              
              {product.badge && (
                <div className={`absolute ${product.badge.type === 'new' ? `top-3 ${lang === 'ar' ? 'left-3' : 'right-3'} bg-[#1a365d] text-white` : `bottom-3 ${lang === 'ar' ? 'right-3' : 'left-3'} bg-[#eab308] text-[#1a365d]`} px-3 py-1 rounded-full text-xs font-bold`}>
                  {product.badge.text}
                </div>
              )}
            </div>
            
            <div className="p-5 flex flex-col flex-1">
              <span className="text-xs text-gray-400 font-medium mb-1 block">{product.category}</span>
              <h3 className="font-bold text-[#1a365d] mb-2 line-clamp-2 leading-snug">{product.title}</h3>
              
              <div className="flex items-center gap-1 mb-4 mt-auto">
                <Star className="w-3.5 h-3.5 text-[#eab308] fill-[#eab308]" />
                <span className="text-sm font-bold text-gray-700">{product.rating}</span>
                <span className="text-xs text-gray-400">({product.reviews} {dict.trending.reviews})</span>
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-50">
                <div className="font-extrabold text-[#1a365d] text-lg flex items-center gap-1">
                  {lang === 'en' ? dict.common.currency : ''} {product.price} {lang === 'ar' ? dict.common.currency : ''}
                </div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-full bg-[#e1eaf5] text-[#1a365d] flex items-center justify-center hover:bg-[#1a365d] hover:text-white transition-colors">
                  <ShoppingCart className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
