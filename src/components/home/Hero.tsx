import Link from 'next/link';

export default function Hero() {
  return (
    <section className="container mx-auto px-4 md:px-8 py-8">
      <div className="relative rounded-[2rem] overflow-hidden min-h-[500px] flex items-center bg-[#e2e8f0]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=2070&auto=format&fit=crop")' }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-white/80 via-white/40 to-transparent z-10 md:hidden"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-[#e2e8f0]/90 via-[#e2e8f0]/40 to-transparent z-10 hidden md:block"></div>
        
        {/* Content */}
        <div className="relative z-20 max-w-2xl px-8 md:px-16 py-12 text-[#1a365d]">
          <div className="inline-block bg-[#846b2b] text-white px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            عرض اليوم المحدود
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-[#1a365d]">
            بساطة في التسوق،<br />رقي في الاختيار.
          </h1>
          
          <p className="text-lg md:text-xl text-[#1a365d] mb-10 font-medium">
            اكتشف أفضل المتاجر المحلية والمنتجات الحصرية بأسعار تنافسية وتوصيل سريع حتى باب منزلك.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link href="#" className="bg-[#eab308] hover:bg-[#dca500] text-[#1a365d] font-extrabold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-yellow-500/20">
              تسوق الآن
            </Link>
            <Link href="#" className="bg-[#8b9bb4]/40 hover:bg-[#8b9bb4]/60 backdrop-blur-md text-white font-bold px-8 py-4 rounded-xl transition-colors">
              اكتشف المزيد
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
