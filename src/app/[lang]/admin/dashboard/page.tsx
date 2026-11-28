'use client';
import { use, useEffect, useState } from 'react';
import AccountForm from '@/components/admin/AccountForm';
import AdminCenter from '@/components/admin/AdminCenter';
import Link from 'next/link';
import api from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { useAuthStore } from '@/store/useAuthStore';
import type { User } from '@/types';

type Account = User & { id: string; status: 'active' | 'suspended' };

export default function AdminDashboard({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = use(params);
    return <AdminCenter lang={lang}><Accounts lang={lang}/></AdminCenter>;
}
function Accounts({lang}:{lang:string}) {
    const ar = lang === 'ar';
    const { user, isLoading, token } = useAuthStore();
    const [editId,setEditId]=useState('');
    const [users, setUsers] = useState<Account[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [version, setVersion] = useState(0);
    useEffect(() => {
        if (!token || user?.role !== 'admin') return;
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const { data } = await api.get('/admin/users', { params: { q: query || undefined, page, role: role || undefined, status: status || undefined }, signal: controller.signal });
                setUsers(data.users);
                setTotal(data.total);
                setError('');
            } catch (e) { if (!controller.signal.aborted) setError(errorMessage(e)); }
        }, 200);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [query, role, status, token, user?.role, page, version]);
    if (isLoading) return <p className="p-8">{ar ? 'جارٍ التحميل…' : 'Loading…'}</p>;
    if (user?.role !== 'admin') return <Link className="block p-8 underline" href={'/' + lang + '/admin/login'}>{ar ? 'دخول الإدارة' : 'Admin login'}</Link>;

    async function changeStatus(account: Account) {
        const suspend = account.status === 'active';
        const reason = suspend ? window.prompt(ar ? 'سبب تعليق الحساب' : 'Reason for suspension')?.trim() : undefined;
        if (suspend && !reason) return;
        if (!suspend && !window.confirm(ar ? 'إعادة تفعيل الحساب؟' : 'Reactivate account?')) return;
        setBusy(true);
        try {
            await api.patch('/admin/users/' + account.id + '/status', { status: suspend ? 'suspended' : 'active', reason });
            setVersion(v => v + 1);
        } catch (e) { setError(errorMessage(e)); }
        finally { setBusy(false); }
    }
    const input = 'rounded-lg border bg-white px-3 py-2';
    return <section className="mx-auto max-w-5xl space-y-5 p-5 text-[#1a365d]">
        <header className="flex items-center justify-between"><h1 className="text-2xl font-bold">{ar ? 'إدارة الحسابات' : 'Manage accounts'}</h1></header>
        <button onClick={()=>setEditId('new')} className={input}>{ar?'إنشاء حساب':'Create account'}</button>
        {editId && <AccountForm key={editId} id={editId} ar={ar} onClose={()=>setEditId('')} onSaved={()=>{setEditId('');setVersion(v=>v+1);}}/>}
        <div className="flex flex-wrap gap-3">
            <input className={input} aria-label={ar ? 'بحث' : 'Search'} placeholder={ar ? 'اسم أو بريد أو هاتف' : 'Name, email or phone'} value={query} onChange={e => {setQuery(e.target.value); setPage(1);}}/>
            <select className={input} aria-label={ar ? 'نوع الحساب' : 'Role'} value={role} onChange={e => {setRole(e.target.value); setPage(1);}}>
                <option value="">{ar ? 'كل الحسابات' : 'All roles'}</option><option value="customer">{ar ? 'زبون' : 'Customer'}</option><option value="seller">{ar ? 'تاجر' : 'Seller'}</option><option value="admin">{ar ? 'أدمن' : 'Admin'}</option>
            </select>
            <select className={input} aria-label={ar ? 'الحالة' : 'Status'} value={status} onChange={e => {setStatus(e.target.value); setPage(1);}}>
                <option value="">{ar ? 'كل الحالات' : 'All statuses'}</option><option value="active">{ar ? 'نشط' : 'Active'}</option><option value="suspended">{ar ? 'معلّق' : 'Suspended'}</option>
            </select>
        </div>
        {error && <p role="alert">{error}</p>}
        <ul className="divide-y rounded-xl bg-white">{users.map(account => <li key={account.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <button className={input} onClick={()=>setEditId(account.id)}>{ar?'تفاصيل الحساب':'Account details'}</button>
            <div><strong>{account.name}</strong><p><bdi>{account.email}</bdi></p></div>
            <span>{account.status === 'active' ? (ar ? 'نشط' : 'Active') : (ar ? 'معلّق' : 'Suspended')}</span>
            {account.id !== (user.id || user._id) && <button disabled={busy} className={input} onClick={() => changeStatus(account)}>{account.status === 'active' ? (ar ? 'تعليق الحساب' : 'Suspend') : (ar ? 'إعادة التفعيل' : 'Reactivate')}</button>}
        </li>)}</ul>
        <nav className="flex gap-4"><button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{ar ? 'السابق' : 'Previous'}</button><span>{page}</span><button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>{ar ? 'التالي' : 'Next'}</button></nav>
    </section>;
}
