'use client';
import { Heart, ShoppingCart, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NewArrivals({ dict, lang }: { dict: any, lang: string }) {
  const products = [
    {
      id: 5,
      title: dict.lang === 'en' ? 'Minimalist Leather Backpack' : 'حقيبة ظهر جلدية بتصميم بسيط',
      category: dict.categories?.items?.fashion || 'Fashion',
      price: 320,
      rating: 5.0,
      reviews: 12,
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 6,
      title: dict.lang === 'en' ? 'Ceramic Coffee Pour-over Set' : 'طقم تحضير قهوة سيراميك',
      category: dict.categories?.items?.home || 'Home',
      price: 150,
      rating: 4.8,
      reviews: 34,
      image: 'https://images.unsplash.com/photo-1495474472205-51f750c07c1b?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 7,
      title: dict.lang === 'en' ? 'Fitness Smartwatch Pro' : 'ساعة ذكية رياضية برو',
      category: dict.categories?.items?.electronics || 'Electronics',
      price: 299,
      rating: 4.9,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 8,
      title: dict.lang === 'en' ? 'Natural Soy Wax Candle' : 'شمعة طبيعية من صويا واكس',
      category: dict.categories?.items?.gifts || 'Gifts',
      price: 45,
      rating: 4.7,
      reviews: 56,
      image: 'https://images.unsplash.com/photo-1602874801007-bd458cb6c975?q=80&w=800&auto=format&fit=crop',
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <section className="bg-[#f8fafc] py-16 mt-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-[#e1eaf5] text-[#1a365d] rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-extrabold text-[#1a365d] mb-3">{dict?.newArrivals?.title || 'New Arrivals'}</h2>
          <p className="text-gray-500 max-w-2xl">{dict?.newArrivals?.subtitle || 'Discover the latest products.'}</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <Link href={`/${lang}/products/${product.id}`} key={product.id}>
              <motion.div variants={itemVariants} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer relative top-0 hover:-top-2">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className={`absolute top-3 ${lang === 'ar' ? 'left-3' : 'right-3'} bg-[#1a365d] text-white px-3 py-1 rounded-full text-xs font-bold shadow-md`}>
                    {dict.trending?.new || 'NEW'}
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs text-[#6a9bc3] font-bold mb-2 block uppercase tracking-wider">{product.category}</span>
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 leading-snug group-hover:text-[#1a365d] transition-colors">{product.title}</h3>
                  
                  <div className="flex items-center gap-1 mb-4 mt-auto">
                    <Star className="w-4 h-4 text-[#eab308] fill-[#eab308]" />
                    <span className="text-sm font-bold text-gray-700">{product.rating}</span>
                    <span className="text-xs text-gray-400">({product.reviews})</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
                    <div className="font-extrabold text-[#1a365d] text-xl">
                      {lang === 'en' ? dict.common?.currency || '$' : ''} {product.price} {lang === 'ar' ? dict.common?.currency || 'ر.س' : ''}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#1a365d] group-hover:text-white transition-colors">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
