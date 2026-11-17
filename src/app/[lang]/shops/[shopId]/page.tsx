import { readShop } from '@/lib/catalog.server';
import type { Metadata } from 'next';
import ShopDetailsHeader from '@/components/shops/ShopDetailsHeader';
import ShopTabs from '@/components/shops/ShopTabs';
import { getDictionary } from '@/i18n/dictionaries';
import { getShopProducts } from '@/lib/api';
import axios from 'axios';
import { notFound } from 'next/navigation';

export default async function ShopDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; shopId: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang;
  const shopId = resolvedParams.shopId;
  const dict = await getDictionary(lang as 'en' | 'ar');

  let shop;
  let products: import('@/components/shops/ProductCard').Product[] = [];
  try {
    shop = await readShop(shopId);
    const listings = await getShopProducts(shopId);
    products = listings.map((l) => ({
      id: l.product._id,
      original: l.product,
      listingId: l._id,
      name: lang === 'ar' ? l.product.nameAr : l.product.name,
      description: l.product.description || '',
      price: l.price,
      image: l.product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
      inStock: l.inStock,
      category: typeof l.product.category === 'object' ? (lang === 'ar' ? l.product.category.nameAr : l.product.category.name) : '',
    }));
  } catch (error) {
    if(axios.isAxiosError(error) && error.response?.status===404)notFound();
    throw error;
  }

  if (!shop) {
    notFound();
  }


  return (
    <div className="pb-20">
      {/* Header section with cover, logo, and store details */}
      <ShopDetailsHeader shop={shop} dict={dict} lang={lang} />

      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-8">
        
        <ShopTabs shop={shop} products={products} dict={dict} lang={lang} />
        
      </div>
    </div>
  );
}

export async function generateMetadata({params}:{params:Promise<{lang:string;shopId:string}>}):Promise<Metadata>{const {lang,shopId}=await params;try{const shop=await readShop(shopId);return {title:shop.name+' | Bastha',description:shop.description,alternates:{languages:{ar:'/ar/shops/'+shopId,en:'/en/shops/'+shopId}}};}catch{return {title:lang==='ar'?'المتجر | بسطة':'Shop | Bastha'};}}
