'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Banknote, Truck, RotateCcw, Share2, Store, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

interface ProductDetailsProps {
  dict: any;
  lang: string;
  productId: string;
}

export default function ProductDetails({ dict, lang, productId }: ProductDetailsProps) {
  const isAr = lang === 'ar';
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { addItem, isLoading: addingToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://bastah-backend.onrender.com/api'}/products/${productId}/listings`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

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
      router.push(`/${lang}/auth?mode=login`);
      return;
    }
    setAddingId(listingId);
    try {
      await addItem(listingId, 1);
      toast.success(isAr ? 'تمت الإضافة للسلة بنجاح!' : 'Added to cart successfully!');
    } catch (err: any) {
      toast.error(err.message || (isAr ? 'فشل إضافة المنتج' : 'Failed to add product'));
      console.error(err);
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-200 rounded-2xl w-full"></div>
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

  if (!data || !data.product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-bold text-xl">
        {isAr ? 'المنتج غير موجود' : 'Product not found'}
      </div>
    );
  }

  const { product, listings } = data;
  const bestListing = listings?.[0]; // Usually the cheapest or first

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <Link href={`/${lang}`} className="hover:text-[#1a365d] transition">{dict.nav?.home || 'Home'}</Link>
        <span>/</span>
        <Link href={`/${lang}/search?category=${product.category?.slug || product.category}`} className="hover:text-[#1a365d] transition">
          {isAr ? product.category?.nameAr || product.category : product.category?.name || product.category}
        </Link>
        <span>/</span>
        <span className="text-[#1a365d] font-medium truncate w-48">{isAr ? product.nameAr : product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <Image
                src={product.images?.[activeImage] || product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'}
                alt={isAr ? product.nameAr : product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </motion.div>
            <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} bg-white/90 backdrop-blur-md p-2 rounded-full cursor-pointer hover:bg-white transition hover:text-red-500 shadow-sm`}>
              <Heart className="w-5 h-5 text-gray-400 hover:fill-red-500 hover:text-red-500 transition" />
            </div>
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img: string, idx: number) => (
                  <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#1a365d] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full mb-3 uppercase tracking-wider">
              {isAr ? product.category?.nameAr || product.category : product.category?.name || product.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a365d] mb-4 leading-tight">
              {isAr ? product.nameAr : product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1 bg-[#fff8e1] px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-[#eab308] fill-[#eab308]" />
                <span className="font-bold text-gray-800">{product.rating || '0.0'}</span>
                <span className="text-gray-500 text-sm ml-1">({product.reviewsCount || 0} {dict.product?.reviews || 'Reviews'})</span>
              </div>
              {bestListing?.inStock && (
                <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {dict.product?.inStock || 'In Stock'}
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-[#1a365d]">
                {bestListing ? `${bestListing.price} ${dict.common?.currency || 'ILS'}` : (isAr ? 'غير متوفر' : 'Unavailable')}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            {isAr ? product.descriptionAr || product.description : product.description}
          </p>

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!bestListing || (addingToCart && addingId === bestListing?._id)}
              onClick={() => bestListing && handleAddToCart(bestListing._id)}
              className="flex-1 bg-[#1a365d] text-white py-4 px-8 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#12284b] transition shadow-lg shadow-blue-900/20 disabled:opacity-50"
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
              onClick={handleShare}
              className="w-16 h-16 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#1a365d] hover:border-[#1a365d] transition"
            >
              <Share2 className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-100 py-6">
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1a365d]">
                <Banknote className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-600">الدفع نقداً / Cash Only</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1a365d]">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-600">توصيل محلي / Local Delivery</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1a365d]">
                <RotateCcw className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-600">Free Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Stores Section */}
      {listings && listings.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-[#1a365d] mb-6 flex items-center gap-2">
            <Store className="w-6 h-6" />
            {dict.product?.availableStores || 'Available Stores'}
          </h2>
          
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-gray-100">
              {listings.map((listing: any) => (
                <div key={listing._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <Link href={`/${lang}/shops/${listing.shop?._id}`} className="font-bold text-lg text-[#1a365d] hover:underline">
                        {listing.shop?.name}
                      </Link>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Star className="w-3.5 h-3.5 text-[#eab308] fill-[#eab308]" />
                        <span>{listing.shop?.rating || '4.5'}</span>
                        <span className="mx-2">•</span>
                        <span>{listing.shop?.area}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                    <span className="text-2xl font-black text-gray-800">
                      {listing.price} {dict.common?.currency || 'ILS'}
                    </span>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={addingToCart && addingId === listing._id}
                      onClick={() => handleAddToCart(listing._id)}
                      className="px-6 py-2 bg-white border-2 border-[#1a365d] text-[#1a365d] font-bold rounded-lg hover:bg-[#1a365d] hover:text-white transition disabled:opacity-50 flex items-center gap-2"
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between gap-4 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,1rem)]">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-bold">{dict.common?.total || 'Total'}</span>
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
