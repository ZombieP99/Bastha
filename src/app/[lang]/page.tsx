import Hero from '@/components/home/Hero';
import TrendingProducts from '@/components/home/TrendingProducts';
import NewArrivals from '@/components/home/NewArrivals';
import FeaturedStores from '@/components/home/FeaturedStores';
import { getDictionary } from '@/i18n/dictionaries';

export default async function Home({
  params,
}: {
  params: Promise<any>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as 'en' | 'ar';
  const dict = await getDictionary(lang);

  return (
    <>
      <Hero dict={dict} lang={lang} />
      <TrendingProducts dict={dict} lang={lang} />
      <NewArrivals dict={dict} lang={lang} />
      <FeaturedStores dict={dict} lang={lang} />
    </>
  );
}
