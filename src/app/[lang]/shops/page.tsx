import ShopsHeader from '@/components/shops/ShopsHeader';
import ShopGrid from '@/components/shops/ShopGrid';
import { getDictionary } from '@/i18n/dictionaries';

export default async function ShopsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as 'en' | 'ar';
  const dict = await getDictionary(lang);

  return (
    <>
      <ShopsHeader dict={dict} lang={lang} />
      <ShopGrid dict={dict} lang={lang} />
    </>
  );
}
