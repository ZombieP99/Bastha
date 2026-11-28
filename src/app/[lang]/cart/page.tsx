'use client';
import { useMounted } from '@/hooks/useMounted';

import { hasCartListing, useCartStore } from '@/store/useCartStore';
import { AnimatePresence,motion } from 'framer-motion';
import { ArrowLeft,ArrowRight,Minus,Plus,ShoppingBag,Trash2 } from 'lucide-react';
import ProductImage from '@/components/products/ProductImage';
import Link from 'next/link';
import { use } from 'react';

export default function CartPage({ params }: { params: Promise<{ lang: string }> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang as 'en' | 'ar';
  const isAr = lang === 'ar';

  const mounted = useMounted();
  const { items, removeItem, updateQuantity, getTotalPrice, isLoading, error, clearCart } = useCartStore();


  if (!mounted) return <div className="min-h-screen bg-[#f8fafc] pt-20" />;

  const subtotal = getTotalPrice();

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-12 pb-20">
      <div className="container mx-auto px-4 md:px-8">
        
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="w-8 h-8 text-[#1a365d]" />
          <h1 className="text-3xl font-extrabold text-[#1a365d]">
            {isAr ? 'سلة التسوق' : 'Shopping Cart'}
          </h1>
        </div>

        <button disabled={isLoading} className="underline mb-4" onClick={()=>{if(confirm(isAr?'إفراغ السلة؟':'Clear cart?'))void clearCart().catch(()=>{});}}>{isAr?'إفراغ السلة':'Clear cart'}</button>
        {error && <p role="alert" className="text-red-700 p-4">{error}</p>}
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {isAr ? 'سلتك فارغة' : 'Your cart is empty'}
            </h2>
            <p className="text-gray-500 mb-8 max-w-md">
              {isAr 
                ? 'يبدو أنك لم تضف أي منتجات إلى سلتك بعد. اكتشف أحدث العروض والمنتجات المميزة.' 
                : 'Looks like you haven\'t added any products to your cart yet. Discover our latest offers and featured products.'}
            </p>
            <Link href={`/${lang}/products`}>
              <button className="bg-[#1a365d] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2b4c7e] transition-colors shadow-md">
                {isAr ? 'تسوق الآن' : 'Shop Now'}
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <AnimatePresence>
                    {items.map((item, index) => {
                      const listing = item.listing;
                      if (!hasCartListing(item) || !listing) {
                        const id = listing?._id || item.listingId;
                        return <div key={item._id || id || index} className="rounded-xl bg-amber-50 p-4">
                          <p>{isAr ? 'عرض محذوف أو غير متاح' : 'Removed or unavailable listing'} × {item.quantity}</p>
                          {id ? <button disabled={isLoading} className="underline" onClick={() => void removeItem(id)}>{isAr ? 'إزالة المنتج' : 'Remove item'}</button>
                           : <p>{isAr ? 'لا يوجد معرّف لهذا العرض. يمكنك إفراغ السلة كاملة من الزر أعلاه.' : 'This listing has no ID. You can clear the entire cart using the button above.'}</p>}
                        </div>;
                      }
                      return (
                      <motion.div 
                        key={listing._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex flex-col sm:flex-row items-center gap-6 py-6 border-b border-gray-100 last:border-0"
                      >
                        {/* Image */}
                        <Link href={`/${lang}/products/${listing.product._id}`}>
                          <div className="w-24 h-24 rounded-2xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 relative">
                            <ProductImage
                              product={listing.product}
                              alt={isAr ? listing.product.nameAr : listing.product.name}
                              className="object-cover"
                              sizes="96px"
                            />
                          </div>
                        </Link>

                        {/* Details */}
                        <div className="flex-1 w-full text-center sm:text-start">
                          <div className="text-xs font-bold text-[#2b4c7e] mb-1 bg-[#eaf1f8] inline-block px-2 py-1 rounded-md">
                            {listing.shop?.name || 'Store'}
                          </div>
                          {(!listing.inStock || listing.product.isActive === false) && <p className="font-bold text-red-700">{isAr ? 'غير متاح للشراء · أزل المنتج للمتابعة' : 'Unavailable · Remove this item to continue'}</p>}
                          <Link href={`/${lang}/products/${listing.product._id}`}>
                            <h3 className="font-bold text-gray-800 text-lg hover:text-[#1a365d] transition-colors line-clamp-2">
                              {isAr ? listing.product.nameAr : listing.product.name}
                            </h3>
                          </Link>
                          <p className="text-[#a38024] font-bold mt-2">
                            {listing.price} ₪
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:items-end gap-4 w-full sm:w-auto">
                          <button 
                            disabled={isLoading} onClick={() => { void removeItem(listing._id).catch(()=>{}); }}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 self-end sm:self-auto"
                            title={isAr ? 'حذف' : 'Remove'}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          
                          <div className="flex items-center justify-between sm:justify-start gap-4 bg-gray-50 rounded-xl p-1 border border-gray-200">
                            <button 
                              onClick={() => { void updateQuantity(listing._id, item.quantity - 1).catch(()=>{}); }}
                              disabled={isLoading || item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm disabled:opacity-50 hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-gray-800 w-6 text-center">
                              {item.quantity}
                            </span>
                            <button 
                              disabled={isLoading} onClick={() => { void updateQuantity(listing._id, item.quantity + 1).catch(()=>{}); }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );})}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-[380px]">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
                  {isAr ? 'ملخص الطلب' : 'Order Summary'}
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span className="font-bold text-gray-800">{subtotal} ₪</span>
                  </div>
                  <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                    {isAr
                      ? '📦 رسوم التوصيل تُحسب لكل متجر عند إتمام الطلب حسب المنطقة.'
                      : '📦 Delivery fee is calculated per shop at checkout based on your area.'}
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">{isAr ? 'الإجمالي' : 'Total'}</span>
                    <span className="text-2xl font-black text-[#1a365d]">{subtotal} ₪</span>
                  </div>
                </div>

                <Link href={`/${lang}/checkout`}>
                  <button className="w-full bg-[#1a365d] text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-[#2b4c7e] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 group">
                    <span>{isAr ? 'إتمام الطلب' : 'Proceed to Checkout'}</span>
                    {isAr ? (
                      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    )}
                  </button>
                </Link>

                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <Link href={`/${lang}/products`} className="text-[#2b4c7e] font-bold hover:underline text-sm">
                    {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
