import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDownWideNarrow, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';
import CatalogProductCard from '@/components/products/CatalogProductCard';
import { getNewProducts } from '@/lib/api';

const PAGE_SIZE = 20;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: lang === 'ar' ? 'جميع المنتجات | بسطة' : 'All products | Bastah' };
}

export default async function ProductsPage({ params, searchParams }: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ lang }, query] = await Promise.all([params, searchParams]);
  const ar = lang === 'ar';
  const parsed = Number(query.page || 1);
  const page = Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
  const data = await getNewProducts(page, PAGE_SIZE);
  const products = data.products || [];
  const total = data.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = products.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const end = products.length ? start + products.length - 1 : 0;
  const format = (value: number) => value.toLocaleString(ar ? 'ar' : 'en');
  const href = (value: number) => `/${lang}/products?page=${value}`;
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])].filter(value => value >= 1 && value <= totalPages).sort((a, b) => a - b);
  const Previous = ar ? ChevronRight : ChevronLeft;
  const Next = ar ? ChevronLeft : ChevronRight;
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const pageButton = 'grid h-11 min-w-11 place-items-center rounded-xl border text-sm font-bold transition-colors';

  return <div className="min-h-screen bg-[#f7f9fc] pb-16 md:pb-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-7 md:pt-9">
      <nav aria-label={ar ? 'مسار الصفحة' : 'Breadcrumb'} className="mb-5 flex items-center gap-2 text-sm text-[#718198]">
        <Link href={`/${lang}`} className="transition-colors hover:text-[#1a365d]">{ar ? 'الرئيسية' : 'Home'}</Link>
        <span aria-hidden="true">/</span><span aria-current="page" className="font-medium text-[#1a365d]">{ar ? 'المنتجات' : 'Products'}</span>
      </nav>
      <header className="pb-10 pt-3 sm:pb-12 sm:pt-5">
        <div>
          <p className="mb-4 flex items-center gap-3 text-xs sm:text-sm font-bold text-[#8a713a]"><span className="h-px w-7 bg-[#a88b4b]" aria-hidden="true"/>{ar ? 'اختياراتك تبدأ من هنا' : 'Your next find starts here'}</p>
          <h1 className="text-[2.6rem] sm:text-5xl md:text-[3.5rem] font-extrabold leading-[1.25] text-[#173353]">{ar ? 'جميع المنتجات' : 'All products'}<span className="text-[#a88b4b]">.</span></h1>
          <p className="mt-4 max-w-lg text-base leading-8 text-[#687b91]">{ar ? 'تصفّح منتجات المتاجر المحلية، وقارن عروضها. اختيارك الأفضل يبدأ بمقارنة بسيطة.' : 'Explore products from local shops and compare their offers. A better choice starts with a simple comparison.'}</p>
        </div>
      </header>

      <section aria-label={ar ? 'كتالوج المنتجات' : 'Product catalog'} className="border-t border-[#1a365d]/[0.07] pt-6 md:pt-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#61738a]">{products.length ? (ar ? <>عرض <span className="font-bold text-[#1a365d] tabular-nums">{format(start)}–{format(end)}</span> من {format(total)} منتجًا</> : <>Showing <span className="font-bold text-[#1a365d] tabular-nums">{format(start)}–{format(end)}</span> of {format(total)} products</>) : (ar ? `${format(total)} منتج` : `${format(total)} products`)}</p>
          <span className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#526780]"><ArrowDownWideNarrow className="h-4 w-4" strokeWidth={1.6} aria-hidden="true"/>{ar ? 'الأحدث أولًا' : 'Newest first'}</span>
        </div>
        {products.length ? <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map(product => <CatalogProductCard key={product._id} product={product} lang={lang}/>)}
        </div> : <div className="rounded-2xl border border-[#e1e8f0] bg-white py-16 px-5 text-center">
          <PackageOpen className="mx-auto mb-4 h-10 w-10 text-[#9aabc0]" strokeWidth={1.4} aria-hidden="true"/>
          <h2 className="text-xl font-bold text-[#1a365d]">{ar ? 'لا توجد منتجات في هذه الصفحة' : 'No products on this page'}</h2>
          <p className="mt-2 text-[#61738a] text-sm">{ar ? 'جرّب العودة إلى البداية أو تصفّح المتاجر.' : 'Return to the first page or browse the stores.'}</p>
          <Link href={page > 1 ? href(1) : `/${lang}/shops`} className="mt-6 inline-flex items-center gap-2 font-bold text-sm text-[#1a365d] underline underline-offset-4">{page > 1 ? (ar ? 'الصفحة الأولى' : 'First page') : (ar ? 'تصفّح المتاجر' : 'Browse stores')}<Arrow className="h-4 w-4" aria-hidden="true"/></Link>
        </div>}

        {totalPages > 1 && <div className="mt-9 md:mt-11 border-t border-[#e1e8f0] pt-7 flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-sm text-[#61738a]">{ar ? `صفحة ${format(page)} من ${format(totalPages)}` : `Page ${format(page)} of ${format(totalPages)}`}</p>
          <nav aria-label={ar ? 'صفحات المنتجات' : 'Product pages'} className="flex items-center gap-2">
            {page > 1 ? <Link href={href(page - 1)} className={`${pageButton} bg-white border-[#dce4ee] text-[#1a365d] hover:bg-[#e8eff7]`} aria-label={ar ? 'الصفحة السابقة' : 'Previous page'}><Previous className="h-4 w-4"/></Link> : <span aria-disabled="true" className={`${pageButton} border-transparent text-[#b5bfcd]`}><Previous className="h-4 w-4"/></span>}
            {pages.map((value, index) => <span key={value} className="contents">
              {index > 0 && value - pages[index - 1] > 1 && <span className="px-1 text-[#718198]" aria-hidden="true">…</span>}
              <Link href={href(value)} aria-label={ar ? `الصفحة ${format(value)}` : `Page ${value}`} aria-current={value === page ? 'page' : undefined} className={`${pageButton} ${value === page ? 'bg-[#1a365d] border-[#1a365d] text-white' : 'bg-white border-[#dce4ee] text-[#526780] hover:bg-[#e8eff7]'}`}>{format(value)}</Link>
            </span>)}
            {page < totalPages ? <Link href={href(page + 1)} className={`${pageButton} bg-white border-[#dce4ee] text-[#1a365d] hover:bg-[#e8eff7]`} aria-label={ar ? 'الصفحة التالية' : 'Next page'}><Next className="h-4 w-4"/></Link> : <span aria-disabled="true" className={`${pageButton} border-transparent text-[#b5bfcd]`}><Next className="h-4 w-4"/></span>}
          </nav>
        </div>}
      </section>
    </div>
  </div>;
}
