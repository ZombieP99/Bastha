import ShopCard from '@/components/shops/ShopCard';
import { getDictionary } from '@/i18n/dictionaries';
import api, { getShops } from '@/lib/api';
import { Store } from 'lucide-react';

export default async function ShopsPage({
  params, searchParams,
}: {
  searchParams: Promise<{owner?:string;deliversTo?:string}>;
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as 'en' | 'ar';
  const dict = await getDictionary(lang);
  const isAr = lang === 'ar';

  // Fetch all shops
  const {owner,deliversTo}=await searchParams;
  const [shops,areaData]=await Promise.all([getShops({owner,deliversTo}),api.get<{areas:{_id:string;name:string;nameAr:string}[]}>('/areas').catch(()=>null)]);

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-12 pb-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-[#e1eaf5] text-[#1a365d] rounded-full flex items-center justify-center mb-4">
            <Store className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1a365d] mb-3">
            {isAr ? 'جميع المتاجر' : 'All Shops'}
          </h1>
          <p className="text-gray-500 max-w-2xl">
            {isAr ? 'تصفح جميع المتاجر المتاحة على منصتنا واكتشف أفضل العروض.' : 'Browse all shops available on our platform and discover the best deals.'}
          </p>
        </div>

        {areaData && <form className="mb-4 flex items-center gap-2">{owner && <input type="hidden" name="owner" value={owner}/>}<label>{isAr?'منطقة التوصيل':'Delivery area'} <select name="deliversTo" defaultValue={deliversTo || ''}><option value="">{isAr?'جميع المناطق':'All areas'}</option>{areaData.data.areas.map(a=><option key={a._id} value={a._id}>{isAr?a.nameAr:a.name}</option>)}</select></label><button className="rounded-lg border p-2">{isAr?'عرض':'Apply'}</button></form>}
        {shops.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {isAr ? 'لا توجد متاجر حالياً.' : 'No shops available currently.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <ShopCard key={shop._id} shop={shop} dict={dict} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
