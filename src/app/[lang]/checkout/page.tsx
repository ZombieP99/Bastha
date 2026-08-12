'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Truck, CreditCard, Banknote, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function OneStepCheckoutPage({ params }: { params: Promise<any> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang as 'en' | 'ar';
  const isAr = lang === 'ar';
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const { getTotalPrice, items, clearCart } = useCartStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#f8fafc] pt-20" />;

  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-[#1a365d] mb-4">
          {isAr ? 'عربة التسوق فارغة' : 'Your cart is empty'}
        </h2>
        <Link href={`/${lang}`}>
          <button className="bg-[#1a365d] text-white px-8 py-3 rounded-xl font-bold">
            {isAr ? 'العودة للتسوق' : 'Continue Shopping'}
          </button>
        </Link>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = items.length > 0 ? 15 : 0;
  const total = subtotal + shipping;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleConfirmOrder = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      clearCart();
      router.push(`/${lang}/checkout/success`);
    }, 1500);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-12 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-10">
          <ShieldCheck className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-extrabold text-[#1a365d]">
            {isAr ? 'إتمام الطلب بأمان' : 'Secure Checkout'}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Checkout Flow */}
          <div className="flex-1 space-y-6">
            
            {/* Step 1: Delivery Information */}
            <div className={`bg-white rounded-3xl shadow-sm border transition-all duration-300 overflow-hidden ${step === 1 ? 'border-[#1a365d] ring-1 ring-[#1a365d]' : 'border-gray-200'}`}>
              <div 
                className={`p-6 md:p-8 flex items-center justify-between cursor-pointer ${step !== 1 ? 'bg-gray-50 hover:bg-gray-100' : ''}`}
                onClick={() => step === 2 && setStep(1)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors ${step >= 1 ? 'bg-[#1a365d]' : 'bg-gray-300'}`}>
                    {step > 1 ? <CheckCircle2 className="w-6 h-6" /> : '1'}
                  </div>
                  <h2 className={`text-xl font-bold ${step === 1 ? 'text-[#1a365d]' : 'text-gray-600'}`}>
                    {isAr ? 'معلومات التوصيل' : 'Delivery Information'}
                  </h2>
                </div>
                {step === 2 && (
                  <span className="text-sm font-bold text-blue-600 underline">
                    {isAr ? 'تعديل' : 'Edit'}
                  </span>
                )}
              </div>

              <AnimatePresence>
                {step === 1 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 md:px-8 pb-8"
                  >
                    <form id="delivery-form" onSubmit={handleNextStep} className="space-y-6 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">{isAr ? 'الاسم الكامل' : 'Full Name'}</label>
                          <input 
                            required
                            type="text" 
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:bg-white transition-all"
                            placeholder={isAr ? 'الاسم الأول والأخير' : 'First and Last name'}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">{isAr ? 'رقم الهاتف' : 'Phone Number'}</label>
                          <input 
                            required
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:bg-white transition-all text-left dir-ltr"
                            placeholder="05X XXX XXXX"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-bold text-gray-700">{isAr ? 'المدينة' : 'City'}</label>
                          <select 
                            required
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:bg-white transition-all"
                          >
                            <option value="">{isAr ? 'اختر المدينة' : 'Select City'}</option>
                            <option value="gaza">{isAr ? 'غزة' : 'Gaza'}</option>
                            <option value="north_gaza">{isAr ? 'شمال غزة' : 'North Gaza'}</option>
                            <option value="deir_al_balah">{isAr ? 'دير البلح' : 'Deir al-Balah'}</option>
                            <option value="nuseirat">{isAr ? 'النصيرات' : 'Nuseirat'}</option>
                            <option value="bureij">{isAr ? 'البريج' : 'Bureij'}</option>
                            <option value="khan_yunis">{isAr ? 'خانيونس' : 'Khan Yunis'}</option>
                            <option value="rafah">{isAr ? 'رفح' : 'Rafah'}</option>
                          </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-bold text-gray-700">{isAr ? 'العنوان التفصيلي' : 'Detailed Address'}</label>
                          <input 
                            required
                            type="text" 
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:bg-white transition-all"
                            placeholder={isAr ? 'اسم الشارع، رقم العمارة، الطابق...' : 'Street name, Building no, Floor...'}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-bold text-gray-700">{isAr ? 'ملاحظات للسائق (اختياري)' : 'Driver Notes (Optional)'}</label>
                          <textarea 
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:bg-white transition-all resize-none h-24"
                            placeholder={isAr ? 'أي معلومات إضافية للوصول إليك بسهولة' : 'Any extra info to reach you easily'}
                          ></textarea>
                        </div>
                      </div>
                      <div className="flex justify-end mt-6">
                        <button type="submit" form="delivery-form" className="w-full md:w-auto bg-[#1a365d] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#2b4c7e] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group">
                          <span>{isAr ? 'متابعة للدفع' : 'Continue to Payment'}</span>
                          {isAr ? <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 2: Payment */}
            <div className={`bg-white rounded-3xl shadow-sm border transition-all duration-300 overflow-hidden ${step === 2 ? 'border-[#1a365d] ring-1 ring-[#1a365d]' : 'border-gray-200 opacity-70'}`}>
              <div className="p-6 md:p-8 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors ${step === 2 ? 'bg-[#1a365d]' : 'bg-gray-300'}`}>
                  2
                </div>
                <h2 className={`text-xl font-bold ${step === 2 ? 'text-[#1a365d]' : 'text-gray-500'}`}>
                  {isAr ? 'طريقة الدفع' : 'Payment Method'}
                </h2>
              </div>
              
              <AnimatePresence>
                {step === 2 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 md:px-8 pb-8"
                  >
                    <div className="space-y-4 pt-4 border-t border-gray-100">
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-[400px]">
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
                <div className="flex justify-between text-green-600">
                  <span>{isAr ? 'رسوم التوصيل' : 'Shipping'}</span>
                  <span className="font-bold text-green-600">{shipping} ₪</span>
                </div>
                
                <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-3xl font-black text-[#1a365d]">{total} ₪</span>
                </div>
              </div>

              {step === 2 ? (
                <button 
                  onClick={handleConfirmOrder} 
                  disabled={isSubmitting}
                  className="w-full bg-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">{isAr ? 'جاري التأكيد...' : 'Confirming...'}</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      <span>{isAr ? 'تأكيد الطلب' : 'Confirm Order'}</span>
                    </>
                  )}
                </button>
              ) : (
                <button 
                  onClick={() => {
                    const form = document.getElementById('delivery-form') as HTMLFormElement;
                    if(form.checkValidity()) {
                      handleNextStep({ preventDefault: () => {} } as any);
                    } else {
                      form.reportValidity();
                    }
                  }} 
                  className="w-full bg-[#1a365d] text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-[#2b4c7e] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  {isAr ? 'أكمل التوصيل أولاً' : 'Complete Delivery First'}
                </button>
              )}

              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-500 text-sm">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span>{isAr ? 'معلوماتك مشفرة ومحمية بالكامل' : 'Your information is encrypted & secure'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
