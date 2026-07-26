'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Truck, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function DeliveryPage({ params }: { params: Promise<any> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang as 'en' | 'ar';
  const isAr = lang === 'ar';
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, save address to state/context here
    router.push(`/${lang}/checkout/payment`);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-12 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center w-full max-w-xl">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#1a365d] text-white flex items-center justify-center font-bold">1</div>
              <span className="text-sm font-bold mt-2 text-[#1a365d]">{isAr ? 'التوصيل' : 'Delivery'}</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">2</div>
              <span className="text-sm font-bold mt-2 text-gray-400">{isAr ? 'الدفع' : 'Payment'}</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">3</div>
              <span className="text-sm font-bold mt-2 text-gray-400">{isAr ? 'تأكيد' : 'Confirm'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
            <Truck className="w-8 h-8 text-[#1a365d]" />
            <h1 className="text-2xl font-extrabold text-[#1a365d]">
              {isAr ? 'معلومات التوصيل' : 'Delivery Information'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  <option value="ramallah">{isAr ? 'رام الله' : 'Ramallah'}</option>
                  <option value="nablus">{isAr ? 'نابلس' : 'Nablus'}</option>
                  <option value="hebron">{isAr ? 'الخليل' : 'Hebron'}</option>
                  <option value="jenin">{isAr ? 'جنين' : 'Jenin'}</option>
                  <option value="bethlehem">{isAr ? 'بيت لحم' : 'Bethlehem'}</option>
                  <option value="tulkarm">{isAr ? 'طولكرم' : 'Tulkarm'}</option>
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

            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center mt-8">
              <Link href={`/${lang}/cart`} className="w-full sm:w-auto">
                <button type="button" className="w-full text-gray-500 hover:text-gray-800 font-bold py-3 transition-colors flex items-center justify-center gap-2">
                  {isAr ? (
                    <><ArrowRight className="w-5 h-5" /> الرجوع للسلة</>
                  ) : (
                    <><ArrowLeft className="w-5 h-5" /> Back to Cart</>
                  )}
                </button>
              </Link>
              <button type="submit" className="w-full sm:w-auto bg-[#1a365d] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#2b4c7e] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 group">
                <span>{isAr ? 'المتابعة للدفع' : 'Proceed to Payment'}</span>
                {isAr ? (
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
