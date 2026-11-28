'use client';
import { useParams } from 'next/navigation';

export default function ErrorPage({ reset }: { reset: () => void }) {
    const ar = useParams().lang === 'ar';
    return <div role="alert" className="p-12 text-center">
        <h1>{ar ? 'تعذر تحميل الصفحة' : 'Unable to load this page'}</h1>
        <button className="mt-5 underline" onClick={reset}>{ar ? 'إعادة المحاولة' : 'Retry'}</button>
    </div>;
}
