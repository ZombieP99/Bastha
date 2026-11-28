'use client';
import { shoppingLogin } from '@/lib/shopping-login';
import { useMounted } from '@/hooks/useMounted';
import api from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import type { Listing,Product } from '@/types';
import type { Dictionary } from '@/types/dictionary';
import { motion } from 'framer-motion';
import { Banknote,CheckCircle,Heart,Loader2,RotateCcw,Share2,ShoppingCart,Star,Store,Truck } from 'lucide-react';
import ProductImage from './ProductImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect,useState } from 'react';
import toast from 'react-hot-toast';

interface ProductDetailsProps {
  dict: Dictionary;
  lang: string;
  productId: string;
  selectedListingId?: string;
  initialData?: {product:Product;listings:Listing[]};
}

export default function ProductDetails({ dict, lang, productId, initialData, selectedListingId }: ProductDetailsProps) {
  const mounted=useMounted();
  const wishlisted = useWishlistStore(s=>s.items.some(item=>item._id===productId));
  const toggleWishlist = useWishlistStore(s=>s.toggleWishlist);
  const isAr = lang === 'ar';
  const router = useRouter();
  const [data, setData] = useState<{product:Product & {descriptionAr?:string;rating?:number;reviewsCount?:number};listings:Listing[]} | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [fetchError,setFetchError]=useState('');
  const [retry,setRetry]=useState(0);
  
  const { addItem, isLoading: addingToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if(initialData)return;
    let active=true;
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${productId}/listings`);
        if(active)setData(res.data);
      } catch (err) {
        if(active)setFetchError(errorMessage(err));
      } finally {
        if(active)setLoading(false);
      }
    };
    fetchProduct();
    return ()=>{active=false;};
  }, [productId,retry,initialData]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: isAr ? data?.product?.nameAr : data?.product?.name,
          text: isAr ? data?.product?.descriptionAr : data?.product?.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(isAr ? 'تم نسخ الرابط بنجاح!' : 'Link copied successfully!');
      }
    } catch (error) {
      toast.error(isAr ? 'حدث خطأ أثناء المشاركة' : 'Error sharing');
      console.log('Error sharing', error);
    }
  };

  const handleAddToCart = async (listingId: string) => {
    if (!isAuthenticated) {
      toast(isAr ? 'يجب تسجيل الدخول أولاً' : 'Please login first', { icon: '🔒' });
      router.push(shoppingLogin(lang, productId, listingId));
      return;
    }
    setAddingId(listingId);
    try {
      await addItem(listingId, 1);
      toast.success(isAr ? 'تمت الإضافة للسلة بنجاح!' : 'Added to cart successfully!');
    } catch (err: unknown) {
      toast.error(errorMessage(err));
      console.error(err);
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 pb-28 md:pb-12 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-5 lg:gap-7">
          <div className="aspect-square bg-gray-200 rounded-2xl w-full max-w-[400px] md:max-w-none mx-auto"></div>
          <div className="flex flex-col gap-6 pt-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mt-4"></div>
            <div className="h-32 bg-gray-200 rounded w-full mt-4"></div>
            <div className="h-16 bg-gray-200 rounded w-full mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if(fetchError)return <div role="alert" className="p-12"><p>{fetchError}</p><button onClick={()=>{setFetchError('');setLoading(true);setRetry(n=>n+1);}}>{isAr?'إعادة المحاولة':'Retry'}</button></div>;
  if (!data || !data.product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-bold text-xl">
        {isAr ? 'المنتج غير موجود' : 'Product not found'}
      </div>
    );
  }

  const { product, listings } = data;
  const bestListing = selectedListingId ? listings.find(listing => listing._id === selectedListingId && listing.inStock) : listings?.reduce<Listing | undefined>((best, listing) => listing.inStock && (!best || listing.price < best.price) ? listing : best, undefined);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 pb-28 md:pb-12">
      {/* Breadcrumb */}
      <nav className="text-xs sm:text-sm text-[#718198] mb-4 flex min-w-0 items-center gap-2">
        <Link href={`/${lang}`} className="hover:text-[#1a365d] transition">{dict.nav?.home || 'Home'}</Link>
        <span>/</span>
        <Link href={`/${lang}/search?category=${(product.category && typeof product.category === 'object' ? product.category._id : product.category || '')}`} className="hover:text-[#1a365d] transition">
          {isAr ? (product.category && typeof product.category === 'object' ? product.category.nameAr : '') : (product.category && typeof product.category === 'object' ? product.category.name : '')}
        </Link>
        <span>/</span>
        <span className="text-[#1a365d] font-medium truncate min-w-0">{isAr ? product.nameAr : product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-center gap-6 lg:gap-10 mb-7">
        {/* Product Images */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full max-w-[400px] md:max-w-none mx-auto rounded-2xl overflow-hidden bg-[#f0f3f7]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <ProductImage
                product={product}
                alt={isAr ? product.nameAr : product.name}
                className="object-cover"
                sizes="(max-width: 767px) min(92vw, 400px), (max-width: 1023px) 44vw, 440px"
                priority
              />
            </motion.div>
            <button aria-label={isAr ? 'المفضلة' : 'Wishlist'} aria-pressed={mounted && wishlisted} onClick={()=>toggleWishlist(product)} className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} bg-white/90 backdrop-blur-md p-2 rounded-full cursor-pointer hover:bg-white transition hover:text-red-500 shadow-sm`}>
              <Heart className={mounted && wishlisted ? "w-5 h-5 fill-red-500 text-red-500" : "w-5 h-5 text-gray-400"} />
            </button>
          </div>
          

        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-4">
            <span className="inline-block text-[#8a713a] font-medium text-xs mb-2">
              {product.category && typeof product.category === 'object' ? (isAr ? product.category.nameAr : product.category.name) : ''}
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#1a365d] mb-4 leading-snug">
              {isAr ? product.nameAr : product.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {bestListing?.inStock && (
                <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {(isAr ? 'متوفر' : 'In stock')}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-2xl lg:text-3xl font-bold tabular-nums text-[#1a365d]">
                {bestListing ? `${bestListing.price} ${dict.common?.currency || 'ILS'}` : (isAr ? 'غير متوفر' : 'Unavailable')}
              </span>
              {bestListing?.shop?.name && <span className="text-sm text-slate-600">{bestListing.shop.name}</span>}
            </div>
          </div>

          <p className="text-[#61738a] text-sm leading-6 mb-4 max-w-prose whitespace-pre-line">
            {isAr ? product.descriptionAr || product.description : product.description}
          </p>

          {/* Actions */}
          <div className="flex gap-2 mb-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!bestListing || (addingToCart && addingId === bestListing?._id)}
              onClick={() => bestListing && handleAddToCart(bestListing._id)}
              className="flex-1 min-h-11 bg-[#1a365d] text-white py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#254b77] transition disabled:opacity-50"
            >
              {addingToCart && addingId === bestListing?._id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
              {dict.product?.addToCart || 'Add to Cart'}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare} aria-label={isAr ? 'مشاركة المنتج' : 'Share product'}
              className="size-11 shrink-0 rounded-xl border border-[#dce4ee] flex items-center justify-center text-gray-500 hover:text-[#1a365d] hover:border-[#1a365d] transition"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-x-5 gap-y-3 border-t border-[#e1e8f0] pt-4">
            <div className="flex items-center gap-2">
              <div className="text-[#718198]">
                <Banknote className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-600">{isAr ? 'الدفع نقدًا' : 'Cash payment'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[#718198]">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-600">{isAr ? 'توصيل أو استلام من المتجر' : 'Delivery or store pickup'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[#718198]">
                <RotateCcw className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-600">{isAr ? 'راجع سياسة المتجر' : 'Check shop return policy'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Stores Section */}
      {selectedListingId && !bestListing && <p role="status" className="rounded-xl bg-amber-50 p-4">{isAr ? 'العرض الذي اخترته غير متوفر. اختر عرضًا آخر من المتاجر المتاحة.' : 'Your selected listing is unavailable. Choose another available store.'}</p>}
      {listings.length === 0 && <p role="status" className="rounded-xl bg-slate-50 p-4 text-slate-700">{isAr ? 'لا يبيع أي متجر هذا المنتج حتى الآن.' : 'No shop sells this product yet.'}</p>}
      {listings && listings.length > 0 && (
        <div className="mt-0 border-t border-[#e1e8f0] pt-5">
          <h2 className="text-lg font-bold text-[#1a365d] mb-4 flex items-center gap-2">
            <Store className="w-6 h-6" />
            {dict.product?.availableStores || 'Available Stores'}
          </h2>
          
          <div className="bg-white border border-[#e1e8f0] rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-gray-100">
              {listings.map((listing: Listing) => (
                <div id={'listing-' + listing._id} key={listing._id} className="scroll-mt-24 target:bg-blue-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f7f9fc] transition">
                  <div className="flex items-center gap-4">
                    <div className="size-10 shrink-0 rounded-lg bg-[#f0f3f7] flex items-center justify-center font-bold text-gray-400">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <Link href={`/${lang}/shops/${listing.shop?._id}`} className="font-bold text-sm text-[#1a365d] hover:underline">
                        {listing.shop?.name} {listing.shop?.isVerified && (isAr ? '· موثّق' : '· Verified')}
                      </Link>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Star className="w-3.5 h-3.5 text-[#eab308] fill-[#eab308]" />
                        <span>{listing.shop?.ratingCount ? listing.shop.ratingAvg : (isAr ? 'لم يُقيّم بعد' : 'Not yet rated')}</span>
                        <span className="mx-2">•</span>
                        <span>{listing.shop?.area}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto">
                    <span className="text-xl font-bold tabular-nums text-[#1a365d]">
                      {listing.price} {dict.common?.currency || 'ILS'}
                      {listing.priceConfirmedAt && <small className="block font-normal">{isAr ? 'تأكيد السعر' : 'Price checked'} · {new Date(listing.priceConfirmedAt).toLocaleDateString(lang,{timeZone:'Asia/Gaza'})}</small>}
                    </span>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!listing.inStock || (addingToCart && addingId === listing._id)}
                      onClick={() => handleAddToCart(listing._id)}
                      className="min-h-10 px-4 py-2 text-sm bg-white border border-[#1a365d] text-[#1a365d] font-bold rounded-lg hover:bg-[#1a365d] hover:text-white transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {addingToCart && addingId === listing._id && <Loader2 className="w-4 h-4 animate-spin" />}
                      {dict.product?.addToCart || 'Add to Cart'}
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Cart Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between gap-4 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-bold">{(isAr ? 'الإجمالي' : 'Total')}</span>
          <span className="text-lg font-black text-[#1a365d]">
            {bestListing ? `${bestListing.price} ${dict.common?.currency || 'ILS'}` : '-'}
          </span>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          disabled={!bestListing || (addingToCart && addingId === bestListing?._id)}
          onClick={() => bestListing && handleAddToCart(bestListing._id)}
          className="flex-1 bg-[#1a365d] text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-900/20"
        >
          {addingToCart && addingId === bestListing?._id ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ShoppingCart className="w-5 h-5" />
          )}
          {dict.product?.addToCart || 'Add to Cart'}
        </motion.button>
      </div>
    </div>
  );
}
