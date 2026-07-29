'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Store, Package, ShoppingBag, LayoutDashboard, TrendingUp, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboardPage({ params }: { params: Promise<any> }) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang as 'en' | 'ar';
  const isAr = lang === 'ar';
  const router = useRouter();

  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`/${lang}/seller/login`);
      } else if (user?.role !== 'seller' && user?.role !== 'admin') {
        router.push(`/${lang}/seller/login`);
      }
    }
  }, [isLoading, isAuthenticated, user, router, lang]);

  if (isLoading || !isAuthenticated || (user?.role !== 'seller' && user?.role !== 'admin')) {
    return <div className="min-h-screen bg-[#f8fafc] pt-20" />;
  }

  const handleLogout = () => {
    logout();
    router.push(`/${lang}/seller/login`);
  };

  const navItems = [
    { icon: LayoutDashboard, title: isAr ? 'لوحة القيادة' : 'Dashboard', active: true },
    { icon: Package, title: isAr ? 'المنتجات' : 'Products', active: false },
    { icon: ShoppingBag, title: isAr ? 'الطلبات' : 'Orders', active: false },
    { icon: TrendingUp, title: isAr ? 'التقارير المبيعات' : 'Sales Reports', active: false },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-12 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-72 shrink-0">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-[#1a365d]">
                <Store className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 text-center">{user.name}</h2>
              <p className="text-gray-500 text-sm mt-1">{isAr ? 'مدير المتجر' : 'Store Manager'}</p>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col gap-2">
              {navItems.map((item, index) => (
                <button 
                  key={index} 
                  className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-colors w-full ${isAr ? 'text-right' : 'text-left'} ${
                    item.active 
                      ? 'bg-[#1a365d] text-white' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.title}</span>
                </button>
              ))}
              <div className="h-px bg-gray-100 my-2"></div>
              <button onClick={handleLogout} className="flex items-center gap-3 p-4 rounded-2xl hover:bg-red-50 text-red-600 font-bold transition-colors w-full text-left">
                <LogOut className="w-5 h-5" />
                <span>{isAr ? 'تسجيل الخروج' : 'Logout'}</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-extrabold text-[#1a365d]">
                {isAr ? 'مرحباً بعودتك،' : 'Welcome back,'} {user.name.split(' ')[0]} 👋
              </h1>
              <Link href={`/${lang}/seller/products/new`}>
                <button className="bg-[#1a365d] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#2b4c7e] transition-colors shadow-md flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {isAr ? 'إضافة منتج جديد' : 'Add New Product'}
                </button>
              </Link>
            </div>

            {/* Stats Cards Mock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="text-green-500 font-bold text-sm bg-green-50 px-2 py-1 rounded-lg">+12%</span>
                </div>
                <h3 className="text-gray-500 font-medium mb-1">{isAr ? 'إجمالي المبيعات' : 'Total Sales'}</h3>
                <p className="text-3xl font-black text-gray-800">24,500 ₪</p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <span className="text-green-500 font-bold text-sm bg-green-50 px-2 py-1 rounded-lg">+5%</span>
                </div>
                <h3 className="text-gray-500 font-medium mb-1">{isAr ? 'الطلبات الجديدة' : 'New Orders'}</h3>
                <p className="text-3xl font-black text-gray-800">142</p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-gray-500 font-medium mb-1">{isAr ? 'المنتجات النشطة' : 'Active Products'}</h3>
                <p className="text-3xl font-black text-gray-800">45</p>
              </div>
            </div>

            {/* Recent Orders Mock */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">{isAr ? 'أحدث الطلبات' : 'Recent Orders'}</h3>
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">{isAr ? 'لا توجد طلبات جديدة حالياً' : 'No new orders right now'}</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
