'use client';

export default function SkeletonShopCard({ lang }: { lang: string }) {
  const isAr = lang === 'ar';

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="relative h-48 bg-gray-200">
        {/* Rating Badge Skeleton */}
        <div className="absolute top-4 left-4 bg-gray-300 w-16 h-8 rounded-xl"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6 flex flex-col flex-1 relative z-20">
        <div className={`flex items-start justify-between gap-4 mb-4 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Logo Skeleton */}
          <div className="w-16 h-16 rounded-2xl border-2 border-white flex-shrink-0 bg-gray-200 -mt-12 z-20"></div>
          
          {/* Title & Desc Skeleton */}
          <div className={`flex-1 flex flex-col gap-2 mt-1 ${isAr ? 'items-end' : 'items-start'}`}>
            <div className="w-3/4 h-6 bg-gray-200 rounded-lg"></div>
            <div className="w-full h-4 bg-gray-200 rounded-lg"></div>
            <div className="w-5/6 h-4 bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        {/* Tags Skeleton */}
        <div className={`flex flex-wrap gap-2 mb-8 ${isAr ? 'justify-end' : 'justify-start'}`}>
          <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
          <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
        </div>

        {/* Button Skeleton */}
        <div className="mt-auto pt-4 border-t border-gray-50">
          <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
