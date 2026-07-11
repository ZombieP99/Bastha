import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import TrendingProducts from '@/components/home/TrendingProducts';
import FeaturedStores from '@/components/home/FeaturedStores';

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <TrendingProducts />
      <FeaturedStores />
    </>
  );
}
