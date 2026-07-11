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
        <div className={`flex flex-col gap-2 mb-4 ${isAr ? 'items-end' : 'items-start'}`}>
          <div className="w-3/4 h-6 bg-gray-200 rounded-lg"></div>
          <div className="w-full h-4 bg-gray-200 rounded-lg"></div>
          <div className="w-5/6 h-4 bg-gray-200 rounded-lg"></div>
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
