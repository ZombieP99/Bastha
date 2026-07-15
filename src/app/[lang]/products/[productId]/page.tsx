import { getDictionary } from '@/i18n/dictionaries';
import ProductDetails from '@/components/products/ProductDetails';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; productId: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as 'en' | 'ar';
  const productId = resolvedParams.productId;
  const dict = await getDictionary(lang);

  return (
    <div className="bg-white min-h-screen">
      <ProductDetails dict={dict} lang={lang} productId={productId} />
    </div>
  );
}
