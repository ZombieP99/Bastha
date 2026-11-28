'use client';
import type { Dictionary } from '@/types/dictionary';
import { Banknote } from 'lucide-react';
import Link from 'next/link';

export default function Footer({ dict, lang }: { dict: Dictionary, lang?: string }) {
  const isAr = lang === 'ar' || !lang;

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 mb-12">

          <div className="flex flex-col">
            <h2 className="text-2xl font-extrabold text-[#1a365d] mb-4">
              {isAr ? 'بسطة' : 'Bastah'}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {dict?.footer?.description}
            </p>
          </div>

          <div>
            <h3 className="text-[#1a365d] font-bold mb-6">{dict?.footer?.quickLinks?.title}</h3>
            <ul className="flex flex-col gap-3 text-sm text-gray-500">
              <li><Link href={`/${lang}/support`} className="hover:text-[#1a365d] hover:translate-x-1 transition-all inline-block">{dict?.footer?.quickLinks?.about}</Link></li>
              <li><Link href={`/${lang}/support?tab=contact`} className="hover:text-[#1a365d] hover:translate-x-1 transition-all inline-block">{dict?.footer?.quickLinks?.contact}</Link></li>
              <li><Link href={`/${lang}/shops`} className="hover:text-[#1a365d] hover:translate-x-1 transition-all inline-block">{dict?.footer?.quickLinks?.stores}</Link></li>
              <li><Link href={`/${lang}/offers`} className="hover:text-[#1a365d] hover:translate-x-1 transition-all inline-block">{dict?.footer?.quickLinks?.offers}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#1a365d] font-bold mb-6">{dict?.footer?.legal?.title}</h3>
            <ul className="flex flex-col gap-3 text-sm text-gray-500">
              <li><Link href={`/${lang}/support?tab=policies#privacy`} className="hover:text-[#1a365d] hover:translate-x-1 transition-all inline-block">{dict?.footer?.legal?.privacy}</Link></li>
              <li><Link href={`/${lang}/support?tab=policies#terms`} className="hover:text-[#1a365d] hover:translate-x-1 transition-all inline-block">{dict?.footer?.legal?.terms}</Link></li>
              <li><Link href={`/${lang}/support`} className="hover:text-[#1a365d] hover:translate-x-1 transition-all inline-block">{dict?.footer?.legal?.help}</Link></li>
              <li><Link href={`/${lang}/support?tab=faq`} className="hover:text-[#1a365d] hover:translate-x-1 transition-all inline-block">{dict?.footer?.legal?.faq}</Link></li>
            </ul>
          </div>



        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4">
          <p>{dict?.footer?.copyright}</p>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Banknote className="w-5 h-5" />
            <span>{isAr ? 'الدفع نقداً عند الاستلام' : 'Cash on delivery only'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
