'use client';
import { Heart, ShoppingCart, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getFeaturedProducts } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';

export default function TrendingProducts({ dict, lang }: { dict: any, lang: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProducts(4).then((data) => {
      setProducts(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a365d]"></div></div>;
  }

  if (products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 md:px-8 py-12 relative">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">{dict.trending.title}</h2>
          <p className="text-gray-500 font-medium">{dict.trending.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            {lang === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <button className="w-10 h-10 rounded-full bg-[#1a365d] flex items-center justify-center text-white hover:bg-[#2b4c7e] transition-colors shadow-md">
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
          <motion.div variants={itemVariants} key={product._id}>
            <ProductCard product={product} lang={lang} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
