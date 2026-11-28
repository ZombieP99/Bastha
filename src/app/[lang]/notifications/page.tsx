import NotificationsView from '@/components/notifications/NotificationsView';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: 'en' | 'ar' }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === 'ar';
  return {
    title: isAr ? 'مركز الإشعارات | بسطة' : 'Notifications | Bastah',
    description: isAr 
      ? 'مركز الإشعارات لمنصة بسطة. تابع تحديثات الطلبات والعروض الحصرية.' 
      : 'Bastah notification center. Track your orders and local deals.',
  };
}

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ lang: 'en' | 'ar' }>;
}) {
  const { lang } = await params;

  return <NotificationsView lang={lang} />;
}
