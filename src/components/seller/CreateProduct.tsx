'use client';
import AccountGate from '@/components/auth/AccountGate';
import api, { getCategories } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import type { Category, Product } from '@/types';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
export default function CreateProduct({ lang, shop }: {
    shop?: string;
    lang: string;
}) { return <AccountGate lang={lang} seller><ProductForm lang={lang} shop={shop}/></AccountGate>; }
function ProductForm({ lang, shop }: {
    shop?: string;
    lang: string;
}) {
    const ar = lang === 'ar';
    const [published, setPublished] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]), [error, setError] = useState(''), [busy, setBusy] = useState(false), [created, setCreated] = useState<Product | null>(null);
    const [form, setForm] = useState({ name: '', nameAr: '', category: '', unit: '', description: '' });
    const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null);
    const [photoError, setPhotoError] = useState('');
    const photoInput = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (!photo) return;
        return () => URL.revokeObjectURL(photo.preview);
    }, [photo]);

    async function uploadPhoto(productId: string, file: File) {
        const body = new FormData();
        body.append('image', file);
        try {
            const { data } = await api.post<{ product: Product }>('/products/' + productId + '/image', body, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (data.product?._id !== productId || !data.product.imageUrl?.startsWith('/images/') || data.product.imageUrl === '/images/products/default.jpg') {
                throw new Error(ar ? 'لم يؤكد الخادم حفظ صورة المنتج.' : 'The server did not confirm the product photo.');
            }
            setCreated(data.product);
            setPhoto(null);
        } catch (failure) {
            const unavailable = axios.isAxiosError(failure) && [404, 405, 501].includes(failure.response?.status ?? 0);
            setPhotoError(unavailable
                ? (ar ? 'خدمة رفع الصورة غير متاحة لهذا المنتج.' : 'Photo uploads are unavailable for this product.')
                : errorMessage(failure, ar ? 'تعذر رفع الصورة. حاول مجددًا.' : 'Photo upload failed. Please retry.'));
        }
    }

    function clearPhoto() {
        setPhoto(null);
        setPhotoError('');
        if (photoInput.current) photoInput.current.value = '';
    }

    const photoField = <div className="space-y-2">
        <label htmlFor="product-photo" className="block font-semibold">{ar ? 'صورة المنتج (اختيارية)' : 'Product photo (optional)'}</label>
        <input id="product-photo" type="file" ref={photoInput} disabled={busy} accept="image/jpeg,image/png,image/webp"
            aria-describedby="product-photo-help" className="block w-full rounded-xl border p-3 text-sm"
            onChange={e => {
                const file = e.currentTarget.files?.[0];
                if (!file) return;
                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) {
                    e.currentTarget.value = '';
                    setPhotoError(ar ? 'اختر صورة JPG أو PNG أو WebP بحجم أقصاه ٥ ميغابايت.' : 'Choose a JPG, PNG or WebP image up to 5 MB.');
                    return;
                }
                setPhotoError('');
                setPhoto({file, preview: URL.createObjectURL(file)});
            }}/>
        <p id="product-photo-help" className="text-sm text-slate-600">{ar ? 'JPG أو PNG أو WebP، حتى ٥ ميغابايت.' : 'JPG, PNG or WebP, up to 5 MB.'}</p>
        {photo && <div className="flex items-center gap-3">
            <Image src={photo.preview} unoptimized alt={ar ? 'معاينة صورة المنتج قبل الرفع' : 'Product photo preview before upload'} width={96} height={96} className="size-24 rounded-xl border object-cover"/>
            <span dir="auto" className="min-w-0 truncate text-sm">{photo.file.name}</span>
            <button disabled={busy} type="button" onClick={clearPhoto} className="underline">{ar ? 'إزالة الصورة' : 'Remove photo'}</button>
        </div>}
        {photoError && <p role="alert" className="text-sm text-red-700">{photoError}</p>}
    </div>;
    useEffect(() => { let active = true; getCategories().then(data => { if (active)
        setCategories(data); }).catch(e => { if (active)
        setError(errorMessage(e)); }); return () => { active = false; }; }, []);
    return <div className="container mx-auto max-w-2xl px-4 py-10"><h1 className="text-3xl font-bold mb-6">{ar ? 'إضافة منتج للكتالوج' : 'Create catalog product'}</h1>
 {created ? <section className="space-y-4 rounded-xl border bg-white p-5">
  <p role="status">{created.nameAr || created.name} · {published ? (ar ? 'تم نشر العرض' : 'Listing published') : (ar ? 'تم إنشاء منتج الكتالوج' : 'Catalog product created')}</p>
  {photo && <div className="space-y-3">{photoField}
    <button type="button" disabled={busy} className="rounded-lg bg-[#1a365d] px-4 py-2 text-white" onClick={async () => {
        setBusy(true); setPhotoError('');
        try { await uploadPhoto(created._id, photo.file); } finally { setBusy(false); }
    }}>{busy ? (ar ? 'جارٍ رفع الصورة…' : 'Uploading photo…') : (ar ? 'رفع الصورة' : 'Upload photo')}</button>
  </div>}
  {published ? <Link className="underline" href={'/'+lang+'/products/'+created._id}>{ar ? 'عرض المنتج في المتجر' : 'View public product'}</Link>
  : shop && <form className="space-y-3" onSubmit={async e => {
    e.preventDefault();
    if (busy) return;
    const price = Number(new FormData(e.currentTarget).get('price'));
    setBusy(true); setError('');
    try {
      await api.post('/shops/'+shop+'/listings',{product:created._id,price,inStock:true});
      setPublished(true);
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  }}>
    <label>{ar ? 'سعر البيع في المتجر المحدد (₪)' : 'Price in the selected shop (₪)'}<input className="block rounded-lg border p-2" required name="price" type="number" min="0" step=".01"/></label>
    <button disabled={busy || !!photo} className="rounded-lg bg-[#1a365d] px-4 py-2 text-white disabled:opacity-50">{ar ? 'نشر العرض كمتوفر' : 'Publish in stock'}</button>
  </form>}
  {error && <p role="alert">{error}</p>}
  <Link className="block underline" href={'/'+lang+'/seller/dashboard'}>{ar ? 'إدارة عروض المتجر' : 'Manage store listings'}</Link>
 </section> : <form className="bg-white border rounded-2xl p-6 space-y-5" onSubmit={async (e) => { e.preventDefault(); if (busy)
            return; setBusy(true); setError(''); try {
            const { data } = await api.post<{
                product: Product;
            }>('/products', form);
            setCreated(data.product);
            if (photo) await uploadPhoto(data.product._id, photo.file);
        }
        catch (error) {
            setError(errorMessage(error));
        }
        finally {
            setBusy(false);
        } }}>
 {error && <p role="alert">{error}</p>}
 {(['name', 'nameAr', 'unit', 'description'] as const).map(key => <label className="block" key={key}>{({ name: ar ? 'الاسم بالإنجليزية' : 'English name', nameAr: ar ? 'الاسم بالعربية' : 'Arabic name', unit: ar ? 'الوحدة' : 'Unit', description: ar ? 'الوصف' : 'Description' })[key]}<input required={key === 'name' || key === 'nameAr'} type="text" maxLength={key === 'description' ? 3000 : 500} className="block border rounded-xl p-3 w-full" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}/></label>)}
 <label className="block">{ar ? 'التصنيف' : 'Category'}<select required className="block border rounded-xl p-3 w-full" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option value="">{ar ? 'اختر التصنيف' : 'Choose category'}</option>{categories.map(c => <option key={c._id} value={c._id}>{ar ? c.nameAr : c.name}</option>)}</select></label>
 {photoField}
 <button disabled={busy || !categories.length} className="bg-[#1a365d] text-white rounded-xl p-3">{busy ? (ar ? 'جاري الحفظ…' : 'Saving…') : (ar ? 'إنشاء المنتج' : 'Create product')}</button>
 </form>}</div>;
}
