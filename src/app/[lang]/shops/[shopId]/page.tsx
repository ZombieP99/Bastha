import { getDictionary } from '@/i18n/dictionaries';
import ShopDetailsHeader from '@/components/shops/ShopDetailsHeader';
import ShopTabs from '@/components/shops/ShopTabs';
import { notFound } from 'next/navigation';
import { getShopById, getShopProducts } from '@/lib/api';

export default async function ShopDetailsPage({
  params,
}: {
  params: Promise<any>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang;
  const shopId = resolvedParams.shopId;
  const dict = await getDictionary(lang as 'en' | 'ar');

  let shop;
  let products = [];
  try {
    shop = await getShopById(shopId);
    const listings = await getShopProducts(shopId);
    products = listings.map((l: any) => ({
      id: l.product._id,
      name: lang === 'ar' ? l.product.nameAr : l.product.name,
      description: l.product.description || '',
      price: l.price,
      image: l.product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
      inStock: l.inStock,
      category: lang === 'ar' && l.product.category?.nameAr ? l.product.category.nameAr : l.product.category?.name || 'Category',
    }));
  } catch (error) {
    console.error("Error fetching shop data:", error);
  }

  if (!shop) {
    notFound();
  }

  const isAr = lang === 'ar';

  return (
    <div className="pb-20">
      {/* Header section with cover, logo, and store details */}
      <ShopDetailsHeader shop={shop as any} dict={dict} lang={lang} />

      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-8">
        
        <ShopTabs shop={shop as any} products={products} dict={dict} lang={lang} />
        
      </div>
    </div>
  );
}
