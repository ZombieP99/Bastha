import Link from 'next/link';
import { 
  MonitorSmartphone, 
  Shirt, 
  Armchair, 
  ShieldPlus, 
  Baby, 
  Utensils,
  ArrowLeft
} from 'lucide-react';

const categories = [
  { id: 1, name: 'إلكترونيات', icon: MonitorSmartphone },
  { id: 2, name: 'أزياء وموضة', icon: Shirt },
  { id: 3, name: 'المنزل والأثاث', icon: Armchair },
  { id: 4, name: 'صحة وجمال', icon: ShieldPlus },
  { id: 5, name: 'ألعاب وأطفال', icon: Baby },
  { id: 6, name: 'مواد غذائية', icon: Utensils },
];

export default function Categories() {
  return (
    <section className="container mx-auto px-4 md:px-8 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1a365d] mb-2">تسوق حسب الفئة</h2>
          <p className="text-gray-500">اختر ما يناسبك من بين أكثر من 15 فئة متنوعة</p>
        </div>
        <Link href="#" className="flex items-center gap-2 text-[#1a365d] font-bold hover:text-blue-700 transition">
          مشاهدة الكل
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link 
              key={category.id} 
              href="#"
              className="flex flex-col items-center justify-center p-6 bg-[#e1eaf5] rounded-2xl hover:bg-[#d0dbe9] transition-colors group"
            >
              <div className="bg-white p-4 rounded-xl shadow-sm text-[#1a365d] mb-4 group-hover:scale-110 transition-transform">
                <Icon className="w-8 h-8" />
              </div>
              <span className="font-bold text-[#1a365d] text-center">{category.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
