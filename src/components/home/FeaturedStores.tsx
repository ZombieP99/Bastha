'use client';
import { BadgeCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FeaturedStores({ dict, lang }: { dict: any, lang: string }) {
  const stores = [
    {
      id: 1,
      name: lang === 'en' ? 'Purity Harvest' : 'حصاد النقاء',
      description: lang === 'en' ? '100% organic and natural products directly from local farms to your table.' : 'منتجات عضوية وطبيعية ١٠٠٪ مباشرة من المزارع المحلية إلى مائدتكم.',
      logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop',
      verified: true,
      itemsCount: '+25'
    },
    {
      id: 2,
      name: lang === 'en' ? 'Elegance Boutique' : 'بوتيك الأناقة',
      description: lang === 'en' ? 'Modern designs that suit all tastes and occasions with quality fabrics.' : 'تصاميم عصرية تناسب جميع الأذواق والمناسبات مع جودة أقمشة لا...',
      logo: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=200&auto=format&fit=crop',
      verified: true,
      itemsCount: '+80'
    },
    {
      id: 3,
      name: lang === 'en' ? 'TechNova Electronics' : 'تك نوفا للإلكترونيات',
      description: lang === 'en' ? 'The latest smart devices and accessories with warranty and after-sales service.' : 'أحدث الأجهزة الذكية وملحقاتها بضمان الوكيل وخدمة ما بعد البيع...',
      logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=200&auto=format&fit=crop',
      verified: true,
      itemsCount: '+50'
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
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <section className="container mx-auto px-4 md:px-8 py-12">
      <div className="bg-[#eaf1f8] rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
        
        <div className={`absolute top-0 ${lang === 'ar' ? 'right-0 -translate-y-1/2 translate-x-1/4' : 'left-0 -translate-y-1/2 -translate-x-1/4'} w-64 h-64 bg-white/40 blur-3xl rounded-full`}></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
            <h2 className="text-3xl font-extrabold text-[#1a365d] mb-2">{dict.stores.title}</h2>
            <p className="text-[#1a365d]/70 font-medium">{dict.stores.subtitle}</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white text-[#1a365d] font-bold px-6 py-3 rounded-xl shadow-sm border border-white hover:border-[#1a365d]/20 hover:shadow-md transition-all self-start">
            {dict.stores.browseAll}
          </motion.button>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10"
        >
          {stores.map((store) => (
            <motion.div key={store.id} variants={itemVariants} className="bg-white rounded-3xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-extrabold text-lg text-[#1a365d] mb-1">{store.name}</h3>
                  {store.verified && (
                    <div className="flex items-center gap-1 text-xs font-bold text-[#846b2b]">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      {dict.stores.verified}
                    </div>
                  )}
                </div>
                <div className={`w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50 ${lang === 'ar' ? 'mr-4' : 'ml-4'}`}>
                  <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                </div>
              </div>
              
              <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">
                {store.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                <Link href="#" className="flex items-center gap-2 text-[#2b4c7e] font-bold text-sm hover:text-[#1a365d] transition-colors group">
                  {dict.stores.visit}
                  {lang === 'ar' ? (
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </Link>
                
                <div className="flex items-center -space-x-2 space-x-reverse">
                  <div className="w-8 h-8 rounded-full bg-[#8b9bb4]/20 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-[#8b9bb4]/40 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-[#2b4c7e] border-2 border-white text-white text-[10px] font-bold flex items-center justify-center z-10">
                    {store.itemsCount}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
