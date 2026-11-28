'use client';

import { ArrowUpLeft, ArrowUpRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { useMounted } from '@/hooks/useMounted';
import { useWishlistStore } from '@/store/useWishlistStore';
import type { Product } from '@/types';
import ProductImage from './ProductImage';

export default function CatalogProductCard({ product, lang }: { product: Product; lang: string }) {
  const ar = lang === 'ar';
  const mounted = useMounted();
  const saved = useWishlistStore(state => state.items.some(item => item._id === product._id));
  const toggle = useWishlistStore(state => state.toggleWishlist);
  const name = (ar ? product.nameAr : product.name) || product.name || product.nameAr;
  const category = typeof product.category === 'object' && product.category
    ? (ar ? product.category.nameAr : product.category.name) : '';
  const href = `/${lang}/products/${product._id}`;
  const Arrow = ar ? ArrowUpLeft : ArrowUpRight;

  return <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-[#1a365d]/[0.06] transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-18px_rgba(26,54,93,0.2)]">
      <div className="relative">
        <Link href={href} className="block relative aspect-square overflow-hidden bg-[#f0f3f7]" aria-label={name}>
          <ProductImage product={product} alt={name} sizes="(max-width: 639px) 46vw, (max-width: 1023px) 30vw, (max-width: 1439px) 23vw, 308px" className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.045]"/>
        </Link>
        <button type="button" onClick={() => toggle(product)} aria-label={`${mounted && saved ? (ar ? 'إزالة من المفضلة' : 'Remove from wishlist') : (ar ? 'إضافة للمفضلة' : 'Save to wishlist')}: ${name}`} aria-pressed={mounted && saved}
          className={`absolute top-2.5 end-2.5 grid size-10 place-items-center rounded-full shadow-[0_2px_12px_rgba(26,54,93,0.06)] transition-[color,background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95 ${mounted && saved ? 'bg-red-50 text-red-600' : 'bg-white text-[#52647c] hover:text-[#1a365d]'}`}>
          <Heart className={`size-[18px] ${mounted && saved ? 'fill-current' : ''}`} strokeWidth={1.5} aria-hidden="true"/>
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <p className="mb-1.5 min-h-4 truncate text-[11px] sm:text-xs font-medium text-[#718198]">{category || (ar ? 'من متاجر بسطة' : 'From Bastah shops')}</p>
        <h2 className="text-base sm:text-lg font-bold leading-7 text-[#173353]"><Link href={href} className="line-clamp-2 transition-colors duration-300 hover:text-[#8a713a]">{name}</Link></h2>
        <div className="mt-auto pt-4">
          <Link href={href} className="group/offer flex min-h-12 items-center justify-between gap-2 rounded-full bg-[#1a365d] ps-3 sm:ps-4 pe-1.5 py-1.5 text-xs sm:text-sm font-bold text-white shadow-[0_5px_14px_-7px_rgba(26,54,93,0.45)] transition-[background-color,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#254b77] active:scale-[0.98]">
            <span className="sm:hidden whitespace-nowrap">{ar ? 'العروض' : 'Offers'}</span><span className="hidden sm:inline whitespace-nowrap">{ar ? 'عرض العروض' : 'View offers'}</span>
            <span className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-full bg-[#b59a60] text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover/offer:-translate-y-0.5"><Arrow className="size-[18px]" strokeWidth={1.6} aria-hidden="true"/></span>
          </Link>
        </div>
      </div>
  </article>;
}
