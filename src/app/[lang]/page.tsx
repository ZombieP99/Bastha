import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import TrendingProducts from '@/components/home/TrendingProducts';
import FeaturedStores from '@/components/home/FeaturedStores';
import { getDictionary } from '@/i18n/dictionaries';

export default async function Home({
  params,
}: {
  params: { lang: 'en' | 'ar' };
}) {
  const resolvedParams = await params;
  const { lang } = resolvedParams;
  const dict = await getDictionary(lang);

  return (
    <>
      <Hero dict={dict} />
      <Categories dict={dict} lang={lang} />
      <TrendingProducts dict={dict} lang={lang} />
      <FeaturedStores dict={dict} lang={lang} />
    </>
  );
}
