import { getDictionary } from '@/i18n/dictionaries';
import { getNewProducts } from '@/lib/api';
import Link from 'next/link';
import { Package } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';

export default async function ProductsPage({
  params,
}: {
  params: Promise<any>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as 'en' | 'ar';
  const dict = await getDictionary(lang);
  const isAr = lang === 'ar';

  // Fetch all products (limit to 50 for now)
  const data = await getNewProducts(1, 50);
  const products = data.products || [];

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-12 pb-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-[#e1eaf5] text-[#1a365d] rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1a365d] mb-3">
            {isAr ? 'جميع المنتجات' : 'All Products'}
          </h1>
          <p className="text-gray-500 max-w-2xl">
            {isAr ? 'اكتشف جميع المنتجات المتوفرة في منصتنا.' : 'Discover all products available on our platform.'}
          </p>
        </div>

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
      </div>
    </div>
  );
}
