'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductGrid from './ProductGrid';
import { Product } from './ProductCard';
import { Star, MessageSquare } from 'lucide-react';

interface ShopTabsProps {
  shop: any;
  products: Product[];
  dict: any;
  lang: string;
}

export default function ShopTabs({ shop, products, dict, lang }: ShopTabsProps) {
  const isAr = lang === 'ar';
  
  // Tabs: 'overview' | 'products' | 'reviews'
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'reviews'>('overview');

  const tabs = [
    { id: 'overview', label: dict?.shopsPage?.shopDetails?.overview || (isAr ? 'نظرة عامة' : 'Overview') },
    { id: 'products', label: dict?.shopsPage?.shopDetails?.products || (isAr ? 'المنتجات' : 'Products') },
    { id: 'reviews', label: dict?.shopsPage?.shopDetails?.reviews || (isAr ? 'التقييمات' : 'Reviews') },
  ];

  return (
    <div className="w-full">
      {/* Section Tabs */}
      <div className={`flex items-center gap-8 mb-8 border-b border-gray-200 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-2 transition-colors relative ${
              activeTab === tab.id 
                ? 'text-[#1a365d] font-extrabold border-b-4 border-[#1a365d]' 
                : 'text-gray-400 hover:text-gray-600 font-bold'
            }`}
          >
            <h2 className="text-xl">{tab.label}</h2>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className={`bg-white rounded-3xl p-8 border border-gray-100 shadow-sm ${isAr ? 'text-right' : 'text-left'}`}>
              <h3 className="text-2xl font-bold text-[#1a365d] mb-4">
                {isAr ? 'عن المحل' : 'About the Shop'}
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {shop.description}
              </p>
              
              <h3 className="text-xl font-bold text-[#1a365d] mb-4">
                {isAr ? 'الموقع الجغرافي' : 'Location'}
              </h3>
              <p className="text-gray-700 text-lg">
                {isAr ? 'غزة، فلسطين - يقع المتجر في وسط المدينة ليقدم لكم أفضل الخدمات وأجود المنتجات.' : 'Gaza, Palestine - Located in the city center to provide you with the best services and highest quality products.'}
              </p>
            </div>
          )}

          {activeTab === 'products' && (
            <ProductGrid products={products} dict={dict} lang={lang} />
          )}

          {activeTab === 'reviews' && (
            <div className={`bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm ${isAr ? 'text-right' : 'text-left'}`}>
              
              {!isSubmitted ? (
                <div>
                  <h3 className="text-2xl font-bold text-[#1a365d] mb-2">
                    {isAr ? 'أضف تقييمك' : 'Add your review'}
                  </h3>
                  <p className="text-gray-500 mb-8">
                    {isAr ? 'رأيك يهمنا ويساعدنا على تحسين خدماتنا' : 'Your opinion matters and helps us improve our services'}
                  </p>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-3">
                      {isAr ? 'التقييم' : 'Rating'}
                    </label>
                    <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse justify-end' : ''}`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star 
                            className={`w-8 h-8 transition-colors ${
                              star <= (hoveredRating || rating) 
                                ? 'fill-[#eab308] text-[#eab308]' 
                                : 'text-gray-300'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-3">
                      {isAr ? 'التعليق' : 'Comment'}
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={isAr ? 'اكتب تجربتك مع المتجر هنا...' : 'Write your experience with the shop here...'}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-700 outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] transition-all min-h-[120px] resize-y"
                    ></textarea>
                  </div>

                  <button
                    onClick={() => {
                      if (rating > 0 && comment.trim() !== '') {
                        setIsSubmitted(true);
                        // Here you would normally send the data to your backend
                      }
                    }}
                    disabled={rating === 0 || comment.trim() === ''}
                    className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold transition-all shadow-sm ${
                      rating > 0 && comment.trim() !== ''
                        ? 'bg-[#1a365d] text-white hover:bg-blue-800'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isAr ? 'إرسال التقييم' : 'Submit Review'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Star className="w-10 h-10 text-green-500 fill-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a365d] mb-3">
                    {isAr ? 'شكراً لتقييمك!' : 'Thank you for your review!'}
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    {isAr ? 'تم إرسال تقييمك بنجاح، نقدر وقتك ومشاركتك لتجربتك.' : 'Your review has been successfully submitted. We appreciate your time and sharing your experience.'}
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setRating(0);
                      setComment('');
                    }}
                    className="mt-8 text-[#1a365d] font-bold underline hover:text-blue-800"
                  >
                    {isAr ? 'إضافة تقييم آخر' : 'Add another review'}
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
