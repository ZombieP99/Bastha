'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MonitorSmartphone, 
  Shirt, 
  Armchair, 
  ShieldPlus, 
  Baby, 
  Utensils,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

export default function Categories({ dict, lang }: { dict: any, lang: string }) {
  const categories = [
    { id: 1, name: dict.categories.items.electronics, icon: MonitorSmartphone },
    { id: 2, name: dict.categories.items.fashion, icon: Shirt },
    { id: 3, name: dict.categories.items.home, icon: Armchair },
    { id: 4, name: dict.categories.items.health, icon: ShieldPlus },
    { id: 5, name: dict.categories.items.toys, icon: Baby },
    { id: 6, name: dict.categories.items.food, icon: Utensils },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <section className="container mx-auto px-4 md:px-8 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1a365d] mb-2">{dict.categories.title}</h2>
          <p className="text-gray-500">{dict.categories.subtitle}</p>
        </div>
        <Link href={`/${lang}/shops`} className="flex items-center gap-2 text-[#1a365d] font-bold hover:text-blue-700 transition group">
          {dict.categories.viewAll}
          {lang === 'ar' ? (
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          ) : (
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          )}
        </Link>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <motion.div key={category.id} variants={itemVariants}>
              <Link 
                href="#"
                className="flex flex-col items-center justify-center p-6 bg-[#e1eaf5] rounded-2xl hover:bg-[#d0dbe9] transition-colors group h-full"
              >
                <div className="bg-white p-4 rounded-xl shadow-sm text-[#1a365d] mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8" />
                </div>
                <span className="font-bold text-[#1a365d] text-center">{category.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
