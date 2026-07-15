import { getDictionary } from '@/i18n/dictionaries';
import SearchResults from '@/components/search/SearchResults';

export default async function SearchPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as 'en' | 'ar';
  const dict = await getDictionary(lang);

  return (
    <SearchResults dict={dict} lang={lang} />
  );
}
