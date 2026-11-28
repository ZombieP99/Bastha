'use client';
import api from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { useAuthStore } from '@/store/useAuthStore';
import type { Review,Shop } from '@/types';
import type { Dictionary } from '@/types/dictionary';
import { AnimatePresence,motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useEffect,useState } from 'react';
import toast from 'react-hot-toast';
import { Product } from './ProductCard';
import ProductGrid from './ProductGrid';

interface ShopTabsProps {
  reviewsInitiallyOpen?: boolean;
  shop: Shop;
  products: Product[];
  dict: Dictionary;
  lang: string;
}

export default function ShopTabs({ shop, products, dict, lang, reviewsInitiallyOpen }: ShopTabsProps) {
  const isAr = lang === 'ar';
  
  // Tabs: 'overview' | 'products' | 'reviews'
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'reviews'>(reviewsInitiallyOpen ? 'reviews' : 'overview');

  // Review Form States
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const user=useAuthStore(s=>s.user);
  const [editing,setEditing]=useState<Review | null>(null),[version,setVersion]=useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reviewError, setReviewError] = useState('');
  useEffect(() => {
    let active=true;
    api.get<{reviews:Review[];total:number}>(`/shops/${shop._id}/reviews?page=${page}`).then(({data})=>{if(active){setReviews(data.reviews);setTotal(data.total);setReviewError('');}}).catch(error=>{if(active)setReviewError(errorMessage(error));});
    return ()=>{active=false;};
  },[shop._id,page,isSubmitted,version]);
  const submitReview = async () => {
    if(useAuthStore.getState().user?.role !== 'customer') {toast.error(isAr?'سجل الدخول بحساب زبون':'Log in as a customer');return;}
    if(submitting)return;
    setSubmitting(true);
    try {await api.post(`/shops/${shop._id}/reviews`,{rating,comment});setIsSubmitted(true);}
    catch(error){toast.error(errorMessage(error));} finally {setSubmitting(false);}
  };

  const tabs = [
    { id: 'overview', label: dict?.shopsPage?.shopDetails?.overview || (isAr ? 'نظرة عامة' : 'Overview') },
    { id: 'products', label: dict?.shopsPage?.shopDetails?.products || (isAr ? 'المنتجات' : 'Products') },
    { id: 'reviews', label: dict?.shopsPage?.shopDetails?.reviews || (isAr ? 'التقييمات' : 'Reviews') },
  ];

  return (
    <div className="w-full">
      {/* Section Tabs */}
      <div className={`flex items-center gap-8 mb-8 border-b border-gray-200 ${isAr ? 'flex-row-reverse' : 'flex-row'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'products' | 'reviews')}
            className={`pb-4 px-2 transition-colors relative ${
              activeTab === tab.id 
                ? 'text-[#1a365d] font-extrabold border-b-4 border-[#1a365d]' 
                : 'text-gray-400 hover:text-gray-600 font-bold'
            }`}
          >
            <h2 className="text-xl">{tab.label}</h2>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className={`bg-white rounded-3xl p-8 border border-gray-100 shadow-sm ${isAr ? 'text-right' : 'text-left'}`}>
              <h3 className="text-2xl font-bold text-[#1a365d] mb-4">
                {isAr ? 'عن المحل' : 'About the Shop'}
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {shop.description}
              </p>
              
              <h3 className="text-xl font-bold text-[#1a365d] mb-4">
                {isAr ? 'الموقع الجغرافي' : 'Location'}
              </h3>
              <p className="text-gray-700 text-lg">
                {shop.address || shop.area || (isAr ? 'لم يحدد المتجر موقعه' : 'Location not provided')}
              </p>
            </div>
          )}

          {activeTab === 'products' && (
            <ProductGrid products={products} dict={dict} lang={lang} />
          )}

          {activeTab === 'reviews' && (
            <div id="reviews" className={`bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm ${isAr ? 'text-right' : 'text-left'}`}>
              
              {reviewError && <p role="alert">{reviewError}</p>}
              <div className="space-y-4 mb-8">{reviews.map(review=><article key={review._id} className="border-b pb-4"><strong>{review.author?.name}</strong><p>{review.rating} / 5</p><p>{review.comment}</p>
                {user && review.author?._id === (user.id || user._id) && <button className="underline me-4" onClick={()=>setEditing(review)}>{isAr?'تعديل':'Edit'}</button>}
                {user && (review.author?._id === (user.id || user._id) || user.role==='admin') && <button disabled={submitting} onClick={async()=>{
                  if(!window.confirm(isAr?'حذف التقييم؟':'Delete review?'))return;
                  setSubmitting(true);
                  try{await api.delete('/reviews/'+review._id);setEditing(null);setIsSubmitted(false);setPage(1);setVersion(v=>v+1);}catch(e){toast.error(errorMessage(e));}finally{setSubmitting(false);}
                }}>{isAr?'حذف':'Delete'}</button>}
              </article>)}</div>
              {editing && <form key={editing._id} className="mb-4 grid gap-2" onSubmit={async e=>{
                e.preventDefault();const fields=new FormData(e.currentTarget);setSubmitting(true);
                try{await api.patch('/reviews/'+editing._id,{rating:Number(fields.get('rating')),comment:fields.get('comment')});setEditing(null);setVersion(v=>v+1);}
                catch(err){toast.error(errorMessage(err));}finally{setSubmitting(false);}
              }}><label>{isAr?'التقييم':'Rating'} <input type="number" name="rating" min="1" max="5" required defaultValue={editing.rating}/></label>
              <label>{isAr?'التعليق':'Comment'} <textarea name="comment" defaultValue={editing.comment}/></label>
              <button disabled={submitting}>{isAr?'حفظ':'Save'}</button><button type="button" onClick={()=>setEditing(null)}>{isAr?'إلغاء':'Cancel'}</button></form>}
              {total > 20 && <nav className="flex gap-4 mb-8"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>{isAr?'السابق':'Previous'}</button><span>{page} / {Math.ceil(total/20)}</span><button disabled={page>=Math.ceil(total/20)} onClick={()=>setPage(p=>p+1)}>{isAr?'التالي':'Next'}</button></nav>}
              {!isSubmitted ? (
                <div>
                  <h3 className="text-2xl font-bold text-[#1a365d] mb-2">
                    {isAr ? 'أضف تقييمك' : 'Add your review'}
                  </h3>
                  <p className="text-gray-500 mb-8">
                    {isAr ? 'رأيك يهمنا ويساعدنا على تحسين خدماتنا' : 'Your opinion matters and helps us improve our services'}
                  </p>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-3">
                      {isAr ? 'التقييم' : 'Rating'}
                    </label>
                    <div className={`flex items-center gap-2 ${isAr ? 'flex-row-reverse justify-end' : ''}`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          aria-label={(isAr ? 'تقييم ' : 'Rate ')+star} aria-pressed={rating===star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star 
                            className={`w-8 h-8 transition-colors ${
                              star <= (hoveredRating || rating) 
                                ? 'fill-[#eab308] text-[#eab308]' 
                                : 'text-gray-300'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-3">
                      {isAr ? 'التعليق' : 'Comment'}
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={isAr ? 'اكتب تجربتك مع المتجر هنا...' : 'Write your experience with the shop here...'}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-700 outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] transition-all min-h-[120px] resize-y"
                    ></textarea>
                  </div>

                  <button
                    onClick={submitReview}
                    disabled={rating === 0 || submitting}
                    className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold transition-all shadow-sm ${
                      rating > 0 && comment.trim() !== ''
                        ? 'bg-[#1a365d] text-white hover:bg-blue-800'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {submitting ? (isAr ? 'جاري الإرسال…' : 'Sending…') : (isAr ? 'إرسال التقييم' : 'Submit Review')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Star className="w-10 h-10 text-green-500 fill-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a365d] mb-3">
                    {isAr ? 'شكراً لتقييمك!' : 'Thank you for your review!'}
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    {isAr ? 'تم إرسال تقييمك بنجاح، نقدر وقتك ومشاركتك لتجربتك.' : 'Your review has been successfully submitted. We appreciate your time and sharing your experience.'}
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setRating(0);
                      setComment('');
                    }}
                    className="mt-8 text-[#1a365d] font-bold underline hover:text-blue-800"
                  >
                    {isAr ? 'العودة' : 'Back'}
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
