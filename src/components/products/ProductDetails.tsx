'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Shield, Truck, RotateCcw, Share2, Store, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface ProductDetailsProps {
  dict: any;
  lang: string;
  productId: string;
}

export default function ProductDetails({ dict, lang, productId }: ProductDetailsProps) {
  const isAr = lang === 'ar';
  const [activeImage, setActiveImage] = useState(0);

  // Mock product data
  const product = {
    id: productId,
    title: dict.lang === 'en' ? 'Sony WH-1000XM5 Wireless Noise Canceling Headphones' : 'سماعات سوني WH-1000XM5 اللاسلكية العازلة للضوضاء',
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviewsCount: 1245,
    category: dict.categories?.items?.electronics || 'Electronics',
    inStock: true,
    description: dict.lang === 'en' 
      ? 'Industry-leading noise cancellation optimized to you. Magnificent Sound, engineered to perfection. Crystal clear hands-free calling. Up to 30-hour battery life with quick charging.' 
      : 'عزل ضوضاء رائد في الصناعة ومحسن خصيصاً لك. صوت مذهل مصمم بإتقان. مكالمات واضحة جداً بدون استخدام اليدين. بطارية تدوم حتى 30 ساعة مع شحن سريع.',
    images: [
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1000&auto=format&fit=crop',
    ],
    features: [
      dict.lang === 'en' ? 'Active Noise Cancellation' : 'عزل نشط للضوضاء',
      dict.lang === 'en' ? '30 Hours Battery Life' : 'بطارية تدوم 30 ساعة',
      dict.lang === 'en' ? 'Bluetooth 5.2' : 'بلوتوث 5.2',
      dict.lang === 'en' ? 'Touch Controls' : 'تحكم باللمس'
    ],
    stores: [
      { id: '1', name: dict.lang === 'en' ? 'ElectroWorld' : 'عالم الإلكترونيات', price: 349.99, rating: 4.9 },
      { id: '2', name: dict.lang === 'en' ? 'TechHub' : 'تيك هب', price: 355.00, rating: 4.6 },
      { id: '3', name: dict.lang === 'en' ? 'SoundStore' : 'متجر الصوتيات', price: 360.00, rating: 4.7 }
    ]
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <Link href={`/${lang}`} className="hover:text-[#1a365d] transition">{dict.nav?.home || 'Home'}</Link>
        <span>/</span>
        <Link href={`/${lang}/search?category=${product.category}`} className="hover:text-[#1a365d] transition">{product.category}</Link>
        <span>/</span>
        <span className="text-[#1a365d] font-medium truncate w-48">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
            <motion.img 
              key={activeImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={product.images[activeImage]} 
              alt={product.title} 
              className="w-full h-full object-cover"
            />
            <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} bg-white/90 backdrop-blur-md p-2 rounded-full cursor-pointer hover:bg-white transition hover:text-red-500 shadow-sm`}>
              <Heart className="w-5 h-5 text-gray-400 hover:fill-red-500 hover:text-red-500 transition" />
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#1a365d] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full mb-3 uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a365d] mb-4 leading-tight">
              {product.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1 bg-[#fff8e1] px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-[#eab308] fill-[#eab308]" />
                <span className="font-bold text-gray-800">{product.rating}</span>
                <span className="text-gray-500 text-sm ml-1">({product.reviewsCount} {dict.product?.reviews || 'Reviews'})</span>
              </div>
              <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
                <CheckCircle className="w-4 h-4" />
                {dict.product?.inStock || 'In Stock'}
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-[#1a365d]">
                {lang === 'en' ? dict.common?.currency || '$' : ''}{product.price}{lang === 'ar' ? dict.common?.currency || 'ر.س' : ''}
              </span>
              <span className="text-xl text-gray-400 line-through font-medium">
                {lang === 'en' ? dict.common?.currency || '$' : ''}{product.originalPrice}{lang === 'ar' ? dict.common?.currency || 'ر.س' : ''}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Quick Features */}
          <ul className="grid grid-cols-2 gap-3 mb-8">
            {product.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-gray-700 font-medium">
                <div className="w-2 h-2 rounded-full bg-[#6a9bc3]" />
                {feature}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-[#1a365d] text-white py-4 px-8 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#12284b] transition shadow-lg shadow-blue-900/20"
            >
              <ShoppingCart className="w-5 h-5" />
              {dict.product?.addToCart || 'Add to Cart'}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#1a365d] hover:border-[#1a365d] transition"
            >
              <Share2 className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-100 py-6">
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1a365d]">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-600">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1a365d]">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-600">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1a365d]">
                <RotateCcw className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-600">Free Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Stores Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-[#1a365d] mb-6 flex items-center gap-2">
          <Store className="w-6 h-6" />
          {dict.product?.availableStores || 'Available Stores'}
        </h2>
        
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-gray-100">
            {product.stores.map((store) => (
              <div key={store.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <Link href={`/${lang}/shops/${store.id}`} className="font-bold text-lg text-[#1a365d] hover:underline">
                      {store.name}
                    </Link>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Star className="w-3.5 h-3.5 text-[#eab308] fill-[#eab308]" />
                      <span>{store.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                  <span className="text-2xl font-black text-gray-800">
                    {lang === 'en' ? dict.common?.currency || '$' : ''}{store.price}{lang === 'ar' ? dict.common?.currency || 'ر.س' : ''}
                  </span>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-white border-2 border-[#1a365d] text-[#1a365d] font-bold rounded-lg hover:bg-[#1a365d] hover:text-white transition"
                  >
                    {dict.product?.addToCart || 'Add to Cart'}
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
