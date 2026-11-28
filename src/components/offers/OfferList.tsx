'use client';
import Link from 'next/link';
import axios from 'axios';
import { useEffect, useState, type FormEvent } from 'react';
import api from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { useAuthStore } from '@/store/useAuthStore';
import ProductImage from '@/components/products/ProductImage';

type Offer = {
    _id: string; title: string; titleAr: string; body: string; bodyAr: string; endsAt: string; isActive: boolean;
    shop: { _id: string; name: string; isVerified?: boolean };
    product?: { _id: string; name: string; nameAr: string; imageUrl: string };
    createdBy?: { _id: string; role: string };
};
type Mode = 'public' | 'seller' | 'admin';
const button = 'rounded-lg border px-3 py-2 text-sm font-bold disabled:opacity-50';

export default function OfferList({lang, shop, mode='public', allowCreate=false}: {
    lang: string; shop?: string; mode?: Mode; allowCreate?: boolean;
}) {
    const ar = lang === 'ar';
    const user = useAuthStore(s=>s.user);
    const endpoint = mode === 'public' ? (shop ? '/shops/'+shop+'/offers' : '/offers') : '/'+mode+'/offers';
    const [offers,setOffers] = useState<Offer[]>([]);
    const [page,setPage] = useState(1), [total,setTotal] = useState(0);
    const [version,refresh] = useState(0), [busy,setBusy] = useState(false);
    const [error,setError] = useState(''), [message,setMessage] = useState('');
    const [loaded,setLoaded] = useState(''), [editor,setEditor] = useState<Offer|'new'|null>(null);
    const request = [endpoint, shop, page, version].join(':');
    useEffect(()=>{
        const controller = new AbortController();
        api.get(endpoint,{params:{page,limit:12,shop:mode !== 'public' ? shop : undefined},signal:controller.signal})
          .then(({data})=>{ if (!controller.signal.aborted) {setOffers(data.offers);setTotal(data.total);setLoaded(request);setError('');} })
          .catch(e=>{if (!controller.signal.aborted) {setError(errorMessage(e));setLoaded(request);}});
        return ()=>controller.abort();
    },[request,endpoint,shop,page,mode]);
    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy || !editor) return;
        const fields = new FormData(event.currentTarget);
        const date = String(fields.get('endsAt') || '');
        const data = {title:String(fields.get('title')).trim(), titleAr:String(fields.get('titleAr')).trim(),
            body:String(fields.get('body')).trim(),bodyAr:String(fields.get('bodyAr')).trim(),
            ...(date && {endsAt:new Date(date+'T23:59:59').toISOString()})};
        setBusy(true); setMessage('');
        try {
            if (editor === 'new') {
                const product = fields.get('product');
                const result = await api.post(endpoint,{...data,shop,...(product && {product})});
                setMessage((ar?'عدد المستلمين: ':'Recipients: ')+result.data.notified);
            } else {await api.patch(endpoint+'/'+editor._id,data);setMessage(ar?'تم الحفظ':'Saved');}
            setEditor(null);setPage(1);refresh(v=>v+1);
        } catch (e) {
            const limited = axios.isAxiosError(e) && e.response?.data?.code === 'offer_limit_reached';
            setMessage(limited ? (ar?'يمكن نشر حملة واحدة لكل متجر يوميًا. حاول غدًا.':'One promotion per shop per day. Try tomorrow.') : errorMessage(e));
        }
        finally {setBusy(false);}
    }
    async function toggle(offer:Offer) {
        if (busy || !window.confirm(ar?'تأكيد تغيير حالة الحملة؟':'Change campaign status?')) return;
        setBusy(true);
        try {await api.patch(endpoint+'/'+offer._id,{isActive:!offer.isActive});refresh(v=>v+1);}
        catch(e){setMessage(errorMessage(e));} finally{setBusy(false);}
    }
    if (mode==='public' && shop && loaded===request && !error && !total) return null;
    return <section id="offers" className="space-y-4 rounded-xl border bg-white p-5 text-[#1a365d]">
      <h2 className="text-xl font-bold">{ar?'العروض الترويجية':'Promotions'}</h2>
      {allowCreate && shop && <button className={button} onClick={()=>setEditor('new')}>{ar?'نشر حملة':'Post promotion'}</button>}
      {editor && <form key={editor==='new'?'new':editor._id} onSubmit={save} className="grid gap-3 sm:grid-cols-2">
        {(['titleAr','title','bodyAr','body'] as const).map((field,i)=><label key={field}>{(ar?['العنوان بالعربية','العنوان بالإنجليزية','النص بالعربية','النص بالإنجليزية']:['Arabic title','English title','Arabic message','English message'])[i]}
          <textarea name={field} required maxLength={i<2?100:1000} defaultValue={editor==='new'?'':editor[field]} className="block w-full rounded-lg border p-2"/></label>)}
        {editor==='new' && shop && mode!=='public' && <CampaignProducts key={shop} ar={ar} shop={shop} mode={mode}/>}
        <label>{ar?'تاريخ الانتهاء':'End date'}<input name="endsAt" type="date" required={editor==='new'} className="block rounded-lg border p-2"/></label>
        <div className="flex gap-2 items-end"><button className={button} disabled={busy}>{ar?'حفظ':'Save'}</button><button className={button} type="button" onClick={()=>setEditor(null)}>{ar?'إلغاء':'Cancel'}</button></div>
      </form>}
      {message && <p role="status">{message}</p>}
      {loaded!==request ? <p>{ar?'جارٍ التحميل…':'Loading…'}</p> : error ? <p role="alert">{error} <button onClick={()=>refresh(v=>v+1)}>{ar?'إعادة المحاولة':'Retry'}</button></p>
      : <div className="grid gap-3 sm:grid-cols-2">{offers.map(offer=>{
        const canEdit = mode==='admin' || (mode==='seller' && offer.createdBy?._id === (user?.id || user?._id));
        const title = ar?offer.titleAr:offer.title;
        return <article key={offer._id} className="space-y-2 rounded-lg border p-4">
          <div className="text-sm">{offer.shop.name} {offer.shop.isVerified && (ar?'· موثّق':'· Verified')}</div>
          <h3 className="font-bold">{title}</h3><p>{ar?offer.bodyAr:offer.body}</p>
          <div className="text-sm">{ar?'حتى':'Until'} {new Date(offer.endsAt).toLocaleDateString(lang)}</div>
          {mode==='public' ? <Link className="flex items-center gap-2 font-bold underline" href={'/'+lang+(offer.product?'/products/'+offer.product._id:'/shops/'+offer.shop._id)}>
            {offer.product && <span className="relative size-12"><ProductImage product={offer.product} alt="" sizes="48px"/></span>}
            {offer.product ? (ar?offer.product.nameAr:offer.product.name) : offer.shop.name}</Link>
          : <p>{!offer.isActive?(ar?'متوقفة':'Switched off'):new Date(offer.endsAt)<new Date()?(ar?'منتهية':'Ended'):(ar?'نشطة':'Live')}</p>}
          {canEdit && <div className="flex gap-2"><button className={button} onClick={()=>setEditor(offer)}>{ar?'تعديل':'Edit'}</button>
          {(offer.isActive || mode==='admin') && <button disabled={busy} className={button} onClick={()=>void toggle(offer)}>{offer.isActive?(ar?'إيقاف':'Switch off'):(ar?'تشغيل':'Activate')}</button>}</div>}
        </article>;
      })}{!total && <p>{ar?'لا توجد حملات حاليًا.':'No promotions yet.'}</p>}</div>}
      {(total>12 || page>1) && <nav className="flex gap-3"><button disabled={page===1} onClick={()=>setPage(p=>p-1)}>{ar?'السابق':'Previous'}</button>{page}<button disabled={page*12>=total} onClick={()=>setPage(p=>p+1)}>{ar?'التالي':'Next'}</button></nav>}
    </section>;
}

type ListingProduct = { _id:string; name:string; nameAr:string };
function CampaignProducts({ar,shop,mode}:{ar:boolean;shop:string;mode:'admin'|'seller'}) {
    const [page,setPage]=useState(1), [total,setTotal]=useState(0), [loaded,setLoaded]=useState(0);
    const [products,setProducts]=useState<ListingProduct[]>([]), [error,setError]=useState(''),[attempt,retry]=useState(0);
    useEffect(()=>{
        const controller=new AbortController();
        api.get<{listings:{product:ListingProduct|null}[];total:number}>('/'+mode+'/listings',{
            params:{shop,page,limit:50},signal:controller.signal
        }).then(({data})=>{
            if(controller.signal.aborted)return;
            const incoming=data.listings.flatMap(row=>row.product?[row.product]:[]);
            setProducts(old=>[...new Map([...old,...incoming].map(p=>[p._id,p])).values()]);
            setTotal(data.total);setLoaded(page);setError('');
        }).catch(e=>{if(!controller.signal.aborted)setError(errorMessage(e));});
        return ()=>controller.abort();
    },[page,shop,mode,attempt]);
    return <div><label>{ar?'المنتج المشمول بالحملة':'Promotion product'}
      <select name="product" className="block rounded border p-2"><option value="">{ar?'المتجر بالكامل':'Entire shop'}</option>
      {products.map(p=><option key={p._id} value={p._id}>{ar?p.nameAr:p.name}</option>)}</select></label>
      {error ? <p role="alert">{error} <button type="button" onClick={()=>retry(v=>v+1)}>{ar?'إعادة المحاولة':'Retry'}</button></p>
      : loaded===page && page*50<total && <button type="button" onClick={()=>setPage(page+1)}>{ar?'عرض منتجات إضافية':'More products'}</button>}</div>;
}
