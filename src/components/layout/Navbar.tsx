import Link from 'next/link';
import { Search, ShoppingCart, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* Top Header */}
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Right side: Logo & Search */}
        <div className="flex items-center gap-8 flex-1">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-[#1a365d]">بسطة</h1>
            <ShoppingBag className="w-6 h-6 text-green-600" />
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl relative">
            <input
              type="text"
              placeholder="ابحث عن منتجات، متاجر، أو عروض..."
              className="w-full bg-[#f0f4f8] text-sm rounded-full py-2.5 px-4 pr-10 outline-none border border-transparent focus:border-[#1a365d] transition-colors"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Left side: Auth & Cart */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
            <Link href="#" className="text-[#1a365d] hover:text-blue-700 transition">
              تسجيل الدخول
            </Link>
            <Link href="#" className="bg-[#2b4c7e] text-white px-5 py-2.5 rounded-lg hover:bg-[#1a365d] transition">
              اشترك مجاناً
            </Link>
          </div>
          
          <Link href="#" className="relative flex items-center">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            <span className="absolute -top-2 -right-2 bg-[#a38024] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              3
            </span>
          </Link>
        </div>
      </div>

      {/* Bottom Nav (Categories) */}
      <div className="bg-[#f8fafc] border-t border-gray-100 hidden md:block">
        <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between text-sm font-semibold">
          <nav className="flex items-center gap-6 text-gray-600">
            <Link href="#" className="text-[#1a365d] border-b-2 border-[#1a365d] pb-1">الرئيسية</Link>
            <Link href="#" className="hover:text-[#1a365d] transition pb-1 border-b-2 border-transparent hover:border-[#1a365d]">الأقسام</Link>
            <Link href="#" className="hover:text-[#1a365d] transition pb-1 border-b-2 border-transparent hover:border-[#1a365d]">المتاجر المميزة</Link>
            <Link href="#" className="hover:text-[#1a365d] transition pb-1 border-b-2 border-transparent hover:border-[#1a365d]">أقوى العروض</Link>
            <Link href="#" className="hover:text-[#1a365d] transition pb-1 border-b-2 border-transparent hover:border-[#1a365d]">وصل حديثاً</Link>
            <Link href="#" className="hover:text-[#1a365d] transition pb-1 border-b-2 border-transparent hover:border-[#1a365d]">الأكثر مبيعاً</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="w-px h-5 bg-gray-300"></div>
            <Link href="#" className="text-[#846b2b] hover:text-[#a38024] font-bold flex items-center gap-2">
              بيع مع بسطة
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
