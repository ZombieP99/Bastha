'use client';
import AccountGate from '@/components/auth/AccountGate';
import OrdersView from '@/components/orders/OrdersView';
import api, { getShops, searchProducts } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { useAuthStore } from '@/store/useAuthStore';
import type { Product, Shop } from '@/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
type Listing = {
    _id: string;
    product: Product;
    price: number;
    inStock: boolean;
};
export default function SellerDashboard({ lang }: {
    lang: string;
}) {
    const token = useAuthStore(s => s.token);
    return <AccountGate lang={lang} seller><Dashboard key={token} lang={lang}/></AccountGate>;
}
function Dashboard({ lang }: {
    lang: string;
}) {
    const ar = lang === 'ar', user = useAuthStore(s => s.user), logout = useAuthStore(s => s.logout);
    const [tab, setTab] = useState<'products' | 'orders'>('products');
    const [shops, setShops] = useState<Shop[]>([]), [shopId, setShopId] = useState(''), [listings, setListings] = useState<Listing[]>([]);
    const [error, setError] = useState(''), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [version, setVersion] = useState(0);
    const [query, setQuery] = useState(''), [products, setProducts] = useState<Product[]>([]), [selected, setSelected] = useState(''), [price, setPrice] = useState('');
    useEffect(() => { let active = true; getShops().then(all => { if (!active)
        return; const own = all.filter(s => user?.role === 'admin' || (typeof s.owner === 'string' ? s.owner : s.owner?._id) === (user?._id || user?.id)); setShops(own); setShopId(own[0]?._id || ''); setLoading(false); }).catch(e => { if (active) {
        setError(errorMessage(e));
        setLoading(false);
    } }); return () => { active = false; }; }, [user]);
    useEffect(() => { if (!shopId)
        return; let active = true; api.get<{
        listings: Listing[];
    }>('/shops/' + shopId + '/products').then(({ data }) => { if (active) {
        setListings(data.listings.filter(listing=>listing.product));
        setLoading(false);
    } }).catch(e => { if (active) {
        setError(errorMessage(e));
        setLoading(false);
    } }); return () => { active = false; }; }, [shopId, version]);
    useEffect(() => { let active = true; const timer = setTimeout(() => { searchProducts(query, undefined, undefined, 1, 20).then(data => { if (active)
        setProducts(data.products); }).catch(e => { if (active)
        setError(errorMessage(e)); }); }, 300); return () => { active = false; clearTimeout(timer); }; }, [query]);
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
    return <div className="container mx-auto px-4 py-10 max-w-6xl"><header className="flex flex-wrap justify-between gap-4 mb-8"><h1 className="text-3xl font-bold">{ar ? 'لوحة التاجر' : 'Seller dashboard'} — {user?.name}</h1><button onClick={logout}>{ar ? 'تسجيل الخروج' : 'Log out'}</button></header>
 <nav className="flex gap-4 mb-8"><button className="border rounded-xl p-3" onClick={() => setTab('products')}>{ar ? 'المنتجات والأسعار' : 'Products and prices'}</button><button className="border rounded-xl p-3" onClick={() => setTab('orders')}>{ar ? 'الطلبات الواردة' : 'Incoming orders'}</button></nav>
 {tab === 'orders' ? <OrdersView lang={lang} seller/> : <>
 {error && <p role="alert" className="bg-red-50 p-4 mb-4">{error}</p>}
 {loading ? <p role="status">{ar ? 'جاري التحميل…' : 'Loading…'}</p> : !shops.length ? <p>{ar ? 'لا يوجد متجر نشط مرتبط بحسابك. تواصل مع مسؤول المنصة.' : 'No active shop is linked to your account. Contact the platform administrator.'}</p> : <>
 <label className="block mb-5">{ar ? 'المتجر' : 'Shop'}<select className="border rounded-xl p-3 mx-3" value={shopId} onChange={e => { setShopId(e.target.value); setListings([]); setLoading(true); }}>{shops.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select></label>
 <form className="bg-white rounded-2xl border p-6 space-y-4 mb-8" onSubmit={async (e) => { e.preventDefault(); if (!selected || !Number.isFinite(Number(price)) || Number(price) < 0)
                return; if (await mutate(() => api.post('/shops/' + shopId + '/listings', { product: selected, price: Number(price), inStock: true }))) {
                setSelected('');
                setPrice('');
            } }}>
 <h2 className="text-xl font-bold">{ar ? 'إضافة عرض من الكتالوج' : 'Add a catalog offer'}</h2><Link className="underline" href={'/' + lang + '/seller/products/new'}>{ar ? 'إنشاء منتج جديد' : 'Create a new product'}</Link>
 <label className="block">{ar ? 'بحث في الكتالوج' : 'Search catalog'}<input className="block border rounded-xl p-3 w-full" value={query} onChange={e => setQuery(e.target.value)}/></label>
 <label className="block">{ar ? 'المنتج' : 'Product'}<select required className="block border rounded-xl p-3 w-full" value={selected} onChange={e => setSelected(e.target.value)}><option value="">{ar ? 'اختر المنتج' : 'Choose a product'}</option>{products.map(p => <option key={p._id} value={p._id}>{ar ? p.nameAr : p.name}</option>)}</select></label>
 <label className="block">{ar ? 'السعر بالشيكل' : 'Price in ILS'}<input required type="number" min="0" step="0.01" className="block border rounded-xl p-3" value={price} onChange={e => setPrice(e.target.value)}/></label>
 <button disabled={busy} className="bg-[#1a365d] text-white rounded-xl p-3">{ar ? 'إضافة العرض' : 'Add offer'}</button></form>
 <h2 className="text-xl font-bold mb-4">{ar ? 'عروض المتجر' : 'Shop offers'} ({listings.length})</h2>
 <div className="space-y-4">{listings.map(listing => <ListingEditor key={listing._id + ':' + version} listing={listing} ar={ar} busy={busy} mutate={mutate}/>)}</div>
 </>}</>}</div>;
}
function ListingEditor({ listing, ar, busy, mutate }: {
    listing: Listing;
    ar: boolean;
    busy: boolean;
    mutate: (action: () => Promise<unknown>) => Promise<boolean>;
}) {
    const [price, setPrice] = useState(String(listing.price)), [inStock, setInStock] = useState(listing.inStock);
    return <form className="flex flex-wrap items-end gap-4 bg-white border rounded-2xl p-5" onSubmit={e => { e.preventDefault(); void mutate(() => api.patch('/listings/' + listing._id, { price: Number(price), inStock })); }}><h3 className="font-bold flex-1">{ar ? listing.product.nameAr : listing.product.name}</h3><label>{ar ? 'السعر' : 'Price'}<input className="block border p-2 rounded-lg w-28" type="number" min="0" step="0.01" required value={price} onChange={e => setPrice(e.target.value)}/></label><label><input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)}/> {ar ? 'متوفر' : 'In stock'}</label><button disabled={busy} className="border p-2 rounded-lg">{ar ? 'حفظ' : 'Save'}</button><button disabled={busy} className="text-red-700 p-2" type="button" onClick={() => { if (confirm(ar ? 'حذف العرض؟' : 'Delete offer?'))
        void mutate(() => api.delete('/listings/' + listing._id)); }}>{ar ? 'حذف' : 'Delete'}</button></form>;
}
