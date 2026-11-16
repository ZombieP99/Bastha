'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, Store, MapPin } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function SuccessPage({ params }: { params: Promise<any> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang as 'en' | 'ar';
  const isAr = lang === 'ar';
  
  const searchParams = useSearchParams();
  const ordersParam = searchParams.get('orders');
  
  const token = useAuthStore(state => state.token);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!ordersParam || !token) {
      setIsLoading(false);
      return;
    }

    const orderIds = ordersParam.split(',');
    
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await Promise.all(
          orderIds.map(async (id) => {
            try {
              const res = await axios.get(`https://bastah-backend.onrender.com/api/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              return res.data.order;
            } catch (e) {
              console.error(`Failed to fetch order ${id}`, e);
              return null;
            }
          })
        );
        
        setOrders(fetchedOrders.filter(Boolean));
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [ordersParam, token]);

  if (isLoading) {
    return (
      <div className="bg-[#f8fafc] min-h-screen pt-20 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#1a365d] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-12 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1a365d] mb-4">
            {isAr ? 'تم تسجيل طلباتك بنجاح!' : 'Orders placed successfully!'}
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            {isAr 
              ? 'شكراً لتسوقك معنا. سيتم تجهيز طلباتك في أسرع وقت. المتاجر ستتواصل معك قريباً.' 
              : 'Thank you for shopping with us. Your orders will be processed quickly. The shops will contact you soon.'}
          </p>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-6 mb-10">
            {orders.map((order, idx) => (
              <motion.div 
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Store className="w-5 h-5 text-[#1a365d]" />
                      <h2 className="text-xl font-bold text-gray-800">{order.shop.name}</h2>
                    </div>
                    <div className="text-gray-500 text-sm flex items-center gap-2">
                      <span>{isAr ? 'رقم الطلب:' : 'Order ID:'}</span>
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{order._id.substring(order._id.length - 8)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end gap-1">
                    <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">
                      {isAr ? 'قيد الانتظار' : 'Pending'}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {order.deliveryMethod === 'delivery' ? (isAr ? 'توصيل' : 'Delivery') : (isAr ? 'استلام من المتجر' : 'Pickup')}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-gray-700">
                      <div className="flex items-center gap-3">
                        <span className="bg-gray-100 text-gray-600 font-bold w-8 h-8 flex items-center justify-center rounded-lg text-sm">
                          {item.quantity}x
                        </span>
                        <span>{isAr ? item.productNameAr : item.productName}</span>
                      </div>
                      <span className="font-bold">{item.priceAtOrder * item.quantity} ₪</span>
                    </div>
                  ))}
                </div>

                <div className="bg-[#f8fbff] rounded-2xl p-5 border border-blue-50 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span className="font-bold text-gray-800">{order.subtotal} ₪</span>
                  </div>
                  {order.deliveryMethod === 'delivery' && (
                    <div className="flex justify-between text-gray-600">
                      <span>{isAr ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                      <span className="font-bold text-gray-800">{order.deliveryFee === 0 ? (isAr ? 'مجاني' : 'Free') : `${order.deliveryFee} ₪`}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-blue-100 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">{isAr ? 'المطلوب دفعه نقداً' : 'Cash to Pay'}</span>
                    <span className="text-2xl font-black text-[#1a365d]">{order.total} ₪</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 mb-10">
            <p className="text-gray-500">{isAr ? 'لا توجد تفاصيل لعرضها.' : 'No order details to display.'}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/${lang}/orders`}>
            <button className="w-full sm:w-auto text-white bg-[#1a365d] px-8 py-4 rounded-xl font-bold hover:bg-[#2b4c7e] transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              {isAr ? 'متابعة طلباتي' : 'Track My Orders'}
            </button>
          </Link>
          <Link href={`/${lang}/`}>
            <button className="w-full sm:w-auto bg-white text-[#1a365d] border-2 border-gray-100 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center">
              {isAr ? 'العودة للرئيسية' : 'Back to Home'}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
