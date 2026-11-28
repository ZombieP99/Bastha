'use client';
import AccountGate from '@/components/auth/AccountGate';
import { useMounted } from '@/hooks/useMounted';
import api from '@/lib/api';
import { checkoutRecovery } from '@/lib/orders';
import { errorMessage } from '@/lib/errors';
import { hasCartListing, type CartListing, type CartItem } from '@/store/useCartStore';

import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { AnimatePresence,motion } from 'framer-motion';
import { CheckCircle2,Info,ShieldCheck,Store,Truck } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use,useEffect,useMemo,useRef,useState } from 'react';
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

export default function CheckoutPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang as 'en' | 'ar';
  const sessionToken=useAuthStore(s=>s.token);
  return <AccountGate lang={lang} customer><CheckoutContent key={sessionToken} lang={lang}/></AccountGate>;
}
function CheckoutContent({lang}:{lang:string}) {
  const isAr = lang === 'ar';
  const router = useRouter();

  const mounted = useMounted();
  const { items, isLoading:cartLoading, error:cartError, fetchCart, removeItem } = useCartStore();
  const token = useAuthStore((state) => state.token);

  const [areaError, setAreaError] = useState('');
  const [areas, setAreas] = useState<Area[]>([]);
  const [shopDetails, setShopDetails] = useState<Record<string, ShopDetails>>({});
  
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [formData, setFormData] = useState({
    phone: useAuthStore.getState().user?.phone || '',
    areaId: '',
    details: '',
    note: ''
  });
  const [checkoutIssue, setCheckoutIssue] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError,setDataError]=useState('');
  const [retry,setRetry]=useState(0);

  const submitting = useRef(false);
  const [closedShops, setClosedShops] = useState<string[]>([]);
  const visibleItems = useMemo(() => items.filter(hasCartListing), [items]);
  const unavailable = items.some(item => !hasCartListing(item) || !item.listing.inStock || item.listing.product.isActive === false);

  const groupedByShop = useMemo(() => {
    const groups: Record<string, { shop: CartListing['shop']; items: CartItem[]; subtotal: number }> = {};
    visibleItems.forEach((item) => {
      const shopId = item.listing.shop._id;
      if (!groups[shopId]) {
        groups[shopId] = { shop: item.listing.shop, items: [], subtotal: 0 };
      }
      groups[shopId].items.push(item);
      groups[shopId].subtotal += item.listing.price * item.quantity;
    });
    return Object.values(groups);
  }, [visibleItems]);

  useEffect(() => {
    let active=true;
    const fetchData = async () => {
      try {
        // 1. Fetch areas
        const areaRequest = api.get<{areas: Area[]}>('/areas').then(r => {
          if (!active) return;
          setAreas(r.data.areas);
          setFormData(prev => !prev.areaId || r.data.areas.some(area => area._id === prev.areaId)
            ? prev : {...prev, areaId: ''});
          setAreaError('');
        }).catch(error => { if (active) setAreaError(errorMessage(error)); });

        // 2. Fetch full shop details for shops in cart to get deliveryZones
        const uniqueShopIds = Array.from(new Set(visibleItems.map(item => item.listing.shop._id)));
        const detailsMap: Record<string, ShopDetails> = {};
        
        const closed: string[] = [];
        await Promise.all([areaRequest, ...uniqueShopIds.map(async (id) => {
          try {
            const shopRes = await api.get(`/shops/${id}`);
            detailsMap[id] = shopRes.data.shop;
          } catch (e) {
            if (axios.isAxiosError(e) && e.response?.status === 404) closed.push(id);
            else throw e;
          }
        })]);
        
        if(active){setClosedShops(closed);setShopDetails(detailsMap);setDataError('');}
      } catch (err) {
        if(active)setDataError(errorMessage(err));
      } finally {
        if(active)setIsLoadingData(false);
      }
    };

    if (items.length > 0) {
      fetchData();
    } else {
      queueMicrotask(()=>{if(active)setIsLoadingData(false);});
    }
    return ()=>{active=false;};
  }, [items,visibleItems,retry]);

  if (!mounted || isLoadingData || cartLoading) return <div className="min-h-screen bg-[#f8fafc] pt-20 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#1a365d] border-t-transparent rounded-full"></div></div>;

  if (cartError) return <div role="alert" className="mx-auto max-w-xl py-12"><p>{cartError}</p><button className="underline" onClick={() => void fetchCart()}>{isAr ? 'إعادة تحميل السلة' : 'Reload cart'}</button></div>;

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
  let canCheckout = (deliveryMethod === 'pickup' || !areaError) && !dataError && !unavailable && !closedShops.length && items.length > 0;
  const shopSummaries = groupedByShop.map(group => {
    let fee = 0;
    let error = null;

    if (deliveryMethod === 'delivery') {
      if (formData.areaId) {
        const shopInfo = shopDetails[group.shop._id];
        if (!shopInfo?.deliveryZones) {
          error = isAr ? 'تعذر التحقق من رسوم التوصيل' : 'Unable to verify delivery fees';
          canCheckout = false;
        } else {
          const zone = shopInfo.deliveryZones.find(z => z.area?._id === formData.areaId);
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
    if (!canCheckout || submitting.current) return;
    if(!formData.phone.trim()){toast.error(isAr?'أدخل رقم الهاتف':'Enter a phone number');return;}

    if (!token) {
      toast.error(isAr ? 'يجب تسجيل الدخول لإتمام الطلب' : 'You must log in to checkout');
      return;
    }

    submitting.current = true;
    setCheckoutIssue(null);
    setIsSubmitting(true);
    try {
      const payload: {contactPhone:string;note:string;deliveryMethod?:string;address?:{area:string;details:string}} = {
        contactPhone: formData.phone,
        deliveryMethod,
        note: formData.note
      };

      if (deliveryMethod === 'delivery') {
        payload.address = {
          area: formData.areaId,
          details: formData.details
        };
      }

      const res = await api.post<{orders:{_id:string}[]}>('/orders', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if(useAuthStore.getState().token!==token)return;
      const orderIds = res.data.orders.map((o) => o._id).join(',');
      
      toast.success(isAr ? 'تم إرسال طلباتك بنجاح!' : 'Orders placed successfully!');
      useCartStore.setState({ items: [], error: null, isLoading: false });
      router.push(`/${lang}/checkout/success?orders=${orderIds}`);
    } catch (err: unknown) {
      if(useAuthStore.getState().token!==token)return;
      const msg = errorMessage(err);
      toast.error(msg);
      
      const recovery = checkoutRecovery(err);
      if (recovery === 'cart_empty' || recovery === 'cart_changed') {
        void fetchCart().catch(() => {});
        router.replace('/' + lang + '/orders?checkout=' + recovery);
        return;
      }
      if (recovery === 'refresh-cart') {
        setCheckoutIssue(axios.isAxiosError(err) && err.response?.data?.code || 'cart');
        setIsLoadingData(true);
        await fetchCart().catch(() => {});
        setRetry(v => v + 1);
      } else if (recovery === 'check-orders') {
        setCheckoutIssue('unknown');
      } else if (recovery === 'review-input') {
        setRetry(v => v + 1);
      }
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-12 pb-20">
      {(unavailable || checkoutIssue === 'item_unavailable' || checkoutIssue === 'out_of_stock' || checkoutIssue === 'cart') && <div role="alert" className="mx-auto max-w-6xl rounded-xl bg-amber-50 p-4">
        <Link className="underline" href={'/'+lang+'/cart'}>{isAr ? 'راجع المنتجات غير المتاحة وأزلها من السلة' : 'Review and remove unavailable items in your cart'}</Link></div>}
      {checkoutIssue === 'unknown' && <p role="alert" className="mx-auto max-w-6xl p-4"><Link className="underline" href={'/'+lang+'/orders'}>{isAr ? 'تعذّر تأكيد النتيجة. تحقق من طلباتك أو أعد المحاولة.' : 'The result is uncertain. Check your orders or retry.'}</Link></p>}
      {checkoutIssue === 'no_delivery_to_area' && deliveryMethod === 'delivery' && <p role="alert" className="mx-auto max-w-6xl p-4">{isAr ? 'اختر منطقة أخرى أو الاستلام من المتجر.' : 'Choose another area or select pickup.'}</p>}
      {(dataError || (areaError && deliveryMethod === 'delivery')) && <div role="alert" className="p-6 text-red-700"><p>{dataError || areaError}</p><button onClick={()=>{setIsLoadingData(true);setRetry(v=>v+1);}}>{isAr?'إعادة المحاولة':'Retry'}</button></div>}
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
                            onChange={(e) => {setCheckoutIssue(null);setFormData({...formData, areaId: e.target.value});}}
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
                
                {closedShops.includes(summary.shop._id) && <div className="mb-3 rounded-xl bg-amber-50 p-3">
                  <p>{isAr ? 'هذا المتجر مغلق' : 'This shop is closed'}</p>
                  <button type="button" disabled={cartLoading || isSubmitting} className="underline" onClick={async () => {
                    for (const item of summary.items) {
                      if (!item.listing || useAuthStore.getState().token !== token) break;
                      await removeItem(item.listing._id);
                      if (useCartStore.getState().error) break;
                    }
                  }}>{isAr ? 'إزالة منتجات هذا المتجر' : 'Remove this shop’s items'}</button></div>}
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
