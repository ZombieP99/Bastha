import { Metadata } from 'next';
import { getDictionary } from '@/i18n/dictionaries';
import SupportView from '@/components/support/SupportView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: 'en' | 'ar' }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === 'ar';
  return {
    title: isAr ? 'مركز الدعم والمساعدة | بسطة' : 'Support Center | Bastha',
    description: isAr 
      ? 'مركز الدعم والمساعدة لمنصة بسطة. تواصل معنا، وتصفح الأسئلة الشائعة وسياسات المنصة.' 
      : 'Bastha support center. Contact us, browse FAQs, and review our platform policies.',
  };
}

export default async function SupportPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: 'en' | 'ar' }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { lang } = await params;
  const { tab } = await searchParams;
  const dict = await getDictionary(lang);

  return <SupportView dict={dict} lang={lang} initialTab={tab} />;
}
