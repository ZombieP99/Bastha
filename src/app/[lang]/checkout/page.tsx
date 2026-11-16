'use client';

import { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Truck, Store, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Info } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Area {
  _id: string;
  name: string;
  nameAr: string;
}

interface ShopDetails {
  _id: string;
  name: string;
  deliveryZones?: { area: Area; fee: number }[];
}

export default function CheckoutPage({ params }: { params: Promise<any> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang as 'en' | 'ar';
  const isAr = lang === 'ar';
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const { items, clearCart } = useCartStore();
  const token = useAuthStore((state) => state.token);

  const [areas, setAreas] = useState<Area[]>([]);
  const [shopDetails, setShopDetails] = useState<Record<string, ShopDetails>>({});
  
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [formData, setFormData] = useState({
    phone: '',
    areaId: '',
    details: '',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Group items by shop
  const groupedByShop = useMemo(() => {
    const groups: Record<string, { shop: any; items: any[]; subtotal: number }> = {};
    items.forEach((item) => {
      const shopId = item.listing.shop._id;
      if (!groups[shopId]) {
        groups[shopId] = { shop: item.listing.shop, items: [], subtotal: 0 };
      }
      groups[shopId].items.push(item);
      groups[shopId].subtotal += item.listing.price * item.quantity;
    });
    return Object.values(groups);
  }, [items]);

  useEffect(() => {
    setMounted(true);
    
    // Auto-fill phone from user if possible
    const user = useAuthStore.getState().user;
    if (user && user.phone) {
      setFormData(prev => ({ ...prev, phone: user.phone }));
    }

    const fetchData = async () => {
      try {
        // 1. Fetch areas
        const areasRes = await axios.get('https://bastah-backend.onrender.com/api/areas');
        setAreas(areasRes.data.areas || []);

        // 2. Fetch full shop details for shops in cart to get deliveryZones
        const uniqueShopIds = Array.from(new Set(items.map(item => item.listing.shop._id)));
        const detailsMap: Record<string, ShopDetails> = {};
        
        await Promise.all(uniqueShopIds.map(async (id) => {
          try {
            const shopRes = await axios.get(`https://bastah-backend.onrender.com/api/shops/${id}`);
            detailsMap[id] = shopRes.data.shop;
          } catch (e) {
            console.error(`Failed to fetch shop ${id}`, e);
          }
        }));
        
        setShopDetails(detailsMap);
      } catch (err) {
        console.error('Failed to load checkout data', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (items.length > 0) {
      fetchData();
    } else {
      setIsLoadingData(false);
    }
  }, [items]);

  if (!mounted || isLoadingData) return <div className="min-h-screen bg-[#f8fafc] pt-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#1a365d] border-t-transparent rounded-full"></div></div>;

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

  // Calculate fees and validation for the current selected area
  let canCheckout = true;
  const shopSummaries = groupedByShop.map(group => {
    let fee = 0;
    let error = null;

    if (deliveryMethod === 'delivery') {
      if (formData.areaId) {
        const shopInfo = shopDetails[group.shop._id];
        if (shopInfo && shopInfo.deliveryZones) {
          const zone = shopInfo.deliveryZones.find(z => z.area._id === formData.areaId);
          if (zone) {
            fee = zone.fee;
          } else {
            error = isAr ? 'لا يوصل لهذه المنطقة' : 'Does not deliver here';
            canCheckout = false;
          }
        }
      } else {
        canCheckout = false; // Need to select area
      }
    }

    return {
      ...group,
      fee,
      total: group.subtotal + fee,
      error
    };
  });

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCheckout) return;

    if (!token) {
      toast.error(isAr ? 'يجب تسجيل الدخول لإتمام الطلب' : 'You must log in to checkout');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        contactPhone: formData.phone,
        note: formData.note
      };

      if (deliveryMethod === 'delivery') {
        payload.deliveryMethod = 'delivery';
        payload.address = {
          area: formData.areaId,
          details: formData.details
        };
      }

      const res = await axios.post('https://bastah-backend.onrender.com/api/orders', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const orderIds = res.data.orders.map((o: any) => o._id).join(',');
      
      toast.success(isAr ? 'تم إرسال طلباتك بنجاح!' : 'Orders placed successfully!');
      clearCart();
      router.push(`/${lang}/checkout/success?orders=${orderIds}`);
    } catch (err: any) {
      setIsSubmitting(false);
      const msg = err.response?.data?.error || (isAr ? 'حدث خطأ أثناء الطلب' : 'Error placing order');
      toast.error(msg);
      
      // If 409, some items might be unavailable, we should redirect back to cart if needed, but error message is enough for now.
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-12 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-10">
          <ShieldCheck className="w-8 h-8 text-[#1a365d]" />
          <h1 className="text-3xl font-extrabold text-[#1a365d]">
            {isAr ? 'تأكيد الطلب' : 'Confirm Order'}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Checkout Form */}
          <div className="flex-1 space-y-6">
            <form id="checkout-form" onSubmit={handleConfirmOrder} className="bg-white rounded-3xl shadow-sm border border-[#1a365d] ring-1 ring-[#1a365d] overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-100">
                <h2 className="text-xl font-bold text-[#1a365d] mb-6">
                  {isAr ? 'طريقة الاستلام' : 'Fulfillment Method'}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${deliveryMethod === 'delivery' ? 'border-[#1a365d] bg-[#f8fbff]' : 'border-gray-100 hover:border-gray-300'}`}>
                    <input 
                      type="radio" 
                      name="method" 
                      className="hidden"
                      checked={deliveryMethod === 'delivery'}
                      onChange={() => setDeliveryMethod('delivery')}
                    />
                    <Truck className={`w-8 h-8 ${deliveryMethod === 'delivery' ? 'text-[#1a365d]' : 'text-gray-400'}`} />
                    <span className={`font-bold ${deliveryMethod === 'delivery' ? 'text-[#1a365d]' : 'text-gray-500'}`}>
                      {isAr ? 'توصيل' : 'Delivery'}
                    </span>
                  </label>
                  
                  <label className={`cursor-pointer flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${deliveryMethod === 'pickup' ? 'border-[#1a365d] bg-[#f8fbff]' : 'border-gray-100 hover:border-gray-300'}`}>
                    <input 
                      type="radio" 
                      name="method" 
                      className="hidden"
                      checked={deliveryMethod === 'pickup'}
                      onChange={() => {
                        setDeliveryMethod('pickup');
                        setFormData(prev => ({ ...prev, areaId: '', details: '' }));
                      }}
                    />
                    <Store className={`w-8 h-8 ${deliveryMethod === 'pickup' ? 'text-[#1a365d]' : 'text-gray-400'}`} />
                    <span className={`font-bold ${deliveryMethod === 'pickup' ? 'text-[#1a365d]' : 'text-gray-500'}`}>
                      {isAr ? 'استلام من المتجر' : 'Pickup'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-bold text-[#1a365d] mb-6">
                  {isAr ? 'تفاصيل الاتصال' : 'Contact Details'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700">{isAr ? 'رقم الهاتف للتواصل' : 'Contact Phone'}</label>
                    <input 
                      required
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:bg-white transition-all text-left dir-ltr"
                      placeholder="05X XXX XXXX"
                    />
                  </div>

                  <AnimatePresence>
                    {deliveryMethod === 'delivery' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6 md:col-span-2"
                      >
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">{isAr ? 'المنطقة' : 'Area'}</label>
                          <select 
                            required={deliveryMethod === 'delivery'}
                            value={formData.areaId}
                            onChange={(e) => setFormData({...formData, areaId: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:bg-white transition-all"
                          >
                            <option value="">{isAr ? 'اختر منطقتك' : 'Select your area'}</option>
                            {areas.map(area => (
                              <option key={area._id} value={area._id}>
                                {isAr ? area.nameAr : area.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">{isAr ? 'العنوان التفصيلي' : 'Detailed Address'}</label>
                          <input 
                            required={deliveryMethod === 'delivery'}
                            type="text" 
                            value={formData.details}
                            onChange={(e) => setFormData({...formData, details: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:bg-white transition-all"
                            placeholder={isAr ? 'اسم الشارع، العمارة، الطابق...' : 'Street name, Building, Floor...'}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700">{isAr ? 'ملاحظات للمتجر (اختياري)' : 'Notes to shop (Optional)'}</label>
                    <textarea 
                      value={formData.note}
                      onChange={(e) => setFormData({...formData, note: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:bg-white transition-all resize-none h-20"
                      placeholder={isAr ? 'مثال: يرجى الاتصال قبل الساعة 6' : 'e.g., call before 6pm'}
                    ></textarea>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Separate Orders Summaries (One per shop) */}
          <div className="lg:w-[420px] space-y-6">
            <h3 className="text-xl font-bold text-gray-800 px-2">
              {isAr ? 'تفاصيل الطلبات' : 'Order Details'}
            </h3>
            
            {shopSummaries.map((summary) => (
              <div key={summary.shop._id} className={`bg-white rounded-3xl p-6 shadow-sm border ${summary.error ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#1a365d]" />
                    <span className="font-bold text-gray-800">{summary.shop.name}</span>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold">
                    {summary.items.length} {isAr ? 'منتج' : 'items'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span className="font-bold">{summary.subtotal} ₪</span>
                  </div>
                  {deliveryMethod === 'delivery' && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{isAr ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                      <span className={`font-bold ${summary.error ? 'text-red-500' : 'text-green-600'}`}>
                        {summary.error ? summary.error : (summary.fee === 0 ? (isAr ? 'مجاني' : 'Free') : `${summary.fee} ₪`)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-800">{isAr ? 'إجمالي المتجر' : 'Shop Total'}</span>
                  <span className="text-xl font-black text-[#1a365d]">{summary.total} ₪</span>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex gap-3 text-sm font-bold items-start">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                {isAr 
                  ? 'سيتم إرسال طلب مستقل لكل متجر. الدفع يكون نقداً لكل متجر على حدة عند استلام الطلب.' 
                  : 'A separate order is sent to each shop. Payment is made in cash directly to each shop upon receipt.'}
              </p>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={isSubmitting || !canCheckout}
              className="w-full bg-[#1a365d] text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-[#2b4c7e] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-lg"
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
          </div>
        </div>
      </div>
    </div>
  );
}
