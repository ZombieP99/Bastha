'use client';
import AccountGate from '@/components/auth/AccountGate';
import api, { getCategories } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import type { Category, Product } from '@/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
export default function CreateProduct({ lang }: {
    lang: string;
}) { return <AccountGate lang={lang} seller><ProductForm lang={lang}/></AccountGate>; }
function ProductForm({ lang }: {
    lang: string;
}) {
    const ar = lang === 'ar';
    const [categories, setCategories] = useState<Category[]>([]), [error, setError] = useState(''), [busy, setBusy] = useState(false), [created, setCreated] = useState<Product | null>(null);
    const [form, setForm] = useState({ name: '', nameAr: '', category: '', unit: '', description: '', imageUrl: '' });
    useEffect(() => { let active = true; getCategories().then(data => { if (active)
        setCategories(data); }).catch(e => { if (active)
        setError(errorMessage(e)); }); return () => { active = false; }; }, []);
    return <div className="container mx-auto max-w-2xl px-4 py-10"><h1 className="text-3xl font-bold mb-6">{ar ? 'إضافة منتج للكتالوج' : 'Create catalog product'}</h1>
 {created ? <div role="status"><p>{ar ? 'تم إنشاء المنتج. أضف عرضه وسعره من لوحة المتجر.' : 'Product created. Add its shop offer and price from the dashboard.'}</p><Link className="underline" href={'/' + lang + '/seller/dashboard'}>{ar ? 'لوحة المتجر' : 'Shop dashboard'}</Link></div> : <form className="bg-white border rounded-2xl p-6 space-y-5" onSubmit={async (e) => { e.preventDefault(); if (busy)
            return; setBusy(true); setError(''); try {
            const { data } = await api.post<{
                product: Product;
            }>('/products', form);
            setCreated(data.product);
        }
        catch (error) {
            setError(errorMessage(error));
        }
        finally {
            setBusy(false);
        } }}>
 {error && <p role="alert">{error}</p>}
 {(['name', 'nameAr', 'unit', 'description', 'imageUrl'] as const).map(key => <label className="block" key={key}>{({ name: ar ? 'الاسم بالإنجليزية' : 'English name', nameAr: ar ? 'الاسم بالعربية' : 'Arabic name', unit: ar ? 'الوحدة' : 'Unit', description: ar ? 'الوصف' : 'Description', imageUrl: ar ? 'رابط الصورة' : 'Image URL' })[key]}<input required={key === 'name' || key === 'nameAr'} type={key === 'imageUrl' ? 'url' : 'text'} maxLength={key === 'description' ? 3000 : 500} className="block border rounded-xl p-3 w-full" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}/></label>)}
 <label className="block">{ar ? 'التصنيف' : 'Category'}<select required className="block border rounded-xl p-3 w-full" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option value="">{ar ? 'اختر التصنيف' : 'Choose category'}</option>{categories.map(c => <option key={c._id} value={c._id}>{ar ? c.nameAr : c.name}</option>)}</select></label>
 <button disabled={busy || !categories.length} className="bg-[#1a365d] text-white rounded-xl p-3">{busy ? (ar ? 'جاري الحفظ…' : 'Saving…') : (ar ? 'إنشاء المنتج' : 'Create product')}</button>
 </form>}</div>;
}
