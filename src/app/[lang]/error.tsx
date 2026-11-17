'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <div role="alert" className="p-12 text-center"><h1>تعذر تحميل الصفحة / Unable to load this page</h1><button className="mt-5 underline" onClick={reset}>إعادة المحاولة / Retry</button></div>;}
