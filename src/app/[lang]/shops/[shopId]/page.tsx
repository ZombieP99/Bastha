import OfferList from '@/components/offers/OfferList';
import { readShop } from '@/lib/catalog.server';
import type { Metadata } from 'next';
import ShopDetailsHeader from '@/components/shops/ShopDetailsHeader';
import ShopTabs from '@/components/shops/ShopTabs';
import { getDictionary } from '@/i18n/dictionaries';
import { getShopProducts } from '@/lib/api';
import axios from 'axios';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ShopDetailsPage({
  params, searchParams,
}: {
  searchParams: Promise<{tab?: string}>;
  params: Promise<{ lang: string; shopId: string }>;
}) {
  const reviews = (await searchParams).tab === 'reviews';
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
        
        {typeof shop.owner==='object' && shop.owner?._id && <Link className="my-3 inline-block underline" href={'/'+lang+'/shops?owner='+shop.owner._id}>{lang==='ar'?'متاجر هذا التاجر':'Shops by this seller'}</Link>}
        <OfferList key={shopId} lang={lang} shop={shopId}/>
        <ShopTabs key={String(reviews)} reviewsInitiallyOpen={reviews} shop={shop} products={products} dict={dict} lang={lang} />
        
      </div>
    </div>
  );
}

export async function generateMetadata({params}:{params:Promise<{lang:string;shopId:string}>}):Promise<Metadata>{const {lang,shopId}=await params;try{const shop=await readShop(shopId);return {title:shop.name+' | Bastah',description:shop.description,alternates:{languages:{ar:'/ar/shops/'+shopId,en:'/en/shops/'+shopId}}};}catch{return {title:lang==='ar'?'المتجر | بسطة':'Shop | Bastah'};}}
