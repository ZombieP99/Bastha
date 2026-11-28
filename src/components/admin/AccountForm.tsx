'use client';
import {useEffect,useState,type FormEvent} from 'react';
import api from '@/lib/api';
import {errorMessage} from '@/lib/errors';
import {useAuthStore} from '@/store/useAuthStore';
import type {User} from '@/types';

export default function AccountForm({id,ar,onSaved,onClose}:{id:string;ar:boolean;onSaved:()=>void;onClose:()=>void}){
  const self=useAuthStore(s=>s.user?.id || s.user?._id);
  const creating=id==='new';
  const [record,setRecord]=useState<{user:User;shops:{_id:string;name:string}[]}>();
  const [role,setRole]=useState('customer'), [busy,setBusy]=useState(false), [error,setError]=useState('');
  const [version,setVersion]=useState(0);
  useEffect(()=>{
    if(creating)return;
    const controller=new AbortController();
    api.get('/admin/users/'+id,{signal:controller.signal}).then(({data})=>{if(!controller.signal.aborted){setRecord(data);setError('');}})
      .catch(e=>{if(!controller.signal.aborted)setError(errorMessage(e));});
    return ()=>controller.abort();
  },[creating,id,version]);
  async function submit(e:FormEvent<HTMLFormElement>,action:'account'|'password'|'shop'){
    e.preventDefault();if(busy)return;
    const data=Object.fromEntries(new FormData(e.currentTarget));
    const path='/admin/users/'+id;
    setError('');setBusy(true);
    try{
      if(action==='password'){
        if(!window.confirm(ar?'تغيير كلمة المرور وتسجيل خروج هذا الحساب من أجهزته؟':'Reset password and end this user’s sessions?'))return;
        await api.patch(path+'/password',{newPassword:data.password});
      } else if(action==='shop')await api.post(path+'/shops',{name:data.shopName,phone:data.shopPhone});
      else if(creating)await api.post('/admin/users',{name:data.name,email:data.email,phone:data.phone,password:data.password,role,
         ...(role==='seller' && {shop:{name:data.shopName,phone:data.shopPhone}})});
      else await api.patch(path,{name:data.name,email:data.email,phone:data.phone});
      onSaved();
    }catch(e){setError(errorMessage(e));}finally{setBusy(false);}
  }
  function field(name:string,label:string,type='text',value=''){
    return <label className="block">{label}<input required type={type} name={name} defaultValue={value} autoComplete={type==='password'?'new-password':'off'} minLength={type==='password'?6:undefined} className="mt-1 block w-full rounded-lg border p-2"/></label>;
  }
  const save=<button disabled={busy} className="rounded bg-[#1a365d] px-4 py-2 text-white">{ar?'حفظ':'Save'}</button>;
  const shopFields=<>{field('shopName',ar?'اسم المتجر':'Shop name')}{field('shopPhone',ar?'هاتف المتجر':'Shop phone','tel')}</>;
  return <section className="space-y-4 rounded-xl border bg-white p-4"><button onClick={onClose} className="underline">{ar?'إغلاق':'Close'}</button>
    {error && <p role="alert">{error} {!record && !creating && <button onClick={()=>setVersion(v=>v+1)}>{ar?'إعادة المحاولة':'Retry'}</button>}</p>}
    {(creating || record) && <form onSubmit={e=>void submit(e,'account')} className="grid gap-3 sm:grid-cols-2">
      {field('name',ar?'الاسم':'Name','text',record?.user.name)}
      {field('email',ar?'البريد الإلكتروني':'Email','email',record?.user.email)}
      {field('phone',ar?'الهاتف':'Phone','tel',record?.user.phone)}
      {creating && <>{field('password',ar?'كلمة المرور':'Password','password')}<label>{ar?'الدور':'Role'} <select value={role} onChange={e=>setRole(e.target.value)}>{['customer','seller','admin'].map((x,i)=><option key={x} value={x}>{ar?['زبون','تاجر','مدير'][i]:x}</option>)}</select></label>{role==='seller' && shopFields}</>}{save}
    </form>}
    {record && id!==self && <form onSubmit={e=>void submit(e,'password')} className="space-y-2">{field('password',ar?'تعيين كلمة مرور جديدة':'Set new password','password')}{save}</form>}
    {record?.user.role==='seller' && <><p>{record.shops.map(s=>s.name).join(' · ')}</p><form onSubmit={e=>void submit(e,'shop')} className="space-y-2">{shopFields}{save}</form></>}
  </section>;
}
