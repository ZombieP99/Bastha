'use client';
import OfferList from '@/components/offers/OfferList';
import AccountGate from '@/components/auth/AccountGate';
import OrdersView from '@/components/orders/OrdersView';
import api, { searchProducts } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { useAuthStore } from '@/store/useAuthStore';
import { ShopSettings, CreatedProducts, type ManagedShop } from './ShopSettings';
import type { Product } from '@/types';
import Link from 'next/link';
import { Package, Plus, ShoppingBag, Store } from 'lucide-react';
import ProductImage from '@/components/products/ProductImage';
import { useEffect, useState } from 'react';
type Listing = {
    _id: string;
    product: Product & { isActive?: boolean };
    priceConfirmedAt: string | null;
    price: number;
    inStock: boolean;
};
export default function SellerDashboard({ lang, catalog }: {
    catalog?: boolean;
    lang: string;
}) {
    const token = useAuthStore(s => s.token);
    const role = useAuthStore(s=>s.user?.role);
    return <AccountGate lang={lang} seller>{role === "seller" ? <Dashboard catalog={catalog} key={token} lang={lang}/> : <p className="p-8">{lang==="ar"?"هذه اللوحة لحساب التاجر":"Seller account required"}</p>}</AccountGate>;
}
function Dashboard({ lang, catalog }: {
    catalog?: boolean;
    lang: string;
}) {
    const ar = lang === 'ar', user = useAuthStore(s => s.user);
    const [tab, setTab] = useState<'products' | 'orders' | 'settings' | 'newShop' | 'catalog' | 'campaigns'>(catalog ? 'catalog' : 'products');
    const [showOffer, setShowOffer] = useState(false);
    const [shops, setShops] = useState<ManagedShop[]>([]), [shopId, setShopId] = useState(''), [listings, setListings] = useState<Listing[]>([]);
    const [error, setError] = useState(''), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [version, setVersion] = useState(0);
    const [query, setQuery] = useState(''), [products, setProducts] = useState<Product[]>([]), [selected, setSelected] = useState(''), [price, setPrice] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [stale, setStale] = useState(false);
    const [period, setPeriod] = useState<'today' | 'last7Days' | 'last30Days'>('today');
    const [allOrders, setAllOrders] = useState(false);
    const [stats, setStats] = useState<{
        orders: { today: number; last7Days:number; last30Days:number; byStatus: { pending: number } };
        completedValue: { today:number; last7Days:number; last30Days: number };
        topProducts: {product:string;productName:string;productNameAr:string;quantity:number}[];
        listings: { stale: number; total: number; outOfStock: number };
    } | null>(null);
    const shopKey = 'bastah-seller-shop-' + (user?.id || user?._id);
    const shop = shops.find(item => item._id === shopId);
    useEffect(() => {
        let active = true;
        api.get('/seller/shops').then(({data}) => {
            if (!active) return;
            const own: typeof shops = data.shops;
            const preferred = new URLSearchParams(window.location.search).get('shop') || localStorage.getItem(shopKey);
            setShops(own);
            setShopId(own.find(item => item._id === preferred)?._id || own[0]?._id || '');
            setLoading(false);
        }).catch(e => { if (active) { setError(errorMessage(e)); setLoading(false); } });
        return () => { active = false; };
    }, [shopKey]);
    useEffect(() => {
        if (!shopId) return;
        let active = true;
        Promise.all([
            api.get('/seller/stats', {params: {shop: shopId}}),
            api.get('/seller/listings', {params: {shop: shopId, page, limit: 20, staleDays: stale ? 3 : undefined}})
        ]).then(([summary, result]) => {
            if (!active) return;
            setStats(summary.data);
            setListings(result.data.listings.filter((item: Listing) => item.product));
            setTotal(result.data.total);
            setPage(current => Math.min(current, Math.max(1, Math.ceil(result.data.total / 20))));
            setLoading(false);
        }).catch(e => { if (active) { setError(errorMessage(e)); setLoading(false); } });
        return () => { active = false; };
    }, [shopId, page, stale, version]);
    useEffect(() => { let active = true; if (!showOffer) return; const timer = setTimeout(() => { searchProducts(query, undefined, undefined, 1, 20).then(data => { if (active)
        setProducts(data.products); }).catch(e => { if (active)
        setError(errorMessage(e)); }); }, 300); return () => { active = false; clearTimeout(timer); }; }, [query, showOffer]);
    async function mutate(action: () => Promise<unknown>) { if(busy)return false; setBusy(true); setError(''); try {
        await action();
        setVersion(v => v + 1);
        return true;
    }
    catch (e) {
        setError(errorMessage(e));
        return false;
    }
    finally {
        setBusy(false);
    } }
    return <div className="min-h-screen bg-[#f7f9fc] text-[#1a365d]"><div className="mx-auto max-w-6xl px-4 sm:px-6 py-7 md:py-9">
 <header className="flex flex-wrap items-start justify-between gap-4 mb-7">
 <div><p className="mb-2 text-xs font-bold text-[#8a713a]">{ar ? 'بسطة للأعمال' : 'Bastah for business'}</p><h1 className="text-2xl sm:text-3xl font-bold">{ar ? 'مركز البائع' : 'Seller center'}</h1><p className="mt-2 text-sm text-[#718198]">{ar ? `مرحبًا ${user?.name || ''}، أدر عروض متجرك وطلباتك من هنا.` : `Welcome ${user?.name || ''}. Manage your offers and orders here.`}</p></div>
 </header>
 <div className="flex flex-wrap items-center justify-between gap-3 mb-5"><label className="flex items-center gap-2 text-sm font-bold"><Store size={17}/>{ar ? 'المتجر' : 'Shop'}<select className="border border-[#dce4ee] bg-white rounded-lg p-2 max-w-64" value={shopId} onChange={e => { localStorage.setItem(shopKey, e.target.value); setShopId(e.target.value); setStats(null); setError(''); setSelected(''); setPrice(''); setShowOffer(false); setPage(1); setListings([]); setLoading(true); }}>{shops.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select></label></div>
 {shop && <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
 {shop.isVerified && <strong>{ar ? 'متجر موثّق' : 'Verified shop'}</strong>}
 {shop.lock ? <p className="rounded-lg bg-red-50 p-3 text-red-800">{ar ? 'أغلقته بسطة' : 'Closed by Bastah'} · {shop.lock.reason} · {new Date(shop.lock.lockedAt).toLocaleDateString(lang,{timeZone:'Asia/Gaza'})}</p> :
 <button disabled={busy} className="rounded-lg border bg-white px-3 py-2" onClick={async () => {
 const isActive = !shop.isActive;
 if (await mutate(() => api.patch('/shops/' + shop._id, {isActive}))) setShops(current => current.map(item => item._id === shop._id ? {...item,isActive} : item));
 }}>{shop.isActive ? (ar ? 'إغلاق المتجر' : 'Close shop') : (ar ? 'فتح المتجر' : 'Open shop')}</button>}
 </div>}
 {stats && <><label className="mb-3 flex gap-2 text-sm">{ar?"فترة الإحصاءات":"Statistics period"}<select value={period} onChange={e=>setPeriod(e.target.value as typeof period)}><option value="today">{ar?"اليوم":"Today"}</option><option value="last7Days">{ar?"آخر 7 أيام":"Last 7 days"}</option><option value="last30Days">{ar?"آخر 30 يومًا":"Last 30 days"}</option></select></label><div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4">
 {[[ar?'الطلبات خلال الفترة':'Orders placed',stats.orders[period]],[ar?'طلبات بانتظار القبول':'Pending orders',stats.orders.byStatus.pending],[ar?'قيمة الطلبات المكتملة نقدًا':'Value of completed orders (cash)',stats.completedValue[period]+' ₪']].map(([label,value])=><div key={label} className="rounded-xl bg-white p-4 shadow-sm"><p className="text-sm">{label}</p><strong className="text-2xl">{value}</strong></div>)}
 <button className="rounded-xl bg-[#1a365d] p-4 text-start text-white" onClick={()=>{setStale(true);setPage(1);setTab('products');}}>{ar?'أسعار تحتاج تأكيدًا':'Prices to confirm'}<strong className="block text-2xl">{stats.listings.stale}</strong></button></div>{stats.topProducts?.length > 0 && <details className="mb-5 rounded-lg border bg-white p-3"><summary>{ar?"الأكثر مبيعًا خلال آخر 30 يومًا":"Top products over the last 30 days"}</summary><ol className="mt-2 space-y-1">{stats.topProducts.map(item=><li key={item.product}>{ar?item.productNameAr || item.productName:item.productName} · {item.quantity}</li>)}</ol></details>}</>}
 <nav aria-label={ar ? 'أقسام مركز البائع' : 'Seller center sections'} className="flex flex-wrap gap-1 border-b border-[#dce4ee] mb-6">
 {(['products', 'orders', 'settings', 'newShop', 'catalog', 'campaigns'] as const).map(value => <button key={value} aria-current={tab === value ? 'page' : undefined} className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${tab === value ? 'border-[#1a365d] text-[#1a365d]' : 'border-transparent text-[#718198] hover:text-[#1a365d]'}`} onClick={() => setTab(value)}>{value === 'products' ? <Package size={17}/> : <ShoppingBag size={17}/>} {value === 'products' ? (ar ? 'المنتجات والأسعار' : 'Products and prices') : value === 'campaigns' ? (ar?'الحملات الترويجية':'Promotions') : value === 'orders' ? (ar ? 'الطلبات الواردة' : 'Incoming orders') : value === 'settings' ? (ar?'إعدادات المتجر':'Shop settings') : value === 'newShop' ? (ar?'متجر جديد':'New shop') : (ar?'منتجاتي':'My catalog')}</button>)}
 </nav> {tab === 'campaigns' ? <OfferList key={shopId} lang={lang} shop={shopId || undefined} mode="seller" allowCreate={!!shop?.isActive && !shop.lock}/> : tab === 'catalog' ? <CreatedProducts ar={ar}/> : tab === 'newShop' || (tab === 'settings' && shop) ? <ShopSettings key={tab + shopId} ar={ar} shop={tab === 'settings' ? shop : undefined} onSaved={updated=>{
 setShops(current=>current.some(item=>item._id===updated._id)?current.map(item=>item._id===updated._id?updated:item):[...current,updated]);
 setShopId(updated._id);localStorage.setItem(shopKey,updated._id);setPage(1);setTab('settings');setVersion(v=>v+1);
 }}/> : tab === 'orders' ? <><label className="flex gap-2"><input type="checkbox" checked={allOrders} onChange={e=>setAllOrders(e.target.checked)}/>{ar?"عرض طلبات جميع متاجري":"Show orders from all my shops"}</label><OrdersView lang={lang} seller shop={allOrders ? undefined : shopId || undefined}/></> : <>
 {error && <p role="alert" className="bg-red-50 p-4 mb-4">{error}</p>}
 {loading ? <p role="status">{ar ? 'جاري التحميل…' : 'Loading…'}</p> : !shops.length ? <p>{ar ? 'لا يوجد متجر نشط مرتبط بحسابك. تواصل مع مسؤول المنصة.' : 'No active shop is linked to your account. Contact the platform administrator.'}</p> : <>
 <div className="mb-4"><button type="button" aria-expanded={showOffer} aria-controls="catalog-offer-form" onClick={() => setShowOffer(value => !value)} className="inline-flex items-center gap-2 rounded-lg bg-[#1a365d] text-white px-4 py-2.5 text-sm font-bold hover:bg-[#254b77] transition-colors"><Plus size={17}/>{showOffer ? (ar ? 'إغلاق النموذج' : 'Close form') : (ar ? 'إضافة عرض' : 'Add offer')}</button></div>
 <form id="catalog-offer-form" hidden={!showOffer} className="bg-white rounded-xl border border-[#dce4ee] p-5 space-y-4 mb-6 text-sm" onSubmit={async (e) => { e.preventDefault(); if (!selected || !Number.isFinite(Number(price)) || Number(price) < 0)
                return; if (await mutate(() => api.post('/shops/' + shopId + '/listings', { product: selected, price: Number(price), inStock: true }))) {
                setSelected('');
                setPrice('');
            } }}>
 <h2 className="text-xl font-bold">{ar ? 'إضافة عرض من الكتالوج' : 'Add a catalog offer'}</h2><Link className="underline" href={'/' + lang + '/seller/products/new?shop=' + shopId}>{ar ? 'إنشاء منتج جديد' : 'Create a new product'}</Link>
 <label className="block">{ar ? 'بحث في الكتالوج' : 'Search catalog'}<input className="block border rounded-xl p-3 w-full" value={query} onChange={e => setQuery(e.target.value)}/></label>
 <label className="block">{ar ? 'المنتج' : 'Product'}<select required className="block border rounded-xl p-3 w-full" value={selected} onChange={e => setSelected(e.target.value)}><option value="">{ar ? 'اختر المنتج' : 'Choose a product'}</option>{products.map(p => <option key={p._id} value={p._id}>{ar ? p.nameAr : p.name}</option>)}</select></label>
 <label className="block">{ar ? 'السعر بالشيكل' : 'Price in ILS'}<input required type="number" min="0" step="0.01" className="block border rounded-xl p-3" value={price} onChange={e => setPrice(e.target.value)}/></label>
 <button disabled={busy} className="bg-[#1a365d] text-white rounded-xl p-3">{ar ? 'إضافة العرض' : 'Add offer'}</button></form>
 <h2 className="text-xl font-bold mb-4">{ar ? 'عروض المتجر' : 'Shop offers'} ({total})</h2>
 <label className="mb-4 flex items-center gap-2"><input type="checkbox" checked={stale} onChange={e=>{setStale(e.target.checked);setPage(1);}}/>{ar?'عرض الأسعار غير المؤكدة منذ 3 أيام':'Show prices not confirmed in 3 days'}</label>
 {total > 20 && <div className="mb-4 flex gap-4"><button disabled={page===1} onClick={()=>setPage(page-1)}>{ar?'السابق':'Previous'}</button>{page} / {Math.ceil(total/20)}<button disabled={page*20>=total} onClick={()=>setPage(page+1)}>{ar?'التالي':'Next'}</button></div>}
 {stale && !listings.length && <p>{ar?'لا توجد أسعار تحتاج تأكيدًا':'No prices to confirm'}</p>}
 {!stale && !listings.length && <div className="rounded-xl border border-dashed border-[#cbd6e3] p-8 text-center"><Package className="mx-auto mb-3 text-[#93a4ba]" size={28}/><p className="font-bold">{ar ? 'لم تضف عروضًا لهذا المتجر بعد' : 'No offers in this shop yet'}</p><p className="mt-2 text-sm text-[#718198]">{ar ? 'ابدأ بإضافة منتج من الكتالوج وتحديد سعره.' : 'Add a catalog product and set its price to get started.'}</p></div>}<div className="space-y-3">{listings.map(listing => <ListingEditor key={listing._id + ':' + version} listing={listing} ar={ar} busy={busy} mutate={mutate}/>)}</div>
 </>}</>}</div></div>;
}
function ListingEditor({ listing, ar, busy, mutate }: {
    listing: Listing;
    ar: boolean;
    busy: boolean;
    mutate: (action: () => Promise<unknown>) => Promise<boolean>;
}) {
    const [price, setPrice] = useState(String(listing.price)), [inStock, setInStock] = useState(listing.inStock);
    return <form className="flex flex-wrap items-center gap-3 bg-white ring-1 ring-[#1a365d]/[0.06] rounded-xl p-4 text-sm" onSubmit={e => { e.preventDefault(); void mutate(() => api.patch('/listings/' + listing._id, { price: Number(price), inStock })); }}><div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-[#f0f3f7]"><ProductImage product={listing.product} alt={ar ? listing.product.nameAr : listing.product.name} sizes="48px"/></div><h3 className="font-bold flex-1 min-w-32">{ar ? listing.product.nameAr : listing.product.name}</h3>{listing.product.isActive === false && <span>{ar?'مخفي بواسطة بسطة':'Hidden by Bastah'}</span>}
 <div className="text-xs text-slate-600">{listing.priceConfirmedAt ? new Date(listing.priceConfirmedAt).toLocaleDateString(ar?'ar':'en',{timeZone:'Asia/Gaza'}) : (ar?'لم يؤكد السعر بعد':'Price never confirmed')}
 <button type="button" disabled={busy} className="block font-bold underline" onClick={()=>void mutate(()=>api.post('/seller/listings/confirm',{listingIds:[listing._id]}))}>{ar?'السعر صحيح':'Confirm price'}</button></div><label>{ar ? 'السعر' : 'Price'}<input className="block border p-2 rounded-lg w-28" type="number" min="0" step="0.01" required value={price} onChange={e => setPrice(e.target.value)}/></label><label><input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)}/> {ar ? 'متوفر' : 'In stock'}</label><button disabled={busy} className="border p-2 rounded-lg">{ar ? 'حفظ' : 'Save'}</button><button disabled={busy} className="text-red-700 p-2" type="button" onClick={() => { if (confirm(ar ? 'حذف العرض؟' : 'Delete offer?'))
        void mutate(() => api.delete('/listings/' + listing._id)); }}>{ar ? 'حذف' : 'Delete'}</button></form>;
}

