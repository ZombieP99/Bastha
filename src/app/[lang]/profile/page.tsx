'use client';

import { use, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { User, Package, Heart, Settings, LogOut, Edit2, Calendar, MapPin, Search, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function ProfilePage({ params }: { params: Promise<any> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang as 'en' | 'ar';
  const isAr = lang === 'ar';
  const router = useRouter();

  const { user, isAuthenticated, logout, isLoading, token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${lang}/auth?mode=login`);
    }
  }, [isAuthenticated, isLoading, router, lang]);

  useEffect(() => {
    if (token) {
      axios.get('https://bastah-backend.onrender.com/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setOrders(res.data.orders?.slice(0, 3) || []))
      .catch(err => console.error('Failed to load orders', err))
      .finally(() => setIsOrdersLoading(false));
    }
  }, [token]);

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-[#f8fafc] pt-20" />;
  }

  const handleLogout = () => {
    logout();
    router.push(`/${lang}`);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-8 pb-24">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#1a365d]/5 to-transparent pointer-events-none"></div>
      
      <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
        <h1 className="text-3xl font-black text-[#1a365d] mb-8">
          {isAr ? 'حسابي الشخصي' : 'My Account'}
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
            
            {/* User Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 flex flex-col items-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#1a365d] to-[#2b4c7e]"></div>
              
              <div className="relative w-28 h-28 bg-white rounded-full flex items-center justify-center mb-5 shadow-xl border-4 border-white mt-4 text-[#1a365d]">
                <User className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-gray-800">{user?.name}</h2>
              <p className="text-gray-500 text-sm mt-1 mb-4">{user?.email}</p>
              
              <div className="px-5 py-2 bg-blue-50 text-[#1a365d] rounded-full text-xs font-bold uppercase tracking-wider">
                {user?.role === 'customer' ? (isAr ? 'زبون مميز' : 'Premium Customer') : user?.role}
              </div>
            </motion.div>

            {/* Navigation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 space-y-2"
            >
              <Link href={`/${lang}/profile`} className="flex items-center justify-between p-4 rounded-2xl bg-[#1a365d] text-white font-bold transition-all shadow-md group">
                <div className="flex items-center gap-4">
                  <Settings className="w-5 h-5 opacity-90" />
                  <span>{isAr ? 'المعلومات الشخصية' : 'Personal Info'}</span>
                </div>
                {isAr ? <ChevronLeft className="w-5 h-5 opacity-70 group-hover:-translate-x-1 transition-transform" /> : <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />}
              </Link>
              
              <Link href={`/${lang}/wishlist`} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 text-gray-700 font-bold transition-all group">
                <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                <span>{isAr ? 'قائمة الرغبات' : 'Wishlist'}</span>
              </Link>
              
              <button onClick={handleLogout} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 text-red-600 font-bold transition-all w-full text-left group">
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>{isAr ? 'تسجيل الخروج' : 'Logout'}</span>
              </button>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            
            {/* Personal Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80"
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                <h3 className="text-2xl font-black text-gray-800">
                  {isAr ? 'إعدادات الحساب' : 'Account Settings'}
                </h3>
                <button className="flex items-center gap-2 text-[#1a365d] font-bold hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors">
                  <Edit2 className="w-4 h-4" />
                  <span>{isAr ? 'تعديل' : 'Edit'}</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">{isAr ? 'الاسم الكامل' : 'Full Name'}</label>
                  <p className="text-gray-800 font-bold text-lg p-4 bg-[#f8fafc] rounded-2xl border border-gray-100">{user?.name}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
                  <p className="text-gray-800 font-bold text-lg p-4 bg-[#f8fafc] rounded-2xl border border-gray-100 text-left dir-ltr">{user?.email}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">{isAr ? 'رقم الهاتف' : 'Phone Number'}</label>
                  <p className="text-gray-800 font-bold text-lg p-4 bg-[#f8fafc] rounded-2xl border border-gray-100 text-left dir-ltr">{user?.phone}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">{isAr ? 'تاريخ التسجيل' : 'Registration Date'}</label>
                  <div className="flex items-center gap-3 p-4 bg-[#f8fafc] rounded-2xl border border-gray-100">
                    <Calendar className="w-5 h-5 text-[#1a365d]" />
                    <p className="text-gray-800 font-bold text-lg">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '---'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Previous Orders */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80"
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Package className="w-7 h-7 text-[#1a365d]" />
                  <h3 className="text-2xl font-black text-gray-800">
                    {isAr ? 'الطلبات السابقة' : 'Previous Orders'}
                  </h3>
                </div>
                <Link href={`/${lang}/orders`} className="text-[#1a365d] font-bold hover:underline">
                  {isAr ? 'عرض الكل' : 'View All'}
                </Link>
              </div>

              <div className="space-y-4">
                {isOrdersLoading ? (
                  <div className="flex justify-center p-8"><div className="animate-spin w-8 h-8 border-4 border-[#1a365d] border-t-transparent rounded-full"></div></div>
                ) : orders.length === 0 ? (
                  <div className="text-center p-8 text-gray-500 font-bold">{isAr ? 'لا توجد طلبات سابقة' : 'No previous orders'}</div>
                ) : orders.map((order, idx) => (
                  <Link key={order._id} href={`/${lang}/checkout/success?orders=${order._id}`} className="block">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-gray-100 hover:border-[#1a365d]/20 hover:shadow-md transition-all gap-4 group">
                    
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-[#f8fafc] rounded-xl flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-blue-50 transition-colors">
                        <Package className="w-7 h-7 text-gray-400 group-hover:text-[#1a365d] transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-800 text-lg mb-1">ORD-{order._id.slice(-5).toUpperCase()}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}</span>
                          <span>•</span>
                          <span>{order.items?.length || 0} {isAr ? 'منتجات' : 'items'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 mt-2 md:mt-0">
                      <div className="text-left md:text-right">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{isAr ? 'الإجمالي' : 'Total'}</p>
                        <p className="font-black text-[#1a365d] text-xl">{order.subtotal + (order.deliveryFee || 0)} ₪</p>
                      </div>
                      
                      <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
                        order.status === 'completed' || order.status === 'delivered' ? 'bg-green-50 text-green-600' : 
                        order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          order.status === 'completed' || order.status === 'delivered' ? 'bg-green-500' : 
                          order.status === 'cancelled' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}></div>
                        <span>{
                          order.status === 'pending' ? (isAr ? 'قيد الانتظار' : 'Pending') :
                          order.status === 'accepted' ? (isAr ? 'تم القبول' : 'Accepted') :
                          order.status === 'ready' ? (isAr ? 'جاهز' : 'Ready') :
                          order.status === 'delivering' ? (isAr ? 'جاري التوصيل' : 'Out for delivery') :
                          order.status === 'completed' || order.status === 'delivered' ? (isAr ? 'مكتمل' : 'Completed') :
                          order.status === 'cancelled' ? (isAr ? 'ملغي' : 'Cancelled') : order.status
                        }</span>
                      </div>
                    </div>

                  </div>
                  </Link>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
