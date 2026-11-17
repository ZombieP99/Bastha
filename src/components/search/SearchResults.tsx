'use client';
import ProductCard from '@/components/products/ProductCard';
import ShopCard from '@/components/shops/ShopCard';
import { getCategories, getShops, searchProducts } from '@/lib/api';
import type { Category, Product, Shop } from '@/types';
import type { Dictionary } from '@/types/dictionary';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
export default function SearchResults({ dict, lang }: {
    dict: Dictionary;
    lang: string;
}) {
    const ar = lang === 'ar', params = useSearchParams(), router = useRouter(), pathname = usePathname();
    const q = params.get('q') || '', category = params.get('category') || '', sort = params.get('sort') === 'name' ? 'name' : 'newest';
    const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);
    const [data, setData] = useState<{
        products: Product[];
        shops: Shop[];
        categories: Category[];
        total: number;
        loading: boolean;
        error: string;
    }>({ products: [], shops: [], categories: [], total: 0, loading: true, error: '' });
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let active = true;
        Promise.all([searchProducts(q, category, sort, page), getShops(), getCategories()]).then(([result, shops, categories]) => {
            if (active)
                setData({ products: result.products, shops, categories, total: result.total, loading: false, error: '' });
        }).catch(() => { if (active)
            setData(s => ({ ...s, loading: false, error: ar ? 'تعذر تحميل النتائج' : 'Unable to load results' })); });
        return () => { active = false; };
    }, [q, category, sort, page, retry, ar]);
    const update = (values: Record<string, string>) => {
        const next = new URLSearchParams(params.toString());
        Object.entries(values).forEach(([k, v]) => v ? next.set(k, v) : next.delete(k));
        setData(s => ({ ...s, loading: true, error: '' }));
        router.push(pathname + '?' + next.toString());
    };
    const shops = q.trim() ? data.shops.filter(s => (s.name + ' ' + (s.area || '') + ' ' + (s.description || '')).toLowerCase().includes(q.trim().toLowerCase())) : [];
    return <div className="bg-[#f8fafc] min-h-screen py-10"><div className="container mx-auto px-4 md:px-8">
  <h1 className="text-3xl font-bold mb-6">{ar ? 'البحث' : 'Search'} {q}</h1>
  <div className="flex flex-wrap gap-4 bg-white p-5 rounded-2xl mb-8">
   <label>{ar ? 'التصنيف' : 'Category'}<select className="block border rounded-lg p-2" value={category} onChange={e => update({ category: e.target.value, page: '1' })}><option value="">{ar ? 'الكل' : 'All'}</option>{data.categories.map(c => <option key={c._id} value={c._id}>{ar ? c.nameAr : c.name}</option>)}</select></label>
   <label>{ar ? 'الترتيب' : 'Sort'}<select className="block border rounded-lg p-2" value={sort} onChange={e => update({ sort: e.target.value, page: '1' })}><option value="newest">{ar ? 'الأحدث' : 'Newest'}</option><option value="name">{ar ? 'الاسم' : 'Name'}</option></select></label>
   <button onClick={() => update({ category: '', sort: '', page: '1' })}>{ar ? 'مسح الفلاتر' : 'Clear filters'}</button>
  </div>
  {data.error ? <div role="alert"><p>{data.error}</p><button onClick={() => { setData(s => ({ ...s, loading: true, error: '' })); setRetry(n => n + 1); }}>{ar ? 'إعادة المحاولة' : 'Retry'}</button></div> : data.loading ? <p role="status">{ar ? 'جاري البحث…' : 'Searching…'}</p> : <>
   <p className="mb-5">{data.total} {ar ? 'منتج' : 'products'}</p>
   {shops.length > 0 && <section className="mb-10"><h2 className="text-xl font-bold mb-4">{ar ? 'المتاجر المطابقة' : 'Matching shops'}</h2><div className="grid md:grid-cols-3 gap-5">{shops.map(shop => <ShopCard key={shop._id} shop={shop} dict={dict} lang={lang}/>)}</div></section>}
   <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">{data.products.map(product => <ProductCard key={product._id} product={product} lang={lang}/>)}</div>
   {!data.products.length && <p>{ar ? 'لا توجد منتجات مطابقة' : 'No matching products'}</p>}
   {data.total > 20 && <nav aria-label={ar ? 'صفحات النتائج' : 'Result pages'} className="flex justify-center gap-6 mt-8"><button disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>{ar ? 'السابق' : 'Previous'}</button><span>{page} / {Math.ceil(data.total / 20)}</span><button disabled={page >= Math.ceil(data.total / 20)} onClick={() => update({ page: String(page + 1) })}>{ar ? 'التالي' : 'Next'}</button></nav>}
  </>}
 </div></div>;
}
