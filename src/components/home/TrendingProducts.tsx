'use client';
import ProductCard from '@/components/products/ProductCard';
import { getFeaturedProducts } from '@/lib/api';
import { Product } from '@/types';
import type { Dictionary } from '@/types/dictionary';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect,useState } from 'react';

export default function TrendingProducts({ dict, lang }: { dict: Dictionary, lang: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed,setFailed]=useState(false);
  const [retry,setRetry]=useState(0);

  useEffect(() => {
    let active=true;
    getFeaturedProducts(4).then((data) => {
      if(!active)return;
      setProducts(data);
      setLoading(false);
    }).catch(()=>{if(active)setFailed(true);}).finally(() => {if(active)setLoading(false);});
    return ()=>{active=false;};
  }, [retry]);

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

  if(failed)return <div role="alert" className="container mx-auto px-4 py-8"><p>{lang==='ar'?'تعذر تحميل هذا القسم':'Unable to load this section'}</p><button onClick={()=>{setFailed(false);setLoading(true);setRetry(n=>n+1);}}>{lang==='ar'?'إعادة المحاولة':'Retry'}</button></div>;
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
        <Link className="font-bold underline" href={`/${lang}/products`}>{lang==='ar'?'عرض الكل':'View all'}</Link>
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
