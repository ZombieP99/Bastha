import { getDictionary } from '@/i18n/dictionaries';
import { getNewProducts } from '@/lib/api';
import Link from 'next/link';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';

const PAGE_SIZE = 20;

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<any>;
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;

  const lang = resolvedParams.lang as 'en' | 'ar';
  const dict = await getDictionary(lang);
  const isAr = lang === 'ar';

  const currentPage = Math.max(1, parseInt(resolvedSearch.page || '1', 10));

  // Fetch paginated products from API
  const data = await getNewProducts(currentPage, PAGE_SIZE);
  const products = data.products || [];
  const total: number = data.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildPageUrl = (page: number) => `/${lang}/products?page=${page}`;

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-12 pb-20">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-[#e1eaf5] text-[#1a365d] rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1a365d] mb-3">
            {isAr ? 'جميع المنتجات' : 'All Products'}
          </h1>
          <p className="text-gray-500 max-w-2xl">
            {isAr
              ? `اكتشف جميع المنتجات المتوفرة في منصتنا — ${total} منتج`
              : `Discover all products available on our platform — ${total} products`}
          </p>
        </div>

        {/* Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {isAr ? 'لا توجد منتجات حالياً.' : 'No products available currently.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <div key={product._id}>
                <ProductCard product={product} lang={lang} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {/* Prev */}
            {currentPage > 1 ? (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-[#1a365d] hover:bg-[#1a365d] hover:text-white transition-colors shadow-sm"
                aria-label={isAr ? 'الصفحة السابقة' : 'Previous page'}
              >
                {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </Link>
            ) : (
              <span className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-300">
                {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </span>
            )}

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`e-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400 font-bold">
                    …
                  </span>
                ) : (
                  <Link
                    key={item}
                    href={buildPageUrl(item)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-colors shadow-sm text-sm ${
                      item === currentPage
                        ? 'bg-[#1a365d] text-white border border-[#1a365d]'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-[#eaf1f8] hover:text-[#1a365d]'
                    }`}
                  >
                    {item}
                  </Link>
                )
              )}

            {/* Next */}
            {currentPage < totalPages ? (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-[#1a365d] hover:bg-[#1a365d] hover:text-white transition-colors shadow-sm"
                aria-label={isAr ? 'الصفحة التالية' : 'Next page'}
              >
                {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </Link>
            ) : (
              <span className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-300">
                {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </span>
            )}
          </div>
        )}

        {/* Page info */}
        {totalPages > 1 && (
          <p className="text-center text-sm text-gray-400 mt-4">
            {isAr
              ? `صفحة ${currentPage} من ${totalPages}`
              : `Page ${currentPage} of ${totalPages}`}
          </p>
        )}
      </div>
    </div>
  );
}
