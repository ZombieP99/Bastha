import { getDictionary } from '@/i18n/dictionaries';
import ShopDetailsHeader from '@/components/shops/ShopDetailsHeader';
import ProductGrid from '@/components/shops/ProductGrid';
import { Product } from '@/components/shops/ProductCard';
import { notFound } from 'next/navigation';

// Mock Data fetching function
async function getShopData(id: string, lang: string) {
  const isAr = lang === 'ar';
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // In a real app, you would fetch the shop by ID here.
  // For now, returning mock shop data.
  const shop = {
    id: parseInt(id),
    name: isAr ? 'مخبز اليازجي' : 'Al-Yazji Bakery',
    description: isAr 
      ? 'مخبوزات وكعك محلي طازج محضر يومياً بأجود المكونات الطبيعية. نحن نقدم تشكيلة واسعة من الخبز والمعجنات والحلويات.' 
      : 'Fresh local baked goods and cakes prepared daily with the finest natural ingredients. We offer a wide variety of breads, pastries, and sweets.',
    coverImage: 'https://picsum.photos/seed/bakery/1200/500',
    logo: '', // Let the header show the initial
    rating: 4.8,
    tags: ['Restaurants', 'Sweets'],
  };

  // Generate realistic mock products
  const products: Product[] = [
    {
      id: 1,
      name: isAr ? 'خبز فرنسي طازج' : 'Fresh French Baguette',
      description: isAr ? 'خبز فرنسي مقرمش يخبز يومياً' : 'Crispy authentic French baguette baked daily',
      price: 15,
      image: 'https://picsum.photos/seed/bread1/600/600',
      inStock: true,
      category: isAr ? 'مخبوزات' : 'Bakery',
    },
    {
      id: 2,
      name: isAr ? 'كرواسون بالزبدة' : 'Butter Croissant',
      description: isAr ? 'كرواسون غني بالزبدة هش ومقرمش' : 'Flaky and buttery authentic croissant',
      price: 12,
      image: 'https://picsum.photos/seed/croissant/600/600',
      inStock: true,
      category: isAr ? 'معجنات' : 'Pastries',
    },
    {
      id: 3,
      name: isAr ? 'كعكة الشوكولاتة الفاخرة' : 'Premium Chocolate Cake',
      description: isAr ? 'كعكة غنية بالشوكولاتة البلجيكية تكفي لـ 6 أشخاص' : 'Rich Belgian chocolate cake, serves 6',
      price: 120,
      image: 'https://picsum.photos/seed/cake/600/600',
      inStock: true,
      category: isAr ? 'حلويات' : 'Sweets',
    },
    {
      id: 4,
      name: isAr ? 'بسكويت الشوفان الصحي' : 'Healthy Oat Cookies',
      description: isAr ? 'بسكويت الشوفان مع العسل والزبيب' : 'Oat cookies made with honey and raisins',
      price: 25,
      image: 'https://picsum.photos/seed/cookies/600/600',
      inStock: false,
      category: isAr ? 'صحي' : 'Healthy',
    },
    {
      id: 5,
      name: isAr ? 'تارت الفواكه المشكلة' : 'Mixed Fruit Tart',
      description: isAr ? 'تارت طازج مع الكريمة والفواكه الموسمية' : 'Fresh tart with cream and seasonal fruits',
      price: 85,
      image: 'https://picsum.photos/seed/tart/600/600',
      inStock: true,
      category: isAr ? 'حلويات' : 'Sweets',
    },
    {
      id: 6,
      name: isAr ? 'فطيرة التفاح الكلاسيكية' : 'Classic Apple Pie',
      description: isAr ? 'فطيرة تفاح دافئة مع القرفة' : 'Warm apple pie with cinnamon spices',
      price: 60,
      image: 'https://picsum.photos/seed/pie/600/600',
      inStock: true,
      category: isAr ? 'حلويات' : 'Sweets',
    },
    {
      id: 7,
      name: isAr ? 'خبز أسمر للدايت' : 'Whole Wheat Diet Bread',
      description: isAr ? 'خبز صحي مصنوع من القمح الكامل 100%' : 'Healthy bread made from 100% whole wheat',
      price: 8,
      image: 'https://picsum.photos/seed/wheat/600/600',
      inStock: true,
      category: isAr ? 'صحي' : 'Healthy',
    },
    {
      id: 8,
      name: isAr ? 'دونات محشوة بالمربى' : 'Jam Filled Donuts',
      description: isAr ? 'دونات طازجة محشوة بمربى الفراولة اللذيذة' : 'Fresh donuts filled with delicious strawberry jam',
      price: 18,
      image: 'https://picsum.photos/seed/donut/600/600',
      inStock: true,
      category: isAr ? 'معجنات' : 'Pastries',
    }
  ];

  return { shop, products };
}

export default async function ShopDetailsPage({
  params,
}: {
  params: Promise<{ lang: string; shopId: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang;
  const shopId = resolvedParams.shopId;
  const dict = await getDictionary(lang as 'en' | 'ar');

  const { shop, products } = await getShopData(shopId, lang);

  if (!shop) {
    notFound();
  }

  const isAr = lang === 'ar';

  return (
    <div className="pb-20">
      {/* Header section with cover, logo, and store details */}
      <ShopDetailsHeader shop={shop} dict={dict} lang={lang} />

      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Section Tabs */}
        <div className={`flex items-center gap-8 mb-8 border-b border-gray-200 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="border-b-4 border-[#1a365d] pb-4 px-2">
            <h2 className="text-xl font-extrabold text-[#1a365d]">{dict?.shopsPage?.shopDetails?.products}</h2>
          </div>
          <div className="pb-4 px-2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            <h2 className="text-xl font-bold">{dict?.shopsPage?.shopDetails?.overview}</h2>
          </div>
          <div className="pb-4 px-2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            <h2 className="text-xl font-bold">{dict?.shopsPage?.shopDetails?.reviews}</h2>
          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid products={products} dict={dict} lang={lang} />
        
      </div>
    </div>
  );
}
