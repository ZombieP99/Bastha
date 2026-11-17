import SearchResults from '@/components/search/SearchResults';
import { getDictionary } from '@/i18n/dictionaries';
import { Suspense } from 'react';

export default async function SearchPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as 'en' | 'ar';
  const dict = await getDictionary(lang);

  return (
    <Suspense fallback={<p className="p-12">Loading…</p>}><SearchResults dict={dict} lang={lang} /></Suspense>
  );
}
