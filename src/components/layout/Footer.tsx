import Link from 'next/link';
import { Globe, Share2, AtSign, CreditCard, Wallet, ChevronLeft } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* Brand & Socials */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-extrabold text-[#1a365d] mb-4">بسطة</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              تجارة بسيطة للجميع. نربطك بأفضل المتاجر المحلية بلمسة واحدة لنجعل من تسوقك تجربة ممتعة وموثوقة.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-[#e1eaf5] text-[#1a365d] flex items-center justify-center hover:bg-[#1a365d] hover:text-white transition">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#e1eaf5] text-[#1a365d] flex items-center justify-center hover:bg-[#1a365d] hover:text-white transition">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#e1eaf5] text-[#1a365d] flex items-center justify-center hover:bg-[#1a365d] hover:text-white transition">
                <AtSign className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#1a365d] font-bold mb-6">روابط سريعة</h3>
            <ul className="flex flex-col gap-3 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-[#1a365d] transition">من نحن</Link></li>
              <li><Link href="#" className="hover:text-[#1a365d] transition">تواصل معنا</Link></li>
              <li><Link href="#" className="hover:text-[#1a365d] transition">المتاجر</Link></li>
              <li><Link href="#" className="hover:text-[#1a365d] transition">العروض والخصومات</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[#1a365d] font-bold mb-6">قانوني</h3>
            <ul className="flex flex-col gap-3 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-[#1a365d] transition">سياسة الخصوصية</Link></li>
              <li><Link href="#" className="hover:text-[#1a365d] transition">شروط الخدمة</Link></li>
              <li><Link href="#" className="hover:text-[#1a365d] transition">مركز المساعدة</Link></li>
              <li><Link href="#" className="hover:text-[#1a365d] transition">الأسئلة الشائعة</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-[#1a365d] font-bold mb-6">اشترك في نشرتنا</h3>
            <p className="text-gray-500 text-sm mb-4">
              احصل على آخر العروض والمستجدات مباشرة في بريدك.
            </p>
            <div className="flex items-center">
              <input 
                type="email" 
                placeholder="البريد الإلكتروني" 
                className="w-full bg-[#eef3f9] text-sm py-3 px-4 rounded-r-lg outline-none border border-transparent focus:border-[#1a365d] transition-colors"
              />
              <button className="bg-[#2b4c7e] text-white py-3 px-4 rounded-l-lg hover:bg-[#1a365d] transition-colors flex items-center justify-center">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4">
          <p>© 2024 بسطة. تجارة بسيطة للجميع.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <CreditCard className="w-5 h-5" />
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>
    </footer>
  );
}
