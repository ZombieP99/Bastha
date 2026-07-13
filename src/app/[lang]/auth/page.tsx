import { getDictionary } from '@/i18n/dictionaries';
import AuthContainer from '@/components/auth/AuthContainer';

export default async function AuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const lang = resolvedParams.lang as 'en' | 'ar';
  const dict = await getDictionary(lang);
  
  const initialMode = resolvedSearchParams.mode === 'signup' ? 'signup' : 'login';

  return (
    <div className="bg-gray-50/50">
      <AuthContainer dict={dict} lang={lang} initialMode={initialMode} />
    </div>
  );
}
