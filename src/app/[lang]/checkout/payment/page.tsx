'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, Banknote, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { motion } from 'framer-motion';

export default function PaymentPage({ params }: { params: Promise<any> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang as 'en' | 'ar';
  const isAr = lang === 'ar';
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const { getTotalPrice, items } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');

  useEffect(() => {
    setMounted(true);
    // If cart is empty and we mounted, maybe redirect to cart
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#f8fafc] pt-20" />;

  const subtotal = getTotalPrice();
  const shipping = items.length > 0 ? 15 : 0;
  const total = subtotal + shipping;

  const handleConfirmOrder = () => {
    // In a real app, send the order to the backend API here.
    // Since we don't have an order API yet, we just proceed to success page
    // and let the success page clear the cart.
    router.push(`/${lang}/checkout/success`);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-12 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center w-full max-w-xl">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">✓</div>
              <span className="text-sm font-bold mt-2 text-green-600">{isAr ? 'التوصيل' : 'Delivery'}</span>
            </div>
            <div className="flex-1 h-1 bg-green-500 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#1a365d] text-white flex items-center justify-center font-bold">2</div>
              <span className="text-sm font-bold mt-2 text-[#1a365d]">{isAr ? 'الدفع' : 'Payment'}</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">3</div>
              <span className="text-sm font-bold mt-2 text-gray-400">{isAr ? 'تأكيد' : 'Confirm'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                <CreditCard className="w-8 h-8 text-[#1a365d]" />
                <h1 className="text-2xl font-extrabold text-[#1a365d]">
                  {isAr ? 'طريقة الدفع' : 'Payment Method'}
                </h1>
              </div>

              <div className="space-y-4">
                {/* Cash on Delivery Option */}
                <label className={`cursor-pointer flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${paymentMethod === 'cod' ? 'border-[#1a365d] bg-[#f8fbff]' : 'border-gray-100 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-5 h-5 text-[#1a365d] focus:ring-[#1a365d]"
                  />
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">{isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</h3>
                    <p className="text-gray-500 text-sm mt-1">{isAr ? 'الدفع نقداً عند استلام طلبك بأمان' : 'Pay in cash safely upon arrival'}</p>
                  </div>
                </label>

                {/* Credit Card Option (Disabled Mock) */}
                <label className={`cursor-pointer flex items-center gap-4 p-5 rounded-2xl border-2 transition-all opacity-50 ${paymentMethod === 'card' ? 'border-[#1a365d] bg-[#f8fbff]' : 'border-gray-100 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="card"
                    disabled
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="w-5 h-5 text-[#1a365d] focus:ring-[#1a365d]"
                  />
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800 text-lg">{isAr ? 'البطاقة الائتمانية' : 'Credit Card'}</h3>
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-md font-bold">{isAr ? 'قريباً' : 'Soon'}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{isAr ? 'فيزا، ماستركارد، وأخرى' : 'Visa, Mastercard, etc.'}</p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Link href={`/${lang}/checkout/delivery`} className="w-full sm:w-auto">
                <button type="button" className="w-full text-gray-500 hover:text-gray-800 font-bold py-3 transition-colors flex items-center justify-center gap-2">
                  {isAr ? (
                    <><ArrowRight className="w-5 h-5" /> الرجوع لمعلومات التوصيل</>
                  ) : (
                    <><ArrowLeft className="w-5 h-5" /> Back to Delivery</>
                  )}
                </button>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-[380px]">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
                {isAr ? 'تفاصيل الفاتورة' : 'Invoice Details'}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>{isAr ? 'عدد المنتجات' : 'Products'}</span>
                  <span className="font-bold text-gray-800">{items.length}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="font-bold text-gray-800">{subtotal} ₪</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{isAr ? 'رسوم التوصيل' : 'Shipping'}</span>
                  <span className="font-bold text-gray-800">{shipping} ₪</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4 mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-2xl font-black text-[#1a365d]">{total} ₪</span>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-xl flex items-start gap-3 mb-8 border border-green-100">
                <ShieldCheck className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-green-800 leading-relaxed">
                  {isAr ? 'تسوق آمن ومضمون. سيتم الدفع نقداً عند استلام طلبك فقط.' : 'Safe and secure. You will pay in cash only when your order arrives.'}
                </p>
              </div>

              <button 
                onClick={handleConfirmOrder}
                className="w-full bg-[#1a365d] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#2b4c7e] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 group"
              >
                <span>{isAr ? 'تأكيد الطلب' : 'Confirm Order'}</span>
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
