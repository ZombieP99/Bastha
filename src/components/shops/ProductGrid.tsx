'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, PackageOpen } from 'lucide-react';
import ProductCard, { Product } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  dict: any;
  lang: string;
}

export default function ProductGrid({ products, dict, lang }: ProductGridProps) {
  const isAr = lang === 'ar';
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
