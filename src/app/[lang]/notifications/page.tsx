import { Metadata } from 'next';
import { getDictionary } from '@/i18n/dictionaries';
import NotificationsView from '@/components/notifications/NotificationsView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: 'en' | 'ar' }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === 'ar';
  return {
    title: isAr ? 'مركز الإشعارات | بسطة' : 'Notifications | Bastha',
    description: isAr 
      ? 'مركز الإشعارات لمنصة بسطة. تابع تحديثات الطلبات والعروض الحصرية.' 
      : 'Bastha notification center. Track your orders and local deals.',
  };
}

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ lang: 'en' | 'ar' }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <NotificationsView dict={dict} lang={lang} />;
}
