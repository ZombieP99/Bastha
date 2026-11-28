'use client';
import { useEffect, useState, type FormEvent } from 'react';
import api, { getCategories } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import type { Category, Product, Shop } from '@/types';

type Area = { _id: string; name: string; nameAr?: string };
export type ManagedShop = Shop & {
    lock?: { reason: string; lockedAt: string } | null;
    deliveryZones?: { area: Area; fee: number }[];
};
const field = 'block w-full rounded-lg border border-slate-200 px-3 py-2 mt-1';
const button = 'rounded-lg bg-[#1a365d] px-4 py-2 text-white disabled:opacity-50';

export function ShopSettings({ shop, ar, onSaved }: { shop?: ManagedShop; ar: boolean; onSaved: (shop: ManagedShop) => void }) {
    const [areas, setAreas] = useState<Area[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [zones, setZones] = useState((shop?.deliveryZones || []).map(z => ({area:z.area._id,fee:String(z.fee)})));
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    useEffect(() => {
        let active = true;
        Promise.all([api.get('/areas'), getCategories()]).then(([res, cats]) => {
            if (active) { setAreas(res.data.areas); setCategories(cats); }
        }).catch(e => { if (active) setMessage(errorMessage(e)); });
        return () => { active = false; };
    }, []);
    async function save(e: FormEvent<HTMLFormElement>, delivery = false) {
        e.preventDefault();
        if (busy) return;
        const fields = Object.fromEntries(new FormData(e.currentTarget));
        setBusy(true);
        setMessage('');
        try {
            if (delivery && shop) {
                await api.patch('/shops/' + shop._id + '/delivery-zones', {zones: zones.map(z => ({ area:z.area, fee:Number(z.fee) }))});
                onSaved({...shop, deliveryZones:zones.map(z => ({area:choices.find(a=>a._id===z.area)!,fee:Number(z.fee)}))});
            } else {
                if (!fields.category) delete fields.category;
                const {data} = shop ? await api.patch('/shops/' + shop._id, fields) : await api.post('/shops', fields);
                onSaved({...shop,...data.shop});
            }
            setMessage(ar?'تم الحفظ':'Saved');
        } catch (err) { setMessage(errorMessage(err)); }
        finally { setBusy(false); }
    }
    const choices = [...new Map([...(shop?.deliveryZones || []).map(z=>z.area),...areas].map(a=>[a._id,a])).values()];
    const currentCategory = typeof shop?.category === 'object' ? shop.category : undefined;
    const cats = currentCategory && !categories.some(c=>c._id===currentCategory._id) ? [currentCategory,...categories] : categories;
    return <section className="space-y-5 rounded-xl bg-white p-5">
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
        {(['name','phone','area','address','description'] as const).map((key,i)=><label key={key}>{(ar?['اسم المتجر','هاتف المتجر','المنطقة','العنوان','الوصف']:['Shop name','Public phone','Area','Address','Description'])[i]}<input className={field} name={key} required={i<2} maxLength={[100,20,100,200,1000][i]} defaultValue={shop?.[key] || ''}/></label>)}
        <label>{ar?'التصنيف':'Category'}<select className={field} name="category" defaultValue={currentCategory?._id || ''}><option value="">—</option>{cats.map(c=><option key={c._id} value={c._id}>{ar?c.nameAr:c.name}</option>)}</select></label>
        <button disabled={busy} className={button}>{shop?(ar?'حفظ بيانات المتجر':'Save shop'):(ar?'إنشاء المتجر':'Create shop')}</button>
      </form>
      {shop && <form onSubmit={e=>save(e,true)} className="space-y-3 border-t pt-4"><h3 className="font-bold">{ar?'مناطق التوصيل ورسومها بالشيكل':'Delivery areas and fees (ILS)'}</h3>
      {zones.map((z,i)=><div className="flex flex-wrap gap-2" key={i}>
        <select required aria-label={ar?'منطقة التوصيل':'Delivery area'} value={z.area} onChange={e=>setZones(zones.map((row,j)=>j===i?{...row,area:e.target.value}:row))}><option value="">—</option>{choices.filter(a=>areas.some(active=>active._id===a._id)||a._id===z.area).map(a=><option disabled={zones.some((row,j)=>j!==i&&row.area===a._id)} key={a._id} value={a._id}>{ar?a.nameAr||a.name:a.name}</option>)}</select>
        <input className="w-24 border rounded p-2" aria-label={ar?'الرسوم':'Fee'} type="number" required min="0" step="0.01" value={z.fee} onChange={e=>setZones(zones.map((row,j)=>j===i?{...row,fee:e.target.value}:row))}/>
        <button type="button" onClick={()=>setZones(zones.filter((_,j)=>j!==i))}>{ar?'إزالة':'Remove'}</button></div>)}
        <button type="button" disabled={zones.length>=60} className="me-4 underline" onClick={()=>setZones([...zones,{area:'',fee:'0'}])}>{ar?'إضافة منطقة':'Add area'}</button>
        <button disabled={busy} className={button}>{ar?'حفظ مناطق التوصيل':'Save delivery zones'}</button></form>}
      {message && <p role="status">{message}</p>}
    </section>;
}

export function CreatedProducts({ ar }: { ar:boolean }) {
    const [page,setPage]=useState(1);
    const [total,setTotal]=useState(0);
    const [items,setItems]=useState<(Product & {canEdit:boolean;isActive:boolean})[]>([]);
    const [version,setVersion]=useState(0);
    const [message,setMessage]=useState('');
    const [busy,setBusy]=useState(false);
    useEffect(()=>{
        let active=true;
        api.get('/seller/products',{params:{page,limit:20}}).then(({data})=>{
            if(active){setTotal(data.total);setItems(data.products);}
        }).catch(e=>{if(active)setMessage(errorMessage(e));});
        return ()=>{active=false;};
    },[page,version]);
    return <section className="space-y-3"><h2 className="text-xl font-bold">{ar?'منتجات أضفتها للكتالوج':'Products I added'}</h2>
    {items.map(item=><details className="rounded-xl bg-white p-4" key={item._id}><summary>{ar?item.nameAr:item.name} {item.isActive===false && (ar?'· مخفي بواسطة بسطة':'· Hidden by Bastah')}</summary>
      {item.canEdit ? <form className="mt-3 grid gap-3 sm:grid-cols-2" onSubmit={async e=>{
          e.preventDefault(); if(busy)return;
          const data=Object.fromEntries(new FormData(e.currentTarget));setBusy(true);
          try {await api.patch('/products/'+item._id,data);setVersion(v=>v+1);setMessage(ar?'تم الحفظ':'Saved');}
          catch(err){setMessage(errorMessage(err));}finally{setBusy(false);}
      }}>{(['nameAr','name','unit','description'] as const).map((key,i)=><label key={key}>{(ar?['الاسم بالعربية','الاسم بالإنجليزية','الوحدة','الوصف']:['Arabic name','English name','Unit','Description'])[i]}<input required={i<2} className={field} name={key} defaultValue={item[key] || ''}/></label>)}<button disabled={busy} className={button}>{ar?'حفظ المنتج':'Save product'}</button></form>:<p>{ar?'تبيع متاجر أخرى هذا المنتج. تواصل مع دعم بسطة لتعديله.':'Other shops sell this product. Contact support to edit it.'}</p>}
    </details>)}
    {total>20 && <div className="flex gap-4"><button disabled={page===1} onClick={()=>setPage(page-1)}>{ar?'السابق':'Previous'}</button>{page}<button disabled={page*20>=total} onClick={()=>setPage(page+1)}>{ar?'التالي':'Next'}</button></div>}
    {message && <p role="status">{message}</p>}</section>;
}
