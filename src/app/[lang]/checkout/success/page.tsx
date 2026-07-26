'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Package } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { motion } from 'framer-motion';

export default function SuccessPage({ params }: { params: Promise<any> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang as 'en' | 'ar';
  const isAr = lang === 'ar';
  
  const clearCart = useCartStore(state => state.clearCart);

  useEffect(() => {
    // Clear the cart when reaching the success page
    clearCart();
  }, [clearCart]);

  const orderNumber = Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-12 pb-20 flex items-center justify-center">
      <div className="container mx-auto px-4">
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 text-center"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>

          <h1 className="text-3xl font-extrabold text-[#1a365d] mb-4">
            {isAr ? 'تم استلام طلبك بنجاح!' : 'Order received successfully!'}
          </h1>
          
          <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto leading-relaxed">
            {isAr 
              ? 'شكراً لتسوقك معنا. سيتم تجهيز طلبك في أسرع وقت. سيتصل بك مندوبنا قريباً.' 
              : 'Thank you for shopping with us. Your order will be processed quickly. Our agent will contact you soon.'}
          </p>

          <div className="bg-[#f8fbff] border border-[#eaf1f8] rounded-2xl p-6 mb-10 flex flex-col items-center gap-2">
            <span className="text-gray-500 text-sm font-bold">{isAr ? 'رقم الطلب' : 'Order Number'}</span>
            <span className="text-3xl font-black text-[#2b4c7e] tracking-wider">#{orderNumber}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${lang}/orders`}>
              <button className="w-full sm:w-auto text-[#1a365d] bg-gray-50 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                <Package className="w-5 h-5" />
                {isAr ? 'تتبع الطلب' : 'Track Order'}
              </button>
            </Link>
            <Link href={`/${lang}/products`}>
              <button className="w-full sm:w-auto bg-[#1a365d] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#2b4c7e] transition-colors shadow-md flex items-center justify-center gap-2">
                {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
                <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
