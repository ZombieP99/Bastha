'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Store, Clock, CheckCircle2, Truck, XCircle, Phone } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const STATUS_ICONS = {
  pending: Clock,
  accepted: CheckCircle2,
  ready: Package,
  delivering: Truck,
  completed: CheckCircle2,
  cancelled: XCircle,
};

const STATUS_COLORS = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  ready: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivering: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function OrdersPage({ params }: { params: Promise<any> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang as 'en' | 'ar';
  const isAr = lang === 'ar';
  
  const token = useAuthStore(state => state.token);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('https://bastah-backend.onrender.com/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders', err);
      toast.error(isAr ? 'حدث خطأ في تحميل الطلبات' : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من إلغاء هذا الطلب؟' : 'Are you sure you want to cancel this order?')) return;
    
    setCancellingId(orderId);
    try {
      await axios.patch(`https://bastah-backend.onrender.com/api/orders/${orderId}/status`, 
        { status: 'cancelled' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(isAr ? 'تم إلغاء الطلب' : 'Order cancelled');
      fetchOrders(); // refresh
    } catch (err: any) {
      const msg = err.response?.data?.error || (isAr ? 'فشل الإلغاء' : 'Cancellation failed');
      toast.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return isAr ? 'قيد الانتظار' : 'Pending';
      case 'accepted': return isAr ? 'تم القبول' : 'Accepted';
      case 'ready': return isAr ? 'جاهز' : 'Ready';
      case 'delivering': return isAr ? 'جاري التوصيل' : 'Out for delivery';
      case 'completed': return isAr ? 'مكتمل' : 'Completed';
      case 'cancelled': return isAr ? 'ملغي' : 'Cancelled';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#f8fafc] min-h-screen pt-20 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#1a365d] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="bg-[#f8fafc] min-h-screen flex flex-col items-center justify-center p-4">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-[#1a365d] mb-4">
          {isAr ? 'يجب تسجيل الدخول' : 'Please log in'}
        </h2>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-12 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        
        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-200">
          <Package className="w-8 h-8 text-[#1a365d]" />
          <h1 className="text-3xl font-extrabold text-[#1a365d]">
            {isAr ? 'طلباتي' : 'My Orders'}
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 flex flex-col items-center">
            <Package className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-xl font-bold text-gray-500 mb-6">
              {isAr ? 'لم تقم بأي طلبات بعد' : 'You have no orders yet'}
            </p>
            <Link href={`/${lang}/`}>
              <button className="bg-[#1a365d] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2b4c7e] transition-colors">
                {isAr ? 'ابدأ التسوق' : 'Start Shopping'}
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const StatusIcon = STATUS_ICONS[order.status as keyof typeof STATUS_ICONS] || Clock;
              const statusColor = STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || 'bg-gray-50 text-gray-700';

              return (
                <div key={order._id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-500">
                          {isAr ? 'طلب #' : 'Order #'}
                        </span>
                        <span className="font-mono font-bold text-[#1a365d] bg-blue-50 px-2 py-0.5 rounded">
                          {order._id.substring(order._id.length - 8)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { 
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-2">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm ${statusColor}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span>{getStatusLabel(order.status)}</span>
                      </div>
                      <span className="text-sm text-gray-500 font-medium">
                        {order.deliveryMethod === 'delivery' ? (isAr ? 'توصيل للمنزل' : 'Home Delivery') : (isAr ? 'استلام من المتجر' : 'Store Pickup')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <span className="bg-white border border-gray-200 text-[#1a365d] font-black w-8 h-8 flex items-center justify-center rounded-lg text-sm shadow-sm">
                              {item.quantity}
                            </span>
                            <span className="font-bold text-gray-800">{isAr ? item.productNameAr : item.productName}</span>
                          </div>
                          <span className="font-bold text-[#1a365d]">{item.priceAtOrder * item.quantity} ₪</span>
                        </div>
                      ))}
                    </div>

                    <div className="lg:w-72 space-y-6">
                      <div className="bg-[#f8fbff] rounded-2xl p-5 border border-blue-50">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-blue-100">
                          <Store className="w-5 h-5 text-[#2b4c7e]" />
                          <div>
                            <h3 className="font-bold text-[#1a365d] text-sm">{order.shop.name}</h3>
                            <a href={`tel:${order.shop.phone}`} className="text-blue-600 text-sm flex items-center gap-1 hover:underline mt-1">
                              <Phone className="w-3 h-3" /> {order.shop.phone}
                            </a>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{isAr ? 'المجموع' : 'Subtotal'}</span>
                            <span className="font-bold">{order.subtotal} ₪</span>
                          </div>
                          {order.deliveryMethod === 'delivery' && (
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>{isAr ? 'التوصيل' : 'Delivery'}</span>
                              <span className="font-bold">{order.deliveryFee === 0 ? (isAr ? 'مجاني' : 'Free') : `${order.deliveryFee} ₪`}</span>
                            </div>
                          )}
                          <div className="pt-3 mt-3 border-t border-blue-100 flex justify-between items-center">
                            <span className="font-bold text-gray-800">{isAr ? 'الإجمالي' : 'Total'}</span>
                            <span className="text-xl font-black text-[#1a365d]">{order.total} ₪</span>
                          </div>
                        </div>
                      </div>

                      {order.status === 'pending' ? (
                        <button 
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingId === order._id}
                          className="w-full border-2 border-red-100 text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {cancellingId === order._id ? (
                            <span className="animate-pulse">{isAr ? 'جاري الإلغاء...' : 'Cancelling...'}</span>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5" />
                              {isAr ? 'إلغاء الطلب' : 'Cancel Order'}
                            </>
                          )}
                        </button>
                      ) : (order.status !== 'cancelled' && order.status !== 'completed' && (
                        <div className="text-center p-3 rounded-xl bg-orange-50 text-orange-700 border border-orange-100 text-sm font-bold">
                          {isAr ? 'لتعديل أو إلغاء الطلب، يرجى الاتصال بالمتجر' : 'To edit or cancel, please call the shop'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
