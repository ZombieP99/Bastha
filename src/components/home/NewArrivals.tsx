'use client';
import { Heart, Star, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getNewProducts } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';

export default function NewArrivals({ dict, lang }: { dict: any, lang: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNewProducts(1, 4).then((data) => {
      setProducts(data.products || []);
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
            <motion.div variants={itemVariants} key={product._id}>
              <ProductCard product={product} lang={lang} isNew={true} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
