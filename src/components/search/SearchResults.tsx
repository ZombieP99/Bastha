'use client';
import ProductCard from '@/components/products/ProductCard';
import ShopCard from '@/components/shops/ShopCard';
import { getCategories, searchGroup, searchMarketplace, searchProducts, type SearchType } from '@/lib/api';
import type { Category, Product, Shop } from '@/types';
import type { Dictionary } from '@/types/dictionary';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Results {
    products: Product[];
    shops: Shop[];
    categories: Category[];
    total: number;
    shopCount: number;
    partialError?: boolean;
}
const empty: Results = {products: [], shops: [], categories: [], total: 0, shopCount: 0};

export default function SearchResults(props: {dict: Dictionary; lang: string}) {
    const params = useSearchParams();
    return <ResultPage key={params.toString() + props.lang} {...props} params={new URLSearchParams(params.toString())}/>;
}

function ResultPage({dict, lang, params}: {dict: Dictionary; lang: string; params: URLSearchParams}) {
    const router = useRouter(), pathname = usePathname(), ar = lang === 'ar';
    const q = params.get('q') || '', category = params.get('category') || '';
    const sort = params.get('sort') === 'name' ? 'name' : 'newest';
    const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);
    const value = params.get('type');
    const type: SearchType | null = value === 'shops' || value === 'categories' || value === 'products' ? value : null;
    const labels = {products: ar ? 'المنتجات' : 'Products', shops: ar ? 'المتاجر' : 'Shops', categories: ar ? 'الفئات' : 'Categories'};
    const [data, setData] = useState<Results | null>(null);
    const [error, setError] = useState(false);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let active = true;
        async function load(): Promise<Results> {
            if (type === 'shops') {
                const {results, total} = await searchGroup(type, q, page);
                return {...empty, shops: results, total};
            }
            if (type === 'categories') {
                const {results, total} = await searchGroup(type, q, page);
                return {...empty, categories: results, total};
            }
            if (type === 'products') {
                const {results, total} = await searchGroup(type, q, page);
                return {...empty, products: results, total};
            }
            const [products, bundle, categories] = await Promise.allSettled([
                searchProducts(q, category, sort, page),
                q.trim() ? searchMarketplace(q) : Promise.resolve(null),
                getCategories(),
            ]);
            if (products.status === 'rejected') throw products.reason;
            const suggestions = bundle.status === 'fulfilled' ? bundle.value : null;
            return {...products.value, shops: suggestions?.shops ?? [], shopCount: suggestions?.counts.shops ?? 0,
                categories: categories.status === 'fulfilled' ? categories.value : [],
                partialError: categories.status === 'rejected' || bundle.status === 'rejected'};
        }
        load().then(result => {if (active) setData(result);}).catch(() => {if (active) setError(true);});
        return () => {active = false;};
    }, [q, category, sort, page, type, retry]);
    function url(values: Record<string, string>) {
        const next = new URLSearchParams(params);
        for (const [key, value] of Object.entries(values)) {
            if (value) next.set(key, value);
            else next.delete(key);
        }
        return pathname + '?' + next.toString();
    }
    const retryButton = <button className="underline" onClick={() => {setError(false);setData(null);setRetry(n => n + 1);}}>{ar ? 'إعادة المحاولة' : 'Retry'}</button>;
    return <main className="mx-auto min-h-screen max-w-7xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold">{type ? labels[type] : ar ? 'البحث' : 'Search'} {q}</h1>
        {type && <Link className="mb-4 inline-block underline" href={url({type: '', page: '1'})}>{ar ? 'جميع النتائج' : 'All results'}</Link>}
        {!type && <div className="mb-8 flex flex-wrap gap-4 rounded-2xl bg-white p-5">
            <label>{ar ? 'التصنيف' : 'Category'}<select className="block rounded-lg border p-2" value={category} onChange={e => router.push(url({category:e.target.value,page:'1'}))}>
                <option value="">{ar ? 'الكل' : 'All'}</option>{data?.categories.map(c => <option key={c._id} value={c._id}>{ar ? c.nameAr : c.name}</option>)}</select></label>
            <label>{ar ? 'الترتيب' : 'Sort'}<select className="block rounded-lg border p-2" value={sort} onChange={e => router.push(url({sort:e.target.value,page:'1'}))}>
                <option value="newest">{ar ? 'الأحدث' : 'Newest'}</option><option value="name">{ar ? 'الاسم بالإنجليزية' : 'English name'}</option></select></label>
            <button onClick={() => router.push(url({category:'',sort:'',page:'1'}))}>{ar ? 'مسح الفلاتر' : 'Clear filters'}</button>
        </div>}
        {error ? <p role="alert">{ar ? 'تعذر تحميل النتائج.' : 'Unable to load results.'} {retryButton}</p> :
        !data ? <p role="status">{ar ? 'جارٍ البحث…' : 'Searching…'}</p> : <>
            {data.partialError && <p role="status">{ar ? 'تعذر تحميل بعض المتاجر أو الفئات.' : 'Some shops or categories could not be loaded.'} {retryButton}</p>}
            <p className="mb-4">{labels[type || 'products']} · {data.total}</p>
            {data.shops.length > 0 && <section className="mb-8">
                {!type && <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">{ar ? 'المتاجر المطابقة' : 'Matching shops'}</h2>
                    <Link className="underline" href={url({type:'shops',page:'1',category:'',sort:''})}>{ar ? 'عرض كل المتاجر المطابقة' : 'See all matching shops'} ({data.shopCount})</Link></div>}
                <div className="grid gap-5 md:grid-cols-3">{data.shops.map(shop => <ShopCard key={shop._id} shop={shop} dict={dict} lang={lang}/>)}</div>
            </section>}
            {type === 'categories' && <ul className="space-y-3">{data.categories.map(c => <li key={c._id}><Link className="underline" href={pathname + '?category=' + encodeURIComponent(c._id)}>{ar ? c.nameAr : c.name}</Link></li>)}</ul>}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{data.products.map(product => <ProductCard key={product._id} product={product} lang={lang}/>)}</div>
            {!data.total && <p>{ar ? 'لا توجد نتائج مطابقة في هذا القسم.' : 'No matches in this section.'}</p>}
            {data.total > 20 && <nav aria-label={ar ? 'صفحات النتائج' : 'Result pages'} className="mt-8 flex justify-center gap-6">
                {page > 1 && <Link href={url({page:String(page - 1)})}>{ar ? 'السابق' : 'Previous'}</Link>}<span>{page} / {Math.ceil(data.total / 20)}</span>
                {page * 20 < data.total && <Link href={url({page:String(page + 1)})}>{ar ? 'التالي' : 'Next'}</Link>}
            </nav>}
        </>}
    </main>;
}
