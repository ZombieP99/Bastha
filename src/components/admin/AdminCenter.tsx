'use client';
import { useEffect, useState, type ReactNode, type FormEvent } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { useAuthStore } from '@/store/useAuthStore';
import OrdersView from '@/components/orders/OrdersView';
import OfferList from '@/components/offers/OfferList';
import AccountSecurity from '@/components/auth/AccountSecurity';

const modules = {
  stats: ['نظرة عامة','Overview'], users:['الحسابات','Accounts'], shops:['المتاجر','Shops'], listings:['الأسعار والمخزون','Listings'],
  products:['الكتالوج','Products'], categories:['الفئات','Categories'], areas:['مناطق التوصيل','Areas'], reviews:['التقييمات','Reviews'],
  orders:['الطلبات','Orders'], offers:['الحملات','Promotions'], announcements:['إرسال إعلان','Announcements'], security:['أمان الحساب','Account security']
};
type Section = keyof typeof modules;
type Resource = 'shops'|'products'|'categories'|'areas'|'listings'|'reviews';
interface Entry {
  _id:string; name?:string; nameAr?:string; isVerified?:boolean; lock?:{reason:string}; isActive?:boolean; isFeatured?:boolean;
  product?:{name:string;nameAr:string}; shop?:{name:string}; price?:number; inStock?:boolean; rating?:number; comment?:string;
  author?:{name:string}; owner?:{name:string}; productCount?:number; shopCount?:number;
}
const button='rounded-lg border px-3 py-2 text-sm disabled:opacity-50';
function usePage<T>(url:string, page:number, revision:number) {
  const [result,setResult]=useState<{key:string;data?:T;error?:string}>();
  const key=[url,page,revision].join(':');
  useEffect(()=>{
    const c=new AbortController();
    api.get<T>(url,{params:{page,limit:20},signal:c.signal}).then(({data})=>{
      if(!c.signal.aborted)setResult({key,data});
    }).catch(e=>{if(!c.signal.aborted)setResult({key,error:errorMessage(e)});});
    return ()=>c.abort();
  },[key,url,page,revision]);
  return result?.key===key ? result : undefined;
}

export default function AdminCenter({lang,children}:{lang:string;children:ReactNode}) {
  const ar=lang==='ar', {user,token,isLoading,logout}=useAuthStore();
  const [section,setSection]=useState<Section>('stats');
  if(isLoading)return <p role="status" className="p-8">{ar?'جارٍ التحميل…':'Loading…'}</p>;
  if(!token || user?.role!=='admin')return <Link className="block p-8 underline" href={'/'+lang+'/admin/login'}>{ar?'دخول الإدارة':'Admin login'}</Link>;
  return <main className="mx-auto max-w-7xl px-4 py-8 text-[#1a365d]"><header className="mb-5 flex justify-between"><h1 className="text-2xl font-bold">{ar?'مركز الإدارة':'Admin center'}</h1><button onClick={logout}>{ar?'تسجيل الخروج':'Sign out'}</button></header>
    <div className="grid items-start gap-5 md:grid-cols-[12rem_minmax(0,1fr)]"><nav className="flex flex-wrap gap-1 rounded-xl border bg-white p-2 md:flex-col">
    {(Object.keys(modules) as Section[]).map(id=><button key={id} aria-current={id===section?'page':undefined} className={'rounded-md px-3 py-2 text-start '+(id===section?'bg-[#1a365d] text-white':'')} onClick={()=>setSection(id)}>{modules[id][ar?0:1]}</button>)}</nav>
    <section key={token+section} className="space-y-3">
    {section==='users'?children:section==='stats'?<Stats ar={ar}/>:section==='security'?<AccountSecurity ar={ar} saving={false}/>:section==='orders'?<OrdersView lang={lang} seller/>:
     section==='offers'?<OfferList lang={lang} mode="admin"/>:section==='announcements'?<Announcement ar={ar}/>:<Resources section={section} lang={lang}/>}
    </section></div></main>;
}
function Stats({ar}:{ar:boolean}) {
  const [v,setV]=useState(0);
  const r=usePage<{users:{total:number};shops:{total:number};products:{total:number};orders:{today:number};completedValue:{today:number}}>('/admin/stats',1,v);
  if(!r?.data)return <button className={button} onClick={()=>setV(v+1)}>{r?.error || (ar?'جارٍ التحميل…':'Loading…')}</button>;
  const d=r.data;
  return <div className="grid grid-cols-2 gap-3">{[
    [ar?'الحسابات':'Accounts',d.users.total],[ar?'المتاجر':'Shops',d.shops.total],[ar?'المنتجات':'Products',d.products.total],
    [ar?'طلبات اليوم':'Orders today',d.orders.today],[ar?'قيمة الطلبات المكتملة اليوم':'Completed today',d.completedValue.today+' ₪']
  ].map(([label,value])=><div key={label} className="rounded-xl border bg-white p-4"><p>{label}</p><strong className="text-2xl">{value}</strong></div>)}</div>;
}
function Resources({section,lang}:{section:Resource;lang:string}) {
  const ar=lang==='ar', base='/admin/'+section;
  const [page,setPage]=useState(1),[v,setV]=useState(0),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [editing,setEditing]=useState<Entry|'new'|null>(null), [shop,setShop]=useState('');
  const r=usePage<Partial<Record<Resource,Entry[]>> & {total?:number}>(base,page,v);
  const tax=section==='categories'||section==='areas';
  async function mutate(action:()=>Promise<unknown>) {
    if(busy)return;
    setBusy(true);setError('');
    try{await action();setEditing(null);setV(x=>x+1);}catch(e){setError(errorMessage(e));}finally{setBusy(false);}
  }
  function names(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const form=new FormData(e.currentTarget),data={name:form.get('name'),nameAr:form.get('nameAr')};
    if(editing==='new')void mutate(()=>api.post(base,data));
    else if(editing)void mutate(()=>api.patch((section==='products'?'/products':base)+'/'+editing._id,data));
  }
  return <><h2 className="text-xl font-bold">{modules[section][ar?0:1]}</h2>
    {tax && <button className={button} onClick={()=>setEditing('new')}>{ar?'إضافة':'Add'}</button>}
    {editing && <form key={editing==='new'?'new':editing._id} onSubmit={names} className="flex flex-wrap gap-2">
      {(['name','nameAr'] as const).map((k,i)=><label key={k}>{i?'العربية':'English'}<input className={button} required name={k} defaultValue={editing==='new'?'':editing[k]}/></label>)}
      <button disabled={busy} className={button}>{ar?'حفظ':'Save'}</button><button type="button" onClick={()=>setEditing(null)}>{ar?'إلغاء':'Cancel'}</button></form>}
    {error && <p role="alert">{error}</p>}{r?.error && <p role="alert">{r.error} <button onClick={()=>setV(v+1)}>{ar?'إعادة المحاولة':'Retry'}</button></p>}
    {!r && <p role="status">{ar?'جارٍ التحميل…':'Loading…'}</p>}
    {r?.data?.[section]?.map(row=><article key={row._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4">
      <div><strong>{(ar && row.nameAr) || row.name || (ar && row.product?.nameAr) || row.product?.name || row.author?.name}</strong>
        <p>{row.owner?.name || row.shop?.name} {row.rating!=null && row.rating+'/5'} {row.comment}</p>
        {row.price!=null && <p>{row.price} ₪ · {row.inStock?(ar?'متوفر':'Available'):(ar?'غير متوفر':'Out of stock')}</p>}
        {row.lock && <p>{row.lock.reason}</p>}
        {tax && <small>{ar?'عدد الاستخدامات':'Usage count'} · {row.productCount ?? row.shopCount}</small>}
      </div><fieldset disabled={busy} className="flex flex-wrap gap-2">
      {(tax || section==='products') && <><button className={button} onClick={()=>setEditing(row)}>{ar?'تعديل الاسم':'Rename'}</button>
        <button className={button} onClick={()=>{if(window.confirm(ar?'تأكيد تغيير الظهور؟':'Change visibility?'))void mutate(()=>api.patch(base+'/'+row._id+(tax?'':'/active'),{isActive:!row.isActive}));}}>{row.isActive?(ar?'إخفاء':'Hide'):(ar?'إظهار':'Show')}</button></>}
      {section==='products' && <button className={button} onClick={()=>void mutate(()=>api.patch('/products/'+row._id+'/feature',{isFeatured:!row.isFeatured}))}>{row.isFeatured?(ar?'إلغاء التمييز':'Unfeature'):(ar?'تمييز':'Feature')}</button>}
      {section==='shops' && <><button className={button} onClick={()=>void mutate(()=>api.patch(base+'/'+row._id+'/verify',{isVerified:!row.isVerified}))}>{row.isVerified?(ar?'إلغاء التوثيق':'Unverify'):(ar?'توثيق':'Verify')}</button>
        <button className={button} onClick={()=>{
          const reason=row.lock?undefined:window.prompt(ar?'سبب القفل':'Lock reason')?.trim();
          if(row.lock?!window.confirm(ar?'فك قفل المتجر؟':'Unlock shop?'):!reason)return;
          void mutate(()=>api.patch(base+'/'+row._id+'/lock',{locked:!row.lock,reason}));
        }}>{row.lock?(ar?'فك القفل':'Unlock'):(ar?'قفل':'Lock')}</button>
        {row.isActive && <button className={button} onClick={()=>setShop(row._id)}>{ar?'حملات المتجر':'Shop promotions'}</button>}</>}
      {section==='reviews' && <button className={button} onClick={()=>{if(window.confirm(ar?'حذف التقييم؟':'Delete review?'))void mutate(()=>api.delete('/reviews/'+row._id));}}>{ar?'حذف':'Delete'}</button>}
      </fieldset></article>)}
    {r?.data?.[section]?.length===0 && <p>{ar?'لا توجد نتائج':'No results'}</p>}
    {shop && <OfferList key={shop} mode="admin" shop={shop} lang={lang} allowCreate/>}
    {((r?.data?.total ?? 0)>20 || page>1) && <nav className="flex gap-3"><button disabled={page===1} onClick={()=>setPage(page-1)}>{ar?'السابق':'Previous'}</button>{page}<button disabled={page*20>=(r?.data?.total ?? 0)} onClick={()=>setPage(page+1)}>{ar?'التالي':'Next'}</button></nav>}
  </>;
}
function Announcement({ar}:{ar:boolean}){
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  async function send(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); const form=e.currentTarget;
    const data=Object.fromEntries(new FormData(form));
    if(busy || !window.confirm((ar?'إرسال إعلان نهائي إلى الجمهور المحدد؟ ':'Send permanently to the selected audience? ')+data.audience))return;
    setBusy(true);setMessage('');
    try{const {data:result}=await api.post('/admin/announcements',data);setMessage((ar?'عدد المستلمين: ':'Recipients: ')+result.sent);form.reset();}
    catch(err){setMessage(errorMessage(err));}finally{setBusy(false);}
  }
  return <form onSubmit={send} className="grid gap-3 rounded-xl border bg-white p-4">
    <h2>{ar?'إرسال إعلان':'Send announcement'}</h2>
    {(['titleAr','title','bodyAr','body'] as const).map((name,i)=><label key={name}>{['العنوان بالعربية','English title','النص بالعربية','English message'][i]}<textarea required maxLength={i<2?100:1000} name={name} className="block w-full rounded border p-2"/></label>)}
    <label>{ar?'الجمهور':'Audience'} <select name="audience">{['all','customers','sellers'].map((v,i)=><option key={v} value={v}>{ar?['الجميع','الزبائن','التجار'][i]:v}</option>)}</select></label>
    <button disabled={busy} className={button}>{ar?'إرسال':'Send'}</button>{message && <p role="status">{message}</p>}
  </form>;
}
