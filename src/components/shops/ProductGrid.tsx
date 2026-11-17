'use client';
import type { Dictionary } from '@/types/dictionary';
import { AnimatePresence,motion } from 'framer-motion';
import { PackageOpen } from 'lucide-react';
import { useMemo,useState } from 'react';
import ProductCard,{ Product } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  dict: Dictionary;
  lang: string;
}

export default function ProductGrid({ products, dict, lang }: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="w-full">
      <label className="block mb-6">{lang==='ar'?'البحث في منتجات المتجر':'Search shop products'}<input className="block border rounded-xl p-3 w-full mt-2" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/></label>


      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} dict={dict} lang={lang} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-3xl border border-gray-100 border-dashed">
          <PackageOpen className="w-16 h-16 mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-[#1a365d] mb-2">{dict?.shopsPage?.noResults || 'No products found'}</h3>
        </div>
      )}
    </div>
  );
}
