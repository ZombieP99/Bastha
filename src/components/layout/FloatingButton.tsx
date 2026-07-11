import { Store } from 'lucide-react';

export default function FloatingButton() {
  return (
    <button className="fixed bottom-6 left-6 z-50 bg-[#6b705c] hover:bg-[#5a5e4d] text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 transition-transform transform hover:scale-105 font-bold">
      ابدأ البيع اليوم
      <Store className="w-5 h-5" />
    </button>
  );
}
